-- Create performance_summaries table
CREATE TABLE IF NOT EXISTS public.performance_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term INTEGER NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  average_score DECIMAL(5,2) NOT NULL,
  performance_status TEXT NOT NULL,
  school_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, term, academic_year)
);

-- Enable Row Level Security
ALTER TABLE public.performance_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own performance summaries"
  ON public.performance_summaries
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own performance summaries"
  ON public.performance_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own performance summaries"
  ON public.performance_summaries
  FOR UPDATE
  USING (auth.uid() = student_id);

-- Create index for better query performance
CREATE INDEX idx_performance_summaries_student_id ON public.performance_summaries(student_id);
CREATE INDEX idx_performance_summaries_term_year ON public.performance_summaries(term, academic_year);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performance_summaries_updated_at
BEFORE UPDATE ON public.performance_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
