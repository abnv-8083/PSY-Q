# Troubleshooting: Cannot Create Notifications

## Most Likely Cause

**The `notifications` table doesn't exist in your Supabase database yet.**

## Solution: Run the Database Migration

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `rkhsdukwyxypsbxhlppl`

### Step 2: Run the Migration Script
1. Click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `d:\psy-q-main\scripts\add_notifications_table.sql`
4. Copy ALL the contents
5. Paste into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see a message: `Notifications table created successfully!`

### Step 4: Test in the App
1. Refresh your admin page: `http://localhost:5173/admin`
2. Click "Manage" above the carousel
3. Try creating a notification again

---

## Other Possible Issues

### Issue 2: Permission Denied (RLS Policies)

**Symptoms**: Error message mentions "permission denied" or "RLS"

**Cause**: You're not logged in as an admin user

**Solution**:
1. Make sure you're logged into the app as an admin
2. Check your user's role in Supabase:
   - Go to Supabase Dashboard → **Table Editor** → `profiles`
   - Find your user by email
   - Verify the `role` column is one of: `admin`, `sub-admin`, or `superadmin`
   - If not, update it to `admin`

### Issue 3: Browser Console Errors

**How to Check**:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try creating a notification
4. Look for red error messages

**Common Errors**:
- `relation "notifications" does not exist` → Run the migration (Step 1 above)
- `permission denied` → Check your admin role (Issue 2 above)
- `Failed to fetch` → Check your internet connection and Supabase status

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] **Database Migration**: Did you run `add_notifications_table.sql` in Supabase SQL Editor?
- [ ] **Table Exists**: Go to Supabase → Table Editor → Check if `notifications` table is listed
- [ ] **Sample Data**: If table exists, it should have 3 sample notifications
- [ ] **Admin Login**: Are you logged into the app as an admin user?
- [ ] **Admin Role**: Check your user in `profiles` table has role = `admin`
- [ ] **Browser Console**: Any red errors when clicking "Create"?
- [ ] **Network Tab**: Check if API request is being sent (DevTools → Network)

---

## Still Not Working?

### Get Detailed Error Information

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Click "Manage" → "Add Notification"
4. Fill in the form and click "Create"
5. **Copy the error message** that appears in the console
6. Share the error message for more specific help

The enhanced error logging I just added will show exactly what's going wrong!

---

## Expected Behavior

When working correctly:
1. Click "Manage" → Opens dialog with table
2. Click "Add Notification" → Opens form
3. Fill in Image URL, Header, Description
4. Click "Create"
5. **Console shows**: `handleSave called with formData: {...}`
6. **Console shows**: `Creating new notification: {...}`
7. **Console shows**: `Notification created successfully: {...}`
8. Dialog closes, new notification appears in table
9. Close manager, carousel shows new slide

---

## Quick Test

Try this simple test:
1. Open Supabase Dashboard → **Table Editor** → `notifications`
2. Click **Insert row**
3. Fill in:
   - image_url: `https://via.placeholder.com/800x400`
   - header: `Test`
   - description: `Test description`
   - is_active: `true`
   - display_order: `0`
4. Click **Save**

If this works, the table exists and you have permissions. The issue is in the frontend code.
If this fails, the table doesn't exist or you don't have permissions.
