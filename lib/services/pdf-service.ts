import { Student, StudentSubject } from '@/components/coordinator-dashboard/index'

export interface PdfGenerationOptions {
  fileName: string
  students: Student[]
  studentSubjects?: StudentSubject[]
  selectedTerm?: number
}

export class PdfService {
  /**
   * Generate PDF blob for download without blocking the UI
   */
  static async generateStudentReportBlob(options: PdfGenerationOptions): Promise<Blob | null> {
    try {
      // Validate input
      if (!options.students || options.students.length === 0) {
        console.error('No student data provided to PDF generator')
        return null
      }

      const student = options.students[0]
      
      // Ensure student has required properties
      const validStudent = {
        id: student.id || '',
        name: student.name || 'Unknown Student',
        email: student.email || '',
        school: student.school || 'Unknown School',
        grade: student.grade || 'Unknown',
        average: typeof student.average === 'number' ? student.average : 0,
        status: student.status || 'No Data'
      }

      // Use jsPDF instead of @react-pdf/renderer due to React 19 compatibility issues
      return await this.generateStudentReportWithJsPDF(validStudent, options.studentSubjects || [], options.selectedTerm || 1)
    } catch (error) {
      console.error('Error generating student report PDF:', error)
      return null
    }
  }

  /**
   * Generate PDF blob for all students
   */
  static async generateAllStudentsReportBlob(students: Student[]): Promise<Blob | null> {
    try {
      // Validate input
      if (!students || !Array.isArray(students) || students.length === 0) {
        console.error('Invalid students data provided to PDF generator')
        return null
      }

      // Ensure all students have required properties
      const validStudents = students.map(student => ({
        id: student.id || '',
        name: student.name || 'Unknown Student',
        email: student.email || '',
        school: student.school || 'Unknown School',
        grade: student.grade || 'Unknown',
        average: typeof student.average === 'number' ? student.average : 0,
        status: student.status || 'No Data'
      }))

      // Try jsPDF first, fallback to CSV if it fails
      try {
        return await this.generateAllStudentsReportWithJsPDF(validStudents)
      } catch (jsPdfError) {
        console.error('jsPDF failed, falling back to CSV:', jsPdfError)
        return this.generateCSVReportBlob(validStudents)
      }
    } catch (error) {
      console.error('Error generating all students report PDF:', error)
      return null
    }
  }

  /**
   * Generate term-specific PDF blob for multiple students
   */
  static async generateTermSpecificReportBlob(
    studentsWithTermData: Array<Student & { termData: any[], term: number }>, 
    selectedTerm: number
  ): Promise<Blob | null> {
    try {
      // Validate input
      if (!studentsWithTermData || !Array.isArray(studentsWithTermData) || studentsWithTermData.length === 0) {
        console.error('Invalid students data provided to term-specific PDF generator')
        return null
      }

      // For now, use the existing all students report generator but with term-specific data
      // In the future, this could be enhanced to show term-specific analytics
      const studentsWithTermAverages = studentsWithTermData.map(student => {
        // Calculate term-specific average
        const termSubjects = student.termData || []
        const validSubjects = termSubjects.filter(s => {
          const percentage = Number.parseFloat(String(s.finalPercentage))
          return !isNaN(percentage) && percentage >= 0 && percentage <= 100
        })
        
        const termAverage = validSubjects.length > 0 
          ? Math.round(validSubjects.reduce((sum, s) => sum + Number.parseFloat(String(s.finalPercentage)), 0) / validSubjects.length)
          : 0
          
        const termStatus = termAverage >= 60 ? "Doing Well" : termAverage >= 40 ? "Needs Support" : "At Risk"
        
        return {
          ...student,
          average: termAverage,
          status: termStatus
        }
      })

      // Try jsPDF first, fallback to CSV if it fails
      try {
        return await this.generateTermSpecificBulkReportWithJsPDF(studentsWithTermAverages, selectedTerm)
      } catch (jsPdfError) {
        console.error('jsPDF failed, falling back to CSV:', jsPdfError)
        return this.generateTermSpecificCSVReportBlob(studentsWithTermAverages, selectedTerm)
      }
    } catch (error) {
      console.error('Error generating term-specific PDF:', error)
      return null
    }
  }

