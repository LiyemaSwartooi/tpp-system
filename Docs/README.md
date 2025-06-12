# Talent Pipeline Programme (TPP) System

A Next.js web application for managing the Talent Pipeline Programme, featuring role-based access control for students and coordinators.

## Features

- **Authentication**: Secure login/signup with Supabase Auth
- **Role-based Access Control**:
  - Students: View and manage their profile and academic performance
  - Coordinators: Manage student data and track academic progress
  - Strict role-based route protection
- **Academic Reports**:
  - Upload and manage academic reports (PDF, DOC, DOCX)
  - View report history with download and delete options
  - Real-time upload progress tracking
  - File size validation (max 10MB)
  - Secure file storage with Supabase Storage
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Form Handling**: Robust form validation with React Hook Form and Zod
- **Loading States**: Beautiful loading animations with the TPP logo
- **Responsive Design**: Works on all device sizes
- **Error Handling**: Graceful error states and access denied pages

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + Hooks
- **Database & Auth**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js 18 or later
- npm or pnpm
- Supabase account (https://supabase.com/)
- Git for version control

## Setting Up Academic Reports with Supabase

### 1. Enable Row Level Security (RLS) on Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Configure the bucket:
   - Name: `reports`
   - Public access: Disabled
   - File size limit: 10MB

### 2. Set Up Storage Policies

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- Set up RLS policies for the reports bucket
create policy "Users can view their own reports"
  on storage.objects for select
  using (bucket_id = 'reports' AND auth.uid() = owner);

create policy "Users can upload their own reports"
  on storage.objects for insert
  with check (bucket_id = 'reports' AND auth.uid() = owner);

create policy "Users can delete their own reports"
  on storage.objects for delete
  using (bucket_id = 'reports' AND auth.uid() = owner);
```

### 3. Create the Reports Table

```sql
create table if not exists reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  size_bytes bigint not null,
  mime_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table reports enable row level security;

-- Create policies
create policy "Users can view their own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on reports for delete
  using (auth.uid() = user_id);
```

## Academic Reports Feature

### Overview
The Academic Reports feature allows students to upload, view, and manage their academic reports. Reports are securely stored in Supabase Storage and linked to the user's account.
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  size_bytes bigint not null,
  mime_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table reports enable row level security;

-- Create policies
create policy "Users can view their own reports"
  on reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on reports for delete
  using (auth.uid() = user_id);
```

#### Storage Bucket
Create a storage bucket named 'reports' in Supabase Storage with the following RLS policies:

```sql
-- Create storage bucket
insert into storage.buckets (id, name, public) 
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- Set up RLS policies for the reports bucket
create policy "Users can view their own reports"
  on storage.objects for select
  using (bucket_id = 'reports' AND auth.uid() = owner);

create policy "Users can upload their own reports"
  on storage.objects for insert
  with check (bucket_id = 'reports' AND auth.uid() = owner);

create policy "Users can delete their own reports"
  on storage.objects for delete
  using (bucket_id = 'reports' AND auth.uid() = owner);
```

### Key Components

1. **ProfileForm Component**
   - Handles both profile information and academic reports
   - Located at: `components/student-dashboard/profile-form.tsx`
   - Features:
     - File upload with drag-and-drop support
     - Progress tracking for uploads
     - Report listing with download/delete functionality
     - Form validation and error handling

2. **API Routes**
   - Handles file uploads and database operations
   - Uses Supabase client for authentication and storage

### Usage

1. **Uploading a Report**
   - Navigate to the profile page
   - Click "Upload New Report"
   - Select a file (PDF, DOC, or DOCX, max 10MB)
   - Click "Upload"
   - The file will be uploaded and appear in the "Your Reports" section

2. **Viewing Reports**
   - All uploaded reports are listed in the "Your Reports" section
   - Each report shows:
     - File name
     - Upload date
     - File size
     - Download/Delete buttons

3. **Downloading a Report**
   - Click the download icon next to the report
   - The file will be downloaded to your device

4. **Deleting a Report**
   - Click the delete (trash) icon next to the report
   - Confirm the deletion
   - The report will be removed from storage and the list

### Error Handling
- File size validation (max 10MB)
- File type validation (PDF, DOC, DOCX only)
- Network error handling
- Authentication checks

### Performance Considerations
- Files are uploaded in chunks for better reliability
- Progress indicators provide feedback during uploads
- Lazy loading for report lists with many items
- Optimistic UI updates for better perceived performance

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd tpp-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with your Supabase credentials. Make sure to include the storage bucket URL:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STORAGE_BUCKET_URL=your_storage_bucket_url
   ```

4. **Run database migrations**
   Make sure to set up the database schema as described in `DATABASE.md`

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Development

1. **Set up Supabase**
   - Create a new project in Supabase
   - Run the SQL migrations from the `supabase/migrations` directory
   - Set up storage bucket and policies as described above

2. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Testing the Academic Reports Feature**
   - Log in as a student
   - Navigate to the profile page
   - Test uploading different file types and sizes
   - Verify that the reports appear in the list
   - Test downloading and deleting reports
   - Check the browser console for any errors

## Testing Authentication

1. **Create a test user**
   - Visit `/access-portal`
   - Sign up with an email and password
   - The system will automatically create a profile with the 'student' role

2. **Access different dashboards**
   - Students will be redirected to `/student`
   - Coordinators will be redirected to `/coordinator`
   - Accessing unauthorized routes will show an access denied page

## Deployment

1. **Production Build**
   ```bash
   npm run build
   npm start
   ```

2. **Environment Variables**
   - Make sure all environment variables are set in your production environment
   - Verify that CORS is properly configured in your Supabase project

3. **Storage Configuration**
   - Ensure the storage bucket is created with the correct policies
   - Set appropriate CORS headers for file uploads

4. **Deployment**
   Deploy your application to Vercel, Netlify, or your preferred hosting provider.

## Project Structure

```
├── app/                    # App router pages and layouts
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── public/                 # Static assets
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Implementation

The authentication system is built with the following key components:

1. **Sign Up Flow**
   - Collects user details (name, email, password, role)
   - Creates user in Supabase Auth
   - Creates corresponding profile in the database
   - Automatically logs in the user

2. **Sign In Flow**
   - Validates credentials against Supabase Auth
   - Retrieves user profile
   - Stores session in localStorage
   - Redirects based on user role

3. **Session Management**
   - JWT-based authentication
   - Persistent sessions
   - Automatic token refresh

## Security Notes

⚠️ **Important**: This implementation is for development purposes. For production, consider adding:
- Email confirmation
- Password strength requirements
- Rate limiting
- Additional security headers
- Proper RLS policies


For production deployment, consider using:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Self-hosted on a VPS with Nginx/PM2

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository or contact the development team.
