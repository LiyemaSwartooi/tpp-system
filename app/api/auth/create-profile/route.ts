import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    const {
      userId,
      email,
      firstName,
      lastName,
      role,
    } = await request.json();

    // Verify required fields
    if (!userId || !email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First verify the user exists in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 409 }
      );
    }

    // Create the profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: userData.user.email || email,
        first_name: firstName,
        last_name: lastName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      
      // If profile creation fails, try to delete the auth user
      if (userId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (deleteError) {
          console.error('Error cleaning up auth user:', deleteError);
        }
      }
      
      // Handle duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create profile' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in create-profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
