"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Trash2, Loader2 } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { smartToast } from "@/lib/smart-toast"
import type { Subject } from "./types"

interface SubjectTableProps {
  subjects: Subject[]
  selectedTerm: number
  isSubmitted: boolean
  setSubjects: (subjects: Subject[]) => void
}

// Define level to percentage range mapping
const getLevelPercentageRange = (level: number) => {
  const levelNum = typeof level === 'string' ? parseInt(level, 10) : level;
  switch (levelNum) {
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

export const SubjectTable: React.FC<SubjectTableProps> = ({ subjects, selectedTerm, isSubmitted, setSubjects }) => {
  const [deletingSubjects, setDeletingSubjects] = useState<Set<string>>(new Set())
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const termSubjects = subjects.filter((s) => s.term === selectedTerm)

  const removeSubject = async (id: string) => {
    // Show loading state for this specific subject
    setDeletingSubjects(prev => new Set(prev).add(id))
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Update local state immediately for better UX
      const updatedSubjects = subjects.filter((s) => s.id !== id)
      setSubjects(updatedSubjects)

      // Calculate the current term subjects after deletion
      const currentTermSubjects = updatedSubjects.filter(s => s.term === selectedTerm)
      
      // Calculate new average and performance status
      const calculateAverage = (termSubjects: Subject[]) => {
        if (termSubjects.length === 0) return 0
        const total = termSubjects.reduce((sum, s) => {
          const percentage = parseFloat(s.finalPercentage) || 0
          return sum + percentage
        }, 0)
        return Math.round(total / termSubjects.length)
      }

      const determinePerformanceStatus = (average: number) => {
        if (average >= 70) return 'Doing Well'
        if (average >= 50) return 'Needs Support'
        return 'At Risk'
      }

      const newAverage = calculateAverage(currentTermSubjects)
      const newPerformanceStatus = determinePerformanceStatus(newAverage)

      // Save updated subjects to database
      const updateData = {
        [`term${selectedTerm}_subjects`]: currentTermSubjects,
        [`term${selectedTerm}_average`]: newAverage,
        [`term${selectedTerm}_performance_status`]: newPerformanceStatus,
        last_term_updated: selectedTerm,
        last_term_submitted_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      smartToast.success('Subject deleted and saved successfully', {
        category: 'data save',
        priority: 'medium'
      })

    } catch (error) {
      console.error('Error deleting subject:', error)
      
      // Revert the local state change if database update failed
      setSubjects(subjects)
      
      // Get more detailed error information
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        // Handle Supabase error format
        errorMessage = (error as any)?.message || (error as any)?.error_description || JSON.stringify(error)
      }
      
              smartToast.error(`Failed to delete subject: ${errorMessage}`, {
          category: 'data save',
          priority: 'high'
        })
    } finally {
      // Remove loading state for this subject
      setDeletingSubjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const validateLevelAndPercentage = (level: string, percentage: string) => {
    const levelNum = parseInt(level, 10)
    const percentageNum = parseFloat(percentage)
    
    if (isNaN(levelNum) || isNaN(percentageNum)) return null
    
    const range = getLevelPercentageRange(levelNum)
    if (!range) return null
    
    if (percentageNum < range.min || percentageNum > range.max) {
      return `For level ${levelNum}, percentage must be ${range.label}`
    }
    
    return null
  }

  if (termSubjects.length === 0) {
    return null
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Subject</TableHead>
            <TableHead className="font-semibold">Level (1-7)</TableHead>
            <TableHead className="font-semibold">Final %</TableHead>
            <TableHead className="font-semibold">Grade Average %</TableHead>
            <TableHead className="w-[100px] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {termSubjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-medium">{subject.name}</TableCell>
              <TableCell className="relative">
                <div className="flex items-center">
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={subject.level}
                    onChange={(e) => updateSubject(subject.id, "level", e.target.value)}
                    className={`w-16 h-8 ${subject.level && subject.finalPercentage && validateLevelAndPercentage(subject.level, subject.finalPercentage) ? 'border-red-500' : ''}`}
                    disabled={isSubmitted}
                  />
                </div>
              </TableCell>
              <TableCell className="relative">
                <div className="flex items-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={subject.finalPercentage}
                    onChange={(e) => updateSubject(subject.id, "finalPercentage", e.target.value)}
                    className={`w-20 h-8 ${subject.level && subject.finalPercentage && validateLevelAndPercentage(subject.level, subject.finalPercentage) ? 'border-red-500' : ''}`}
                    disabled={isSubmitted}
                  />
                  {subject.level && subject.finalPercentage && validateLevelAndPercentage(subject.level, subject.finalPercentage) && (
                    <div className="absolute -right-2 transform translate-x-full w-48">
                      <div className="flex items-center bg-red-50 text-red-700 text-xs p-2 rounded-md border border-red-200">
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{validateLevelAndPercentage(subject.level, subject.finalPercentage)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={subject.gradeAverage}
                  onChange={(e) => updateSubject(subject.id, "gradeAverage", e.target.value)}
                  className="w-20 h-8"
                  disabled={isSubmitted}
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubject(subject.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  disabled={isSubmitted || deletingSubjects.has(subject.id)}
                >
                  {deletingSubjects.has(subject.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
