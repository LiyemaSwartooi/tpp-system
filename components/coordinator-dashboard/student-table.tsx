"use client"
import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Search, FileDown, Users, ChevronDown, Download, CheckSquare, Square } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { PdfService } from '@/lib/services/pdf-service';
import { 
  ValidatedInput, 
  ValidatedSelect, 
  ValidationRules, 
  useFormValidation 
} from "@/components/ui/form-validation"
import { ButtonLoading, Spinner } from "@/components/ui/loading"
import { toast } from "sonner"
import type { Student } from "./index"

interface StudentTableProps {
  students: Student[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  schoolFilter?: string
  setSchoolFilter?: (school: string) => void
  sortBy: "name" | "school" | "average" | "status"
  sortDirection: "asc" | "desc"
  onSort: (column: "name" | "school" | "average" | "status") => void
  onViewDetails: (student: Student) => void
  onViewReport: (student: Student) => void
  onViewSubjects: (student: Student) => void
  setActiveTab: (tab: string) => void
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  selectedTerm: number
  studentSubjects: Array<{
    studentId: string
    term: number
    subjects: Array<{
      name: string
      level: number
      finalPercentage: number
      gradeAverage: number
    }>
  }>
  isLoading?: boolean
  isSearching?: boolean
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  schoolFilter = "all",
  setSchoolFilter = () => {},
  sortBy,
  sortDirection,
  onSort,
  onViewDetails,
  onViewReport,
  onViewSubjects,
  setActiveTab,
  pagination,
  selectedTerm,
  studentSubjects,
  isLoading,
  isSearching = false,
}) => {
  // Loading state for PDF download
  const [isPdfGenerating, setIsPdfGenerating] = React.useState(false)
  
  // State for download status filter
  const [downloadStatus, setDownloadStatus] = React.useState("all")
  
  // Bulk selection state
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)
  
  // Keyboard shortcuts for accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A to select all visible students
      if (event.ctrlKey && event.key === 'a' && students.length > 0) {
        event.preventDefault()
        const visibleStudentIds = new Set(students.map(student => student.id))
        setSelectedStudents(visibleStudentIds)
        setIsAllSelected(true)
      }
      // Escape to clear selection
      if (event.key === 'Escape' && selectedStudents.size > 0) {
        setSelectedStudents(new Set())
        setIsAllSelected(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [students, selectedStudents.size])
  
  // Reset selection when term changes (since data context changes)
  React.useEffect(() => {
    setSelectedStudents(new Set())
    setIsAllSelected(false)
  }, [selectedTerm])
  
  // Form validation for search and filters
  const {
    values: formValues,
    errors: formErrors,
    touched: formTouched,
    handleChange,
    handleBlur
  } = useFormValidation(
    { 
      search: searchQuery,
      status: statusFilter,
      school: schoolFilter
    },
    { 
      search: ValidationRules.search,
      status: { required: false },
      school: { required: false }
    }
  )
  // Bulk selection helper functions
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudents(new Set())
      setIsAllSelected(false)
    } else {
      // Only select visible students for better performance
      const visibleStudentIds = new Set(students.map(student => student.id))
      setSelectedStudents(visibleStudentIds)
      setIsAllSelected(true)
    }
  }

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
    setIsAllSelected(newSelected.size === students.length)
  }

  // Handle search input with validation
  const handleSearchChange = (value: string) => {
    // Check if the input contains numbers or invalid characters
    const hasNumbers = /\d/.test(value)
    const hasInvalidChars = /[^a-zA-Z\s]/.test(value)
    
    if (hasNumbers) {
      toast.error("Search can only contain letters and spaces - numbers not allowed!", {
        position: 'top-right',
        duration: 3000,
      })
      return // Don't update the search query
    }
    
    if (hasInvalidChars) {
      toast.error("Search can only contain letters and spaces - special characters not allowed!", {
        position: 'top-right',
        duration: 3000,
      })
      return // Don't update the search query
    }
    
    // If validation passes, update the search query
    setSearchQuery(value)
  }

  // Function to handle bulk report generation for selected term
  const handleBulkDownloadReports = async (type: 'selected' | 'all' | 'status', status?: string) => {
    try {
      setIsPdfGenerating(true)
      
      let targetStudents: Student[] = [];
      let description = "";
      
      if (type === 'selected') {
        targetStudents = students.filter(student => selectedStudents.has(student.id));
        description = `${targetStudents.length} selected students`;
      } else if (type === 'status' && status) {
        targetStudents = students.filter(student => student.status === status);
        description = `students with "${status}" status`;
      } else {
        targetStudents = students;
        description = "all students";
      }
      
      if (targetStudents.length === 0) {
        toast.error(`No students found for ${description}`, {
          position: 'top-right',
          duration: 3000,
        });
        return;
      }
      
      toast.info(`Generating Term ${selectedTerm} reports for ${description}...`, {
        position: 'top-right',
        duration: 3000,
      })
      
      if (!PdfService.isSupported()) {
        console.error('PDF generation not supported in this environment');
        toast.error('PDF generation not supported in this browser', {
          position: 'top-right',
          duration: 5000,
        })
        return;
      }

      // Generate term-specific report data
      const studentsWithTermData = targetStudents.map(student => {
        const termData = studentSubjects.find(s => s.studentId === student.id && s.term === selectedTerm);
        return {
          ...student,
          termData: termData?.subjects || [],
          term: selectedTerm
        };
      });

      const blob = await PdfService.generateTermSpecificReportBlob(studentsWithTermData, selectedTerm);
      if (blob) {
        const isCSV = blob.type.includes('csv')
        const extension = isCSV ? 'csv' : 'pdf'
        const fileName = `Term_${selectedTerm}_${description.replace(/\s+/g, '_')}_Report.${extension}`;
        PdfService.downloadPdf(blob, fileName);
        toast.success(`Successfully generated Term ${selectedTerm} reports for ${targetStudents.length} students!`, {
          position: 'top-right',
          duration: 4000,
        })
      } else {
        console.error('Failed to generate PDF');
        toast.error('Failed to generate PDF report. Please try again.', {
          position: 'top-right',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error downloading student reports:', error);
      toast.error('Error generating PDF report. Please try again.', {
        position: 'top-right',
        duration: 5000,
      })
    } finally {
      setIsPdfGenerating(false)
    }
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Title Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Student Overview - Term {selectedTerm}
            </h3>
            <p className="text-sm text-gray-600">
              View and manage student performance for the selected term
            </p>
          </div>

          {/* Mobile-Optimized Actions Section */}
          <div className="flex flex-col gap-3">
            {/* Bulk Actions Bar - Full width on mobile */}
            {selectedStudents.size > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none text-blue-600 border-blue-300 hover:bg-blue-100"
                    onClick={() => handleBulkDownloadReports('selected')}
                    disabled={isPdfGenerating}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    <span className="hidden xs:inline">Download Reports</span>
                    <span className="xs:hidden">Download</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700 px-3"
                    onClick={() => {
                      setSelectedStudents(new Set())
                      setIsAllSelected(false)
                    }}
                    title="Clear selection"
                  >
                    <Square className="h-3 w-3" />
                    <span className="sr-only">Clear selection</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* Quick Actions Dropdown - Full width on mobile */}
            <div className="flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:text-green-700 w-full sm:w-auto px-4 py-2 text-sm min-h-[40px]"
                    disabled={students.length === 0 || isPdfGenerating}
                  >
                    <FileDown className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      {isPdfGenerating ? 'Generating PDF...' : 'Term Reports'}
                    </span>
                    <span className="sm:hidden">
                      {isPdfGenerating ? 'Generating...' : 'Term Reports'}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 sm:w-64">
                  <div className="px-3 py-2 border-b text-xs font-medium text-gray-600 uppercase">
                    Term {selectedTerm} Reports
                  </div>
                  <DropdownMenuItem
                    onClick={() => handleBulkDownloadReports('all')}
                    disabled={isPdfGenerating}
                    className="py-3"
                  >
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-1">All Students (Term {selectedTerm})</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkDownloadReports('status', 'Doing Well')}
                    disabled={isPdfGenerating}
                    className="py-3"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                    <span className="flex-1">Doing Well Students</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      ({students.filter(s => s.status === 'Doing Well').length})
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkDownloadReports('status', 'Needs Support')}
                    disabled={isPdfGenerating}
                    className="py-3"
                  >
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3 flex-shrink-0"></div>
                    <span className="flex-1">Needs Support Students</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      ({students.filter(s => s.status === 'Needs Support').length})
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkDownloadReports('status', 'At Risk')}
                    disabled={isPdfGenerating}
                    className="py-3"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                    <span className="flex-1">At Risk Students</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      ({students.filter(s => s.status === 'At Risk').length})
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-3 py-2 text-xs text-gray-500">
                    💡 Select students below for custom reports
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <ValidatedInput
              label=""
              name="search"
              type="search"
              placeholder="Search by name or school (letters only)..."
              className="pl-10 bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
              value={searchQuery}
              onChange={handleSearchChange}
              onBlur={() => handleBlur('search')}
              validation={ValidationRules.search}
              touched={formTouched.search}
              errors={formErrors.search}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status Filter</label>
            <select
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Doing Well">Doing Well</option>
              <option value="Needs Support">Needs Support</option>
              <option value="At Risk">At Risk</option>
                <option value="No Data">No Data</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">School Filter</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
              >
                <option value="all">All Schools</option>
                <option value="Baitiredi Technical High School">Baitiredi Technical High School</option>
                <option value="Bankhara Bodulong High School">Bankhara Bodulong High School</option>
                <option value="Galaletsang High School">Galaletsang High School</option>
                <option value="KP Toto Technical and Commercial High School">KP Toto Technical and Commercial High School</option>
                <option value="Olebogeng High School">Olebogeng High School</option>
                <option value="Lebang Secondary School">Lebang Secondary School</option>
                <option value="Postmasburg High School">Postmasburg High School</option>
                <option value="Blinkklip High School">Blinkklip High School</option>
                <option value="Ratang Thuto High School">Ratang Thuto High School</option>
                <option value="SA Van Wyk High School">SA Van Wyk High School</option>
                <option value="AlexanderBaai High School">AlexanderBaai High School</option>
            </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchQuery || statusFilter !== "all" || schoolFilter !== "all") && (
        <div className="px-4 sm:px-6 py-3 bg-blue-50 border-b border-gray-200">
          <p className="text-sm text-blue-700">
            Showing {students.length} of {students.length} students
            {searchQuery && <span> matching "{searchQuery}"</span>}
            {statusFilter !== "all" && <span> with status "{statusFilter}"</span>}
            {schoolFilter !== "all" && <span> from "{schoolFilter}"</span>}
          </p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-6 font-medium text-gray-700 w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-400"
                />
              </th>
              <th
                className="text-left py-3 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onSort("name")}
                >
                <div className="flex items-center gap-2">
                    <span>Student Name</span>
                  {sortBy === "name" && <span className="text-red-500">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
              <th
                className="text-left py-3 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort("school")}
              >
                <div className="flex items-center gap-2">
                  <span>School</span>
                  {sortBy === "school" && <span className="text-red-500">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Grade</th>
                <th
                className="text-left py-3 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onSort("average")}
                >
                <div className="flex items-center gap-2">
                    <span>Term Average</span>
                  {sortBy === "average" && <span className="text-red-500">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
                <th
                className="text-left py-3 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onSort("status")}
                >
                <div className="flex items-center gap-2">
                    <span>Status</span>
                  {sortBy === "status" && <span className="text-red-500">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={() => handleSelectStudent(student.id)}
                      className="border-gray-400"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-red-100">
                        <AvatarFallback className="text-red-600 text-sm">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{student.school || 'Not specified'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-900">
                      {student.grade || 'Not specified'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                                          <div className="text-sm font-semibold text-gray-900">{Math.round(student.average)}%</div>
                    </td>
                  <td className="py-4 px-6">
                        <Badge
                      variant={
                        student.status === "Doing Well" ? "default" :
                        student.status === "Needs Support" ? "secondary" :
                        student.status === "At Risk" ? "destructive" : "outline"
                      }
                      className={
                        student.status === "Doing Well" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                        student.status === "Needs Support" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                        student.status === "At Risk" ? "bg-red-100 text-red-800 hover:bg-red-200" : 
                        "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }
                        >
                          {student.status}
                        </Badge>
                  </td>
                  <td className="py-4 px-6">
                        <Button
                      variant="outline"
                          size="sm"
                      onClick={() => onViewDetails(student)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          View Details
                        </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-gray-300" />
                    <p>No students match your search criteria</p>
                  </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      {/* Mobile Table View - Consistent with Desktop */}
      <div className="lg:hidden">
        {students.length > 0 ? (
          <div className="space-y-3 p-3 sm:p-4">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                {/* Mobile Card */}
                <div className="p-4">
                  {/* Header: Checkbox + Student Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={() => handleSelectStudent(student.id)}
                      className="border-gray-400 flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-8 w-8 bg-red-100 flex-shrink-0">
                          <AvatarFallback className="text-red-600 text-xs font-medium">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm truncate">{student.name}</div>
                          <div className="text-xs text-gray-500 truncate">{student.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* School & Grade Info */}
                  <div className="mb-3 pl-8">
                    <div className="text-sm text-gray-600 truncate">{student.school || 'Not specified'}</div>
                    <div className="text-xs text-gray-500">Grade: {student.grade || 'Not specified'}</div>
                  </div>
                  
                  {/* Performance & Status Row */}
                  <div className="flex items-center justify-between mb-3 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{Math.round(student.average)}%</div>
                        <div className="text-xs text-gray-500">Term Avg</div>
                      </div>
                      <Badge
                        variant={
                          student.status === "Doing Well" ? "default" :
                          student.status === "Needs Support" ? "secondary" :
                          student.status === "At Risk" ? "destructive" : "outline"
                        }
                        className={`text-xs ${
                          student.status === "Doing Well" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                          student.status === "Needs Support" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                          student.status === "At Risk" ? "bg-red-100 text-red-800 hover:bg-red-200" : 
                          "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="pl-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(student)}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 text-sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="flex flex-col items-center gap-3">
              <Users className="h-12 w-12 text-gray-300" />
              <div>
                <p className="font-medium">No students found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Also export as default for compatibility
export default StudentTable
