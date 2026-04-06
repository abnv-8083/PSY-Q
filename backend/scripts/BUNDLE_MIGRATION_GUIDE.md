# Bundle Management System - Migration Guide

## Overview
This guide will help you migrate from the old dynamic bundle system to the new fixed bundle system with three tiers: **Basic**, **Advanced**, and **Premium**.

## Prerequisites
- Access to Supabase Dashboard
- Admin privileges on the database
- Backup of existing data (automatically created by migration script)

## Migration Steps

### Step 1: Backup Current Data
The migration script automatically creates backup tables, but you should also create a manual backup:

1. Go to Supabase Dashboard → Database → Backups
2. Create a manual backup before proceeding
3. Note the backup ID for potential rollback

### Step 2: Run Migration Script

**Option A: Using Supabase Dashboard (Recommended)**

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `scripts/migrate_bundles_to_fixed.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration
7. Verify the output shows no errors

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push --file scripts/migrate_bundles_to_fixed.sql
```

### Step 3: Verify Migration

Run the following SQL query to verify the three bundles were created:

```sql
SELECT * FROM bundles ORDER BY display_order;
```

You should see three rows:
- **BASIC** - Basic Plan - ₹499
- **ADVANCED** - Advanced Plan - ₹999
- **PREMIUM** - Premium Plan - ₹1499

### Step 4: Test Admin Interface

1. Navigate to Admin Dashboard
2. Click on **Bundle Management** in the sidebar
3. Verify you see three bundle cards
4. Test editing pricing for each bundle
5. Test adding/removing mock tests
6. Test editing features

### Step 5: Update Student-Facing Interface (Optional)

The student-facing bundle display in `MockTestHome.jsx` currently shows hardcoded data. To fetch from the database:

1. Import the bundles API:
   ```javascript
   import { fetchBundles } from '../../api/bundlesApi';
   ```

2. Replace hardcoded bundle data with API call in `useEffect`

3. Update the pricing display to show offer prices and discounts

## Rollback Procedure

If you need to rollback the migration:

```sql
-- Restore from backup tables
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS bundle_tests CASCADE;
DROP TABLE IF EXISTS user_bundles CASCADE;

-- Restore original tables
CREATE TABLE bundles AS SELECT * FROM bundles_backup;
CREATE TABLE bundle_tests AS SELECT * FROM bundle_tests_backup;
CREATE TABLE user_bundles AS SELECT * FROM user_bundles_backup;

-- Restore foreign keys and constraints
-- (You may need to manually recreate these based on your original schema)
```

## Features of New System

### Admin Features
- ✅ Three fixed bundles (cannot be created/deleted)
- ✅ Configure regular price and offer price
- ✅ Automatic discount percentage calculation
- ✅ Add/remove mock tests to bundles
- ✅ Edit bundle features
- ✅ Visual pricing display with strikethrough for regular price

### Validation
- ✅ Offer price cannot exceed regular price
- ✅ Prices must be non-negative
- ✅ Real-time discount calculation
- ✅ Duplicate test prevention

### Database Features
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates
- ✅ Indexed for performance
- ✅ Cascade deletes for data integrity

## Troubleshooting

### Error: "relation 'bundles' already exists"
**Solution**: The old bundles table still exists. Run the DROP TABLE commands first:
```sql
DROP TABLE IF EXISTS user_bundles CASCADE;
DROP TABLE IF EXISTS bundle_tests CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
```

### Error: "permission denied for table bundles"
**Solution**: Check RLS policies. Ensure your admin user has the correct role:
```sql
SELECT * FROM profiles WHERE id = auth.uid();
-- Role should be 'admin' or 'superadmin'
```

### Bundles not showing in admin interface
**Solution**: 
1. Check browser console for errors
2. Verify bundles exist: `SELECT * FROM bundles;`
3. Check RLS policies allow reading
4. Ensure admin user is authenticated

### Tests not appearing in bundle management
**Solution**:
1. Verify tests exist: `SELECT * FROM tests WHERE is_published = true;`
2. Check that tests have valid subject_id
3. Ensure RLS policies allow reading tests

## Post-Migration Tasks

### 1. Update Pricing
- Review and update regular prices if needed
- Set offer prices for promotional periods
- Verify discount percentages are correct

### 2. Assign Mock Tests
- Add relevant mock tests to each bundle
- Ensure Basic has fewer tests than Advanced
- Ensure Premium has the most comprehensive test set

### 3. Customize Features
- Edit feature lists for each bundle
- Ensure features accurately reflect bundle benefits
- Keep feature lists concise (4-5 items)

### 4. Test User Flow
- Test bundle purchase flow
- Verify users can access purchased bundles
- Check that pricing displays correctly on frontend

## Support

If you encounter any issues during migration:

1. Check the backup tables exist: `SELECT * FROM bundles_backup;`
2. Review Supabase logs for detailed error messages
3. Verify all RLS policies are correctly applied
4. Ensure the API layer (`bundlesApi.js`) is properly imported

## Next Steps

After successful migration:

1. ✅ Update student-facing bundle display to fetch from database
2. ✅ Implement bundle purchase flow
3. ✅ Add analytics for bundle performance
4. ✅ Consider A/B testing for pricing strategies
