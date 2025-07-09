import type { Subject } from '@/components/student-dashboard/types'

export function calculateAverage(subjects: Subject[]): number {
  if (!subjects.length) return 0
  
  const sum = subjects.reduce((acc, subject) => {
    const percentage = parseFloat(subject.finalPercentage)
    return acc + (isNaN(percentage) ? 0 : percentage)
  }, 0)
  
  return Math.round((sum / subjects.length) * 100) / 100
}

export function determinePerformanceStatus(average: number): string {
  if (average >= 70) return 'Doing Well'
  if (average >= 50) return 'Needs Support'
  return 'At Risk'
}

export function validateSubjectData(subjects: Subject[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!subjects.length) {
    errors.push('At least one subject is required')
    return { isValid: false, errors }
  }

  subjects.forEach((subject, index) => {
    const percentage = parseFloat(subject.finalPercentage)
    const gradeAverage = parseFloat(subject.gradeAverage)

    if (!subject.name) {
      errors.push(`Subject ${index + 1} name is required`)
    }
    if (!subject.level) {
      errors.push(`Subject ${index + 1} level is required`)
    }
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      errors.push(`Subject ${index + 1} percentage must be between 0 and 100`)
    }
    if (isNaN(gradeAverage) || gradeAverage < 0 || gradeAverage > 100) {
      errors.push(`Subject ${index + 1} grade average must be between 0 and 100`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function calculateSubjectBreakdown(subjects: Subject[]): {
  doingWell: string[]
  needsSupport: string[]
  atRisk: string[]
} {
  const doingWell: string[] = []
  const needsSupport: string[] = []
  const atRisk: string[] = []

  subjects.forEach(subject => {
    const percentage = parseFloat(subject.finalPercentage)
    if (percentage >= 70) {
      doingWell.push(subject.name)
    } else if (percentage >= 50) {
      needsSupport.push(subject.name)
    } else {
      atRisk.push(subject.name)
    }
  })

  return { doingWell, needsSupport, atRisk }
}

export function calculatePerformanceTrends(
  term1Average: number | null,
  term2Average: number | null,
  term3Average: number | null,
  term4Average: number | null
): {
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  percentageChange: number | null
} {
  const averages = [term1Average, term2Average, term3Average, term4Average].filter(
    (avg): avg is number => avg !== null
  )

  if (averages.length < 2) {
    return { trend: 'insufficient_data', percentageChange: null }
  }

  const firstValidAverage = averages[0]
  const lastValidAverage = averages[averages.length - 1]
  const percentageChange = ((lastValidAverage - firstValidAverage) / firstValidAverage) * 100

  if (Math.abs(percentageChange) < 5) {
    return { trend: 'stable', percentageChange }
  }

  return {
    trend: percentageChange > 0 ? 'improving' : 'declining',
    percentageChange
  }
}

export function generatePerformanceFeedback(
  average: number,
  performanceStatus: string,
  subjectBreakdown: { doingWell: string[]; needsSupport: string[]; atRisk: string[] }
): string {
  const feedback: string[] = []

  // Overall performance feedback
  if (performanceStatus === 'Doing Well') {
    feedback.push('Excellent work! You are performing well overall.')
  } else if (performanceStatus === 'Needs Support') {
    feedback.push('You are making progress, but there is room for improvement.')
  } else {
    feedback.push('Your performance needs immediate attention.')
  }

  // Subject-specific feedback
  if (subjectBreakdown.doingWell.length > 0) {
    feedback.push(
      `You are excelling in: ${subjectBreakdown.doingWell.join(', ')}. Keep up the good work!`
    )
  }

  if (subjectBreakdown.needsSupport.length > 0) {
    feedback.push(
      `You need additional support in: ${subjectBreakdown.needsSupport.join(', ')}. Consider seeking help from teachers or tutors.`
    )
  }

  if (subjectBreakdown.atRisk.length > 0) {
    feedback.push(
      `You are at risk in: ${subjectBreakdown.atRisk.join(', ')}. Immediate intervention is recommended.`
    )
  }

  return feedback.join(' ')
} 