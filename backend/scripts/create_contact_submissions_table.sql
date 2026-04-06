-- Create contact_submissions table for storing user feedback and bug reports
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_type TEXT NOT NULL CHECK (contact_type IN ('feedback', 'bug', 'general')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id TEXT,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Create index on contact_type for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_type ON contact_submissions(contact_type);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert contact submissions (authenticated or not)
CREATE POLICY "Anyone can submit contact forms"
    ON contact_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy: Only authenticated users can view their own submissions
CREATE POLICY "Users can view their own submissions"
    ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::text);

-- Policy: Admins can view all submissions (assuming you have an admin role)
-- You may need to adjust this based on your admin role implementation
CREATE POLICY "Admins can view all submissions"
    ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()::text
            AND profiles.role = 'admin'
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Add comment to table
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions including feedback, bug reports, and general inquiries from mocktest users';
