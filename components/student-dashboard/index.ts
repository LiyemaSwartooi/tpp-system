export interface Subject {
  id: string
  name: string
  level: string
  finalPercentage: string
  gradeAverage: string
  term: number
}

export interface AllSubject {
  id: string
  name: string
}

export interface UserInfo {
  name: string
  email: string
  avatarFallback: string
  studentNumber?: string
  school?: string
  grade?: string
}

export const allSubjects: AllSubject[] = [
  { id: "subject-1", name: "Mathematics" },
  { id: "subject-2", name: "Physical Sciences" },
  { id: "subject-3", name: "Life Sciences" },
  { id: "subject-4", name: "Geography" },
  { id: "subject-5", name: "History" },
  { id: "subject-6", name: "English Home Language" },
  { id: "subject-7", name: "Afrikaans First Additional Language" },
  { id: "subject-8", name: "Business Studies" },
  { id: "subject-9", name: "Economics" },
  { id: "subject-10", name: "Accounting" },
  { id: "subject-11", name: "Computer Applications Technology" },
  { id: "subject-12", name: "Information Technology" },
  { id: "subject-13", name: "Life Orientation" },
  { id: "subject-14", name: "Consumer Studies" },
  { id: "subject-15", name: "Tourism" },
  { id: "subject-16", name: "Afrikaans Home Language" },
  { id: "subject-17", name: "English First Additional Language" },
  { id: "subject-18", name: "Mathematical Literacy" },
  { id: "subject-19", name: "Engineering Graphics and Design" }
]

// Export all components
export { Sidebar } from "./sidebar"
export { InputForm } from "./input-form"
export { PerformanceSummary } from "./performance-summary"
export { GradeSelection } from "./grade-selection"
export { SubjectSelection } from "./subject-selection"
export { SubjectTable } from "./subject-table"
export { FormActions } from "./form-actions"
export { ResultsSummary } from "./results-summary"
