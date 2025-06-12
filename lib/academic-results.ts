import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"

type AcademicResult = Database['public']['Tables']['academic_results']['Insert']

export const saveAcademicResults = async (results: Omit<AcademicResult, 'id' | 'created_at' | 'updated_at'>[]) => {
  const supabase = createClientComponentClient<Database>()
  
  try {
    // Add detailed logging for terms 3 and 4
    const term3or4Results = results.filter(r => r.term === 3 || r.term === 4)
    if (term3or4Results.length > 0) {
      console.log('Saving term 3 or 4 results:', JSON.stringify(term3or4Results, null, 2))
    }
    
    const { data, error } = await supabase
      .from('academic_results')
      .upsert(results, { onConflict: 'student_id,subject_name,term,academic_year' })
      .select()
    
    if (error) {
      console.error('Error details for saveAcademicResults:', error.message, error.details, error.hint)
      throw error
    }
    return { data, error: null }
  } catch (error) {
    console.error('Error saving academic results:', error)
    return { data: null, error }
  }
}

export const fetchAcademicResults = async (studentId: string, term?: number, academicYear?: string) => {
  const supabase = createClientComponentClient<Database>()
  
  try {
    let query = supabase
      .from('academic_results')
      .select('*')
      .eq('student_id', studentId)
    
    if (term) {
      query = query.eq('term', term)
    }
    
    if (academicYear) {
      query = query.eq('academic_year', academicYear)
    }
    
    const { data, error } = await query.order('subject_name', { ascending: true })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching academic results:', error)
    return { data: null, error }
  }
}

export const deleteAcademicResult = async (resultId: string) => {
  const supabase = createClientComponentClient<Database>()
  
  try {
    const { error } = await supabase
      .from('academic_results')
      .delete()
      .eq('id', resultId)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting academic result:', error)
    return { error }
  }
}

export const getCurrentAcademicYear = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // If current month is before July, it's still the previous academic year
  const academicYear = month < 6 ? `${year-1}/${year}` : `${year}/${year+1}`
  console.log(`Calculated academic year: ${academicYear} (current month: ${month+1}, year: ${year})`)
  
  return academicYear
}
