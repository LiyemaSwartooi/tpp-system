'use server';

import { supabase } from '../../lib/supabase';

export async function createProfile(
  userId: string, 
  email: string, 
  firstName: string, 
  lastName: string, 
  userType: 'student' | 'coordinator'
) {
  try {
    // 1. First, verify the user exists in auth.users
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error('User not found in auth.users:', userError);
      throw new Error('User authentication failed. Please try again.');
    }

    // 2. Use upsert to handle both insert and update
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error in profile operation:', error);
      
      // Handle specific error cases
      if (error.code === '23505') { // Unique violation
        throw new Error('A profile with this email already exists');
      }
      
      if (error.code === '23503') { // Foreign key violation
        throw new Error('User authentication failed. Please try signing up again.');
      }
      
      throw new Error(error.message || 'Failed to create/update profile');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in createProfile:', error);
    
    // Handle specific error cases
    if (error.message.includes('User not found') || 
        error.message.includes('foreign key constraint')) {
      throw new Error('Authentication failed. Please try signing up again.');
    }
    
    throw new Error(error.message || 'Failed to create user profile');
  }
}

