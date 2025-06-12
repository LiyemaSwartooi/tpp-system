# Authentication Setup Guide

This document provides comprehensive instructions for setting up and configuring authentication in the TPP System using Supabase. It covers database setup, environment configuration, and implementation details.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup Steps](#setup-steps)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Authentication Flows](#authentication-flows)
- [Role-Based Access Control](#role-based-access-control)
- [Testing Authentication](#testing-authentication)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. Node.js (v18 or later)
2. npm, pnpm, or yarn
3. Supabase account ([sign up here](https://supabase.com/))
4. Git for version control
5. Basic understanding of Next.js and React

## Setup Steps

### 1. Project Initialization

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone [repository-url]
cd tpp-system

# Install dependencies
npm install
# or
pnpm install
```

## Setup Steps

### 1. Install Dependencies

```bash
# Core dependencies with specific versions and legacy peer deps
npm install @hookform/resolvers@^3.3.4 react-hook-form@^7.53.0 zod@^3.23.8 sonner@^1.4.2 @supabase/supabase-js@^2.39.7 @supabase/ssr@^0.1.0 --legacy-peer-deps

# Additional UI components (if using shadcn/ui)
npm install @radix-ui/react-dropdown-menu @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react --legacy-peer-deps
```

**Important**: The `--legacy-peer-deps` flag is necessary to avoid dependency conflicts with React 18+.


### 2. Environment Setup

1. Create a `.env.local` file in your project root:

```bash
# Copy example environment file
cp .env.example .env.local
```

2. Update the following variables in `.env.local` with your Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Set to 'true' in development to enable debug logging
NEXT_PUBLIC_DEBUG_AUTH=false
```

> **Note**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

## Database Setup

### 1. Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization and project details
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create project"

### 2. Set Up Database Schema

Run the following SQL in your Supabase SQL Editor:

1. Go to SQL Editor in the Supabase dashboard
2. Click "New Query"
3. Paste the following SQL code
4. Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  first_name text,
  last_name text,
  role text not null default 'student' check (role in ('student', 'coordinator')),
  student_number text,
  school text,
  grade text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_email unique (email)
);

-- Create indexes for better performance
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_student_number_idx on public.profiles (student_number) where student_number is not null;

-- Update timestamp function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create update trigger
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- Handle new user function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    student_number,
    school,
    grade
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName',
    coalesce((new.raw_user_meta_data->>'role')::text, 'student'),
    new.raw_user_meta_data->>'studentNumber',
    new.raw_user_meta_data->>'school',
    new.raw_user_meta_data->>'grade'
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    updated_at = now();
  
  return new;
end;
$$;

-- Create trigger for new users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can view their own profile"
on profiles for select
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
on profiles for update
  using (auth.uid() = id);

-- Allow coordinators to view all profiles
create policy "Coordinators can view all profiles"
on profiles for select
  using (auth.role() = 'authenticated' and 
         exists (select 1 from profiles where id = auth.uid() and role = 'coordinator'));

-- Allow authenticated users to see basic profile info
create policy "Public profiles are viewable by authenticated users"
on profiles for select
  to authenticated
  using (true);

-- RLS Policies
create policy "Allow public read access"
  on public.profiles
  for select
  using (true);

create policy "Allow insert for service role"
  on public.profiles
  for insert
  with check (true);

create policy "Allow update for own profile"
  on public.profiles
  for update
  using (auth.uid() = id);
```

### 4. Supabase Client Setup

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Client-side client
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side client
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper functions
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

### 5. Type Definitions

Create or update `types/supabase.ts`:

```typescript
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'student' | 'coordinator' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'student' | 'coordinator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'student' | 'coordinator' | 'admin';
          updated_at?: string;
        };
      };
    };
    Enums: {
      user_role: 'student' | 'coordinator' | 'admin';
    };
  };
}
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure all necessary RLS policies are in place
   - Check that the service role key is being used for server-side operations

2. **Trigger Not Firing**
   - Verify the trigger is correctly set up on the `auth.users` table
   - Check the function has `security definer`

