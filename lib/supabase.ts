import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    }
  }
);

// Create a server-side supabase client using the service role key
// This should only be used in API routes and server components
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : undefined;

// Helper function to get the user session
// Can be used in both client and server components
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Helper function to get the current user
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper for server-side authentication
export const getServerSession = async (accessToken?: string) => {
  if (!accessToken) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error) return null;
  
  return user;
};

// Export database types for better TypeScript support
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];