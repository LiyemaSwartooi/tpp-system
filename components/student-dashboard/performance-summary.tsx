"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { BarChart, FileText, SchoolIcon, CheckCircle, HelpCircle, AlertTriangle, TrendingUp } from "lucide-react"
import type { Subject } from "./types"

type SchoolListItem = {
  value: string
  label: string
}

type PerformanceSummaryProps = {
  isSubmitted: boolean
  average: number
  performanceStatus: string
  subjects: Subject[]
  selectedTerm: number
  setSelectedTerm: (term: number) => void
  setActiveTab: (tab: string) => void
  selectedSchool?: string
  schoolsList?: SchoolListItem[]
  overallAverage: number
  overallPerformanceStatus: string
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  isSubmitted,
  average,
  performanceStatus,
  subjects,
  selectedTerm,
  setSelectedTerm,
  setActiveTab,
  selectedSchool,
  schoolsList,
  overallAverage,
  overallPerformanceStatus,
}) => {
  if (!isSubmitted) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <BarChart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Results Submitted</h3>
        <p className="text-gray-500 mb-6">Please submit your academic results to view your performance summary.</p>
        <Button onClick={() => setActiveTab("input")} variant="outline">
          Go to Results Form
        </Button>
      </div>
    )
  }

  // Filter subjects for current term
  const termSubjects = subjects.filter((s) => s.term === selectedTerm)
  const schoolLabel = schoolsList?.find((s) => s.value === selectedSchool)?.label

  const getStatusIcon = () => {
    switch (performanceStatus) {
      case "Doing Well":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "Needs Support":
        return <HelpCircle className="h-6 w-6 text-yellow-600" />
      case "At Risk":
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      default:
        return <HelpCircle className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (performanceStatus) {
      case "Doing Well":
        return "text-green-600 bg-green-50 border-green-200"
      case "Needs Support":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "At Risk":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {schoolLabel && (
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-md font-medium text-gray-700 flex items-center justify-center">
            <SchoolIcon className="h-5 w-5 mr-2 text-red-500" />
            School: <span className="ml-1 font-semibold text-gray-800">{schoolLabel}</span>
          </p>
        </div>
      )}

      {/* Combined Results Summary Section */}
      <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
            Results Summary
          </h3>
          {/* Removed View Detailed Analysis Button */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 sm:p-4 rounded-none sm:rounded-lg border-0 sm:border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Term {selectedTerm} Average</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(average)}%</p>
          </div>

          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center mb-2">
              {getStatusIcon()}
              <p className="text-sm font-medium ml-2">Performance Status</p>
            </div>
            <p className="font-bold text-lg">{performanceStatus}</p>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-medium mb-2 md:mb-0">Subject Breakdown</h3>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((term) => (
              <Button
                key={term}
                variant={selectedTerm === term ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTerm(term)}
                className={`${selectedTerm === term ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-700 border-gray-200 hover:bg-gray-100"} px-2 py-1 h-7 rounded-md text-xs`}
              >
                Term {term}
              </Button>
            ))}
          </div>
        </div>

        {/* Table Header - Desktop */}
        <div className="hidden md:grid grid-cols-4 gap-4 py-2 px-4 bg-gray-50 rounded-t-lg font-medium text-sm text-gray-700">
          <div>Subject</div>
          <div>Level</div>
          <div>Final %</div>
          <div>Grade Average %</div>
        </div>

        {/* Subject List */}
        <div className="space-y-3 md:space-y-0">
          {termSubjects.map((subject) => (
            <div key={subject.id}>
              {/* Desktop View - Table Row */}
              <div className="hidden md:grid grid-cols-4 gap-4 py-3 px-4 border-b border-gray-100 items-center">
                <div className="font-medium text-gray-800">{subject.name}</div>
                <div className="text-gray-700">{subject.level}</div>
                <div className="text-gray-700">
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-white text-sm font-medium ${
                      Number.parseInt(subject.finalPercentage) >= 60
                        ? "bg-green-500"
                        : Number.parseInt(subject.finalPercentage) >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  >
                    {subject.finalPercentage}%
                  </span>
                </div>
                <div className="text-gray-700">{subject.gradeAverage}%</div>
              </div>

              {/* Mobile View - Card */}
              <div className="md:hidden bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border border-gray-100 p-3 sm:p-4">
                <div className="font-medium text-gray-800 mb-2">{subject.name}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Level:</span>
                    <span className="text-gray-700 font-medium">{subject.level}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Final %:</span>
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-white text-xs font-medium ${
                          Number.parseInt(subject.finalPercentage) >= 60
                            ? "bg-green-500"
                            : Number.parseInt(subject.finalPercentage) >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      >
                        {subject.finalPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Grade Average %:</span>
                    <span className="text-gray-700 font-medium">{subject.gradeAverage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-3">Feedback & Subject Performance</h3>

        {/* No Data State */}
        {performanceStatus === "No Data" ? (
          <div className="mb-5 p-6 bg-white rounded-lg shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-800 mb-2">No Performance Data Available</h4>
            <p className="text-gray-600 mb-4">
              Please enter valid percentage data for at least one subject to see your performance analysis.
            </p>
            <Button
              onClick={() => setActiveTab("input")}
              variant="outline"
              className="bg-white border-red-600 text-red-600 hover:bg-red-50 transition-colors"
            >
              Go to Results Form
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Feedback */}
            <div className="mb-5 p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-800 mb-2">
                Overall Status:
                <span
                  className={`ml-1 ${
                    performanceStatus === "Doing Well"
                      ? "text-green-600"
                      : performanceStatus === "Needs Support"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {performanceStatus}
                </span>
              </h4>
              <p className="text-gray-700">
                {performanceStatus === "Doing Well"
                  ? "Keep up the good work! You are performing well in your academic studies."
                  : performanceStatus === "Needs Support"
                    ? "You are making progress but may benefit from additional support in some subjects."
                    : "Your current performance indicates you need immediate academic support. Please speak with your teachers or coordinator."}
              </p>
            </div>

            {/* Subject Performance Breakdown */}
            <div className="space-y-4">
              {/* Doing Well Subjects */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-green-700 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  Doing Well (&ge; 60%)
                </h4>
                <div className="pl-5 space-y-1">
                  {termSubjects.filter((s) => {
                    const percentage = Number.parseFloat(s.finalPercentage)
                    return !isNaN(percentage) && percentage >= 60
                  }).length > 0 ? (
                    termSubjects
                      .filter((s) => {
                        const percentage = Number.parseFloat(s.finalPercentage)
                        return !isNaN(percentage) && percentage >= 60
                      })
                      .map((subject) => (
                        <div
                          key={`well-${subject.id}`}
                          className="flex justify-between items-center py-1 border-b border-gray-100"
                        >
                          <span className="text-gray-800">{subject.name}</span>
                          <span className="font-medium text-green-600">{subject.finalPercentage}%</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No subjects in this category</p>
                  )}
                </div>
              </div>

              {/* Needs Support Subjects */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-yellow-700 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  Needs Support (40-59%)
                </h4>
                <div className="pl-5 space-y-1">
                  {termSubjects.filter((s) => {
                    const percentage = Number.parseFloat(s.finalPercentage)
                    return !isNaN(percentage) && percentage >= 40 && percentage < 60
                  }).length > 0 ? (
                    termSubjects
                      .filter((s) => {
                        const percentage = Number.parseFloat(s.finalPercentage)
                        return !isNaN(percentage) && percentage >= 40 && percentage < 60
                      })
                      .map((subject) => (
                        <div
                          key={`support-${subject.id}`}
                          className="flex justify-between items-center py-1 border-b border-gray-100"
                        >
                          <span className="text-gray-800">{subject.name}</span>
                          <span className="font-medium text-yellow-600">{subject.finalPercentage}%</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No subjects in this category</p>
                  )}
                </div>
              </div>

              {/* At Risk Subjects */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-red-700 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  At Risk (&lt; 40%)
                </h4>
                <div className="pl-5 space-y-1">
                  {termSubjects.filter((s) => {
                    const percentage = Number.parseFloat(s.finalPercentage)
                    return !isNaN(percentage) && percentage < 40
                  }).length > 0 ? (
                    termSubjects
                      .filter((s) => {
                        const percentage = Number.parseFloat(s.finalPercentage)
                        return !isNaN(percentage) && percentage < 40
                      })
                      .map((subject) => (
                        <div
                          key={`risk-${subject.id}`}
                          className="flex justify-between items-center py-1 border-b border-gray-100"
                        >
                          <span className="text-gray-800">{subject.name}</span>
                          <span className="font-medium text-red-600">{subject.finalPercentage}%</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No subjects in this category</p>
                  )}
                </div>
              </div>

              {/* Missing Data Subjects */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                  Missing Percentage Data
                </h4>
                <div className="pl-5 space-y-1">
                  {termSubjects.filter((s) => {
                    if (!s.finalPercentage || s.finalPercentage.trim() === "") return true
                    const percentage = Number.parseFloat(s.finalPercentage)
                    return isNaN(percentage) || percentage < 0 || percentage > 100
                  }).length > 0 ? (
                    termSubjects
                      .filter((s) => {
                        if (!s.finalPercentage || s.finalPercentage.trim() === "") return true
                        const percentage = Number.parseFloat(s.finalPercentage)
                        return isNaN(percentage) || percentage < 0 || percentage > 100
                      })
                      .map((subject) => (
                        <div
                          key={`missing-${subject.id}`}
                          className="flex justify-between items-center py-1 border-b border-gray-100"
                        >
                          <span className="text-gray-800">{subject.name}</span>
                          <span className="text-xs text-gray-500 italic">No valid data</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">All subjects have valid data</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Back Button */}
      <div className="pt-4">
        <Button onClick={() => setActiveTab("input")} variant="outline" className="w-full">
          Back to Results Form
        </Button>
      </div>
    </div>
  )
}
