"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, HelpCircle, TrendingUp } from "lucide-react"

interface ResultsSummaryProps {
  isSubmitted: boolean
  average: number
  performanceStatus: string
  setActiveTab: (tab: string) => void
  selectedTerm: number
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  isSubmitted,
  average,
  performanceStatus,
  setActiveTab,
  selectedTerm,
}) => {
  if (!isSubmitted) {
    return null
  }

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
    <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2 sm:mb-0">
          <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
          Results Summary
        </h3>
        <Button
          onClick={() => setActiveTab("summary")}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
        >
          View Detailed Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Term {selectedTerm} Average</p>
          <p className="text-2xl font-bold text-gray-900">{Math.round(average)}%</p>
        </div>

        <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center mb-1">
            {getStatusIcon()}
            <p className="text-sm font-medium ml-2">Performance Status</p>
          </div>
          <p className="font-bold text-base">{performanceStatus}</p>
        </div>
      </div>
    </div>
  )
}