3. **Type Errors**
   - Ensure your TypeScript types match your database schema
   - Restart your TypeScript server after making changes to type definitions

## Useful SQL Commands

```sql
-- View all profiles
select * from public.profiles;

-- View all users
select * from auth.users;

-- View RLS policies
select * from pg_policies where tablename = 'profiles';

-- View triggers
select trigger_name, event_manipulation, event_object_table, action_statement 
from information_schema.triggers;
```

## Security Notes

1. Never expose the `SUPABASE_SERVICE_ROLE_KEY` in client-side code
2. Always use environment variables for sensitive information
3. Regularly audit your RLS policies
4. Keep your Supabase dependencies up to date

## Next Steps

1. Implement email confirmation
2. Add password reset functionality
## Authentication Flows

### 1. Sign Up

1. User visits `/access-portal`
2. Clicks "Create an account"
3. Fills in the registration form
4. System creates a new user in Supabase Auth
5. The `on_auth_user_created` trigger creates a profile
6. User receives a confirmation email (if email confirmation is enabled)
7. After email confirmation, user is redirected to the appropriate dashboard

### 2. Sign In

1. User visits `/access-portal`
2. Enters email and password
3. System authenticates with Supabase
4. On success, fetches the user's profile
5. Redirects to the appropriate dashboard based on role

### 3. Sign Out

1. User clicks "Sign Out" in the dashboard
2. System calls `supabase.auth.signOut()`
3. Redirects to the access portal

## Role-Based Access Control

The system uses two main roles:

### 1. Student
- Can view and update their own profile
- Can view their academic performance
- Can submit assignments
- Cannot access coordinator features

### 2. Coordinator
- Can view all student profiles
- Can manage student data
- Can generate reports
- Has access to admin features

## Testing Authentication

### 1. Create a Test User

```sql
-- Create a test student
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-000000000001',
  'student@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"firstName":"Test","lastName":"Student","role":"student"}'
);

-- Create a test coordinator
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-000000000002',
  'coordinator@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"firstName":"Test","lastName":"Coordinator","role":"coordinator"}'
);
```

### 2. Test Login Credentials

**Student Account**
- Email: student@example.com
- Password: password123

**Coordinator Account**
- Email: coordinator@example.com
- Password: password123

## Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Check if the user exists in the `auth.users` table
   - Verify the password hash is correct
   - Ensure email confirmation is not required or the email is confirmed

2. **Profile Not Created**
   - Check the `auth.users` table for the user
   - Look for errors in the Supabase logs
   - Verify the trigger is properly set up

3. **Role-Based Access Issues**
   - Check the `profiles` table for the user's role
   - Verify RLS policies are correctly set up
   - Check the JWT claims with `select auth.jwt();`

4. **CORS Issues**
   - Ensure your frontend URL is in the Supabase CORS settings
   - Check the browser console for CORS errors

### Debugging

1. **Check Supabase Logs**
   - Go to the Supabase dashboard
   - Navigate to Logs > Edge Functions
   - Look for any error messages

2. **Enable Debug Logging**
   Set `NEXT_PUBLIC_DEBUG_AUTH=true` in your `.env.local` to enable debug logging.

3. **Inspect JWT**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('JWT:', session?.access_token);
   // Decode at https://jwt.io/
   ```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different credentials for development and production
   - Rotate API keys regularly

2. **Password Policies**
   - Enforce strong passwords
   - Implement rate limiting
   - Consider adding MFA for coordinators

3. **Session Management**
   - Use secure, HTTP-only cookies
   - Set appropriate session expiry
   - Implement proper sign-out functionality

4. **Regular Audits**
   - Review access logs
   - Monitor for suspicious activity
   - Keep dependencies updated

## Deployment

1. **Production Environment Variables**
   - Set up environment variables in your hosting provider
   - Never commit production credentials to version control

2. **CORS Configuration**
   - Add your production domain to Supabase CORS settings
   - Remove development URLs in production

3. **Backup Strategy**
   - Set up regular database backups
   - Test restoration procedures

## Support

For additional help, please contact the development team or refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Project Wiki](link-to-your-wiki)
