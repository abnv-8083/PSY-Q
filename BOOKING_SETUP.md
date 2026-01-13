# Booking System Setup Guide

## What Has Been Implemented

✅ **Email & Database Integration**
- Dual email templates: User confirmation + Admin notification
- Automated booking storage in Supabase PostgreSQL
- Full form validation with error handling
- Loading states and success messages

## Setup Steps

### 1. **Set Up Supabase**

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, get your credentials:
   - Project URL
   - Anon Key (from Settings → API)
3. Create the `bookings` table in SQL Editor:

```sql
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  full_name text not null,
  email text not null,
  phone text,
  age int,
  mode_of_therapy text,
  primary_concern text,
  session_type text,
  selected_date date,
  selected_time text,
  package_details jsonb
);
```

### 2. **Set Up Resend Email Service**

1. Go to [resend.com](https://resend.com) and create account
2. Get your API Key from the dashboard
3. Verify the "From" email domain (you'll need to use a verified domain or Resend's sandbox)

**Important:** For production, configure your domain in Resend for proper email delivery.

### 3. **Configure Environment Variables**

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Fill in your credentials in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

3. **Do NOT commit `.env.local` to git** (it's in .gitignore)

### 4. **Verify Setup**

Run the dev server and test the booking flow:
```bash
npm run dev
```

## What Happens When User Books

1. User fills form and clicks "Book Session"
2. Form validation checks all required fields
3. System sends two emails:
   - **User Email**: Confirmation with selected date, time, session type, mode of therapy, and package
   - **Admin Email** (psyqonline@gmail.com): Full booking details + all contact info
4. Booking data stored in Supabase `bookings` table
5. Success message shown: "An email with the confirmation has been sent"
6. Modal closes and form resets

## Files Created/Modified

**New Files:**
- `src/lib/supabaseClient.js` - Supabase client initialization
- `src/api/sendBookingEmails.js` - Email and database logic
- `.env.local.example` - Environment template

**Modified Files:**
- `src/components/BookingModal.jsx` - Updated with booking logic

## Email Templates

**User Confirmation Email:**
- Shows booking details (date, time, session type, mode of therapy, package)
- Professional HTML template
- Sent from: `noreply@psyq.com`

**Admin Notification Email:**
- Shows complete booking info + customer contact details
- Dark themed for admin dashboard
- Sent to: `psyqonline@gmail.com`

## Troubleshooting

**Emails not sending:**
- Check Resend API key is correct
- Verify "From" domain is authenticated in Resend
- Check VITE_RESEND_API_KEY in `.env.local`

**Bookings not saving to database:**
- Verify Supabase URL and Anon Key
- Check `bookings` table exists with correct columns
- Verify column names match exactly (snake_case)

**"Missing environment variables" error:**
- Ensure `.env.local` file exists with all 3 variables
- Restart dev server after adding env vars
- Variables must start with `VITE_` to be exposed to frontend

## Next Steps (Optional)

- Set up admin dashboard to view bookings in Supabase
- Add email notifications for new bookings
- Implement WhatsApp notifications (Twilio integration)
- Add calendar integration for therapist availability
- Set up automated reminders before sessions
