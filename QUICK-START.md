# Quick Start: Complete Your Migration

## ⚠️ Important: You Need to Run the SQL Migration

Your app code has been updated, but you need to create the database tables in Supabase.

## Step-by-Step Instructions

### 1. Open Your Supabase Dashboard
1. Go to https://app.supabase.com
2. Login to your account
3. Select your project (URL ends with `fprtrrurntzpshaprrmm.supabase.co`)

### 2. Run the SQL Migration
1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase-migration.sql` in this project
4. Copy **all the contents** of that file
5. Paste into the SQL Editor
6. Click **Run** button (or press Cmd/Ctrl + Enter)

You should see a success message. This creates:
- `projects` table
- `characters` table
- All security policies (RLS)
- Indexes for performance
- Automatic triggers

### 3. Install Dependencies
In your terminal, run:
```bash
npm install
```

**Note**: The project is configured with `legacy-peer-deps=true` in `.npmrc` to handle React 19 compatibility. This is normal and safe.

### 4. Start Your App
```bash
npm run dev
```

## Verify Everything Works

1. **Test Login**
   - Open the app
   - Try logging in or creating a new account

2. **Test Creating a Project**
   - Create a new reading project
   - Add a script
   - Configure counter-readers

3. **Test Data Persistence**
   - Create a project
   - Close the app
   - Reopen the app and login
   - Your project should still be there!

## What If Something Goes Wrong?

### "User not authenticated" Error
- Make sure you're logged in
- Try logging out and back in
- Check that your `.env` file has the correct Supabase credentials

### "Failed to load projects" Error
- Make sure you ran the SQL migration in Supabase
- Check the browser console for specific error messages
- Verify Row Level Security policies were created

### npm install Errors
- Delete `node_modules` folder
- Delete `package-lock.json` file
- Run `npm install --legacy-peer-deps`

## Need More Details?

- **MIGRATION-INSTRUCTIONS.md** - Full migration guide
- **MIGRATION-SUMMARY.md** - Complete list of changes
- **supabase-migration.sql** - The SQL you need to run

## Your Migration Checklist

- [ ] Logged into Supabase Dashboard
- [ ] Ran the SQL migration (supabase-migration.sql)
- [ ] Verified tables were created in Supabase
- [ ] Ran `npm install`
- [ ] Started the app with `npm run dev`
- [ ] Tested login/signup
- [ ] Created a test project
- [ ] Verified data persists after logout/login

Once all checkboxes are done, your migration is complete! ✅
