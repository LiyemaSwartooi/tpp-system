"use client"

import type React from "react"
import { GraduationCap, Calendar, Edit3, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GradeSelectionProps {
  grade: string
  selectedTerm: number
  isSubmitted: boolean
  setSelectedTerm: (term: number) => void
  handleGradeSelection: (grade: string) => void
}

export const GradeSelection: React.FC<GradeSelectionProps> = ({
  grade,
  selectedTerm,
  isSubmitted,
  setSelectedTerm,
  handleGradeSelection,
}) => {
  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm space-y-3 sm:space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
          <span className="text-sm sm:text-base">Academic Information</span>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
            <span>Grade</span>
                         {grade && (
               <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                 <Edit3 className="h-3 w-3" />
                 <span className="hidden sm:inline">From Profile</span>
               </span>
             )}
          </label>
          <Select value={grade} onValueChange={handleGradeSelection} disabled={isSubmitted}>
            <SelectTrigger className="w-full h-9 sm:h-10 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {[10, 11, 12].map((g) => (
                <SelectItem key={g} value={g.toString()}>
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                     {grade && (
             <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
               <CheckCircle className="h-3 w-3 text-green-600" />
               <span className="hidden sm:inline">This grade is automatically saved from your profile for consistency across all terms</span>
               <span className="sm:hidden">Grade saved to profile</span>
             </p>
           )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Term
          </label>
          <Select
            value={selectedTerm.toString()}
            onValueChange={(value) => setSelectedTerm(Number.parseInt(value))}
            disabled={isSubmitted}
          >
            <SelectTrigger className="w-full h-9 sm:h-10 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((term) => (
                <SelectItem key={term} value={term.toString()} className="text-sm">
                  Term {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
