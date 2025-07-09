"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Edit, Trash2, Search } from "lucide-react"

interface Subject {
  id: number
  name: string
  grade: number
  target: number
  credits: number
}

interface SubjectTableProps {
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
}

export function SubjectTable({ subjects, setSubjects }: SubjectTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredSubjects = subjects.filter((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingSubject) {
      setSubjects(subjects.map((s) => (s.id === editingSubject.id ? editingSubject : s)))
    }
    setIsDialogOpen(false)
    setEditingSubject(null)
  }

  const handleDelete = (id: number) => {
    setSubjects(subjects.filter((s) => s.id !== id))
  }

  const getGradeColor = (grade: number, target: number) => {
    if (grade >= target) return "text-green-600"
    if (grade >= target - 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (grade: number, target: number) => {
    if (grade >= target) return <Badge className="bg-green-100 text-green-800">On Track</Badge>
    if (grade >= target - 5) return <Badge variant="secondary">Close</Badge>
    return <Badge variant="destructive">Needs Focus</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Subject Management</CardTitle>
            <CardDescription>Track and manage your subject performance</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Current Grade</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${getGradeColor(subject.grade, subject.target)}`}>
                      {subject.grade}%
                    </span>
                  </TableCell>
                  <TableCell>{subject.target}%</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(subject.grade / subject.target) * 100} className="w-20" />
                      <span className="text-sm text-gray-500">
                        {((subject.grade / subject.target) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(subject.grade, subject.target)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subject.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No subjects found matching your search." : "No subjects added yet."}
            </p>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update the subject information and grades.</DialogDescription>
          </DialogHeader>
          {editingSubject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={editingSubject.name}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="grade">Current Grade (%)</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={editingSubject.grade}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        grade: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target">Target (%)</Label>
                  <Input
                    id="target"
                    type="number"
                    min="0"
                    max="100"
                    value={editingSubject.target}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        target: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="6"
                  value={editingSubject.credits}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      credits: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
