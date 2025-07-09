"use client"

import React from "react"
import { BookOpen, School, Edit3, CheckCircle, Copy } from "lucide-react"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ButtonLoading } from "@/components/ui/loading"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { toast } from "sonner"
import type { AllSubject, Subject } from "./types"

// Import the new sub-components (we'll create these)
import { GradeSelection } from "./grade-selection"
import { SubjectSelection } from "./subject-selection"
import { SubjectTable } from "./subject-table"
import { FormActions } from "./form-actions"
import { ResultsSummary } from "./results-summary"

type InputFormProps = {
  grade: string
  selectedTerm: number
  isSubmitted: boolean
  newSubject: string
  subjects: Subject[]
  allSubjects: AllSubject[]
  average: number
  performanceStatus: string
  selectedSchool: string
  schoolsList: { value: string; label: string }[]
  handleGradeSelection: (grade: string) => void
  setSelectedTerm: (term: number) => void
  setNewSubject: (subject: string) => void
  setSubjects: (subjects: Subject[]) => void
  setSelectedSchool: (school: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isTermCompleted: (term: number) => boolean
  setActiveTab: (tab: string) => void
  setIsSubmitted: (isSubmitted: boolean) => void
  isSubmitting?: boolean
}

export const InputForm: React.FC<InputFormProps> = ({
  grade,
  selectedTerm,
  isSubmitted,
  newSubject,
  subjects,
  allSubjects,
  average,
  performanceStatus,
  selectedSchool,
  schoolsList,
  handleGradeSelection,
  setSelectedTerm,
  setNewSubject,
  setSubjects,
  setSelectedSchool,
  handleSubmit,
  isTermCompleted,
  setActiveTab,
  setIsSubmitted,
  isSubmitting = false,
}) => {
  
  // Function to copy subjects from previous term to current term
  const copySubjectsFromPreviousTerm = () => {
    const previousTerm = selectedTerm - 1
    
    if (previousTerm < 1) {
      toast.error("No previous term to copy from.", {
        position: 'top-right',
        duration: 3000,
      })
      return
    }
    
    // Get subjects from previous term
    const previousTermSubjects = subjects.filter(subject => subject.term === previousTerm)
    
    if (previousTermSubjects.length === 0) {
      toast.error(`No subjects found in Term ${previousTerm} to copy. Please add subjects to Term ${previousTerm} first.`, {
        position: 'top-right',
        duration: 4000,
      })
      return
    }
    
    // Create copies for current term with empty values
    const newSubjects: Subject[] = []
    
    previousTermSubjects.forEach(previousSubject => {
      // Check if this subject already exists in current term
      const existingSubject = subjects.find(s => s.name === previousSubject.name && s.term === selectedTerm)
      
      if (!existingSubject) {
        newSubjects.push({
          id: crypto.randomUUID(),
          name: previousSubject.name,
          level: '', // Empty value
          finalPercentage: '', // Empty value
          gradeAverage: '', // Empty value
          term: selectedTerm
        })
      }
    })
    
    if (newSubjects.length > 0) {
      setSubjects([...subjects, ...newSubjects])
      toast.success(`Successfully copied ${previousTermSubjects.length} subjects from Term ${previousTerm} to Term ${selectedTerm}!`, {
        position: 'top-right',
        duration: 3000,
      })
    } else {
      toast.info(`All subjects from Term ${previousTerm} already exist in Term ${selectedTerm}.`, {
        position: 'top-right',
        duration: 3000,
      })
    }
  }

  return (
    <DashboardErrorBoundary>
      <Card className="overflow-hidden border-0 sm:border shadow-none sm:shadow-lg rounded-none sm:rounded-xl">
      <div className="bg-gradient-to-r from-red-600 to-red-500 py-4 px-3 sm:py-6 sm:px-4 lg:px-8">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3 mb-2">
          <div className="flex items-center">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Academic Results</CardTitle>
          </div>
          <CardDescription className="text-white/80 text-xs sm:text-sm lg:text-base sm:ml-11">
            Enter your subject results for Term {selectedTerm} to track your performance
          </CardDescription>
        </div>
      </div>
      <CardContent className="pt-3 px-3 sm:pt-5 sm:px-4 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Grade and Term Selection */}
          <GradeSelection
            grade={grade}
            selectedTerm={selectedTerm}
            isSubmitted={isSubmitted}
            setSelectedTerm={setSelectedTerm}
            handleGradeSelection={handleGradeSelection}
          />

          {/* School Selection */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm space-y-3 sm:space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <School className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
                  <span className="text-sm sm:text-base">Select School</span>
                </div>
                                 {selectedSchool && (
                   <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                     <Edit3 className="h-3 w-3" />
                     <span className="hidden sm:inline">From Profile</span>
                   </span>
                 )}
              </label>
            </div>
            <Select value={selectedSchool} onValueChange={setSelectedSchool} disabled={isSubmitted}>
              <SelectTrigger className="w-full h-9 sm:h-10 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white">
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                {schoolsList.map((school) => (
                  <SelectItem key={school.value} value={school.value} className="text-sm">
                    {school.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                         {selectedSchool && (
               <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                 <CheckCircle className="h-3 w-3 text-green-600" />
                 This school is saved from your profile for consistency across all terms
               </p>
             )}
          </div>

          {/* Subject Selection */}
          <SubjectSelection
            newSubject={newSubject}
            setNewSubject={setNewSubject}
            allSubjects={allSubjects}
            subjects={subjects}
            grade={grade}
            isSubmitted={isSubmitted}
            selectedTerm={selectedTerm}
            setSubjects={setSubjects}
          />

          {/* Subject Results Table */}
          <SubjectTable
            subjects={subjects}
            selectedTerm={selectedTerm}
            isSubmitted={isSubmitted}
            setSubjects={setSubjects}
          />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="flex space-x-1 w-full justify-around sm:w-auto">
              {[1, 2, 3, 4].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSelectedTerm(term)}
                  className={`px-3 py-1 rounded-md text-sm font-medium w-1/4 sm:w-auto ${
                    selectedTerm === term
                      ? 'bg-red-100 text-red-700'
                      : isTermCompleted(term)
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isTermCompleted(term) ? `View/Edit Term ${term}` : `Term ${term}`}
                >
                  {term}
                  {isTermCompleted(term) && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              {/* Copy Subjects from Previous Term Button - Only show if not in Term 1 */}
              {selectedTerm > 1 && (
                <button
                  type="button"
                  onClick={copySubjectsFromPreviousTerm}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 flex-grow sm:flex-grow-0"
                  title={`Copy subject names from Term ${selectedTerm - 1} to Term ${selectedTerm} with empty values`}
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy from Term {selectedTerm - 1}</span>
                </button>
              )}
              
              {isSubmitted && (
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 flex-grow sm:flex-grow-0"
                >
                  <span>Edit Term {selectedTerm}</span>
                </button>
              )}
              <ButtonLoading
                type="submit"
                disabled={subjects.filter(s => s.term === selectedTerm).length === 0}
                loading={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 flex-grow sm:flex-grow-0"
              >
                <span>{isSubmitting ? `Saving Term ${selectedTerm}...` : `Save Term ${selectedTerm}`}</span>
              </ButtonLoading>
            </div>
          </div>
        </form>

        {/* Results Summary */}
        <ResultsSummary
          isSubmitted={isSubmitted}
          average={average}
          performanceStatus={performanceStatus}
          setActiveTab={setActiveTab}
          selectedTerm={selectedTerm}
        />
      </CardContent>
    </Card>
    </DashboardErrorBoundary>
  )
}

// For backward compatibility, also export as default
export default InputForm
