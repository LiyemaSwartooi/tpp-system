# Database Documentation

## Overview

This document outlines the database schema, relationships, and setup instructions for the TPP System.

## Database Schema

### Tables

#### 1. `profiles`
Stores user profile information linked to Supabase Auth users.

```sql
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  role text not null check (role in ('student', 'coordinator')) default 'student',
  student_number text,
  school text,
  grade text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 2. `subjects`
Stores student subject information.

```sql
create table subjects (
  id uuid default extensions.uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  level text,
  final_percentage numeric(5,2),
  grade_average numeric(5,2),
  term integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_student_subject_term unique (student_id, name, term)
);
```

## Row Level Security (RLS) Policies

### Profiles Table

```sql
-- Enable RLS
alter table profiles enable row level security;

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
```

### Subjects Table

```sql
-- Enable RLS
alter table subjects enable row level security;

-- Allow users to view their own subjects
create policy "Users can view their own subjects"
on subjects for select
  using (auth.uid() = student_id);

-- Allow users to insert their own subjects
create policy "Users can insert their own subjects"
on subjects for insert
  with check (auth.uid() = student_id);

-- Allow users to update their own subjects
create policy "Users can update their own subjects"
on subjects for update
  using (auth.uid() = student_id);

-- Allow coordinators to view all subjects
create policy "Coordinators can view all subjects"
on subjects for select
  using (auth.role() = 'authenticated' and 
         exists (select 1 from profiles where id = auth.uid() and role = 'coordinator'));
```

## Database Functions

### Update Timestamp Function

```sql
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

### Triggers

```sql
-- Update updated_at on profiles
create trigger handle_updated_at_profiles
before update on profiles
for each row
execute function update_updated_at_column();

-- Update updated_at on subjects
create trigger handle_updated_at_subjects
before update on subjects
for each row
execute function update_updated_at_column();
```

## Setup Instructions

1. **Enable Required Extensions**
   ```sql
   create extension if not exists "uuid-ossp";
   create extension if not exists "pgcrypto";
   ```

2. **Run the Schema**
   Execute the SQL statements above in your Supabase SQL Editor in this order:
   1. Create tables
   2. Create functions
   3. Create triggers
   4. Set up RLS policies

3. **Create Database Triggers**
   Set up triggers in the Supabase dashboard:
   - Go to Authentication > Triggers
   - Create a new trigger that runs after signup
   - Set the function to create a profile for new users

## Testing the Database

1. **Verify Tables**
   ```sql
   \dt
   ```

2. **Check RLS Policies**
   ```sql
   select * from pg_policies where tablename = 'profiles';
   select * from pg_policies where tablename = 'subjects';
   ```

3. **Test with Sample Data**
   ```sql
   -- Insert a test coordinator
   insert into profiles (id, email, first_name, last_name, role)
   values ('00000000-0000-0000-0000-000000000001', 'coordinator@example.com', 'John', 'Doe', 'coordinator');
   
   -- Insert a test student
   insert into profiles (id, email, first_name, last_name, role, student_number, school, grade)
   values ('00000000-0000-0000-0000-000000000002', 'student@example.com', 'Jane', 'Smith', 'student', 'S12345', 'Example High', '12');
   
   -- Insert test subjects
   insert into subjects (student_id, name, level, final_percentage, grade_average, term)
   values ('00000000-0000-0000-0000-000000000002', 'Mathematics', 'Advanced', 85.5, 87.2, 1);
   ```

## Troubleshooting

1. **RLS Issues**
   - Ensure RLS is enabled on all tables
   - Check that the policies are correctly set up
   - Verify the user's JWT claims with `select auth.jwt();`

2. **Connection Issues**
   - Verify your Supabase URL and keys
   - Check your network connection
   - Ensure CORS is properly configured in Supabase

3. **Performance**
   - Add appropriate indexes for frequently queried columns
   - Monitor query performance with `explain analyze`
   - Consider using materialized views for complex queries
