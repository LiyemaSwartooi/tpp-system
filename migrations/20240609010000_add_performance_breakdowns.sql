-- Create performance_breakdowns table to store detailed subject performance data
CREATE TABLE IF NOT EXISTS public.performance_breakdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_summary_id UUID NOT NULL REFERENCES public.performance_summaries(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'doing_well', 'needs_support', 'at_risk', 'missing_data'
  subject_name TEXT NOT NULL,
  level INTEGER,
  final_percentage DECIMAL(5,2),
  grade_average DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performance_summary_id, category, subject_name)
);

-- Enable Row Level Security
ALTER TABLE public.performance_breakdowns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own performance breakdowns"
  ON public.performance_breakdowns
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.performance_summaries ps 
    WHERE ps.id = performance_breakdowns.performance_summary_id 
    AND ps.student_id = auth.uid()
  ));

CREATE POLICY "Students can insert their own performance breakdowns"
  ON public.performance_breakdowns
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.performance_summaries ps 
    WHERE ps.id = performance_breakdowns.performance_summary_id 
    AND ps.student_id = auth.uid()
  ));

-- Create index for better query performance
CREATE INDEX idx_performance_breakdowns_summary_id ON public.performance_breakdowns(performance_summary_id);
CREATE INDEX idx_performance_breakdowns_category ON public.performance_breakdowns(category);

-- Create trigger to update updated_at
CREATE TRIGGER update_performance_breakdowns_updated_at
BEFORE UPDATE ON public.performance_breakdowns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update performance_summaries table to include feedback
ALTER TABLE public.performance_summaries 
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS overall_status TEXT;
