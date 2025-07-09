import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Subject, AllSubject } from '@/components/student-dashboard/types'
import {
  calculateAverage,
  determinePerformanceStatus,
  validateSubjectData,
  calculateSubjectBreakdown,
  calculatePerformanceTrends,
  generatePerformanceFeedback
} from '@/lib/academic-utils'

interface UseAcademicFormProps {
  initialGrade?: string
  initialTerm?: number
  initialSchool?: string
  initialSubjects?: Subject[]
}

export function useAcademicForm({
  initialGrade = '',
  initialTerm = 1,
  initialSchool = '',
  initialSubjects = []
}: UseAcademicFormProps = {}) {
  const router = useRouter()
  const [grade, setGrade] = useState(initialGrade)
  const [selectedTerm, setSelectedTerm] = useState(initialTerm)
  const [selectedSchool, setSelectedSchool] = useState(initialSchool)
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate subject data
      const validation = validateSubjectData(subjects)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        return
      }

      // Calculate performance metrics
      const average = calculateAverage(subjects)
      const performanceStatus = determinePerformanceStatus(average)
      const subjectBreakdown = calculateSubjectBreakdown(subjects)
      const feedback = generatePerformanceFeedback(average, performanceStatus, subjectBreakdown)

      // Prepare data for submission
      const formData = {
        grade,
        selectedTerm,
        subjects,
        selectedSchool,
        average,
        performanceStatus,
        feedback,
        subjectBreakdown
      }

      // Submit to API
      const response = await fetch('/api/academic-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit academic results')
      }

      setIsSubmitted(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }, [grade, selectedTerm, subjects, selectedSchool, router])

  const addSubject = useCallback((subject: AllSubject) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: subject.name,
      level: '',
      finalPercentage: '',
      gradeAverage: '',
      term: selectedTerm
    }
    setSubjects(prev => [...prev, newSubject])
  }, [selectedTerm])

  const removeSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId))
  }, [])

  const updateSubject = useCallback((subjectId: string, updates: Partial<Subject>) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? { ...s, ...updates }
          : s
      )
    )
  }, [])

  const resetForm = useCallback(() => {
    setGrade('')
    setSelectedTerm(1)
    setSelectedSchool('')
    setSubjects([])
    setError(null)
    setIsSubmitted(false)
  }, [])

  return {
    grade,
    setGrade,
    selectedTerm,
    setSelectedTerm,
    selectedSchool,
    setSelectedSchool,
    subjects,
    setSubjects,
    isSubmitting,
    error,
    isSubmitted,
    handleSubmit,
    addSubject,
    removeSubject,
    updateSubject,
    resetForm
  }
} 