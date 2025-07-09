import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize the Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('=== PROFILE CREATION REQUEST START ===');
  
  try {
    const requestBody = await request.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { userId, email, firstName, lastName, userType } = requestBody;

    // Log all received values
    console.log('Parsed values:', {
      userId,
      email,
      firstName,
      lastName,
      userType
    });

    // Validate required fields
    if (!userId || !email) {
      const error = 'Missing required fields: userId and email are required';
      console.error('Validation error:', error);
      return new NextResponse(
        JSON.stringify({ error }),
        { status: 400 }
      );
    }

    // Validate first_name and last_name
    if (!firstName?.trim()) {
      const error = 'First name is required';
      console.error('Validation error:', error);
      return new NextResponse(
        JSON.stringify({ error }),
        { status: 400 }
      );
    }

    if (!lastName?.trim()) {
      const error = 'Last name is required';
      console.error('Validation error:', error);
      return new NextResponse(
        JSON.stringify({ error }),
        { status: 400 }
      );
    }

    // Define the user metadata type
    type UserMetadata = {
      first_name?: string;
      last_name?: string;
      user_type?: string;
    };

    // Try to get user data from auth if available
    let userMetadata: UserMetadata = {};
    try {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (user) {
        userMetadata = (user.user_metadata as UserMetadata) || {};
      } else if (authError) {
        console.warn('Could not fetch user from auth:', authError);
      }
    } catch (authError) {
      console.warn('Error fetching user from auth:', authError);
    }
    
    // Use values from auth metadata if available, otherwise use the provided values
    const firstNameToUse = (userMetadata?.first_name ?? firstName ?? '').trim();
    const lastNameToUse = (userMetadata?.last_name ?? lastName ?? '').trim();
    const userTypeToUse = (userMetadata?.user_type ?? userType ?? 'student').trim();

    // Validate required fields
    if (!firstNameToUse || !lastNameToUse) {
      throw new Error('First name and last name are required');
    }

    // Prepare profile data
    const profileData = {
      id: userId,
      email: email.toLowerCase().trim(),
      first_name: firstNameToUse,
      last_name: lastNameToUse,
      role: userTypeToUse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('Using profile data:', profileData);
    
    console.log('Prepared profile data:', JSON.stringify(profileData, null, 2));

    // First, check if the profile already exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking for existing profile:', fetchError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to check for existing profile',
          details: fetchError.message,
          code: fetchError.code
        }),
        { status: 500 }
      );
    }

    let data, error;
    
    if (existingProfile) {
      // Update existing profile
      ({ data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role,
          updated_at: profileData.updated_at
        })
        .eq('id', userId)
        .select()
        .single());
    } else {
      // Insert new profile
      ({ data, error } = await supabaseAdmin
        .from('profiles')
        .insert(profileData)
        .select()
        .single());
    }

    if (error) {
      console.error('Profile operation failed:', {
        error,
        existingProfile: !!existingProfile,
        profileData
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          context: existingProfile ? 'updating' : 'creating'
        }),
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in profile API:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500 }
    );
  }
}
