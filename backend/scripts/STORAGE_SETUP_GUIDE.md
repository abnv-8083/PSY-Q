# File Upload Setup Guide for Contact Form

This guide explains how to set up the Supabase Storage bucket for handling file uploads in bug reports.

## Prerequisites

- Access to your Supabase project dashboard
- The `contact_submissions` table already created (from previous setup)

## Step 1: Create Storage Bucket

1. **Navigate to Storage**:
   - Open your Supabase project dashboard
   - Click on **Storage** in the left sidebar

2. **Create New Bucket**:
   - Click the **New bucket** button
   - Enter the following details:
     - **Name**: `contact-attachments`
     - **Public bucket**: Toggle **OFF** (keep it private)
   - Click **Create bucket**

## Step 2: Configure Bucket Policies

1. **Navigate to Policies**:
   - Click on the `contact-attachments` bucket you just created
   - Click on the **Policies** tab

2. **Add Upload Policy**:
   - Click **New policy**
   - Select **For full customization** → **Create policy**
   - Configure the policy:
     - **Policy name**: `Anyone can upload contact attachments`
     - **Allowed operation**: `INSERT`
     - **Target roles**: `public`
     - **WITH CHECK expression**: 
       ```sql
       bucket_id = 'contact-attachments'
       ```
   - Click **Review** → **Save policy**

3. **Add View Policy**:
   - Click **New policy** again
   - Select **For full customization** → **Create policy**
   - Configure the policy:
     - **Policy name**: `Anyone can view contact attachments`
     - **Allowed operation**: `SELECT`
     - **Target roles**: `public`
     - **USING expression**:
       ```sql
       bucket_id = 'contact-attachments'
       ```
   - Click **Review** → **Save policy**

4. **Add Delete Policy** (Optional - for users to remove their uploads):
   - Click **New policy** again
   - Select **For full customization** → **Create policy**
   - Configure the policy:
     - **Policy name**: `Users can delete their own attachments`
     - **Allowed operation**: `DELETE`
     - **Target roles**: `authenticated`
     - **USING expression**:
       ```sql
       bucket_id = 'contact-attachments' AND auth.uid()::text = owner
       ```
   - Click **Review** → **Save policy**

## Step 3: Update Database Schema

Run the SQL migration to add the `attachment_urls` column to the `contact_submissions` table:

1. Open **SQL Editor** in Supabase
2. Copy and paste the contents of `scripts/add_attachments_to_contact_submissions.sql`
3. Click **Run**

The migration adds:
- `attachment_urls` column (text array) to store file URLs
- Appropriate comments for documentation

## Step 4: Configure File Restrictions (Optional)

To restrict file types and sizes at the bucket level:

1. In the `contact-attachments` bucket settings
2. Navigate to **Configuration**
3. Set the following (if available in your Supabase version):
   - **Allowed MIME types**: `image/*`, `video/mp4`, `video/webm`, `application/pdf`
   - **Max file size**: `5242880` (5MB in bytes)

> **Note**: File validation is already implemented in the frontend code, so this step is optional but provides an additional layer of security.

## Step 5: Verify Setup

1. **Test Upload**:
   - Navigate to your contact page: `http://localhost:5173/academic/mocktest/contact`
   - Select **Bug Report** from the Type of Inquiry dropdown
   - You should see the file upload section appear
   - Try uploading an image file

2. **Check Storage**:
   - Go to Supabase Dashboard → **Storage** → `contact-attachments`
   - Verify the uploaded file appears in the bucket

3. **Check Database**:
   - Go to **Table Editor** → `contact_submissions`
   - Find your test submission
   - Verify the `attachment_urls` column contains the file URL

## Troubleshooting

### Error: "Failed to upload files"

**Possible causes**:
1. Storage bucket not created
2. Bucket policies not configured correctly
3. Bucket name mismatch (must be exactly `contact-attachments`)

**Solution**: Double-check Steps 1 and 2 above

### Error: "Bucket not found"

**Cause**: The bucket name in the code doesn't match the created bucket

**Solution**: Ensure the bucket is named exactly `contact-attachments` (with hyphen, not underscore)

### Files upload but don't appear in submissions

**Cause**: Database column not added

**Solution**: Run the SQL migration from Step 3

### Upload works but files can't be viewed

**Cause**: Missing SELECT policy

**Solution**: Add the "Anyone can view" policy from Step 2.3

## File Upload Features

### Supported File Types
- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM
- **Documents**: PDF

### File Size Limit
- Maximum: **5MB per file**
- Multiple files can be uploaded

### Security Features
- Client-side validation (file type and size)
- Server-side validation via Supabase policies
- Unique file names to prevent conflicts
- Private bucket with controlled access

## File Naming Convention

Uploaded files are automatically renamed using the format:
```
{timestamp}-{random-string}.{original-extension}
```

Example: `1707389123456-abc123.png`

This ensures:
- No file name conflicts
- Prevents malicious file names
- Easy sorting by upload time

## Storage Management

### Viewing Uploaded Files

To view all uploaded files:
1. Go to Supabase Dashboard → **Storage** → `contact-attachments`
2. Browse files in the bucket
3. Click on any file to view details or download

### Deleting Files

Files can be deleted:
1. **Automatically**: When users click the X button before submitting the form
2. **Manually**: Through the Supabase Dashboard → Storage interface
3. **Programmatically**: Via admin panel (future enhancement)

### Storage Limits

Supabase free tier includes:
- **1GB** of storage
- **2GB** of bandwidth per month

Monitor your usage in the Supabase Dashboard → **Settings** → **Usage**

## Next Steps

After completing this setup:

1. ✅ Test the file upload functionality
2. ✅ Submit a test bug report with screenshots
3. ✅ Verify files are stored correctly
4. ✅ Consider implementing an admin panel to view submissions with attachments

## Future Enhancements

Consider adding:
- Image compression before upload
- Thumbnail generation for images
- Virus scanning for uploaded files
- Automatic cleanup of orphaned files (files uploaded but form not submitted)
- File download functionality in admin panel
- Email notifications with attachment links
