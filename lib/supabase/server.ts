'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a server-side supabase client using the service role key
// This should only be used in server components and server actions
export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Re-export types for convenience
export type { Database };

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type { Tables, Enums };
