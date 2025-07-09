"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

type SummaryCardsProps = {
  totalStudents: number
  doingWellCount: number
  needsSupportCount: number
  atRiskCount: number
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalStudents,
  doingWellCount,
  needsSupportCount,
  atRiskCount,
}) => {
  const cards = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      description: "Enrolled students"
    },
    {
      title: "Doing Well",
      value: doingWellCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      percentage: totalStudents > 0 ? Math.round((doingWellCount / totalStudents) * 100) : 0,
      description: "Students performing well"
    },
    {
      title: "Needs Support",
      value: needsSupportCount,
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      percentage: totalStudents > 0 ? Math.round((needsSupportCount / totalStudents) * 100) : 0,
      description: "Require additional support"
    },
    {
      title: "At Risk",
      value: atRiskCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      percentage: totalStudents > 0 ? Math.round((atRiskCount / totalStudents) * 100) : 0,
      description: "Need immediate attention"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className={`${card.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${card.iconBg} p-2 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">
                      {card.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    <div className={`text-2xl sm:text-3xl font-bold ${card.color}`}>
                      {card.value}
                    </div>
                    
                    {card.percentage !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-600">
                          {card.percentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          of total
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-600 mt-2">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
