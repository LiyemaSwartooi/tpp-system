"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { smartToast } from "@/lib/smart-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageLoading } from "@/components/ui/loading"
import { Sidebar } from "@/components/student-dashboard/sidebar"
import { ProfileForm } from "@/components/student-dashboard/profile-form"
import { InputForm } from "@/components/student-dashboard/input-form"
import { PerformanceSummary } from "@/components/student-dashboard/performance-summary"
import { supabase } from "@/lib/supabase"
import { createBrowserClient } from '@supabase/ssr'
import { PerformanceTrends } from '@/components/student-dashboard/performance-trends'
import { ErrorBoundary, DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { 
  useFormValidation, 
  ValidationRules, 
  ValidationSummary 
} from "@/components/ui/form-validation"
import { CheckCircle, School, GraduationCap, PartyPopper, XCircle, Edit3 } from 'lucide-react'

// Define the interfaces directly in this file
interface Subject {
  id: string
  name: string
  level: string
  finalPercentage: string
  gradeAverage: string
  term: number
}

interface AllSubject {
  id: string
  name: string
}

interface UserInfo {
  id: string
  name: string
  email: string
  avatarFallback: string
  studentNumber?: string
  school?: string
  grade?: string
}

interface TermData {
  subjects: Subject[];
  average: number;
  performance_status: string;
  completed: boolean;
}

// Mock data for all available subjects
const allSubjects: AllSubject[] = [
  { id: "subject-1", name: "Mathematics" },
  { id: "subject-2", name: "Physical Sciences" },
  { id: "subject-3", name: "Life Sciences" },
  { id: "subject-4", name: "Geography" },
  { id: "subject-5", name: "History" },
  { id: "subject-6", name: "English Home Language" },
  { id: "subject-7", name: "Afrikaans First Additional Language" },
  { id: "subject-8", name: "Business Studies" },
  { id: "subject-9", name: "Economics" },
  { id: "subject-10", name: "Accounting" },
  { id: "subject-11", name: "Computer Applications Technology" },
  { id: "subject-12", name: "Information Technology" },
  { id: "subject-13", name: "Life Orientation" },
  { id: "subject-14", name: "Consumer Studies" },
  { id: "subject-15", name: "Tourism" },
  { id: "subject-16", name: "Afrikaans Home Language" },
  { id: "subject-17", name: "English First Additional Language" },
  { id: "subject-18", name: "Mathematical Literacy" },
  { id: "subject-19", name: "Engineering Graphics and Design" },
  { id: "subject-20", name: "Setswana" },
  { id: "subject-21", name: "Electrical Technology" },
  { id: "subject-22", name: "Mechanical Technology (Automotive)" },
  { id: "subject-23", name: "Electrical Technology (Power Systems)" },
  { id: "subject-24", name: "Mechanical Technology (Welding)" },
  { id: "subject-25", name: "Civil Technology (Construction)" }
]

export default function StudentDashboard() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)

  // Ensure proper mobile scrolling
  useEffect(() => {
    // Ensure body can scroll properly on all devices
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    
    // Set proper mobile viewport handling
    document.body.style.webkitOverflowScrolling = 'touch'
    document.body.style.overflowScrolling = 'touch'
    
    // Cleanup function
    return () => {
      // Keep scrolling enabled when component unmounts
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
  }, [])
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: "",
    name: "",
    email: "",
    avatarFallback: "",
    studentNumber: "",
    school: "",
    grade: "",
  })

  // State for selected subjects
  const [subjects, setSubjects] = useState<Subject[]>([])

  // State for new subject being added
  const [newSubject, setNewSubject] = useState("")
  const [grade, setGrade] = useState("10")
  const [average, setAverage] = useState(0)
  const [performanceStatus, setPerformanceStatus] = useState<'Doing Well' | 'Needs Support' | 'At Risk' | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState(1) // Current academic term (1-4)
  const [overallAverage, setOverallAverage] = useState(0)
  const [overallPerformanceStatus, setOverallPerformanceStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schoolsList = [
    { value: "Baitiredi Technical High School", label: "Baitiredi Technical High School" },
    { value: "Bankhara Bodulong High School", label: "Bankhara Bodulong High School" },
    { value: "Galaletsang High School", label: "Galaletsang High School" },
    { value: "KP Toto Technical and Commercial High School", label: "KP Toto Technical and Commercial High School" },
    { value: "Olebogeng High School", label: "Olebogeng High School" },
    { value: "Lebang Secondary School", label: "Lebang Secondary School" },
    { value: "Postmasburg High School", label: "Postmasburg High School" },
    { value: "Blinkklip High School", label: "Blinkklip High School" },
    { value: "Ratang Thuto High School", label: "Ratang Thuto High School" },
    { value: "SA Van Wyk High School", label: "SA Van Wyk High School" },
    { value: "AlexanderBaai High School", label: "AlexanderBaai High School" }
  ]

  // Set default selected school to first in list
  const [selectedSchool, setSelectedSchool] = useState(schoolsList[0].value)

  // Form validation (after selectedSchool is declared)
  const {
    values: formValues,
    errors: formErrors,
    touched: formTouched,
    handleChange: handleFormChange,
    handleBlur: handleFormBlur,
    validateForm,
    resetForm
  } = useFormValidation(
    {
      grade: grade,
      school: selectedSchool,
      subjects: subjects
    },
    {
      grade: ValidationRules.grade,
      school: ValidationRules.school,
      subjects: { 
        required: true, 
        custom: (value: Subject[]) => {
          if (!value || value.length === 0) {
            return 'Please add at least one subject'
          }
          
          // Check minimum subjects requirement for current term
          const currentTermSubjects = value.filter(s => s.term === selectedTerm)
          if (currentTermSubjects.length < 6) {
            return `Please add at least 6 subjects for Term ${selectedTerm}`
          }
          
          if (currentTermSubjects.length > 9) {
            return 'Maximum 9 subjects allowed per term'
          }
          
          // Check that all current term subjects have level, finalPercentage, and gradeAverage
          const incompleteSubjects = currentTermSubjects.filter(s => 
            !s.level || !s.finalPercentage || !s.gradeAverage ||
            s.level.trim() === '' || s.finalPercentage.trim() === '' || s.gradeAverage.trim() === ''
          )
          
          if (incompleteSubjects.length > 0) {
            return `Please complete all fields (Level, Final %, Grade Average %) for all subjects in Term ${selectedTerm}`
          }
          
          return null
        }
      }
    }
  )



  // Add useEffect to get user data
  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (user) {
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (profileError) throw profileError
          
          setUserInfo({
            id: user.id,
            name: `${profile.first_name} ${profile.last_name}`,
            email: user.email || '',
            avatarFallback: profile.first_name?.[0] || '?',
            studentNumber: profile.student_number || '',
            school: profile.school || '',
            grade: profile.grade || '',
          })

          // Auto-populate grade and school from profile for consistency
          if (profile.grade) {
            setGrade(profile.grade.toString())
            // Suppress grade selection success toast (too noisy)
          } else {
            // Only show if grade is missing (one-time info)
            smartToast.info(`Complete your profile with your current grade for automatic selection`, {
              category: 'profile setup',
              priority: 'low'
            })
          }
          
          if (profile.school) {
            // Find the school in the schoolsList to match the format
            const matchingSchool = schoolsList.find(school => 
              school.value === profile.school || school.label === profile.school
            )
            if (matchingSchool) {
              setSelectedSchool(matchingSchool.value)
              // Suppress school selection success toast (too noisy)
            }
          } else {
            // Only show if school is missing (one-time info)
            smartToast.info(`Complete your profile with your school information for automatic selection`, {
              category: 'profile setup',
              priority: 'low'
            })
          }

          // Show welcome only for first-time users or returning users after a break
          const lastVisit = localStorage.getItem('lastVisit')
          const now = Date.now()
          if (!lastVisit || now - parseInt(lastVisit) > 24 * 60 * 60 * 1000) { // 24 hours
            smartToast.success(`Welcome back, ${profile.first_name}!`, {
              category: 'authentication',
              priority: 'medium'
            })
            localStorage.setItem('lastVisit', now.toString())
          }

          // Load initial term data only if it exists
          if (profile?.[`term${selectedTerm}_subjects` as keyof typeof profile]) {
            const termData = {
              subjects: (profile?.[`term${selectedTerm}_subjects` as keyof typeof profile] as unknown as Subject[]) || [],
              average: Number(profile?.[`term${selectedTerm}_average` as keyof typeof profile]) || 0,
              performance_status: String(profile?.[`term${selectedTerm}_performance_status` as keyof typeof profile]) || '',
              completed: Boolean(profile?.[`term${selectedTerm}_completed` as keyof typeof profile]) || false
            }

            setSubjects(termData.subjects)
            setAverage(termData.average)
            setPerformanceStatus(termData.performance_status)
          }
          
          // Load overall average and performance status
          setOverallAverage(Number(profile?.overall_average) || 0)
          setOverallPerformanceStatus(String(profile?.overall_performance_status) || '')
        }
              } catch (error) {
          console.error('Error loading user:', error)
          smartToast.error('Failed to load user data. Please refresh the page.', {
            category: 'error',
            priority: 'high'
          })
        } finally {
          setIsLoading(false)
        }
    }

    getUser()
  }, [supabase]) // Remove selectedTerm dependency to prevent unnecessary reloads

  // Add useEffect to load term data when selected term changes
  useEffect(() => {
    const loadTermData = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('User not authenticated')
        }

        // Fetch all term data and overall data at once
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            overall_average,
            overall_performance_status,
            term1_subjects,
            term1_average,
            term1_performance_status,
            term1_completed,
            term2_subjects,
            term2_average,
            term2_performance_status,
            term2_completed,
            term3_subjects,
            term3_average,
            term3_performance_status,
            term3_completed,
            term4_subjects,
            term4_average,
            term4_performance_status,
            term4_completed
          `)
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching term data:', profileError)
          return
        }

        // Update overall average and performance status
        setOverallAverage(Number(profile?.overall_average) || 0)
        setOverallPerformanceStatus(String(profile?.overall_performance_status) || '')

        // Load ALL subjects from ALL terms for copy functionality
        const allSubjectsFromAllTerms: Subject[] = []
        for (let term = 1; term <= 4; term++) {
          const termSubjects = (profile?.[`term${term}_subjects` as keyof typeof profile] as unknown as Subject[]) || []
          allSubjectsFromAllTerms.push(...termSubjects)
        }

        // Get data for the selected term
        const termData = {
          subjects: (profile?.[`term${selectedTerm}_subjects` as keyof typeof profile] as unknown as Subject[]) || [],
          average: Number(profile?.[`term${selectedTerm}_average` as keyof typeof profile]) || 0,
          performance_status: String(profile?.[`term${selectedTerm}_performance_status` as keyof typeof profile]) || '',
          completed: Boolean(profile?.[`term${selectedTerm}_completed` as keyof typeof profile]) || false
        }

        // Update state - ALWAYS set all subjects so copy functionality works
        setSubjects(allSubjectsFromAllTerms)
        setAverage(termData.average)
        setPerformanceStatus(termData.performance_status)
        setIsSubmitted(termData.completed) // Set isSubmitted based on term completion status

        if (termData.completed) {
          // Suppress data loading success (too noisy)
        } else {
          // Just update term-specific display state, but keep all subjects for copy functionality
          setAverage(0)
          setPerformanceStatus(null)
          setIsSubmitted(false)
          // Suppress "ready to input" toast (too noisy)
        }
      } catch (error) {
        console.error('Error loading term data:', error)
        smartToast.error('Failed to load term data. Please try again.', {
          category: 'error',
          priority: 'high'
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only load term data if we have a user
    if (userInfo.id) {
      loadTermData()
    }
  }, [selectedTerm, userInfo.id]) // Add userInfo.id dependency to ensure we have user data

  // Helper function to get performance status
  const getPerformanceStatus = (avg: number): 'Doing Well' | 'Needs Support' | 'At Risk' | null => {
    if (avg >= 75) {
      return 'Doing Well';
    } else if (avg >= 50) {
      return 'Needs Support';
    } else if (avg >= 0) {
      return 'At Risk';
    } else {
      return null; // Return null instead of 'No Data' to match database constraint
    }
  };

  // Add the generatePerformanceFeedback function
  const generatePerformanceFeedback = (
    average: number,
    performanceStatus: 'Doing Well' | 'Needs Support' | 'At Risk' | null,
    subjectBreakdown: { doingWell: string[]; needsSupport: string[]; atRisk: string[] }
  ): string => {
    let feedback = `Overall Performance: ${performanceStatus || 'No Data'}\n\n`
    
    if (performanceStatus === 'Doing Well') {
      feedback += `Great job! You're maintaining a strong academic performance with an average of ${Math.round(average)}%.\n\n`
    } else if (performanceStatus === 'Needs Support') {
      feedback += `Your current average is ${Math.round(average)}%. While you're passing, there's room for improvement.\n\n`
    } else if (performanceStatus === 'At Risk') {
      feedback += `Your current average of ${Math.round(average)}% indicates that you need additional support.\n\n`
    } else {
      feedback += `No performance data available yet. Please add subjects and grades to see your performance summary.\n\n`
    }

    if (subjectBreakdown.doingWell.length > 0) {
      feedback += `Strong subjects: ${subjectBreakdown.doingWell.join(', ')}\n`
    }
    if (subjectBreakdown.needsSupport.length > 0) {
      feedback += `Subjects needing attention: ${subjectBreakdown.needsSupport.join(', ')}\n`
    }
    if (subjectBreakdown.atRisk.length > 0) {
      feedback += `Subjects requiring immediate support: ${subjectBreakdown.atRisk.join(', ')}\n`
    }

    return feedback
  }

  const calculateResults = async () => {
    try {
      console.log('Starting calculateResults for term:', selectedTerm)
      
      // Calculate average
      const currentTermSubjects = subjects.filter(s => s.term === selectedTerm)
      console.log('Current term subjects:', currentTermSubjects)
      
      if (currentTermSubjects.length === 0) {
        console.error('No subjects found for term:', selectedTerm)
        smartToast.error('Please add at least one subject for this term', {
          category: 'validation',
          priority: 'medium'
        })
        return { success: false }
      }

      // Validate subject data
      const invalidSubjects = currentTermSubjects.filter(subject => {
        const percentage = parseFloat(subject.finalPercentage.toString())
        return isNaN(percentage) || percentage < 0 || percentage > 100
      })

      if (invalidSubjects.length > 0) {
        console.error('Invalid subject data found:', invalidSubjects)
        smartToast.error('Please ensure all percentages are between 0 and 100', {
          category: 'validation',
          priority: 'medium'
        })
        return { success: false }
      }

      const totalPercentage = currentTermSubjects.reduce((sum, subject) => {
        const percentage = parseFloat(subject.finalPercentage.toString())
        return sum + (isNaN(percentage) ? 0 : percentage)
      }, 0)
      
      const newAverage = currentTermSubjects.length > 0 ? totalPercentage / currentTermSubjects.length : 0
      console.log('Calculated average:', newAverage)
      setAverage(newAverage)

      // Determine performance status based on average
      let newPerformanceStatus: 'Doing Well' | 'Needs Support' | 'At Risk'
      if (newAverage >= 60) {
        newPerformanceStatus = 'Doing Well'
      } else if (newAverage >= 40) {
        newPerformanceStatus = 'Needs Support'
      } else {
        newPerformanceStatus = 'At Risk'
      }
      console.log('Performance status:', newPerformanceStatus)
      setPerformanceStatus(newPerformanceStatus)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('User authentication error:', userError)
        throw new Error('User not authenticated')
      }

      // Get current academic year
      const currentYear = new Date().getFullYear()
      const academicYear = `${currentYear}-${currentYear + 1}`

      // Prepare the update data
      const updateData = {
        [`term${selectedTerm}_subjects`]: currentTermSubjects,
        [`term${selectedTerm}_completed`]: true,
        [`term${selectedTerm}_average`]: newAverage,
        [`term${selectedTerm}_performance_status`]: newPerformanceStatus,
        last_term_updated: selectedTerm,
        last_term_submitted_at: new Date().toISOString(),
        current_grade: grade,
        selected_school: selectedSchool,
        academic_year: academicYear,
        // Update term submission status
        term_submission_status: {
          [`term${selectedTerm}`]: {
            isSubmitted: true,
            submittedAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
          }
        },
        // Update subject validation status
        subject_validation_status: {
          [`term${selectedTerm}`]: {
            isValid: true,
            validationErrors: []
          }
        },
        // Update subject metadata
        subject_metadata: {
          [`term${selectedTerm}`]: {
            editCount: 1,
            lastEditAt: new Date().toISOString(),
            lastEditBy: user.email
          }
        },
        // Update subject details
        subject_details: {
          [`term${selectedTerm}`]: currentTermSubjects.map(s => ({
            name: s.name,
            level: parseInt(s.level.toString()),
            finalPercentage: parseFloat(s.finalPercentage.toString()),
            gradeAverage: parseFloat(s.gradeAverage.toString())
          }))
        }
      }

      // Update the profiles table (including grade and school for consistency)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          grade: grade, // Ensure grade in profile matches current selection
          school: selectedSchool // Ensure school in profile matches current selection
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving to profiles:', error)
        smartToast.error('Failed to save data: ' + error.message, {
          category: 'data save',
          priority: 'high'
        })
        return false
      }

      console.log('Successfully saved to profiles:', data)
      
      // Show important save success
      smartToast.success(`Term ${selectedTerm} results saved successfully!`, {
        category: 'data save',
        priority: 'high'
      })
      
      // Return the calculated values for use in handleSubmit
      return { 
        success: true, 
        average: newAverage, 
        performanceStatus: newPerformanceStatus,
        subjects: currentTermSubjects
      }
    } catch (error) {
      console.error('Error in calculateResults:', error)
      smartToast.error('Failed to calculate and save performance summary: ' + (error instanceof Error ? error.message : 'Unknown error'), {
        category: 'data save',
        priority: 'high'
      })
      return { success: false }
    }
  }

  // Update grade selection
  const handleGradeSelection = (selectedGrade: string) => {
    setGrade(selectedGrade)
    // Clear subjects and reset form state when changing grade
    setSubjects([])
    setAverage(0)
    setPerformanceStatus(null)
    setIsSubmitted(false)
    setNewSubject("")
    
    // Suppress grade selection success (too noisy)
  }

  // Update school selection with feedback
  const handleSchoolSelection = (selectedSchoolValue: string) => {
    setSelectedSchool(selectedSchoolValue)
    
    // Find the school label for display
    const selectedSchoolObj = schoolsList.find(school => school.value === selectedSchoolValue)
    const schoolLabel = selectedSchoolObj?.label || selectedSchoolValue
    
    // Suppress school selection success (too noisy)
  }

  // Calculate and return averages with values directly
  const calculateAveragesWithValues = async () => {
    console.log('Starting calculateAveragesWithValues');
    
    try {
      const termSubjects = subjects.filter((s) => s.term === selectedTerm);
      console.log(`Found ${termSubjects.length} subjects for term ${selectedTerm}`);

      if (termSubjects.length === 0) {
        console.warn('No subjects found for current term');
        return null;
      }

      // Check if all required fields are filled
      const subjectsWithMissingData = termSubjects.filter(subject => {
        return !subject.finalPercentage || subject.finalPercentage.trim() === '';
      });

      if (subjectsWithMissingData.length > 0) {
        console.warn('Some subjects are missing final percentages');
        return null;
      }

      // Validate all percentages are valid numbers
      const invalidSubjects = termSubjects.filter(subject => {
        const percentage = parseFloat(subject.finalPercentage);
        return isNaN(percentage) || percentage < 0 || percentage > 100;
      });

      if (invalidSubjects.length > 0) {
        console.warn('Some subjects have invalid percentages');
        return null;
      }

      // All subjects are valid, proceed with calculation
      const validSubjects = termSubjects.map(subject => ({
        ...subject,
        finalPercentage: parseFloat(subject.finalPercentage)
      }));

      console.log(`Processing ${validSubjects.length} valid subjects`);

      // Calculate total final score
      const totalFinalScore = validSubjects.reduce((acc, subject) => {
        console.log(`Adding subject ${subject.name} with percentage: ${subject.finalPercentage}`);
        return acc + subject.finalPercentage;
      }, 0);

      // Calculate average
      const numberOfSubjects = validSubjects.length;
      const learnerAverage = Math.round((totalFinalScore / numberOfSubjects) * 10) / 10;
      
      console.log(`Calculated average: ${learnerAverage} from ${totalFinalScore} / ${numberOfSubjects}`);

      // Determine performance status
      let status: string;
      if (learnerAverage >= 60) {
        status = "Doing Well";
      } else if (learnerAverage >= 40) {
        status = "Needs Support";
      } else {
        status = "At Risk";
      }
      
      console.log(`Returning average: ${learnerAverage} with status: ${status}`);
      
      return {
        calculatedAverage: learnerAverage,
        calculatedStatus: status
      };
      
    } catch (error) {
      console.error('Error in calculateAveragesWithValues:', error);
      return null;
    }
  }

  // Calculate average based on final percentages and update state
  const calculateAverages = async () => {
    const result = await calculateAveragesWithValues();
    
    if (result) {
      const { calculatedAverage, calculatedStatus } = result;
      setAverage(calculatedAverage);
      setPerformanceStatus(calculatedStatus);
      return true;
    }
    
    setAverage(0);
    setPerformanceStatus(null);
    return false;
  }

  // Define level to percentage range mapping
  const getLevelPercentageRange = (level: number) => {
    switch (level) {
      case 7: return { min: 80, max: 100, label: '80-100%' }
      case 6: return { min: 70, max: 79, label: '70-79%' }
      case 5: return { min: 60, max: 69, label: '60-69%' }
      case 4: return { min: 50, max: 59, label: '50-59%' }
      case 3: return { min: 40, max: 49, label: '40-49%' }
      case 2: return { min: 30, max: 39, label: '30-39%' }
      case 1: return { min: 0, max: 29, label: '0-29%' }
      default: return null
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if we have subjects for the current term
    const currentTermSubjects = subjects.filter(s => s.term === selectedTerm)
    if (currentTermSubjects.length < 6) {
      smartToast.error(`Please add at least 6 subjects for Term ${selectedTerm}`, {
        category: 'validation',
        priority: 'medium'
      })
      return
    }

    if (currentTermSubjects.length > 9) {
      smartToast.error("Maximum 9 subjects allowed per term", {
        category: 'validation',
        priority: 'medium'
      })
      return
    }

    // Check that all current term subjects have level, finalPercentage, and gradeAverage
    const incompleteSubjects = currentTermSubjects.filter(s => 
      !s.level || !s.finalPercentage || !s.gradeAverage ||
      s.level.trim() === '' || s.finalPercentage.trim() === '' || s.gradeAverage.trim() === ''
    )
    
    if (incompleteSubjects.length > 0) {
      smartToast.error(`Please complete all fields (Level, Final %, Grade Average %) for all subjects in Term ${selectedTerm}`, {
        category: 'validation',
        priority: 'medium'
      })
      return
    }

    // Check grade and school selection
    if (!grade || grade.trim() === '') {
      smartToast.error("Please select a grade", {
        category: 'validation',
        priority: 'medium'
      })
      return
    }

    if (!selectedSchool || selectedSchool.trim() === '') {
      smartToast.error("Please select a school", {
        category: 'validation',
        priority: 'medium'
      })
      return
    }

    // Calculate averages and performance status before saving
    const calculationResult = await calculateResults()
    
    // Check if calculation was successful
    if (!calculationResult.success) {
      return // Error already shown in calculateResults
    }

    // Use the fresh calculated values instead of stale state
    const { average: calculatedAverage, performanceStatus: calculatedStatus, subjects: calculatedSubjects } = calculationResult

    // Suppress saving info toast (too noisy)

    try {
      setIsSubmitting(true)
      setError(null)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare the data to update using fresh calculated values
      const updateData = {
        grade: grade, // Save to the grade field
        current_grade: grade, // Also save to current_grade field
        school: selectedSchool, // Save the selected school
        selected_school: selectedSchool, // Also save to selected_school field
        [`term${selectedTerm}_subjects`]: calculatedSubjects, // Use fresh subjects
        [`term${selectedTerm}_average`]: calculatedAverage, // Use fresh calculated average
        [`term${selectedTerm}_performance_status`]: calculatedStatus, // Use fresh calculated status
        [`term${selectedTerm}_completed`]: true,
        last_term_updated: selectedTerm,
        last_term_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Updating profile with data:', updateData)

      // Update the profile with the new grade, school and term data
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw new Error(updateError.message || 'Database update failed')
      }

      setIsSubmitted(true)
      smartToast.success(`Term ${selectedTerm} data saved successfully! Average: ${Math.round(calculatedAverage)}%`, {
        category: 'data save',
        priority: 'high'
      })
          } catch (error) {
        console.error('Error saving term data:', error)
        
        // Better error message handling
        let errorMessage = 'Failed to save term data'
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = JSON.stringify(error)
        }
        
        setError(errorMessage)
        smartToast.error(`${errorMessage}. Please try again.`, {
          category: 'data save',
          priority: 'high'
        })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if a term has been completed
  const isTermCompleted = (term: number) => {
    return subjects.some(s => s.term === term) && average > 0
  }
  
  // Handle term change
  const handleTermChange = (term: number) => {
    if (term < 1 || term > 4) {
      console.error('Invalid term number:', term)
      return
    }
    // Only change term if we're not currently loading
    if (!isLoading) {
      setSelectedTerm(term)
    }
  }

  // Add this function to prepare subject performance data
  const getSubjectPerformanceData = () => {
    const allSubjects = new Set<string>();
    const termData = {
      term1: {} as Record<string, number>,
      term2: {} as Record<string, number>,
      term3: {} as Record<string, number>,
      term4: {} as Record<string, number>,
    };

    // Collect all subjects and their performance across terms
    for (let term = 1; term <= 4; term++) {
      const termSubjects = userInfo?.[`term${term}_subjects` as keyof typeof userInfo] as any[] || [];
      termSubjects.forEach(subject => {
        allSubjects.add(subject.name);
        termData[`term${term}` as keyof typeof termData][subject.name] = subject.finalPercentage;
      });
    }

    // Convert to array format for the chart
    return Array.from(allSubjects).map(subjectName => ({
      name: subjectName,
      term1: termData.term1[subjectName] || null,
      term2: termData.term2[subjectName] || null,
      term3: termData.term3[subjectName] || null,
      term4: termData.term4[subjectName] || null,
    }));
  };

  if (isLoading) {
    return <PageLoading message="Loading student dashboard..." />
  }

  return (
    <ErrorBoundary>
      <DashboardLayout
        title="Student Dashboard"
        portalType="Student"
        userInfo={
          userInfo || {
            id: "",
            name: "Loading...",
            email: "loading@example.com",
            avatarFallback: "??",
            studentNumber: "",
            school: "",
            grade: "",
          }
        }
        sidebarContent={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
      >
      {activeTab === "profile" && (
        <div className="space-y-3 sm:space-y-6">
          <ProfileForm />
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-3 sm:space-y-6">
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-none sm:rounded-lg shadow-sm border-0 sm:border">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Welcome, {userInfo?.name.split(" ")[0] || "Student"}!</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              This is your student dashboard where you can track your academic performance, input your grades, and view
              your progress over time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-100">
                <h3 className="font-medium text-red-800 mb-2 text-sm sm:text-base">Input Form</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Add your subjects and input your grades to track your academic performance.
                </p>
                <button
                  onClick={() => setActiveTab("input")}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Go to Input Form →
                </button>
              </div>

              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100">
                <h3 className="font-medium text-orange-800 mb-2 text-sm sm:text-base">Performance Summary</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  View your academic performance metrics and track your progress over time.
                </p>
                <button
                  onClick={() => setActiveTab("summary")}
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  View Performance →
                </button>
              </div>

              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 sm:col-span-2 lg:col-span-1">
                <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Profile Settings</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Update your personal information and academic details.</p>
                <button
                  onClick={() => setActiveTab("profile")}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit Profile →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "input" && (
        <DashboardErrorBoundary>
          <div className="space-y-3 sm:space-y-6">
            {/* Validation Summary */}
            {Object.values(formErrors).some(errors => errors.length > 0) && (
              <ValidationSummary 
                errors={Object.entries(formErrors)
                  .filter(([_, errors]) => errors.length > 0)
                  .flatMap(([field, errors]) => errors.map(error => `${field}: ${error}`))
                }
              />
            )}
            
            <InputForm
              grade={grade}
              selectedTerm={selectedTerm}
              isSubmitted={isSubmitted}
              newSubject={newSubject}
              subjects={subjects}
              allSubjects={allSubjects}
              average={average}
              performanceStatus={performanceStatus}
              selectedSchool={selectedSchool}
              schoolsList={schoolsList}
              handleGradeSelection={handleGradeSelection}
              setSelectedTerm={handleTermChange}
              setNewSubject={setNewSubject}
              setSubjects={setSubjects}
              setSelectedSchool={handleSchoolSelection}
              handleSubmit={handleSubmit}
              isTermCompleted={isTermCompleted}
              setActiveTab={setActiveTab}
              setIsSubmitted={setIsSubmitted}
              isSubmitting={isSubmitting}
            />
          </div>
        </DashboardErrorBoundary>
      )}

      {activeTab === "summary" && (
        <PerformanceSummary
          isSubmitted={isSubmitted}
          average={average}
          performanceStatus={performanceStatus}
          subjects={subjects}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          setActiveTab={setActiveTab}
          selectedSchool={selectedSchool}
          schoolsList={schoolsList}
          overallAverage={overallAverage}
          overallPerformanceStatus={overallPerformanceStatus}
        />
      )}

      {activeTab === "performance" && (
        <PerformanceTrends subjects={getSubjectPerformanceData()} />
      )}
    </DashboardLayout>
    </ErrorBoundary>
  )
}
