-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  meeting_url TEXT NOT NULL,
  bot_id TEXT,
  status TEXT DEFAULT 'pending',
  transcript JSONB
);

-- Create RLS policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Workspace policies
CREATE POLICY "Users can view their own workspaces" 
  ON workspaces FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workspaces" 
  ON workspaces FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspaces" 
  ON workspaces FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspaces" 
  ON workspaces FOR DELETE 
  USING (auth.uid() = user_id);

-- Meeting policies
CREATE POLICY "Users can view their own meetings" 
  ON meetings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings" 
  ON meetings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings" 
  ON meetings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings" 
  ON meetings FOR DELETE 
  USING (auth.uid() = user_id);