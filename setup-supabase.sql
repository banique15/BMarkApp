-- LLM Consensus Benchmark - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Models Table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  context_length INTEGER DEFAULT 4096,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts Table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Responses Table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id),
  response_text TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consensus Groups Table
CREATE TABLE IF NOT EXISTS consensus_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  count INTEGER NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_responses_prompt_id ON responses(prompt_id);
CREATE INDEX IF NOT EXISTS idx_responses_model_id ON responses(model_id);
CREATE INDEX IF NOT EXISTS idx_consensus_groups_prompt_id ON consensus_groups(prompt_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON models
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample models with updated model IDs
INSERT INTO models (name, provider, model_id, enabled, context_length)
VALUES
  ('GPT-4o', 'OpenAI', 'openai/gpt-4o', true, 128000),
  ('Claude 3 Sonnet', 'Anthropic', 'anthropic/claude-3-sonnet', true, 200000),
  ('Gemini Pro 1.5', 'Google', 'google/gemini-pro-1.5', true, 2000000),
  ('Llama 3 70B', 'Meta', 'meta-llama/llama-3-70b-instruct', true, 8192),
  ('Mistral Large', 'Mistral AI', 'mistralai/mistral-large', true, 128000),
  ('Command R', 'Cohere', 'cohere/command-r', true, 128000)
ON CONFLICT (model_id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  context_length = EXCLUDED.context_length;

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE consensus_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For models table (everyone can read, only authenticated users can modify)
CREATE POLICY "Models are viewable by everyone" 
ON models FOR SELECT 
USING (true);

CREATE POLICY "Models are insertable by authenticated users only" 
ON models FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Models are updatable by authenticated users only" 
ON models FOR UPDATE 
TO authenticated 
USING (true);

-- For prompts table
CREATE POLICY "Prompts are viewable by everyone" 
ON prompts FOR SELECT 
USING (true);

CREATE POLICY "Prompts are insertable by authenticated users only" 
ON prompts FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Prompts are updatable by their owners" 
ON prompts FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- For responses table
CREATE POLICY "Responses are viewable by everyone" 
ON responses FOR SELECT 
USING (true);

CREATE POLICY "Responses are insertable by authenticated users only" 
ON responses FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- For consensus_groups table
CREATE POLICY "Consensus groups are viewable by everyone" 
ON consensus_groups FOR SELECT 
USING (true);

CREATE POLICY "Consensus groups are insertable by authenticated users only" 
ON consensus_groups FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create a view for response statistics
CREATE OR REPLACE VIEW response_stats AS
SELECT 
  p.id AS prompt_id,
  p.text AS prompt_text,
  COUNT(DISTINCT r.model_id) AS total_models,
  COUNT(DISTINCT cg.id) AS consensus_groups,
  MAX(cg.count) AS largest_consensus_group,
  MIN(r.response_time_ms) AS min_response_time,
  MAX(r.response_time_ms) AS max_response_time,
  AVG(r.response_time_ms) AS avg_response_time
FROM 
  prompts p
  LEFT JOIN responses r ON p.id = r.prompt_id
  LEFT JOIN consensus_groups cg ON p.id = cg.prompt_id
GROUP BY 
  p.id, p.text;

-- Create a policy to allow anonymous access for demo purposes
-- This is useful if you don't want to set up authentication right away
CREATE POLICY "Allow anonymous access to models" 
ON models FOR ALL 
USING (true);

CREATE POLICY "Allow anonymous access to prompts" 
ON prompts FOR ALL 
USING (true);

CREATE POLICY "Allow anonymous access to responses" 
ON responses FOR ALL 
USING (true);

CREATE POLICY "Allow anonymous access to consensus_groups" 
ON consensus_groups FOR ALL 
USING (true);

-- Modify the prompts table to make user_id optional
ALTER TABLE prompts ALTER COLUMN user_id DROP NOT NULL;