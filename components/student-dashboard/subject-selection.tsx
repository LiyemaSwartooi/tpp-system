"use client"

import type React from "react"
import { useState } from "react"
import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AllSubject, Subject } from "./types"
import { toast } from "sonner"

interface SubjectSelectionProps {
  newSubject: string
  setNewSubject: (subject: string) => void
  allSubjects: AllSubject[]
  subjects: Subject[]
  grade: string
  isSubmitted: boolean
  selectedTerm: number
  setSubjects: (subjects: Subject[]) => void
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  newSubject,
  setNewSubject,
  allSubjects,
  subjects,
  grade,
  isSubmitted,
  selectedTerm,
  setSubjects,
}) => {
  const [subjectError, setSubjectError] = useState("")

  const addSubject = () => {
    if (!newSubject) {
      setSubjectError("Please select a subject")
      toast.error("Please select a subject", {
        position: 'top-right',
        duration: 3000,
      })
      return
    }

    // Check if subject already exists for current term
    const existingSubject = subjects.find(
      (s) => s.name === allSubjects.find((as) => as.id === newSubject)?.name && s.term === selectedTerm,
    )

    if (existingSubject) {
      setSubjectError("This subject already exists for the selected term")
      toast.error("This subject already exists for the selected term", {
        position: 'top-right',
        duration: 3000,
      })
      return
    }

    // Get current term subjects count
    const currentTermSubjects = subjects.filter(s => s.term === selectedTerm)
    
    // Check if adding this subject would exceed the maximum limit
    if (currentTermSubjects.length >= 9) {
      setSubjectError("Maximum 9 subjects allowed per term")
      toast.error("Maximum 9 subjects allowed per term", {
        position: 'top-right',
        duration: 3000,
      })
      return
    }

    setSubjectError("")
    const selectedSubjectName = allSubjects.find((s) => s.id === newSubject)?.name || ""

    setSubjects([
      ...subjects,
      {
        id: `${Date.now()}`,
        name: selectedSubjectName,
        level: "",
        finalPercentage: "",
        gradeAverage: "",
        term: selectedTerm,
      },
    ])

    // Show success message
    toast.success(`${selectedSubjectName} added successfully`, {
      position: 'top-right',
      duration: 2000,
    })

    // Show warning if less than 6 subjects
    const newSubjectCount = currentTermSubjects.length + 1
    if (newSubjectCount < 6) {
      toast.warning(`You need to add ${6 - newSubjectCount} more subject(s) to meet the minimum requirement`, {
        position: 'top-right',
        duration: 4000,
      })
    } else if (newSubjectCount === 6) {
      toast.success("Minimum subject requirement met!", {
        position: 'top-right',
        duration: 3000,
      })
    }

    setNewSubject("")
  }

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-red-500" />
          <span className="text-base">Add Subject <span className="text-red-500">*</span></span>
        </label>
        <p className="text-sm text-gray-500 mt-1">Minimum 6 subjects required, maximum 9 subjects allowed</p>
      </div>
      <div className="flex space-x-2">
        <Select value={newSubject} onValueChange={setNewSubject} disabled={isSubmitted}>
          <SelectTrigger className="flex-1 h-10 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {allSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id} className="text-sm">
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={addSubject}
          className="flex-shrink-0 h-10 bg-red-600 hover:bg-red-700"
          disabled={isSubmitted}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {subjectError && <p className="text-sm text-red-500 mt-1">{subjectError}</p>}
      <div className="text-sm text-gray-600">
        Current subjects: {subjects.filter(s => s.term === selectedTerm).length}/9
      </div>
    </div>
  )
}
