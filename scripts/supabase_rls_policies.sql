-- ============================================================
-- Supabase RLS Security Policies for Thinky Chatbot
-- ============================================================
-- Run these commands in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. subjects (الموضوعات)
-- ============================================================
-- Public (students) can read active subjects
CREATE POLICY "subjects_public_read" ON subjects
  FOR SELECT
  TO anon
  USING (is_active = true);

-- No public insert/update/delete (only service_role/admin can modify)
-- (No permissive policy = denied by default)

-- ============================================================
-- 3. content_files (المحتوى الدراسي)
-- ============================================================
-- Public can only read active content files
CREATE POLICY "content_files_public_read" ON content_files
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================================
-- 4. conversations (المحادثات)
-- ============================================================
-- Students can create conversations
CREATE POLICY "conversations_public_insert" ON conversations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Students can only read their own conversations (by session_id)
CREATE POLICY "conversations_public_read_own" ON conversations
  FOR SELECT
  TO anon
  USING (session_id = current_setting('app.session_id', true));

-- ============================================================
-- 5. messages (الرسائل)
-- ============================================================
-- Students can create messages
CREATE POLICY "messages_public_insert" ON messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Students can read messages within conversations they own
CREATE POLICY "messages_public_read_own" ON messages
  FOR SELECT
  TO anon
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- ============================================================
-- 6. settings (إعدادات النظام)
-- ============================================================
-- NO public access to settings (has API keys inside!)
-- Only service_role (server-side) can access settings

-- ============================================================
-- NOTE: The service_role key used on the server bypasses ALL
-- RLS policies, which is why admin operations still work.
-- The anon key is now safely restricted.
-- ============================================================
