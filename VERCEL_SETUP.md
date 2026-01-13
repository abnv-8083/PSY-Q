# Vercel Edge Function Setup Guide

## What Changed

Your email sending is now **secure** ✅

- Email logic moved to Vercel Edge Function (`/api/sendBookingEmails.js`)
- API key is **never exposed to the browser**
- BookingModal calls the API endpoint instead of direct function

## Local Development Setup

### 1. Install Vercel CLI (if developing locally)

```bash
npm install -g vercel
```

### 2. Update `.env.local`

Copy `.env.local.example` and fill in the values:

```bash
cp .env.local.example .env.local
```

Fill in these values:

```env
# Frontend (public) - required for Supabase client
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend (private) - required for API
RESEND_API_KEY=re_xxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

**Important:** 
- `VITE_*` variables are public (exposed to frontend)
- Regular variables are private (backend only)
- NEVER commit `.env.local` to git

### 3. Run Locally

```bash
npm run dev
```

The API will be available at `http://localhost:5173/api/sendBookingEmails`

## Deploy to Vercel

### 1. Connect Your Repository

```bash
vercel
```

Follow the prompts to connect your GitHub repo to Vercel.

### 2. Add Environment Variables in Vercel Dashboard

Go to your project settings on [vercel.com](https://vercel.com):

1. **Settings** → **Environment Variables**
2. Add these variables:

| Name | Value | Should be encrypted |
|------|-------|-------------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | No |
| `VITE_SUPABASE_ANON_KEY` | Your Anon Key | Yes |
| `RESEND_API_KEY` | Your Resend API Key | Yes |
| `SUPABASE_URL` | Your Supabase URL | No |
| `SUPABASE_SERVICE_KEY` | Your Service Role Key | Yes |

**Note:** Mark sensitive keys as encrypted.

### 3. Deploy

```bash
vercel --prod
```

Or push to main branch for automatic deployment.

## Getting Required Keys

### Supabase Service Role Key

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Service Role Key** (⚠️ keep this secret!)
5. Use this for `SUPABASE_SERVICE_KEY`

### Resend API Key

1. Go to [resend.com](https://resend.com)
2. Dashboard → **API Keys**
3. Copy your API key
4. Use this for `RESEND_API_KEY`

## Verify It Works

1. Deploy to Vercel
2. Go to your deployed site
3. Click "Book now" on a therapist
4. Fill the form and submit
5. Check if you receive the confirmation email

## Troubleshooting

**API returns 405 (Method not allowed):**
- Make sure you're sending a POST request
- Check the URL is `/api/sendBookingEmails`

**"Missing environment variables" error:**
- Verify all 5 variables are added in Vercel Dashboard
- Wait a few minutes for deployment to use new variables
- Redeploy if needed

**Emails not sending:**
- Check RESEND_API_KEY is correct
- Verify "From" domain (noreply@psyq.com) is authenticated in Resend
- Check email is in "To" field, not in Resend spam

**Booking not saving to database:**
- Verify SUPABASE_SERVICE_KEY is the Service Role key (not anon key)
- Check SUPABASE_URL is correct
- Verify bookings table exists in Supabase

**"Failed to save booking" but emails sent:**
- Check Supabase table schema matches the code
- Verify column names are snake_case: full_name, email, etc.

## Security Best Practices

✅ **What's secure now:**
- API key only on Vercel servers
- Service role key never exposed to browser
- All sensitive data sent server-side

❌ **Never do:**
- Commit `.env.local` to Git
- Use VITE_ prefix for secret keys
- Share your Service Role Key publicly
- Use Anon Key for backend operations

## Next Steps

- Monitor email deliverability
- Set up admin dashboard to view bookings
- Add email notifications for reminders
- Consider rate limiting on the API endpoint
