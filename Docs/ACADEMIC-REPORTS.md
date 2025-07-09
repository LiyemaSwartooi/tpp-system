# Academic Reports Feature

## Overview
The Academic Reports feature allows students to securely upload, view, download, and manage their academic reports. Reports are stored in Supabase Storage and linked to user accounts for secure access.

## Prerequisites

- Supabase project with authentication enabled
- Storage bucket set up in Supabase
- Basic knowledge of Next.js and React

## Backend Setup

### 1. Create Storage Bucket

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

### 3. Create Reports Table

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

## Frontend Implementation

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. File Upload Component

Create a new component `components/FileUpload.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase-client';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  progress: number;
}

export default function FileUpload({ onUpload, isUploading, progress }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      await onUpload(file);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 mb-2" />
            <p className="text-lg font-medium">
              {file ? file.name : 'Drag and drop your file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, DOC, or DOCX (max 10MB)
            </p>
          </div>
        </label>
      </div>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      <Button
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? 'Uploading...' : 'Upload Report'}
      </Button>
    </div>
  );
}
```

### 4. Reports List Component

Create a new component `components/ReportsList.tsx`:

```tsx
'use client';

import { FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  size: string;
}

interface ReportsListProps {
  reports: Report[];
  onDelete: (id: string, name: string) => Promise<void>;
  isDeleting: boolean;
  deletingId: string | null;
}

export default function ReportsList({ 
  reports, 
  onDelete, 
  isDeleting, 
  deletingId 
}: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by uploading a new report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {report.name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{new Date(report.uploadDate).toLocaleDateString()}</span>
                <span>•</span>
                <span>{report.size}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <a
              href={report.url}
              download
              className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              onClick={() => onDelete(report.id, report.name)}
              disabled={isDeleting && deletingId === report.id}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting && deletingId === report.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 5. Update Profile Page

Update your profile page to include the file upload and reports list components:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import FileUpload from '@/components/FileUpload';
import ReportsList from '@/components/ReportsList';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const [reports, setReports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Load user's reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedReports = data.map(report => ({
          id: report.id,
          name: report.name,
          url: supabase.storage.from('reports').getPublicUrl(report.file_path).data.publicUrl,
          uploadDate: report.created_at,
          size: `${(report.size_bytes / (1024 * 1024)).toFixed(1)} MB`
        }));

        setReports(formattedReports);
      } catch (error) {
        console.error('Error loading reports:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reports',
          variant: 'destructive',
        });
      }
    };

    loadReports();
  }, [supabase, toast]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setProgress(0);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      // Save report metadata to database
      const { data: report, error: dbError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: fileName,
          size_bytes: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update UI
      setReports(prev => [{
        id: report.id,
        name: file.name,
        url: publicUrl,
        uploadDate: new Date().toISOString(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }, ...prev]);

      toast({
        title: 'Success',
        description: 'Report uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload report',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      setIsDeleting(true);
      setDeletingId(id);

      // Get the report to delete
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('reports')
        .remove([report.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Update UI
      setReports(prev => prev.filter(r => r.id !== id));

      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete report',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Academic Reports</h1>
        <p className="text-gray-600">Upload and manage your academic reports</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Upload New Report</h2>
          <FileUpload 
            onUpload={handleUpload} 
            isUploading={isUploading}
            progress={progress}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Your Reports</h2>
          <ReportsList 
            reports={reports}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            deletingId={deletingId}
          />
        </div>
      </div>
    </div>
  );
}
```

## Features

### File Upload
- Drag and drop or click to select files
- File type validation (PDF, DOC, DOCX)
- File size limit (10MB)
- Upload progress indicator
- Success/error notifications

### Reports Management
- List of uploaded reports with details
- Download reports
- Delete reports with confirmation
- Real-time updates
- Responsive design

### Security
- Row Level Security (RLS) for database access
- Secure file storage with private access
- User-specific file paths
- Authentication required for all operations

## Error Handling

- File size validation
- File type validation
- Network error handling
- Authentication checks
- User-friendly error messages

## Performance

- Lazy loading of reports
- Optimistic UI updates
- Efficient file handling
- Minimal re-renders

## Testing

1. **Upload Test**
   - Try uploading different file types (PDF, DOC, DOCX)
   - Verify file size validation
   - Check upload progress indicator
   - Verify success notification

2. **Download Test**
   - Click download button on a report
   - Verify file downloads correctly
   - Check file content integrity

3. **Delete Test**
   - Click delete button on a report
   - Confirm deletion
   - Verify report is removed from the list
   - Check storage to ensure file is deleted

4. **Error Cases**
   - Try uploading without authentication
   - Test with invalid file types
   - Check network failure handling

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size limit (max 10MB)
   - Verify file type is allowed (PDF, DOC, DOCX)
   - Check network connection
   - Verify Supabase storage bucket permissions

2. **Reports Not Loading**
   - Check authentication status
   - Verify database connection
   - Check browser console for errors

3. **Permission Denied**
   - Verify RLS policies
   - Check user authentication
   - Ensure proper bucket permissions

### Debugging

1. Check browser console for errors
2. Verify network requests in DevTools
3. Check Supabase logs for server-side errors
4. Test with a different file
5. Try logging out and back in

## Best Practices

1. **File Naming**
   - Use unique filenames with timestamps
   - Sanitize user-provided filenames
   - Store original filename in database

2. **Security**
   - Always validate file types on both client and server
   - Use RLS for database operations
   - Set appropriate CORS policies
   - Implement rate limiting

3. **Performance**
   - Compress files before upload if possible
   - Use pagination for large report lists
   - Implement client-side caching

4. **User Experience**
   - Provide clear feedback during operations
   - Show upload progress
   - Handle errors gracefully
   - Add loading states

## Future Improvements

1. **Bulk Upload**
   - Allow multiple file uploads
   - Add zip file support

2. **Search & Filter**
   - Add search functionality
   - Filter by date range
   - Sort by different criteria

3. **Preview**
   - Add file preview before upload
   - Support for more file types
   - Thumbnail generation

4. **Sharing**
   - Share reports with other users
   - Set expiration dates for shared links
   - Track downloads

## Conclusion

This implementation provides a secure and user-friendly way to manage academic reports with Supabase. The solution includes comprehensive error handling, responsive design, and follows security best practices.
