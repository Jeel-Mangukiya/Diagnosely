-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create document_analysis table
CREATE TABLE IF NOT EXISTS public.document_analysis (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  original_text text NOT NULL,
  analysis text NOT NULL,
  confidence text NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own document analysis"
  ON public.document_analysis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own document analysis"
  ON public.document_analysis
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own document analysis"
  ON public.document_analysis
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document analysis"
  ON public.document_analysis
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_analysis_user_id ON public.document_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_created_at ON public.document_analysis(created_at DESC); 