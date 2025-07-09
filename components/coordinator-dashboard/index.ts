export interface Student {
  id: string
  first_name: string
  last_name: string
  name: string
  email: string
  school: string
  grade: string
  average: number
  status: "At Risk" | "Needs Support" | "Doing Well" | "No Data"
  lastUpdated: string
  subjectsCount: number
}

export interface StudentSubject {
  studentId: string
  term: number
  subjects: {
    name: string
    level: number
    finalPercentage: number
    gradeAverage: number
  }[]
}

export interface UserInfo {
  name: string
  email: string
  avatarFallback: string
  role: string
}

export type StatusKey = "At Risk" | "Needs Support" | "Doing Well" | "No Data"
