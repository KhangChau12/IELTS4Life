-- Create enum type for question types
CREATE TYPE writing_question_type AS ENUM (
  'agree_disagree',
  'advantages_disadvantages',
  'problem_solution',
  'two_part_question',
  'positive_negative',
  'mixed_hybrid'
);

-- Create prompt_topics table
CREATE TABLE IF NOT EXISTS prompt_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create writing_prompts table
CREATE TABLE IF NOT EXISTS writing_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_text TEXT NOT NULL,
  question_type writing_question_type NOT NULL,
  topic_id UUID NOT NULL REFERENCES prompt_topics(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_writing_prompts_question_type ON writing_prompts(question_type);
CREATE INDEX idx_writing_prompts_topic_id ON writing_prompts(topic_id);
CREATE INDEX idx_writing_prompts_created_at ON writing_prompts(created_at DESC);
CREATE INDEX idx_prompt_topics_name ON prompt_topics(name);

-- Enable RLS
ALTER TABLE prompt_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_topics
CREATE POLICY "Authenticated users can view topics" ON prompt_topics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert topics" ON prompt_topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for writing_prompts
CREATE POLICY "Authenticated users can view prompts" ON writing_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert prompts" ON writing_prompts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update prompts" ON writing_prompts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete prompts" ON writing_prompts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed default topics
INSERT INTO prompt_topics (name) VALUES
  ('Education'),
  ('Technology'),
  ('Environment'),
  ('Government & Public Policy'),
  ('Crime & Law'),
  ('Health'),
  ('Work & Employment'),
  ('Society & Social Issues'),
  ('Culture & Traditions'),
  ('Media & Communication'),
  ('Children & Parenting'),
  ('Sports & Leisure'),
  ('Science & Research'),
  ('Global Issues'),
  ('Money & Consumerism')
ON CONFLICT (name) DO NOTHING;
