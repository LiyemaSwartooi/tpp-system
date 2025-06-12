"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Eye, MessageSquare, AlertTriangle } from "lucide-react"

interface Student {
  id: number
  name: string
  email: string
  program: string
  year: string
  gpa: number
  status: string
  lastActive: string
  subjects: number
  avgGrade: number
}

interface StudentOverviewProps {
  students: Student[]
}

export function StudentOverview({ students }: StudentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || student.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge variant="secondary">Good</Badge>
      case "needs_attention":
        return <Badge variant="destructive">Needs Attention</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return "text-green-600"
    if (gpa >= 3.0) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Student Overview</CardTitle>
            <CardDescription>Monitor and manage all students under your supervision</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Students</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("excellent")}>Excellent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("good")}>Good</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("needs_attention")}>Needs Attention</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Avg Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={student.name} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${getGPAColor(student.gpa)}`}>{student.gpa.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>{student.avgGrade}%</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{student.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        {student.status === "needs_attention" && (
                          <DropdownMenuItem>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Create Intervention
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "No students found matching your criteria."
                : "No students assigned yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
