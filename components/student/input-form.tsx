"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const gradeSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject"),
  grade: z.number().min(0, "Grade must be at least 0").max(100, "Grade cannot exceed 100"),
  assessmentType: z.string().min(1, "Please select assessment type"),
  date: z.string().min(1, "Please select a date"),
})

type GradeForm = z.infer<typeof gradeSchema>

interface Subject {
  id: number
  name: string
  grade: number
  target: number
  credits: number
}

interface InputFormProps {
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
  onClose: () => void
}

export function InputForm({ subjects, setSubjects, onClose }: InputFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GradeForm>({
    resolver: zodResolver(gradeSchema),
  })

  const selectedSubjectId = watch("subjectId")

  const onSubmit = async (data: GradeForm) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the subject grade (simplified - in real app would add to history)
      const updatedSubjects = subjects.map((subject) =>
        subject.id === Number.parseInt(data.subjectId) ? { ...subject, grade: data.grade } : subject,
      )

      setSubjects(updatedSubjects)
      onClose()
    } catch (error) {
      console.error("Failed to save grade:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const assessmentTypes = [
    "Quiz",
    "Test",
    "Assignment",
    "Project",
    "Midterm",
    "Final Exam",
    "Lab Report",
    "Presentation",
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Grade</DialogTitle>
          <DialogDescription>Enter a new grade for one of your subjects.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select onValueChange={(value) => setValue("subjectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-sm text-red-500">{errors.subjectId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade (%)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="85"
                  {...register("grade", { valueAsNumber: true })}
                />
                {errors.grade && <p className="text-sm text-red-500">{errors.grade.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assessmentType">Assessment Type</Label>
              <Select onValueChange={(value) => setValue("assessmentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assessmentType && <p className="text-sm text-red-500">{errors.assessmentType.message}</p>}
            </div>

            {selectedSubjectId && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Subject Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {(() => {
                    const subject = subjects.find((s) => s.id === Number.parseInt(selectedSubjectId))
                    if (!subject) return null

                    return (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Current Grade</p>
                          <p className="font-medium">{subject.grade}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Target</p>
                          <p className="font-medium">{subject.target}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Credits</p>
                          <p className="font-medium">{subject.credits}</p>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
