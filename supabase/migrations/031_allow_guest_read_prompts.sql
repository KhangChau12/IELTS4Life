-- Allow guests (anon role) to read writing prompts and topics
-- Previously restricted to authenticated users only, blocking guest access to /write/prompts

-- Drop existing authenticated-only SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view prompts" ON writing_prompts;
DROP POLICY IF EXISTS "Authenticated users can view topics" ON prompt_topics;

-- Replace with policies that allow both authenticated and anonymous (guest) users
CREATE POLICY "Anyone can view prompts" ON writing_prompts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view topics" ON prompt_topics
  FOR SELECT USING (true);
