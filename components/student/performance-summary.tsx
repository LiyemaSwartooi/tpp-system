"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Target, Award, AlertCircle } from "lucide-react"

interface Subject {
  id: number
  name: string
  grade: number
  target: number
  credits: number
}

interface PerformanceSummaryProps {
  subjects: Subject[]
}

export function PerformanceSummary({ subjects }: PerformanceSummaryProps) {
  // Mock historical data for charts
  const performanceHistory = [
    { month: "Jan", average: 75 },
    { month: "Feb", average: 78 },
    { month: "Mar", average: 82 },
    { month: "Apr", average: 85 },
    { month: "May", average: 83 },
    { month: "Jun", average: 87 },
  ]

  const subjectData = subjects.map((subject) => ({
    name: subject.name.substring(0, 8),
    grade: subject.grade,
    target: subject.target,
  }))

  const gradeDistribution = [
    { name: "A (90-100)", value: subjects.filter((s) => s.grade >= 90).length, color: "#10b981" },
    { name: "B (80-89)", value: subjects.filter((s) => s.grade >= 80 && s.grade < 90).length, color: "#3b82f6" },
    { name: "C (70-79)", value: subjects.filter((s) => s.grade >= 70 && s.grade < 80).length, color: "#f59e0b" },
    { name: "D (60-69)", value: subjects.filter((s) => s.grade >= 60 && s.grade < 70).length, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  const overallAverage = subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length
  const onTrackSubjects = subjects.filter((s) => s.grade >= s.target).length
  const needsAttention = subjects.filter((s) => s.grade < s.target)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Performance</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallAverage.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.3% from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Track Subjects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {onTrackSubjects}/{subjects.length}
                </p>
                <Progress value={(onTrackSubjects / subjects.length) * 100} className="mt-2" />
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Attention</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{needsAttention.length}</p>
                {needsAttention.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="destructive" className="text-xs">
                      Action Required
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your average performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Current grades vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grade" fill="#3b82f6" name="Current Grade" />
                <Bar dataKey="target" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Breakdown of your current grades</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects Needing Attention</CardTitle>
            <CardDescription>Focus areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {needsAttention.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Great job!</p>
                  <p className="text-gray-600 dark:text-gray-400">All subjects are meeting their targets</p>
                </div>
              ) : (
                needsAttention.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{subject.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current: {subject.grade}% | Target: {subject.target}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        -{(subject.target - subject.grade).toFixed(1)}% behind
                      </p>
                      <Progress value={(subject.grade / subject.target) * 100} className="w-20 mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
