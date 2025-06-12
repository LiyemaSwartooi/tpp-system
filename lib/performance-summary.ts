import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"

type PerformanceSummary = Database['public']['Tables']['performance_summaries']['Insert']
type PerformanceBreakdown = Database['public']['Tables']['performance_breakdowns']['Insert']

export type PerformanceCategory = 'doing_well' | 'needs_support' | 'at_risk' | 'missing_data'

export interface SubjectPerformance {
  subject_name: string
  level: number | null
  final_percentage: number | null
  grade_average: number | null
}

export interface PerformanceBreakdownData {
  category: PerformanceCategory
  subjects: SubjectPerformance[]
}

export interface SavePerformanceSummaryParams {
  student_id: string
  term: number
  academic_year: string
  average_score: number
  performance_status: string
  school_id?: string | null
  feedback?: string | null
  overall_status: string
  breakdowns: PerformanceBreakdownData[]
}

export const savePerformanceSummary = async (params: SavePerformanceSummaryParams) => {
  const supabase = createClientComponentClient<Database>()
  
  console.log('Saving performance summary with params:', JSON.stringify(params, null, 2))
  
  try {
    // Ensure required fields are present
    if (params.overall_status === undefined || params.overall_status === null) {
      throw new Error('overall_status is required')
    }

    // Prepare the breakdowns data
    const breakdownsData = params.breakdowns
      .map(b => ({
        category: b.category,
        subjects: b.subjects
          .filter(s => s !== null && s !== undefined)
          .map(s => ({
            subject_name: s.subject_name || 'Unknown',
            level: s.level,
            final_percentage: s.final_percentage,
            grade_average: s.grade_average
          }))
      }))
      .filter(b => b.subjects.length > 0)
    
    console.log('Prepared breakdowns data:', JSON.stringify(breakdownsData, null, 2))
    
    // Prepare the RPC parameters
    const rpcParams = {
      p_student_id: params.student_id,
      p_term: params.term,
      p_academic_year: params.academic_year,
      p_average_score: params.average_score,
      p_performance_status: params.performance_status || 'No Data',
      p_school_id: params.school_id || null,
      p_feedback: params.feedback || 'No feedback available',
      p_overall_status: params.overall_status,  // Required by the interface
      p_breakdowns: breakdownsData
    };
    
    console.log('Calling RPC with params:', JSON.stringify(rpcParams, null, 2));
    
    // Start a transaction
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      'save_performance_summary_with_breakdowns',
      rpcParams as any
    )

    if (summaryError) {
      console.error('Error from RPC call:', summaryError)
      throw summaryError
    }
    
    console.log('Successfully saved performance summary:', summaryData)
    return { data: summaryData, error: null }
  } catch (error) {
    console.error('Error in savePerformanceSummary:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }
}

export const fetchPerformanceSummary = async (studentId: string, term: number, academicYear: string) => {
  const supabase = createClientComponentClient<Database>()
  
  try {
    console.log(`Fetching performance summary for student ${studentId}, term ${term}, year ${academicYear}`)
    
    // Fetch summary with breakdowns in a single query
    const { data, error } = await supabase
      .from('performance_summaries')
      .select(`
        *,
        performance_breakdowns (
          id,
          category,
          subject_name,
          level,
          final_percentage,
          grade_average
        )
      `)
      .eq('student_id', studentId)
      .eq('term', term)
      .eq('academic_year', academicYear)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') { // Not found
        console.log('No performance summary found for the given criteria')
        return { data: null, error: null }
      }
      throw error
    }
    
    if (!data) {
      console.log('No data returned from the query')
      return { data: null, error: null }
    }
    
    console.log('Raw performance summary data:', data)
    
    // Transform the data into a more usable format
    try {
      const breakdowns = Array.isArray((data as any).performance_breakdowns) 
        ? (data as any).performance_breakdowns 
        : []
        
      console.log('Raw breakdowns:', breakdowns)
      
      const breakdownByCategory = breakdowns.reduce((acc: Record<string, SubjectPerformance[]>, item: any) => {
        if (!item || !item.category) return acc
        
        const category = item.category as PerformanceCategory
        if (!acc[category]) {
          acc[category] = []
        }
        
        acc[category].push({
          subject_name: item.subject_name || 'Unknown',
          level: typeof item.level === 'number' ? item.level : null,
          final_percentage: typeof item.final_percentage === 'number' ? item.final_percentage : null,
          grade_average: typeof item.grade_average === 'number' ? item.grade_average : null
        })
        
        return acc
      }, {})
      
      console.log('Processed breakdowns:', breakdownByCategory)
      
      const result = {
        ...data,
        breakdowns: breakdownByCategory,
        // Ensure these fields always exist
        average_score: data.average_score || 0,
        performance_status: data.performance_status || '',
      }
      
      console.log('Returning transformed data:', result)
      return { data: result, error: null }
      
    } catch (transformError) {
      console.error('Error transforming performance summary data:', transformError)
      // Return the raw data if transformation fails
      return { 
        data: { 
          ...data, 
          breakdowns: {},
          average_score: data.average_score || 0,
          performance_status: data.performance_status || ''
        }, 
        error: null 
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in fetchPerformanceSummary:', errorMessage, error)
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(errorMessage) 
    }
  }
}

export const fetchAllPerformanceSummaries = async (studentId: string) => {
  const supabase = createClientComponentClient<Database>()
  
  try {
    const { data, error } = await supabase
      .from('performance_summaries')
      .select(`
        *,
        performance_breakdowns (
          id,
          category,
          subject_name,
          level,
          final_percentage,
          grade_average
        )
      `)
      .eq('student_id', studentId)
      .order('academic_year', { ascending: false })
      .order('term', { ascending: false })
    
    if (error) throw error
    
    // Transform the data for each summary
    const transformedData = data.map(summary => {
      const breakdowns = (summary as any).performance_breakdowns || []
      const breakdownByCategory = breakdowns.reduce((acc: Record<string, SubjectPerformance[]>, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push({
          subject_name: item.subject_name,
          level: item.level,
          final_percentage: item.final_percentage,
          grade_average: item.grade_average
        })
        return acc
      }, {})
      
      return {
        ...summary,
        breakdowns: breakdownByCategory
      }
    })
    
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error fetching performance summaries:', error)
    return { data: null, error }
  }
}
