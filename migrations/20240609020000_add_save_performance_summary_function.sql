-- Create a function to save performance summary with breakdowns in a transaction
-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS public.save_performance_summary_with_breakdowns(
  UUID, INTEGER, VARCHAR, DECIMAL, TEXT, TEXT, TEXT, TEXT, JSONB
);

-- Recreate the function with proper null handling
CREATE OR REPLACE FUNCTION public.save_performance_summary_with_breakdowns(
  p_student_id UUID,
  p_term INTEGER,
  p_academic_year VARCHAR(9),
  p_average_score DECIMAL(5,2),
  p_performance_status TEXT,
  p_school_id TEXT DEFAULT NULL,
  p_feedback TEXT DEFAULT NULL,
  p_overall_status TEXT DEFAULT 'No Data',  -- Default value added
  p_breakdowns JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_summary_id UUID;
  v_result JSONB;
  v_breakdown JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Upsert the performance summary
    INSERT INTO public.performance_summaries (
      student_id,
      term,
      academic_year,
      average_score,
      performance_status,
      school_id,
      feedback,
      overall_status
    )
    VALUES (
      p_student_id,
      p_term,
      p_academic_year,
      p_average_score,
      p_performance_status,
      p_school_id,
      p_feedback,
      p_overall_status
    )
    ON CONFLICT (student_id, term, academic_year)
    DO UPDATE SET
      average_score = EXCLUDED.average_score,
      performance_status = EXCLUDED.performance_status,
      school_id = EXCLUDED.school_id,
      feedback = EXCLUDED.feedback,
      overall_status = EXCLUDED.overall_status,
      updated_at = NOW()
    RETURNING id INTO v_summary_id;

    -- Delete existing breakdowns for this summary
    DELETE FROM public.performance_breakdowns
    WHERE performance_summary_id = v_summary_id;

    -- Insert new breakdowns
    FOR v_breakdown IN SELECT * FROM jsonb_array_elements(p_breakdowns)
    LOOP
      INSERT INTO public.performance_breakdowns (
        performance_summary_id,
        category,
        subject_name,
        level,
        final_percentage,
        grade_average
      )
      SELECT
        v_summary_id,
        v_breakdown->>'category',
        s->>'subject_name',
        (s->>'level')::INTEGER,
        (s->>'final_percentage')::DECIMAL(5,2),
        (s->>'grade_average')::DECIMAL(5,2)
      FROM jsonb_array_elements(v_breakdown->'subjects') s;
    END LOOP;

    -- Return success with the summary ID
    v_result := jsonb_build_object(
      'success', true,
      'summary_id', v_summary_id,
      'message', 'Performance summary saved successfully'
    );

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback on error
      RAISE EXCEPTION 'Error saving performance summary: %', SQLERRM;
  END;
END;
$$;
