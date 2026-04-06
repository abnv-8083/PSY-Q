-- Add attachment_urls column to contact_submissions table
ALTER TABLE contact_submissions
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[];

-- Add comment to the new column
COMMENT ON COLUMN contact_submissions.attachment_urls IS 'Array of URLs to uploaded screenshots/media files stored in Supabase Storage';

-- Create a storage bucket for contact form attachments (run this in Supabase Dashboard -> Storage)
-- Note: This needs to be created via Supabase Dashboard or API
-- Bucket name: contact-attachments
-- Public: false (files are private)
-- Allowed MIME types: image/*, video/*, application/pdf

-- Storage policies for contact-attachments bucket
-- These need to be added in Supabase Dashboard -> Storage -> contact-attachments -> Policies

-- Policy 1: Anyone can upload files
-- CREATE POLICY "Anyone can upload contact attachments"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'contact-attachments');

-- Policy 2: Anyone can view files (needed to display uploaded images)
-- CREATE POLICY "Anyone can view contact attachments"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'contact-attachments');

-- Policy 3: Users can delete their own uploads
-- CREATE POLICY "Users can delete their own attachments"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'contact-attachments' AND auth.uid()::text = owner);
