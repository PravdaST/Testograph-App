# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the following:
   - **Name**: Testograph Tools
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Start with Free tier
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Ctrl/Cmd + Enter
6. Verify all tables were created successfully

## Step 3: Configure Authentication

1. Click "Authentication" in the left sidebar
2. Click "Providers"
3. Enable the following providers:
   - **Email**: Toggle ON (already enabled by default)
   - **Google** (optional but recommended):
     - Toggle ON
     - Enter your Google OAuth credentials
     - See [Supabase Google OAuth docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Step 4: Get Your API Credentials

1. Click "Settings" in the left sidebar
2. Click "API"
3. Find the following credentials:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
4. Copy these values

## Step 5: Configure Your Application

1. Copy `.env.example` to `.env` (create it in the root folder)
2. Fill in your credentials:
   ```
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. **IMPORTANT**: Add `.env` to your `.gitignore` file to keep credentials secure

## Step 6: Test the Connection

1. Open the application in a browser
2. Try to sign up with a test email
3. Check your Supabase dashboard under "Authentication" > "Users" to verify the user was created
4. Try logging in with the test credentials

## Optional: Configure Storage (for future features)

1. Click "Storage" in the left sidebar
2. Create a new bucket named "user-uploads"
3. Set it to public or private based on your needs
4. Configure RLS policies for the bucket

## Troubleshooting

### Authentication Issues
- Check that your Supabase URL and anon key are correct
- Verify RLS policies are enabled on all tables
- Check browser console for error messages

### Database Connection Issues
- Verify your project is fully provisioned
- Check that the schema.sql ran without errors
- Look for any failed queries in the SQL Editor

### CORS Issues
- Supabase automatically handles CORS for your project URL
- If testing locally, make sure you're using `http://localhost` or `http://127.0.0.1`

## Security Best Practices

1. Never commit `.env` file to version control
2. Always use Row Level Security (RLS) policies
3. Rotate your API keys if they're ever exposed
4. Use service_role key only on the backend/server (not in this frontend app)
5. Enable email confirmation for new signups (optional)

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