  /**
   * Generate student report using jsPDF
   */
  private static async generateStudentReportWithJsPDF(
    student: Student, 
    studentSubjects: StudentSubject[], 
    selectedTerm: number
  ): Promise<Blob | null> {
    try {
      // Force fresh import to avoid any caching issues
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default?.jsPDF || jsPDFModule.default
      
      if (!jsPDF) {
        throw new Error('jsPDF not found in module')
      }
      
      const doc = new jsPDF()

      // Helper function to draw a professional header
      const drawHeader = () => {
        // Header background
        doc.setFillColor(229, 62, 62) // Red background
        doc.rect(0, 0, 210, 45, 'F')
        
        // Main title
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.text('STUDENT PERFORMANCE REPORT', 105, 20, { align: 'center' })
        
        // Subtitle
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Sol Plaatje University - Talent Pipeline Programme', 105, 32, { align: 'center' })
      }

      // Helper function to draw section headers
      const drawSectionHeader = (title: string, yPos: number) => {
        doc.setFillColor(248, 250, 252) // Light gray background
        doc.rect(15, yPos - 8, 180, 15, 'F')
        doc.setDrawColor(229, 62, 62)
        doc.rect(15, yPos - 8, 180, 15, 'S')
        
        doc.setTextColor(45, 55, 72)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(title, 20, yPos, { baseline: 'middle' })
        
        return yPos + 15
      }

      // Helper function to draw info cards
      const drawInfoCard = (label: string, value: string, x: number, y: number, width: number = 80) => {
        // Card background
        doc.setFillColor(250, 250, 250)
        doc.rect(x, y, width, 20, 'F')
        doc.setDrawColor(226, 232, 240)
        doc.rect(x, y, width, 20, 'S')
        
        // Label
        doc.setTextColor(107, 114, 128)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(label, x + 5, y + 8)
        
        // Value
        doc.setTextColor(17, 24, 39)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(value, x + 5, y + 16)
      }

      // Draw header
      drawHeader()

      // Generate timestamp
      const now = new Date()
      const timestamp = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Document info - move to footer area
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.text(`Generated: ${timestamp}`, 15, 270)
      doc.text(`Term ${selectedTerm} Academic Performance`, 15, 276)

      let yPos = 60

      // Student Information Section
      yPos = drawSectionHeader('Student Information', yPos)
      yPos += 10

      // Info cards layout
      drawInfoCard('Student Name', student.name, 20, yPos, 85)
      drawInfoCard('School', student.school.length > 25 ? student.school.substring(0, 22) + '...' : student.school, 110, yPos, 80)
      yPos += 30

      drawInfoCard('Grade', student.grade, 20, yPos, 40)
      drawInfoCard('Term', `Term ${selectedTerm}`, 65, yPos, 40)
      
      // Performance status with color coding
      const statusColor = student.status === 'Doing Well' ? [34, 197, 94] : 
                         student.status === 'Needs Support' ? [251, 191, 36] : 
                         student.status === 'At Risk' ? [239, 68, 68] : [156, 163, 175]
      
      doc.setFillColor(...statusColor)
      doc.rect(110, yPos, 80, 20, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(student.status, 150, yPos + 12, { align: 'center' })

      yPos += 40

      // Performance Overview
      yPos = drawSectionHeader('Performance Overview', yPos)
      yPos += 15

      // Average circle indicator
      const centerX = 50
      const centerY = yPos + 20
      const radius = 15

      // Circle background
      doc.setFillColor(248, 250, 252)
      doc.circle(centerX, centerY, radius, 'F')
      doc.setDrawColor(...statusColor)
      doc.setLineWidth(3)
      doc.circle(centerX, centerY, radius, 'S')

      // Average text
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`${Math.round(student.average)}%`, centerX, centerY - 2, { align: 'center' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('AVERAGE', centerX, centerY + 8, { align: 'center' })

      // Performance indicators
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Overall Performance Rating:', 80, yPos + 10)
      
      doc.setTextColor(...statusColor)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(student.status, 80, yPos + 25)

      yPos += 50

      // Subject Performance Section
      const termData = studentSubjects.find(s => s.studentId === student.id && s.term === selectedTerm)
      const subjects = termData?.subjects || []

      if (subjects.length > 0) {
        yPos = drawSectionHeader('Subject Performance Details', yPos)
        yPos += 15

        // Enhanced table
        const tableStartY = yPos
        const rowHeight = 12
        const colWidths = [70, 30, 35, 35]
        const colPositions = [20, 90, 120, 155]

        // Table header
        doc.setFillColor(229, 62, 62)
        doc.rect(15, tableStartY, 180, rowHeight, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Subject Name', colPositions[0], tableStartY + 8)
        doc.text('Level', colPositions[1], tableStartY + 8)
        doc.text('Final %', colPositions[2], tableStartY + 8)
        doc.text('Grade Avg %', colPositions[3], tableStartY + 8)

        yPos = tableStartY + rowHeight

        // Table rows with alternating colors
        subjects.forEach((subject, index) => {
          if (yPos > 260) {
            doc.addPage()
            yPos = 30
          }

          // Alternating row colors
          if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251)
            doc.rect(15, yPos, 180, rowHeight, 'F')
          }

          // Row border
          doc.setDrawColor(229, 231, 235)
          doc.rect(15, yPos, 180, rowHeight, 'S')

          // Cell content
          doc.setTextColor(17, 24, 39)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          
          const subjectName = (subject.name || 'Unknown Subject').length > 25 ? 
            (subject.name || 'Unknown Subject').substring(0, 22) + '...' : 
            (subject.name || 'Unknown Subject')
          
          doc.text(subjectName, colPositions[0], yPos + 8)
          doc.text(subject.level || 'N/A', colPositions[1], yPos + 8)
          
          // Color-coded percentages
          const finalPerc = Number(subject.finalPercentage) || 0
          const gradePerc = Number(subject.gradeAverage) || 0
          
          const getPercColor = (perc: number) => {
            if (perc >= 70) return [34, 197, 94] // Green
            if (perc >= 60) return [251, 191, 36] // Yellow
            if (perc >= 40) return [251, 146, 60] // Orange
            return [239, 68, 68] // Red
          }

          doc.setTextColor(...getPercColor(finalPerc))
          doc.setFont('helvetica', 'bold')
          doc.text(`${subject.finalPercentage || 'N/A'}%`, colPositions[2], yPos + 8)
          
          doc.setTextColor(...getPercColor(gradePerc))
          doc.text(`${subject.gradeAverage || 'N/A'}%`, colPositions[3], yPos + 8)

          yPos += rowHeight
        })

        yPos += 10
      }

      // Performance Summary with enhanced styling
      if (yPos > 230) {
        doc.addPage()
        yPos = 30
      }

      yPos = drawSectionHeader('Performance Analysis & Recommendations', yPos)
      yPos += 15

      // Analysis box
      doc.setFillColor(239, 246, 255) // Light blue background
      doc.rect(15, yPos, 180, 45, 'F')
      doc.setDrawColor(59, 130, 246) // Blue border
      doc.rect(15, yPos, 180, 45, 'S')

      const average = student.average || 0
      let feedback = ''
      let recommendations = ''
      
      if (average >= 70) {
        feedback = "Excellent Performance: This student demonstrates outstanding academic achievement and is excelling across subjects."
        recommendations = "Continue current study methods. Consider advanced coursework or peer tutoring opportunities."
      } else if (average >= 60) {
        feedback = "Good Performance: This student is meeting academic expectations and showing solid progress."
        recommendations = "Focus on consistent study habits. Identify strongest subjects for potential leadership roles."
      } else if (average >= 50) {
        feedback = "Satisfactory Performance: This student shows potential but would benefit from additional academic support."
        recommendations = "Recommend study groups, tutoring sessions, and regular check-ins with teachers."
      } else {
        feedback = "Needs Immediate Support: This student requires targeted intervention to improve academic outcomes."
        recommendations = "Schedule immediate meeting with academic counselor. Implement personalized study plan."
      }

      doc.setTextColor(17, 24, 39)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      const feedbackLines = doc.splitTextToSize(feedback, 170)
      const recLines = doc.splitTextToSize(`Recommendations: ${recommendations}`, 170)
      
      doc.text(feedbackLines, 20, yPos + 8)
      doc.text(recLines, 20, yPos + 25)

      // Footer
      doc.setDrawColor(229, 62, 62)
      doc.line(15, 265, 195, 265)
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.text('Sol Plaatje University - Talent Pipeline Programme - Confidential Document', 105, 285, { align: 'center' })

      return doc.output('blob')
    } catch (error) {
      console.error('Error generating PDF with jsPDF:', error)
      return null
    }
  }

  /**
   * Generate all students report using jsPDF
   */
  private static async generateAllStudentsReportWithJsPDF(students: Student[]): Promise<Blob | null> {
    try {
      // Force fresh import to avoid any caching issues
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default?.jsPDF || jsPDFModule.default
      
      if (!jsPDF) {
        throw new Error('jsPDF not found in module')
      }
      
      const doc = new jsPDF()

      // Helper function to draw professional header
      const drawHeader = () => {
        // Header background
        doc.setFillColor(229, 62, 62) // Red background
        doc.rect(0, 0, 210, 50, 'F')
        
        // Main title
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('PERFORMANCE ANALYTICS DASHBOARD', 105, 22, { align: 'center' })
        
        // Subtitle
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Sol Plaatje University - Talent Pipeline Programme', 105, 32, { align: 'center' })
        
        // Report type
        doc.setFontSize(10)
        doc.text('Comprehensive Student Performance Summary', 105, 42, { align: 'center' })
      }

      // Helper function for stats cards
      const drawStatsCard = (title: string, value: string, percentage: string, color: number[], x: number, y: number) => {
        // Card background
        doc.setFillColor(255, 255, 255)
        doc.rect(x, y, 42, 35, 'F')
        doc.setDrawColor(229, 231, 235)
        doc.rect(x, y, 42, 35, 'S')
        
        // Color accent bar
        doc.setFillColor(...color)
        doc.rect(x, y, 42, 3, 'F')
        
        // Value (large number)
        doc.setTextColor(17, 24, 39)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(value, x + 21, y + 15, { align: 'center' })
        
        // Percentage
        doc.setTextColor(...color)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(percentage, x + 21, y + 25, { align: 'center' })
        
        // Title
        doc.setTextColor(107, 114, 128)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(title, x + 21, y + 32, { align: 'center' })
      }

      // Draw header
      drawHeader()

      // Generate timestamp
      const now = new Date()
      const timestamp = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Document metadata - move to footer area
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.text(`Generated: ${timestamp}`, 15, 270)
      doc.text(`Total Students: ${students.length}`, 15, 276)

      let yPos = 65

      // Calculate statistics
      const totalStudents = students.length
      const doingWellCount = students.filter(student => student.status === 'Doing Well').length
      const needsSupportCount = students.filter(student => student.status === 'Needs Support').length
      const atRiskCount = students.filter(student => student.status === 'At Risk').length
      const noDataCount = students.filter(student => student.status === 'No Data').length

      // Performance Overview Section
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos - 8, 180, 20, 'F')
      doc.setDrawColor(229, 62, 62)
      doc.rect(15, yPos - 8, 180, 20, 'S')
      
      doc.setTextColor(45, 55, 72)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Performance Analytics Overview', 20, yPos + 5)

      yPos += 25

      // Stats cards
      drawStatsCard(
        'TOTAL STUDENTS',
        totalStudents.toString(),
        '100%',
        [59, 130, 246],
        15, yPos
      )

      drawStatsCard(
        'DOING WELL',
        doingWellCount.toString(),
        `${Math.round((doingWellCount / totalStudents) * 100)}%`,
        [34, 197, 94],
        62, yPos
      )

      drawStatsCard(
        'NEEDS SUPPORT',
        needsSupportCount.toString(),
        `${Math.round((needsSupportCount / totalStudents) * 100)}%`,
        [251, 191, 36],
        109, yPos
      )

      drawStatsCard(
        'AT RISK',
        atRiskCount.toString(),
        `${Math.round((atRiskCount / totalStudents) * 100)}%`,
        [239, 68, 68],
        156, yPos
      )

      yPos += 50

      // Performance breakdown with visual indicators
      doc.setFillColor(255, 255, 255)
      doc.rect(15, yPos, 180, 25, 'F')
      doc.setDrawColor(229, 231, 235)
      doc.rect(15, yPos, 180, 25, 'S')

      // Performance bars
      const barWidth = 160
      const barHeight = 6
      const barStartX = 25
      const barY = yPos + 8

      // Background bar
      doc.setFillColor(243, 244, 246)
      doc.rect(barStartX, barY, barWidth, barHeight, 'F')

      // Performance segments
      let currentX = barStartX
      
      if (doingWellCount > 0) {
        const width = (doingWellCount / totalStudents) * barWidth
        doc.setFillColor(34, 197, 94)
        doc.rect(currentX, barY, width, barHeight, 'F')
        currentX += width
      }
      
      if (needsSupportCount > 0) {
        const width = (needsSupportCount / totalStudents) * barWidth
        doc.setFillColor(251, 191, 36)
        doc.rect(currentX, barY, width, barHeight, 'F')
        currentX += width
      }
      
      if (atRiskCount > 0) {
        const width = (atRiskCount / totalStudents) * barWidth
        doc.setFillColor(239, 68, 68)
        doc.rect(currentX, barY, width, barHeight, 'F')
        currentX += width
      }

      // Legend
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.text('Performance Distribution Across All Students', 105, yPos + 20, { align: 'center' })

      yPos += 35

      // Detailed Student Listing Section
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos - 8, 180, 15, 'F')
      doc.setDrawColor(229, 62, 62)
      doc.rect(15, yPos - 8, 180, 15, 'S')
      
      doc.setTextColor(45, 55, 72)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Detailed Student Performance Registry', 20, yPos)

      yPos += 20

      // Enhanced table
      const tableStartY = yPos
      const rowHeight = 12
      const colPositions = [20, 75, 120, 145, 165]

      // Table header with gradient effect
      doc.setFillColor(229, 62, 62)
      doc.rect(15, tableStartY, 180, rowHeight, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('STUDENT NAME', colPositions[0], tableStartY + 8)
      doc.text('SCHOOL', colPositions[1], tableStartY + 8)
      doc.text('GRADE', colPositions[2], tableStartY + 8)
      doc.text('AVG', colPositions[3], tableStartY + 8)
      doc.text('STATUS', colPositions[4], tableStartY + 8)

      yPos = tableStartY + rowHeight

      // Student rows with enhanced styling
      students.forEach((student, index) => {
        if (yPos > 260) {
          doc.addPage()
          
          // Recreate header on new page
          doc.setTextColor(107, 114, 128)
          doc.setFontSize(9)
          doc.text(`Page ${Math.floor(index / 20) + 2} - Continued from Student Performance Registry`, 15, 20)
          
          // Table header on new page
          doc.setFillColor(229, 62, 62)
          doc.rect(15, 30, 180, rowHeight, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text('STUDENT NAME', colPositions[0], 38)
          doc.text('SCHOOL', colPositions[1], 38)
          doc.text('GRADE', colPositions[2], 38)
          doc.text('AVG', colPositions[3], 38)
          doc.text('STATUS', colPositions[4], 38)
          
          yPos = 42
        }

        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(15, yPos, 180, rowHeight, 'F')
        }

        // Row border
        doc.setDrawColor(229, 231, 235)
        doc.rect(15, yPos, 180, rowHeight, 'S')

        // Student data
        doc.setTextColor(17, 24, 39)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        
        // Truncate long names smartly
        const name = student.name.length > 25 ? student.name.substring(0, 22) + '...' : student.name
        const school = student.school.length > 20 ? student.school.substring(0, 17) + '...' : student.school
        
        doc.text(name, colPositions[0], yPos + 8)
        doc.text(school, colPositions[1], yPos + 8)
        doc.text(student.grade, colPositions[2], yPos + 8)
        
        // Color-coded average
        const avg = Math.round(student.average)
        const avgColor = avg >= 70 ? [34, 197, 94] : 
                        avg >= 60 ? [251, 191, 36] : 
                        avg >= 40 ? [251, 146, 60] : [239, 68, 68]
        
        doc.setTextColor(...avgColor)
        doc.setFont('helvetica', 'bold')
        doc.text(`${avg}%`, colPositions[3], yPos + 8)
        
        // Status badge effect
        const statusColors = {
          'Doing Well': [34, 197, 94],
          'Needs Support': [251, 191, 36],
          'At Risk': [239, 68, 68],
          'No Data': [156, 163, 175]
        }
        
        const statusColor = statusColors[student.status as keyof typeof statusColors] || [156, 163, 175]
        doc.setTextColor(...statusColor)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(student.status.toUpperCase(), colPositions[4], yPos + 8)

        yPos += rowHeight
      })

      // Summary footer
      yPos += 10
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }

      // Summary box
      doc.setFillColor(239, 246, 255)
      doc.rect(15, yPos, 180, 30, 'F')
      doc.setDrawColor(59, 130, 246)
      doc.rect(15, yPos, 180, 30, 'S')

      doc.setTextColor(17, 24, 39)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Performance Insights', 20, yPos + 10)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const insights = `${Math.round((doingWellCount / totalStudents) * 100)}% of students are performing well. Focus areas: ${needsSupportCount + atRiskCount} students need additional support. Recommend targeted interventions for at-risk students.`
      const insightLines = doc.splitTextToSize(insights, 170)
      doc.text(insightLines, 20, yPos + 18)

      // Professional footer
      doc.setDrawColor(229, 62, 62)
      doc.line(15, 265, 195, 265)
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.text('Sol Plaatje University - Talent Pipeline Programme - Confidential Analytics Report', 105, 285, { align: 'center' })

      return doc.output('blob')
    } catch (error) {
      console.error('Error generating PDF with jsPDF:', error)
      return null
    }
  }

  /**
   * Download PDF file
   */
  static downloadPdf(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Generate CSV report as fallback
   */
  private static generateCSVReportBlob(students: Student[]): Blob {
    // Create CSV content
    const headers = ['Student Name', 'School', 'Grade', 'Average %', 'Status']
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        `"${student.name}"`,
        `"${student.school}"`,
        `"${student.grade}"`,
        Math.round(student.average),
        `"${student.status}"`
      ].join(','))
    ].join('\n')

    // Create blob
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }

  /**
   * Generate term-specific bulk report with jsPDF
   */
  private static async generateTermSpecificBulkReportWithJsPDF(students: Student[], selectedTerm: number): Promise<Blob | null> {
    try {
      // For now, reuse the existing bulk report generator with term info
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default?.jsPDF || jsPDFModule.default
      
      if (!jsPDF) {
        throw new Error('jsPDF not found in module')
      }
      
      const doc = new jsPDF()

      // Header with term information
      doc.setFillColor(229, 62, 62)
      doc.rect(0, 0, 210, 45, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('TERM PERFORMANCE ANALYTICS', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Sol Plaatje University - Term ${selectedTerm} Report`, 105, 32, { align: 'center' })

      // Rest of the implementation reuses the existing bulk report logic
      // but with term-specific context
      const now = new Date()
      const timestamp = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Remove the old footer since we now have proper page footers

      // Add summary statistics for the term
      let yPos = 60
      
      const stats = {
        total: students.length,
        doingWell: students.filter(s => s.status === 'Doing Well').length,
        needsSupport: students.filter(s => s.status === 'Needs Support').length,
        atRisk: students.filter(s => s.status === 'At Risk').length
      }

      doc.setTextColor(17, 24, 39)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`Term ${selectedTerm} Performance Summary`, 20, yPos)
      
      yPos += 20
      
      // Statistics cards
      const cardWidth = 40
      const cardHeight = 25
      const cardSpacing = 45
      
      const drawStatCard = (title: string, value: number, color: number[], x: number) => {
        doc.setFillColor(...color)
        doc.rect(x, yPos, cardWidth, cardHeight, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(value.toString(), x + cardWidth/2, yPos + 12, { align: 'center' })
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(title, x + cardWidth/2, yPos + 20, { align: 'center' })
      }
      
      drawStatCard('Total', stats.total, [75, 85, 99], 20)
      drawStatCard('Doing Well', stats.doingWell, [34, 197, 94], 20 + cardSpacing)
      drawStatCard('Need Support', stats.needsSupport, [251, 191, 36], 20 + cardSpacing * 2)
      drawStatCard('At Risk', stats.atRisk, [239, 68, 68], 20 + cardSpacing * 3)

      yPos += cardHeight + 20

      // Initialize pagination variables in broader scope
      let pageNumber = 1
      
      // Student table
      if (students.length > 0) {
        doc.setTextColor(17, 24, 39)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Individual Student Performance', 20, yPos)
        yPos += 15

        // Table headers
        const tableHeaders = ['Name', 'School', 'Term Avg', 'Status']
        const colWidths = [60, 60, 25, 35]
        const colPositions = [20, 80, 140, 165]
        
        doc.setFillColor(229, 62, 62)
        doc.rect(15, yPos, 180, 10, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        
        tableHeaders.forEach((header, i) => {
          doc.text(header, colPositions[i], yPos + 7)
        })
        
        yPos += 10

        // Table rows with automatic pagination
        const rowHeight = 8
        const pageHeight = 297 // A4 height in mm
        const footerHeight = 30 // Space reserved for footer
        const headerHeight = 50 // Space used by header
        const maxYPosition = pageHeight - footerHeight
        
        let currentYPos = yPos
        let studentIndex = 0
        
        // Helper function to add table headers on new page
        const addTableHeaders = (startY: number) => {
          doc.setFillColor(229, 62, 62)
          doc.rect(15, startY, 180, 10, 'F')
          
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          
          tableHeaders.forEach((header, i) => {
            doc.text(header, colPositions[i], startY + 7)
          })
          
          return startY + 10
        }
        
                 // Helper function to add new page with header
         const addNewPage = () => {
           // Add footer to previous page before creating new page
           if (pageNumber > 1) {
             doc.setTextColor(107, 114, 128)
             doc.setFontSize(8)
             doc.text(`Page ${pageNumber - 1} of ${Math.ceil(students.length / 25) + 1}`, 105, 285, { align: 'center' })
             doc.text(`Showing students ${((pageNumber - 2) * 25) + 1}-${Math.min((pageNumber - 1) * 25, students.length)} of ${students.length}`, 105, 290, { align: 'center' })
           }
           
           doc.addPage()
           pageNumber++
           
           // Add header on new page
           doc.setFillColor(229, 62, 62)
           doc.rect(0, 0, 210, 35, 'F')
           
           doc.setTextColor(255, 255, 255)
           doc.setFontSize(16)
           doc.setFont('helvetica', 'bold')
           doc.text(`TERM ${selectedTerm} PERFORMANCE REPORT (PAGE ${pageNumber})`, 105, 15, { align: 'center' })
           
           doc.setFontSize(10)
           doc.setFont('helvetica', 'normal')
           doc.text(`Sol Plaatje University - Continued`, 105, 25, { align: 'center' })
           
           // Add table headers on new page
           return addTableHeaders(45)
         }
        
                 // Process all students with automatic pagination
         for (let i = 0; i < students.length; i++) {
           const student = students[i]
           
           // Check if we need a new page (approximately 25 students per page)
           if (currentYPos + rowHeight > maxYPosition) {
             currentYPos = addNewPage()
           }
           
           // Alternating row colors (reset for each page)
           const relativeIndex = Math.floor((currentYPos - 55) / rowHeight) // Calculate position relative to page start
           if (relativeIndex % 2 === 0) {
             doc.setFillColor(248, 250, 252)
             doc.rect(15, currentYPos, 180, rowHeight, 'F')
           }
           
           // Render student row
           doc.setTextColor(17, 24, 39)
           doc.setFontSize(8)
           doc.setFont('helvetica', 'normal')
           
           const name = student.name.length > 25 ? student.name.substring(0, 22) + '...' : student.name
           const school = student.school.length > 25 ? student.school.substring(0, 22) + '...' : student.school
           
           doc.text(name, colPositions[0], currentYPos + 5)
           doc.text(school, colPositions[1], currentYPos + 5)
           doc.text(`${student.average}%`, colPositions[2], currentYPos + 5)
           doc.text(student.status, colPositions[3], currentYPos + 5)
           
           currentYPos += rowHeight
         }
        
        // Add summary footer on last page
        const finalYPos = Math.min(currentYPos + 15, maxYPosition - 10)
        doc.setTextColor(34, 197, 94)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`✓ All ${students.length} students displayed across ${pageNumber} page${pageNumber > 1 ? 's' : ''}`, 20, finalYPos)
      }

      // Footer for last page
      doc.setDrawColor(229, 62, 62)
      doc.line(15, 265, 195, 265)
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(8)
      doc.text('Sol Plaatje University - Talent Pipeline Programme - Term Analytics Report', 105, 275, { align: 'center' })
      doc.text(`Page ${pageNumber} of ${pageNumber} | All ${students.length} students displayed`, 105, 285, { align: 'center' })
      doc.text(`Generated: ${timestamp}`, 105, 290, { align: 'center' })

      return doc.output('blob')
    } catch (error) {
      console.error('Error generating term-specific bulk PDF:', error)
      return null
    }
  }

  /**
   * Generate term-specific CSV report
   */
  private static generateTermSpecificCSVReportBlob(students: Student[], selectedTerm: number): Blob {
    const headers = ['Name', 'Email', 'School', 'Grade', `Term ${selectedTerm} Average`, `Term ${selectedTerm} Status`]
    const csvData = [
      headers.join(','),
      ...students.map(student => [
        `"${student.name}"`,
        `"${student.email}"`,
        `"${student.school}"`,
        `"${student.grade}"`,
        student.average,
        `"${student.status}"`
      ].join(','))
    ].join('\n')

    return new Blob([csvData], { type: 'text/csv' })
  }

  /**
   * Check if PDF generation is supported in current environment
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined'
  }
} 