# Supabase Migration Instructions

Your Reading Partner app has been successfully migrated from local SQLite to Supabase! Follow these steps to complete the setup.

## Step 1: Run the Database Migration

1. Log in to your Supabase Dashboard at https://app.supabase.com
2. Select your project (the one with URL: `fprtrrurntzpshaprrmm.supabase.co`)
3. Navigate to the **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of the `supabase-migration.sql` file
6. Paste it into the SQL Editor
7. Click **Run** to execute the migration

This will create:
- `projects` table with proper structure and RLS policies
- `characters` table with proper structure and RLS policies
- Indexes for better performance
- Automatic triggers for updating timestamps

## Step 2: Install Dependencies

Run the following command to install the updated dependencies:

```bash
npm install
```

This will:
- Remove the `expo-sqlite` dependency (no longer needed)
- Update lucide-react-native to version compatible with React 19
- Update all packages to compatible versions

**Note**: If you encounter peer dependency warnings, you can safely use:
```bash
npm install --legacy-peer-deps
```

## What Changed?

### Database
- **Before**: Local SQLite database (device-only storage)
- **After**: Supabase PostgreSQL (cloud storage with sync)

### Benefits
- ✅ Data persists across devices
- ✅ Automatic backups
- ✅ User-specific data isolation with Row Level Security
- ✅ Real-time sync capabilities
- ✅ No local storage limitations

### Files Modified
- ✅ Created `lib/supabaseDatabase.ts` - New database manager
- ✅ Created `contexts/AuthContext.tsx` - Global auth state
- ✅ Updated all screens to use Supabase instead of SQLite
- ✅ Updated `app/_layout.tsx` to include auth provider
- ✅ Removed `expo-sqlite` from dependencies
- ✅ Fixed package version conflicts

### Files You Can Delete
- `lib/database.ts` - Old SQLite database manager (no longer used)

## Verification

After running the migration, verify everything works:

1. **Test Authentication**
   - Try logging in with your existing account
   - Or create a new account

2. **Test Project Creation**
   - Create a new reading project
   - Add a script
   - Configure counter-readers

3. **Test Data Persistence**
   - Log out and log back in
   - Your projects should still be there
   - All data is now stored in Supabase

## Row Level Security (RLS)

Your data is protected with Row Level Security policies:
- Users can only see their own projects
- Users can only see their own characters
- All database operations require authentication
- Data is completely isolated between users

## Need Help?

If you encounter any issues:
1. Check that the SQL migration ran successfully in Supabase
2. Verify your `.env` file has the correct Supabase credentials
3. Make sure you ran `npm install` after the migration

Your app is now fully cloud-enabled with Supabase! 🎉
