-- Create notifications table for admin carousel
-- This table stores notification slides that appear in the admin dashboard carousel

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    header TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores notification carousel slides for the admin dashboard';
COMMENT ON COLUMN notifications.image_url IS 'URL to the carousel slide image';
COMMENT ON COLUMN notifications.header IS 'Prominent header text displayed on the slide';
COMMENT ON COLUMN notifications.description IS 'Description paragraph displayed on the slide';
COMMENT ON COLUMN notifications.is_active IS 'Whether this notification is currently active and should be displayed';
COMMENT ON COLUMN notifications.display_order IS 'Order in which slides appear (lower numbers first)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_order ON notifications(display_order);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- RLS Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON notifications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('admin', 'sub-admin', 'superadmin')
    )
);

-- RLS Policy: Admins can insert notifications
CREATE POLICY "Admins can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('admin', 'sub-admin', 'superadmin')
    )
);

-- RLS Policy: Admins can update notifications
CREATE POLICY "Admins can update notifications"
ON notifications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('admin', 'sub-admin', 'superadmin')
    )
);

-- RLS Policy: Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON notifications FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('admin', 'sub-admin', 'superadmin')
    )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Insert sample notifications for testing
INSERT INTO notifications (image_url, header, description, display_order) VALUES
(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    'Welcome to Psy-Q Admin Portal',
    'Manage your mock tests, students, and content all in one place. Your central hub for educational excellence.',
    1
),
(
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
    'New Features Released',
    'Check out our latest updates including enhanced analytics, improved test builder, and streamlined bundle management.',
    2
),
(
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    'Student Engagement Growing',
    'Your platform is making an impact! Student participation has increased by 45% this month.',
    3
);

-- Verify the table was created successfully
SELECT 'Notifications table created successfully!' AS status;
