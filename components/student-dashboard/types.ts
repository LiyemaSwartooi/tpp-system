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
