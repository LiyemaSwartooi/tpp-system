import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      grade,
      selectedTerm,
      subjects,
      selectedSchool,
      average,
      performanceStatus
    } = body

    // Update the profiles table with the new academic data
    const { data, error } = await supabase
      .from('profiles')
      .update({
        current_grade: grade,
        selected_school: selectedSchool,
        [`term${selectedTerm}_subjects`]: subjects,
        [`term${selectedTerm}_average`]: average,
        [`term${selectedTerm}_performance_status`]: performanceStatus,
        [`term${selectedTerm}_completed`]: true,
        last_term_updated: selectedTerm,
        last_term_submitted_at: new Date().toISOString(),
        term_submission_status: {
          [`term${selectedTerm}`]: {
            isSubmitted: true,
            submittedAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
          }
        }
      })
      .eq('id', session.user.id)
      .select()

    if (error) {
      console.error('Error updating academic results:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in academic results route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the academic results for the user
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        current_grade,
        selected_school,
        term1_subjects,
        term2_subjects,
        term3_subjects,
        term4_subjects,
        term1_average,
        term2_average,
        term3_average,
        term4_average,
        term1_performance_status,
        term2_performance_status,
        term3_performance_status,
        term4_performance_status,
        term1_completed,
        term2_completed,
        term3_completed,
        term4_completed,
        last_term_updated,
        last_term_submitted_at,
        term_submission_status
      `)
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching academic results:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in academic results route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 