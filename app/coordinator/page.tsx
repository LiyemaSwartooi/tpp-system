"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User } from "@supabase/supabase-js"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/coordinator-dashboard/sidebar"
import { SummaryCards } from "@/components/coordinator-dashboard/summary-cards"
import { StudentTable } from "@/components/coordinator-dashboard/student-table"
import { StudentDetails } from "@/components/coordinator-dashboard/student-details"
import { PasswordManagement } from "@/components/coordinator-dashboard/password-management"
import { type StatusKey, type Student, type StudentSubject } from "@/components/coordinator-dashboard"
import { createBrowserClient } from "@supabase/ssr"
import { ErrorBoundary, DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { 
  DataLoading, 
  SummaryCardsLoadingSkeleton, 
  TableSkeleton, 
  MobileCardSkeleton, 
  ButtonLoading,
  Spinner,
  PageLoading
} from "@/components/ui/loading"
import { AlertTriangle } from "lucide-react"
import { 
  useFormValidation, 
  ValidationRules, 
  ValidatedInput 
} from "@/components/ui/form-validation"

interface UserInfo {
  name: string
  email: string
  avatarFallback: string
  role: string
}

export default function CoordinatorDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [schoolFilter, setSchoolFilter] = useState("all")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState(1)
  const [isMobileView, setIsMobileView] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    avatarFallback: "",
    role: "coordinator"
  })
  const [students, setStudents] = useState<Student[]>([])
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Sort state
  const [sortBy, setSortBy] = useState<"name" | "school" | "average" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Check for mobile view on component mount and window resize
  React.useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    // Initial check
    checkMobileView()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobileView)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  // Form validation for search
  const {
    values: searchFormValues,
    errors: searchFormErrors,
    touched: searchFormTouched,
    handleChange: handleSearchFormChange,
    handleBlur: handleSearchFormBlur,
    resetForm: resetSearchForm
  } = useFormValidation(
    { search: "" },
    { search: ValidationRules.search }
  )

  // Fetch user data and verify role
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        setIsLoading(true)
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        if (!user) {
          router.push('/access-portal')
          return
        }

        // Fetch user profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          throw new Error('Failed to fetch user profile')
        }

        // Check if user has coordinator role
        if (profile.role !== 'coordinator') {
          toast.error('Access denied. Coordinator access required.', {
            position: 'top-right',
            duration: 5000,
          })
          router.push(profile.role === 'student' ? '/student' : '/access-portal')
          return
        }

        // Welcome message for coordinator
        toast.success(`Welcome back, ${[profile.first_name, profile.last_name].filter(Boolean).join(' ')}!`, {
          position: 'top-right',
          duration: 4000,
        })

        // Set user info from session
        setUserInfo({
          name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatarFallback: [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'U',
          role: profile.role
        })

        // Fetch students and their subjects from the database
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select(`
            id, first_name, last_name, email, selected_school, current_grade,
            overall_average, overall_performance_status, updated_at,
            term1_subjects, term2_subjects, term3_subjects, term4_subjects
          `)
          .eq('role', 'student');

        if (studentsError) {
          throw studentsError;
        }

        const fetchedStudents: Student[] = [];
        const fetchedStudentSubjects: StudentSubject[] = [];

        if (studentsData) {
          studentsData.forEach((studentProfile) => {
            const studentId = studentProfile.id;
            const overallAverage = Number(studentProfile.overall_average) || 0;
            const overallPerformanceStatus = (studentProfile.overall_performance_status as StatusKey) || "No Data";

            fetchedStudents.push({
              id: studentId,
              first_name: studentProfile.first_name || '',
              last_name: studentProfile.last_name || '',
              name: `${studentProfile.first_name || ''} ${studentProfile.last_name || ''}`.trim(),
              email: studentProfile.email || '',
              school: studentProfile.selected_school || '',
              grade: studentProfile.current_grade || '',
              average: overallAverage,
              status: overallPerformanceStatus,
              lastUpdated: studentProfile.updated_at || '',
              subjectsCount: 0, // Will be calculated below
            });

            let totalSubjectsAcrossTerms = 0;
            for (let term = 1; term <= 4; term++) {
              const termSubjectsKey = `term${term}_subjects` as keyof typeof studentProfile;
              const subjectsForTerm = (studentProfile[termSubjectsKey] || []) as Array<any>;

              if (subjectsForTerm.length > 0) {
                totalSubjectsAcrossTerms += subjectsForTerm.length;
                fetchedStudentSubjects.push({
                  studentId: studentId,
                  term: term,
                  subjects: subjectsForTerm.map(s => ({
                    name: s.name,
                    level: Number(s.level),
                    finalPercentage: Number(s.finalPercentage),
                    gradeAverage: Number(s.gradeAverage),
                  }))
                });
              }
            }
            // Update subjectsCount for the current student after processing all terms
            const studentIndex = fetchedStudents.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
              fetchedStudents[studentIndex].subjectsCount = totalSubjectsAcrossTerms;
            }
          });
        }

        console.log('Fetched Students:', fetchedStudents);
        console.log('Fetched Student Subjects:', fetchedStudentSubjects);

        setStudents(fetchedStudents);
        setStudentSubjects(fetchedStudentSubjects);
        
        // Success feedback
        toast.success(`Successfully loaded ${fetchedStudents.length} students`, {
          position: 'top-right',
          duration: 3000,
        })
        
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'
        setError(errorMessage)
        toast.error(`Error: ${errorMessage}`, {
          position: 'top-right',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase.auth, router]);

  // Calculate term-specific student data
  const studentsWithTermData = students.map((student) => {
    const termData = studentSubjects.find((s) => s.studentId === student.id && s.term === selectedTerm);
    
    if (!termData || termData.subjects.length === 0) {
      return {
        ...student,
        average: 0,
        status: "No Data" as StatusKey
      };
    }

    const validSubjects = termData.subjects.filter(s => {
      const percentage = Number.parseFloat(String(s.finalPercentage));
      return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
    });
    
    if (validSubjects.length === 0) {
      return {
        ...student,
        average: 0,
        status: "No Data" as StatusKey
      };
    }
    
    const average = Math.round(validSubjects.reduce((sum, s) => sum + Number.parseFloat(String(s.finalPercentage)), 0) / validSubjects.length);
    const status: StatusKey = average >= 60 ? "Doing Well" : average >= 40 ? "Needs Support" : "At Risk";
      
    return {
      ...student,
      average,
      status
    };
  });

  // Calculate summary statistics based on term-specific data
  const totalStudents = studentsWithTermData.length;
  const atRiskCount = studentsWithTermData.filter((student) => student.status === "At Risk").length;
  const needsSupportCount = studentsWithTermData.filter((student) => student.status === "Needs Support").length;
  const doingWellCount = studentsWithTermData.filter((student) => student.status === "Doing Well").length;
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    total: students.length,
    limit: 20,
    totalPages: Math.ceil(students.length / 20)
  });

  // Enhanced search functionality with debouncing
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setIsSearching(false)
    }, 300)

    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true)
    }

    return () => clearTimeout(timer)
  }, [searchQuery, debouncedSearchQuery])

  // Filter students based on search query, status, school, and grade filters (client-side for better performance)
  const filteredStudents = studentsWithTermData.filter((student) => {
    // Case-insensitive search across name, email, and school
    const matchesSearch = debouncedSearchQuery === "" || 
      student.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (student.school && student.school.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesSchool = schoolFilter === "all" || student.school === schoolFilter;
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesSchool && matchesGrade;
  });

  // Sort students based on current sort settings
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortBy === "school") {
      return sortDirection === "asc" ? (a.school || '').localeCompare(b.school || '') : (b.school || '').localeCompare(a.school || '');
    } else if (sortBy === "average") {
      return sortDirection === "asc" ? a.average - b.average : b.average - a.average;
    } else if (sortBy === "status") {
      const statusOrder: Record<StatusKey, number> = { "At Risk": 1, "Needs Support": 2, "Doing Well": 3, "No Data": 4 };
      return sortDirection === "asc"
        ? statusOrder[a.status as StatusKey] - statusOrder[b.status as StatusKey]
        : statusOrder[b.status as StatusKey] - statusOrder[a.status as StatusKey]
    }
    return 0
  })

  // Handle sort change
  const handleSort = (column: "name" | "school" | "average" | "status") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  // Sidebar content for coordinator dashboard
  const sidebarContent = <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

  // Loading state
  if (isLoading) {
    return <PageLoading message="Loading coordinator dashboard..." />
  }

  // Error state
  if (error && !isLoading) {
    return (
      <DashboardLayout
        sidebarContent={sidebarContent}
        userInfo={userInfo}
        portalType="Coordinator"
        title="Coordinator Dashboard"
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <ButtonLoading
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </ButtonLoading>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  console.log('Current State:', {
    activeTab,
    selectedStudent,
    studentsCount: students.length,
    studentSubjectsCount: studentSubjects.length,
    selectedStudentData: selectedStudent ? students.find(s => s.id === selectedStudent) : null,
    selectedStudentSubjects: selectedStudent ? studentSubjects.filter(s => s.studentId === selectedStudent) : []
  });

  return (
    <ErrorBoundary>
      <DashboardLayout
        sidebarContent={sidebarContent}
        userInfo={userInfo}
        portalType="Coordinator"
        title="Coordinator Dashboard"
      >
        <div className="min-h-screen bg-gray-50">
          <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 pb-20 sm:pb-8">
            {activeTab === "overview" ? (
              <>
                {/* Header Section */}
                <DashboardErrorBoundary>
                  <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {/* Title */}
                      <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                          Student Performance - Term {selectedTerm}
                        </h1>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                          Monitor and manage student progress across all schools
                        </p>
                      </div>

                      {/* Controls Section */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        {/* Term Selector - Mobile Optimized */}
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">Select Term:</span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {[1, 2, 3, 4].map((term) => (
                              <button
                                key={term}
                                onClick={() => setSelectedTerm(term)}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-w-[44px] sm:min-w-[48px] ${
                                  selectedTerm === term
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                                }`}
                              >
                                Term {term}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="hidden sm:inline">Live Dashboard</span>
                          <span className="sm:hidden">Live</span>
                          {isSearching && (
                            <>
                              <Spinner size="sm" />
                              <span className="hidden xs:inline">Searching...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </DashboardErrorBoundary>

                {/* Summary Cards */}
                <DashboardErrorBoundary>
                  <div className="space-y-3 sm:space-y-4">
                    <DataLoading
                      loading={isLoading}
                      error={error}
                      skeleton={<SummaryCardsLoadingSkeleton />}
                    >
                      <SummaryCards
                        totalStudents={totalStudents}
                        atRiskCount={atRiskCount}
                        needsSupportCount={needsSupportCount}
                        doingWellCount={doingWellCount}
                      />
                    </DataLoading>
                  </div>
                </DashboardErrorBoundary>

                {/* Main Content */}
                <DashboardErrorBoundary>
                  <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border overflow-hidden">
                    <DataLoading
                      loading={isLoading}
                      error={error}
                      skeleton={isMobileView ? <MobileCardSkeleton /> : <TableSkeleton />}
                    >
                      <StudentTable
                        students={sortedStudents}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        schoolFilter={schoolFilter}
                        setSchoolFilter={setSchoolFilter}
                        gradeFilter={gradeFilter}
                        setGradeFilter={setGradeFilter}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onViewDetails={(student) => {
                          setSelectedStudent(student.id);
                          setActiveTab("student-details");
                        }}
                        onViewReport={(student) => {
                          setSelectedStudent(student.id);
                          setActiveTab("student-report");
                        }}
                        onViewSubjects={(student) => {
                          setSelectedStudent(student.id);
                          setActiveTab("student-subjects");
                        }}
                        setActiveTab={setActiveTab}
                        pagination={pagination}
                        selectedTerm={selectedTerm}
                        studentSubjects={studentSubjects}
                        isSearching={isSearching}
                      />
                    </DataLoading>
                  </div>
                </DashboardErrorBoundary>
              </>
            ) : activeTab === "password-management" ? (
              <PasswordManagement />
            ) : activeTab === "student-details" ? (
              <DashboardErrorBoundary>
                <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border overflow-hidden">
                  <DataLoading
                    loading={isLoading}
                    error={error}
                    skeleton={<div className="p-3 sm:p-6"><Spinner className="mx-auto" /></div>}
                  >
                    <StudentDetails
                      selectedStudent={selectedStudent}
                      students={students}
                      studentSubjects={studentSubjects}
                      selectedTerm={selectedTerm}
                      setSelectedTerm={setSelectedTerm}
                      setSelectedStudent={setSelectedStudent}
                      setActiveTab={setActiveTab}
                    />
                  </DataLoading>
                </div>
              </DashboardErrorBoundary>
            ) : null}
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  )
}
