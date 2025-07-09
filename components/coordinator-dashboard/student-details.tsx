"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BarChart, Printer, X, User, ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import type { Student, StudentSubject } from "./index"
import { PerformanceTrends } from "./performance-trends"

type StudentDetailsProps = {
  selectedStudent: string | null
  students: Student[]
  studentSubjects: StudentSubject[]
  selectedTerm: number
  setSelectedTerm: (term: number) => void
  setSelectedStudent: (id: string | null) => void
  setActiveTab: (tab: string) => void
}

interface Report {
  id: string
  name: string
  url: string
  uploadDate: string
  size: string
}

interface StudentProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  second_name: string | null;
  gender: string | null;
  population_group: string | null;
  high_school_situation: string | null;
  facilities: string[] | null;
  id_certificate: string | null;
  learner_cell_phone: string | null;
  learner_landline: string | null;
  parent_guardian_name: string | null;
  parent_guardian_contact: string | null;
  parent_guardian_landline: string | null;
  who_do_you_live_with: string[] | null;
  household_members: number | null;
  family_members_occupation: string | null;
  original_essay: string | null;
  main_language: string[] | null;
  religious_affiliation: string | null;
  positive_impact: string | null;
  plans_after_school: string | null;
  career_interest: string | null;
  personality_statements: string | null;
  successful_community_member: string | null;
  tips_for_friend: string | null;
  kimberley_challenges: string | null;
  school: string | null;
  grade: string | null;
  role: 'student' | 'coordinator' | 'admin';
  student_number: string | null;
  created_at: string;
  updated_at: string;
  profile_status: string;
  date_of_birth: string | null;
  phone_number: string | null;
  address: string | null;
  bio: string | null;
  hobbies: string | null;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({
  selectedStudent,
  students,
  studentSubjects,
  selectedTerm,
  setSelectedTerm,
  setSelectedStudent,
  setActiveTab,
}) => {
  const [viewingReports, setViewingReports] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [viewingProfile, setViewingProfile] = useState(false)
  const [openSections, setOpenSections] = useState({
    personal: true,
    contact: false,
    family: false,
    interests: false,
    language: false,
  })
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Load reports for the selected student from the database
  const loadStudentReports = async (studentId: string | number) => {
    setIsLoadingReports(true)
    try {
      const studentIdStr = String(studentId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('reports')
        .eq('id', studentIdStr)
        .single()
      
      if (error) throw error
      
      const studentReports: Report[] = profile.reports?.map((report: any) => ({
        id: report.id,
        name: report.name,
        url: report.url,
        uploadDate: new Date(report.uploadDate).toLocaleDateString(),
        size: formatFileSize(Number(report.size) || 0)
      })) || []
      
      setReports(studentReports)
      setViewingReports(true)
      
      if (studentReports.length === 0) {
        toast.info('No reports found for this student', {
          description: 'This student has not uploaded any reports yet.',
          position: 'top-center',
          duration: 3000
        })
      }
    } catch (error) {
      console.error("Error loading reports:", error)
      toast.error('Failed to load reports', {
        description: 'There was an error loading the student\'s reports. Please try again.',
        position: 'top-center',
        duration: 3000
      })
    } finally {
      setIsLoadingReports(false)
    }
  }
  
  // Load student profile information
  const loadStudentProfile = async (studentId: string | number) => {
    setIsLoadingProfile(true)
    try {
      const studentIdStr = String(studentId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentIdStr)
        .single()
      
      if (error) throw error
      
      setStudentProfile(profile)
      setViewingProfile(true)
      
    } catch (error) {
      console.error("Error loading student profile:", error)
      toast.error('Failed to load student profile', {
        description: 'There was an error loading the student\'s profile information. Please try again.',
        position: 'top-center',
        duration: 3000
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper function to format display values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided'
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not provided'
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }

  if (!selectedStudent) return null

  const student = students.find((s) => s.id === selectedStudent)
  if (!student) {
    console.error('Student not found:', { selectedStudent, students })
    return null
  }

  console.log('Rendering StudentDetails:', {
    selectedStudent,
    student,
    studentSubjects: studentSubjects.filter(s => s.studentId === selectedStudent)
  })

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header Actions */}
        <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedStudent(null)
                setActiveTab('overview')
              }} 
              className="flex items-center gap-2 w-full sm:w-auto justify-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Student List
            </Button>

            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => loadStudentProfile(student.id)}
                disabled={isLoadingProfile}
                className="flex items-center gap-2 justify-start w-full py-3 px-4 text-left"
              >
                {isLoadingProfile ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>Profile Info</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => loadStudentReports(student.id)}
                disabled={isLoadingReports}
                className="flex items-center gap-2 justify-start w-full py-3 px-4 text-left"
              >
                {isLoadingReports ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>View Reports</span>
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.print()} 
                className="flex items-center gap-2 justify-start w-full py-3 px-4 text-left sm:col-span-2 lg:col-span-1"
              >
                <Printer className="h-4 w-4 flex-shrink-0" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Student Overview Card */}
        <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Student Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl font-bold text-red-600">
                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 break-all sm:truncate">{student.email}</p>
                
                {/* Status Badge */}
                <div className="mt-2 sm:mt-3 flex items-center gap-2 justify-start">
                  <div className={`w-3 h-3 rounded-full ${
                    student.status === "Doing Well" ? "bg-green-500" :
                    student.status === "Needs Support" ? "bg-yellow-500" :
                    student.status === "At Risk" ? "bg-red-500" : "bg-gray-500"
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    student.status === "Doing Well" ? "text-green-700" :
                    student.status === "Needs Support" ? "text-yellow-700" :
                    student.status === "At Risk" ? "text-red-700" : "text-gray-700"
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Student Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* School Info */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-700">School</h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-900 font-medium break-words">
                  {student.school || 'Not specified'}
                </p>
              </div>

              {/* Grade Info */}
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-purple-700">Grade</h3>
                </div>
                <p className="text-xs sm:text-sm text-purple-900 font-medium">
                  Grade {student.grade || 'Not specified'}
                </p>
              </div>

              {/* Term-Specific Average */}
              <div className="bg-red-50 rounded-lg p-3 sm:p-4 col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-red-700">Term {selectedTerm} Average</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  {(() => {
                    const termData = studentSubjects.find((s) => s.studentId === selectedStudent && s.term === selectedTerm);
                    const termSubjects = termData?.subjects || [];
                    
                    if (termSubjects.length === 0) {
                      return (
                        <>
                          <span className="text-2xl font-bold text-gray-400">--</span>
                          <span className="text-xs text-gray-400">no data</span>
                        </>
                      );
                    }
                    
                    const validSubjects = termSubjects.filter(s => {
                      const percentage = Number.parseFloat(String(s.finalPercentage));
                      return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
                    });
                    
                    const average = validSubjects.length > 0 
                      ? Math.round(validSubjects.reduce((sum, s) => sum + Number.parseFloat(String(s.finalPercentage)), 0) / validSubjects.length)
                      : 0;
                      
                    return (
                      <>
                        <span className="text-2xl font-bold text-red-600">{average}%</span>
                        <span className="text-xs text-red-600">for this term</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Term Performance Section */}
        <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Performance by Term</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-6">
              {[1, 2, 3, 4].map((term) => (
                <Button
                  key={term}
                  variant={selectedTerm === term ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTerm(term)}
                  className={`${selectedTerm === term ? "bg-red-600 hover:bg-red-700 text-white" : "hover:bg-gray-50"} w-full text-xs sm:text-sm`}
                >
                  Term {term}
                </Button>
              ))}
            </div>

            <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Viewing detailed subject performance for Term {selectedTerm}
            </div>

            {studentSubjects.find((s) => s.studentId === selectedStudent && s.term === selectedTerm) ? (
              <div className="space-y-6">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Subject</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Level</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Final %</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Grade Average %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {studentSubjects
                        .find((s) => s.studentId === selectedStudent && s.term === selectedTerm)
                        ?.subjects.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-medium text-gray-900">{subject.name}</td>
                            <td className="px-4 py-4 text-gray-600">{subject.level}</td>
                            <td className="px-4 py-4">
                              <span className={`font-semibold ${
                                subject.finalPercentage >= 70 ? 'text-green-600' :
                                subject.finalPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {subject.finalPercentage}%
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`font-semibold ${
                                subject.gradeAverage >= 70 ? 'text-green-600' :
                                subject.gradeAverage >= 50 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {subject.gradeAverage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {studentSubjects
                    .find((s) => s.studentId === selectedStudent && s.term === selectedTerm)
                    ?.subjects.map((subject, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b">
                          <h4 className="font-medium text-gray-900 text-sm">{subject.name}</h4>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="text-left">
                            <div className="text-gray-600 text-xs">Level</div>
                              <div className="font-medium text-gray-900 mt-1">{subject.level}</div>
                          </div>
                            <div className="text-left">
                            <div className="text-gray-600 text-xs">Final %</div>
                              <div className={`font-semibold mt-1 ${
                              subject.finalPercentage >= 70 ? 'text-green-600' :
                              subject.finalPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {subject.finalPercentage}%
                            </div>
                          </div>
                            <div className="text-left">
                            <div className="text-gray-600 text-xs">Grade Avg %</div>
                              <div className={`font-semibold mt-1 ${
                              subject.gradeAverage >= 70 ? 'text-green-600' :
                              subject.gradeAverage >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {subject.gradeAverage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">No subject data available</p>
                    <p className="text-sm text-gray-500">This student hasn't submitted data for Term {selectedTerm} yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback & Subject Performance Section */}
            {studentSubjects.find((s) => s.studentId === selectedStudent && s.term === selectedTerm) && (
              <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="text-lg font-medium mb-3">Feedback & Subject Performance</h3>
                
                {(() => {
                  const termData = studentSubjects.find((s) => s.studentId === selectedStudent && s.term === selectedTerm);
                  const termSubjects = termData?.subjects || [];
                  
                  // Calculate average
                  const validSubjects = termSubjects.filter(s => {
                    const percentage = Number.parseFloat(String(s.finalPercentage));
                    return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
                  });
                  
                  const average = validSubjects.length > 0 
                    ? Math.round(validSubjects.reduce((sum, s) => sum + Number.parseFloat(String(s.finalPercentage)), 0) / validSubjects.length)
                    : 0;
                  
                  // Determine performance status
                  const performanceStatus = average >= 60 ? "Doing Well" : average >= 40 ? "Needs Support" : "At Risk";
                  
                  if (validSubjects.length === 0) {
                    return (
                      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-800 mb-2">No Performance Data Available</h4>
                        <p className="text-gray-600">
                          No valid percentage data available for Term {selectedTerm} subjects.
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      {/* Overall Feedback */}
                      <div className="mb-5 p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Overall Status:
                          <span
                            className={`ml-1 ${
                              performanceStatus === "Doing Well"
                                ? "text-green-600"
                                : performanceStatus === "Needs Support"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {performanceStatus}
                          </span>
                        </h4>
                        <p className="text-gray-700">
                          {performanceStatus === "Doing Well"
                            ? "Keep up the good work! This student is performing well in their academic studies."
                            : performanceStatus === "Needs Support"
                              ? "This student is making progress but may benefit from additional support in some subjects."
                              : "This student's current performance indicates they need immediate academic support. Consider scheduling a meeting with their teachers."}
                        </p>
                      </div>

                      {/* Subject Performance Breakdown */}
                      <div className="space-y-4">
                        {/* Doing Well Subjects */}
                        <div>
                          <h4 className="flex items-center text-sm font-medium text-green-700 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            Doing Well (&ge; 60%)
                          </h4>
                          <div className="pl-5 space-y-1">
                            {termSubjects.filter((s) => {
                              const percentage = Number.parseFloat(String(s.finalPercentage));
                              return !isNaN(percentage) && percentage >= 60;
                            }).length > 0 ? (
                              termSubjects
                                .filter((s) => {
                                  const percentage = Number.parseFloat(String(s.finalPercentage));
                                  return !isNaN(percentage) && percentage >= 60;
                                })
                                .map((subject, index) => (
                                  <div
                                    key={`well-${index}`}
                                    className="flex justify-between items-center py-1 border-b border-gray-100"
                                  >
                                    <span className="text-gray-800">{subject.name}</span>
                                    <span className="font-medium text-green-600">{subject.finalPercentage}%</span>
                                  </div>
                                ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">No subjects in this category</p>
                            )}
                          </div>
                        </div>

                        {/* Needs Support Subjects */}
                        <div>
                          <h4 className="flex items-center text-sm font-medium text-yellow-700 mb-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            Needs Support (40-59%)
                          </h4>
                          <div className="pl-5 space-y-1">
                            {termSubjects.filter((s) => {
                              const percentage = Number.parseFloat(String(s.finalPercentage));
                              return !isNaN(percentage) && percentage >= 40 && percentage < 60;
                            }).length > 0 ? (
                              termSubjects
                                .filter((s) => {
                                  const percentage = Number.parseFloat(String(s.finalPercentage));
                                  return !isNaN(percentage) && percentage >= 40 && percentage < 60;
                                })
                                .map((subject, index) => (
                                  <div
                                    key={`support-${index}`}
                                    className="flex justify-between items-center py-1 border-b border-gray-100"
                                  >
                                    <span className="text-gray-800">{subject.name}</span>
                                    <span className="font-medium text-yellow-600">{subject.finalPercentage}%</span>
                                  </div>
                                ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">No subjects in this category</p>
                            )}
                          </div>
                        </div>

                        {/* At Risk Subjects */}
                        <div>
                          <h4 className="flex items-center text-sm font-medium text-red-700 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            At Risk (&lt; 40%)
                          </h4>
                          <div className="pl-5 space-y-1">
                            {termSubjects.filter((s) => {
                              const percentage = Number.parseFloat(String(s.finalPercentage));
                              return !isNaN(percentage) && percentage < 40;
                            }).length > 0 ? (
                              termSubjects
                                .filter((s) => {
                                  const percentage = Number.parseFloat(String(s.finalPercentage));
                                  return !isNaN(percentage) && percentage < 40;
                                })
                                .map((subject, index) => (
                                  <div
                                    key={`risk-${index}`}
                                    className="flex justify-between items-center py-1 border-b border-gray-100"
                                  >
                                    <span className="text-gray-800">{subject.name}</span>
                                    <span className="font-medium text-red-600">{subject.finalPercentage}%</span>
                                  </div>
                                ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">No subjects in this category</p>
                            )}
                          </div>
                        </div>

                        {/* Missing Data Subjects */}
                        <div>
                          <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                            Missing Percentage Data
                          </h4>
                          <div className="pl-5 space-y-1">
                            {termSubjects.filter((s) => {
                              if (!s.finalPercentage || String(s.finalPercentage).trim() === "") return true;
                              const percentage = Number.parseFloat(String(s.finalPercentage));
                              return isNaN(percentage) || percentage < 0 || percentage > 100;
                            }).length > 0 ? (
                              termSubjects
                                .filter((s) => {
                                  if (!s.finalPercentage || String(s.finalPercentage).trim() === "") return true;
                                  const percentage = Number.parseFloat(String(s.finalPercentage));
                                  return isNaN(percentage) || percentage < 0 || percentage > 100;
                                })
                                .map((subject, index) => (
                                  <div
                                    key={`missing-${index}`}
                                    className="flex justify-between items-center py-1 border-b border-gray-100"
                                  >
                                    <span className="text-gray-800">{subject.name}</span>
                                    <span className="text-xs text-gray-500 italic">No valid data</span>
                                  </div>
                                ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">All subjects have valid data</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Performance Trends Section */}
        <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Performance Trends</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Subject performance across all terms</p>
            <PerformanceTrends student={student} studentSubjects={studentSubjects} />
          </div>
        </div>
      </div>

      {/* Mobile Print Button */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <Button
          onClick={() => window.print()}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full h-12 w-12 shadow-lg"
        >
          <Printer className="h-5 w-5" />
        </Button>
      </div>

      {/* Student Profile Dialog */}
      <Dialog open={viewingProfile} onOpenChange={setViewingProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600 mt-1">View student's personal information and preferences.</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {studentProfile ? (
            <div className="space-y-4">
              {/* A. Personal Details */}
              <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">A. Personal Details</div>
                    </div>
                    {openSections.personal ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Surname</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.last_name)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.first_name)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Second Name</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.second_name)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gender</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.gender)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Population Group</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.population_group)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Current Grade</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.grade)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">High School</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.school)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Where is your high school situated?</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.high_school_situation)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Facilities at your high school</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                        {formatValue(studentProfile.facilities)}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* B. Contact Details */}
              <Collapsible open={openSections.contact} onOpenChange={() => toggleSection('contact')}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">B. Contact Details</div>
                    </div>
                    {openSections.contact ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID/Birth Certificate Number</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.id_certificate)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Cell Phone Number</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.learner_cell_phone)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Landline Number (Optional)</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.learner_landline)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Parent/Guardian Name</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.parent_guardian_name)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Parent/Guardian Cell Phone Number</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.parent_guardian_contact)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Parent/Guardian Landline Number</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.parent_guardian_landline)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Learner Email Address</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.email)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* C. Family and Community */}
              <Collapsible open={openSections.family} onOpenChange={() => toggleSection('family')}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">C. Family and Community</div>
                    </div>
                    {openSections.family ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Who do you live with?</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                        {formatValue(studentProfile.who_do_you_live_with)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Number of Household Members</label>
                        <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                          {formatValue(studentProfile.household_members)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Family Members' Occupation and Education</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.family_members_occupation)}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* D. Interests and Future Plans */}
              <Collapsible open={openSections.interests} onOpenChange={() => toggleSection('interests')}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">D. Interests and Future Plans</div>
                    </div>
                    {openSections.interests ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Person who had a positive impact on you</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.positive_impact)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Plans after school</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.plans_after_school)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Career(s) or job(s) interested in and why</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.career_interest)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Three statements about your personality/character</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.personality_statements)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Describe a successful community member and why</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.successful_community_member)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Three tips for a friend to succeed in TPP</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.tips_for_friend)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Challenges you expect to face in Kimberley</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[60px]">
                        {formatValue(studentProfile.kimberley_challenges)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Original Essay (300–500 words)</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900 min-h-[120px]">
                        {formatValue(studentProfile.original_essay)}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* E. Language and Religion */}
              <Collapsible open={openSections.language} onOpenChange={() => toggleSection('language')}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">E. Language and Religion</div>
                    </div>
                    {openSections.language ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Main Language(s)</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                        {formatValue(studentProfile.main_language)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Religious Affiliation</label>
                      <div className="mt-1 p-2 bg-white border rounded-md text-sm text-gray-900">
                        {formatValue(studentProfile.religious_affiliation)}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">No profile data available</p>
                  <p className="text-sm text-gray-500">Profile information could not be loaded</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={viewingReports} onOpenChange={setViewingReports}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Academic Reports
            </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {student.name} • {reports.length} {reports.length === 1 ? 'report' : 'reports'}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-1">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
                <p className="text-gray-600">This student hasn't uploaded any academic reports yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="group border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg transition-colors">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                            {report.name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <span className="text-sm text-gray-600">
                                {new Date(report.uploadDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                            </span>
                          </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <span className="text-sm text-gray-600">{report.size}</span>
                        </div>
                      </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(report.url, '_blank')}
                          className="flex items-center gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 group-hover:shadow-sm transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = report.url
                            link.download = report.name
                            link.target = '_blank'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="flex items-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 group-hover:shadow-sm transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Enhanced footer with helpful info */}
          {reports.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total: {reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>
                <span>Click View to open in new tab or Download to save locally</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentDetails
