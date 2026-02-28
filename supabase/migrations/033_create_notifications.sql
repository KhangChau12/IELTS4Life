-- Create enum for notification target audience
CREATE TYPE notification_audience AS ENUM ('all', 'student', 'pro', 'free');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience notification_audience NOT NULL DEFAULT 'all',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_reads join table
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_target_audience ON notifications(target_audience);
CREATE INDEX idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX idx_notification_reads_notification_id ON notification_reads(notification_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS: Any authenticated user can SELECT notifications
-- (audience filtering is done in application layer)
CREATE POLICY "Authenticated users can view notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS: Only dev role can INSERT notifications
CREATE POLICY "Dev can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'dev'
    )
  );

-- RLS: Only dev role can DELETE notifications
CREATE POLICY "Dev can delete notifications" ON notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'dev'
    )
  );

-- RLS: Users can read their own notification_reads
CREATE POLICY "Users can view their own reads" ON notification_reads
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: Users can insert their own reads (mark as read)
CREATE POLICY "Users can mark notifications as read" ON notification_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
