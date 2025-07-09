"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2, Download, X, User, Mail, Home, Star, Globe, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Ban, FolderOpen, Trash2, Edit3, PartyPopper } from "lucide-react"
import { MobileIconButton } from '@/components/ui/mobile-icon-button'
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

// Add global styles for toast animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-fade-in-down {
      animation: fadeInDown 0.3s ease-out forwards;
    }
    .animate-progress {
      animation: progress 5s linear forwards;
    }
  `
  document.head.appendChild(style)
}

interface Report {
  id: string
  name: string
  url: string
  uploadDate: string
  size: string
}

// Add type for database profile
type DatabaseProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  second_name: string | null;
  gender: string | null;
  population_group: string | null;
  high_school_situation: string | null;
  facilities: string[] | null;
  id_certificate: string | null;
  learner_cell_phone: string | null;
  learner_landline: string | null;
  parent_guardian_name: string | null;
  parent_guardian_contact: string | null;
  parent_guardian_landline: string | null;
  who_do_you_live_with: string[] | null;
  household_members: number | null;
  family_members_occupation: string | null;
  original_essay: string | null;
  main_language: string[] | null;
  religious_affiliation: string | null;
  positive_impact: string | null;
  plans_after_school: string | null;
  career_interest: string | null;
  personality_statements: string | null;
  successful_community_member: string | null;
  tips_for_friend: string | null;
  kimberley_challenges: string | null;
  school: string | null;
  grade: string | null;
  role: 'student' | 'coordinator' | 'admin';
  student_number: string | null;
  created_at: string;
  updated_at: string;
  profile_status: string;
  reports: Array<{
    id: string;
    name: string;
    size: string;
    uploadDate: string;
    url: string;
    storage_path: string;
  }> | null;
  reports_count: number | null;
  last_report_upload: string | null;
};

export function ProfileForm() {
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [hasProfile, setHasProfile] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [profile, setProfile] = useState<DatabaseProfile>({
    id: "",
    email: "",
    first_name: null,
    last_name: null,
    second_name: null,
    gender: null,
    population_group: null,
    high_school_situation: null,
    facilities: [],
    id_certificate: null,
    learner_cell_phone: null,
    learner_landline: null,
    parent_guardian_name: null,
    parent_guardian_contact: null,
    parent_guardian_landline: null,
    who_do_you_live_with: [],
    household_members: null,
    family_members_occupation: null,
    original_essay: null,
    main_language: [],
    religious_affiliation: null,
    positive_impact: null,
    plans_after_school: null,
    career_interest: null,
    personality_statements: null,
    successful_community_member: null,
    tips_for_friend: null,
    kimberley_challenges: null,
    school: null,
    grade: null,
    role: 'student',
    student_number: null,
    created_at: "",
    updated_at: "",
    profile_status: 'draft',
    reports: [],
    reports_count: 0,
    last_report_upload: null,
  })

  const [openSections, setOpenSections] = useState({
    personal: false,
    contact: false,
    family: false,
    interests: false,
    language: false,
    academicReports: false,
  });
  const toggleSection = (key: keyof typeof openSections) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Load user data and profile on mount
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setIsLoading(true);
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
          router.push('/access-portal');
          return;
        }

        const user = session.user;
        setUserId(user.id);
        
        // Get user metadata from auth
        const userMetadata = user.user_metadata || {};
        const userEmail = user.email || userMetadata.email || '';
        
        // Get profile from database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single() as { data: DatabaseProfile | null, error: any };
          
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        // Set profile state with user data and any existing profile data
        setProfile(prev => ({
          ...prev,
          id: user.id,
          // Personal Details
          first_name: profileData?.first_name || userMetadata.first_name || userMetadata.name?.split(' ')[0] || '',
          last_name: profileData?.last_name || userMetadata.last_name || userMetadata.name?.split(' ').slice(1).join(' ') || '',
          email: userEmail,
          // Contact Details
          learner_cell_phone: profileData?.learner_cell_phone || userMetadata.phone || '',
          // Map other fields from profileData if they exist
          ...(profileData ? {
            second_name: profileData.second_name || '',
            gender: profileData.gender || '',
            population_group: profileData.population_group || '',
            high_school_situation: profileData.high_school_situation || '',
            facilities: Array.isArray(profileData.facilities) ? profileData.facilities : [],
            id_certificate: profileData.id_certificate || '',
            learner_landline: profileData.learner_landline || '',
            parent_guardian_name: profileData.parent_guardian_name || '',
            parent_guardian_contact: profileData.parent_guardian_contact || '',
            parent_guardian_landline: profileData.parent_guardian_landline || '',
            who_do_you_live_with: Array.isArray(profileData.who_do_you_live_with) ? profileData.who_do_you_live_with : [],
            household_members: profileData.household_members || 0,
            family_members_occupation: profileData.family_members_occupation || '',
            original_essay: profileData.original_essay || '',
            main_language: Array.isArray(profileData.main_language) ? profileData.main_language : [],
            religious_affiliation: profileData.religious_affiliation || '',
            positive_impact: profileData.positive_impact || '',
            plans_after_school: profileData.plans_after_school || '',
            career_interest: profileData.career_interest || '',
            personality_statements: profileData.personality_statements || '',
            successful_community_member: profileData.successful_community_member || '',
            tips_for_friend: profileData.tips_for_friend || '',
            kimberley_challenges: profileData.kimberley_challenges || '',
            school: profileData.school || '',
            grade: profileData.grade || '',
            role: profileData.role || 'student',
            student_number: profileData.student_number || '',
            created_at: profileData.created_at || new Date().toISOString(),
            updated_at: profileData.updated_at || new Date().toISOString(),
            profile_status: profileData.profile_status || 'draft',
            reports: profileData.reports || [],
            reports_count: profileData.reports_count || 0,
            last_report_upload: profileData.last_report_upload || null,
          } : {})
        }));

        // Set reports state for display
        if (profileData?.reports) {
          setReports(profileData.reports);
        }

        setHasProfile(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error("Failed to load profile data. Please try again.")
      } finally {
      setIsLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [supabase, router]);

  // Section field lists
  const sectionFields = {
    personal: [
      'last_name', 'first_name', 'gender', 'population_group', 'grade', 'school',
      'high_school_situation', 'facilities'
    ],
    contact: [
      'id_certificate', 'learner_cell_phone', 'parent_guardian_name', 'parent_guardian_contact',
      'parent_guardian_landline', 'learner_landline', 'email'
    ],
    family: [
      'who_do_you_live_with', 'household_members', 'family_members_occupation'
    ],
    interests: [
      'positive_impact', 'plans_after_school', 'career_interest', 'personality_statements',
      'successful_community_member', 'tips_for_friend', 'kimberley_challenges', 'original_essay'
    ],
    language: [
      'main_language', 'religious_affiliation'
    ]
  };

  const isSectionComplete = (section: keyof typeof sectionFields) =>
    sectionFields[section].every(field => profile[field as keyof DatabaseProfile] && (typeof profile[field as keyof DatabaseProfile] !== 'string' || (profile[field as keyof DatabaseProfile] as string).trim() !== ''));

  const getFieldError = (field: keyof DatabaseProfile) => {
    if (!submitAttempted) return false;
    
    const value = profile[field];
    
    switch (field) {
      case 'id_certificate':
        const idResult = validateSouthAfricanID(value as string);
        return idResult !== true;
      case 'learner_cell_phone':
      case 'learner_landline':
      case 'parent_guardian_contact':
      case 'parent_guardian_landline':
        return value && !validatePhoneNumber(value as string);
      case 'email':
        return !value || !validateEmail(value as string);
      case 'grade':
        return !value || !validateGrade(value as string);
      case 'household_members':
        return !value || !validateHouseholdMembers(value as number);
      case 'original_essay':
        return !value || !validateEssay(value as string);
      default:
        return !value || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'string' && value.trim() === '');
    }
  };

  const getFieldHelperText = (field: keyof DatabaseProfile) => {
    switch (field) {
      case 'id_certificate':
        const idHelperResult = validateSouthAfricanID(profile.id_certificate as string);
        return idHelperResult !== true ? idHelperResult : 'Enter a valid 13-digit South African ID number';
      case 'learner_cell_phone':
      case 'parent_guardian_contact':
        return 'Enter a valid South African phone number (e.g., +27 82 123 4567)';
      case 'email':
        return 'Enter a valid email address';
      case 'grade':
        return 'Enter a grade between 8 and 12';
      case 'household_members':
        return 'Enter a number between 1 and 20';
      case 'original_essay':
        return '';
      default:
        return '';
    }
  };

  // Validation function for phone numbers
  const isValidPhoneNumber = (phone: string): boolean => {
    // South African phone number regex (10 digits, may start with 0 or +27)
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/
    return phoneRegex.test(phone)
  }

  // Validation function for date of birth
  const isValidDateOfBirth = (dateString: string): boolean => {
    if (!dateString) return true // Optional field
    const date = new Date(dateString)
    const today = new Date()
    return date <= today
  }

  const saveProfileToDB = async (profileObj: DatabaseProfile, userId: string) => {
    try {
      // Map form fields to database columns
      const profileData = {
        id: userId,
        email: profileObj.email,
        first_name: profileObj.first_name,
        last_name: profileObj.last_name,
        second_name: profileObj.second_name,
        gender: profileObj.gender,
        population_group: profileObj.population_group,
        high_school_situation: profileObj.high_school_situation,
        facilities: profileObj.facilities || [],
        id_certificate: profileObj.id_certificate,
        learner_cell_phone: profileObj.learner_cell_phone,
        learner_landline: profileObj.learner_landline,
        parent_guardian_name: profileObj.parent_guardian_name,
        parent_guardian_contact: profileObj.parent_guardian_contact,
        parent_guardian_landline: profileObj.parent_guardian_landline,
        who_do_you_live_with: profileObj.who_do_you_live_with || [],
        household_members: profileObj.household_members || 0,
        family_members_occupation: profileObj.family_members_occupation,
        original_essay: profileObj.original_essay,
        main_language: profileObj.main_language || [],
        religious_affiliation: profileObj.religious_affiliation,
        positive_impact: profileObj.positive_impact,
        plans_after_school: profileObj.plans_after_school,
        career_interest: profileObj.career_interest,
        personality_statements: profileObj.personality_statements,
        successful_community_member: profileObj.successful_community_member,
        tips_for_friend: profileObj.tips_for_friend,
        kimberley_challenges: profileObj.kimberley_challenges,
        school: profileObj.school,
        grade: profileObj.grade,
        role: profileObj.role || 'student',
        profile_status: profileObj.profile_status || 'draft',
        updated_at: new Date().toISOString()
      };

      console.log('Saving profile data:', JSON.stringify(profileData, null, 2));

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save profile');
      }

      if (!data) {
        throw new Error('No data returned after saving profile');
      }

      return data;
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to save profile: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while saving the profile');
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('User not authenticated. Please log in again.', {
        position: 'top-right',
        duration: 5000,
        icon: <XCircle className="h-4 w-4" />,
      })
      return;
    }

    try {
    setIsLoading(true);
      
      toast.info('Saving draft...', {
        position: 'top-right',
        duration: 2000,
      })
      
      // Save as draft
      await saveProfileToDB({
        ...profile,
        profile_status: 'draft',
        updated_at: new Date().toISOString()
      }, userId);
      
      toast.success('Draft Saved: Your profile has been saved as a draft. You can continue editing later.', {
        position: 'top-right',
        duration: 2000,
      })

      // Show loading message and refresh the page to show updated data
      setTimeout(() => {
        toast.info('Refreshing to show updated data...', {
          position: 'top-right',
          duration: 1000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(`${error instanceof Error ? error.message : 'Failed to save draft. Please try again.'}`, {
        position: 'top-right',
        duration: 6000,
        icon: <XCircle className="h-4 w-4" />,
      })
    } finally {
    setIsLoading(false);
    }
  };

  // Add validation functions
  const validateSouthAfricanID = (id: string): true | string => {
    // Remove any spaces or special characters
    const cleanId = id.replace(/[^0-9]/g, '');
    console.log('Validating ID:', id);
    console.log('Cleaned ID:', cleanId);
    
    // Check if it's 13 digits
    if (cleanId.length !== 13) {
      console.log('Validation failed: Length check');
      return 'ID number must be exactly 13 digits.';
    }
    
    // Removed date, gender, citizenship, and Luhn algorithm checks as per user request.
    // Only length validation remains.

    console.log('Validation successful: Only length checked!');
    return true;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // South African phone number format: +27 or 0 followed by 9 digits
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    return /^(\+27|0)[6-8][0-9]{8}$/.test(cleanPhone);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateGrade = (grade: string): boolean => {
    // South African grades 8-12
    return /^([8-9]|1[0-2])$/.test(grade);
  };

  const validateHouseholdMembers = (count: number): boolean => {
    return count > 0 && count <= 20; // Reasonable range for household members
  };

  const validateEssay = (essay: string): boolean => {
    if (!essay || essay.trim() === '') return false;
    const wordCount = countWords(essay);
    return wordCount >= 300 && wordCount <= 500;
  };

  // Function to count words in a string
  const countWords = (text: string): number => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Function to count characters (excluding spaces for more accurate count)
  const countCharacters = (text: string): number => {
    if (!text) return 0;
    return text.length;
  };

  // Function to count characters without spaces
  const countCharactersNoSpaces = (text: string): number => {
    if (!text) return 0;
    return text.replace(/\s/g, '').length;
  };

  // Component for displaying word and character count
  const TextCounter = ({ text, showWordCount = true, showCharCount = true, wordLimit }: { 
    text: string; 
    showWordCount?: boolean; 
    showCharCount?: boolean; 
    wordLimit?: { min?: number; max?: number }; 
  }) => {
    const words = countWords(text);
    const chars = countCharacters(text);
    const charsNoSpaces = countCharactersNoSpaces(text);
    
    const getWordCountColor = () => {
      if (!wordLimit) return 'text-gray-500';
      if (wordLimit.min && words < wordLimit.min) return 'text-red-500';
      if (wordLimit.max && words > wordLimit.max) return 'text-red-500';
      return 'text-green-600';
    };

    return (
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        {showCharCount && (
          <span className="text-gray-500">
            Characters: <span className="font-medium">{chars}</span> 
            <span className="text-gray-400 ml-1">({charsNoSpaces} without spaces)</span>
          </span>
        )}
        {showWordCount && (
          <span className={getWordCountColor()}>
            Words: <span className="font-medium">{words}</span>
            {wordLimit && (
              <span className="ml-1">
                / {wordLimit.min}-{wordLimit.max} words
              </span>
            )}
          </span>
        )}
      </div>
    );
  };

  // Update handleSubmit to include new validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (!userId) {
      toast.error('User not authenticated. Please log in again.');
        return;
      }

    try {
      // Validate ID/Birth Certificate
      const idValidationResult = validateSouthAfricanID(profile.id_certificate || '');
      if (idValidationResult !== true) {
        toast.error(`Invalid ID Number: ${idValidationResult}`, {
          position: 'top-right',
          duration: 5000,
          icon: <XCircle className="h-4 w-4" />,
        });
        return;
      }

      // Validate phone numbers
      if (!profile.learner_cell_phone || !validatePhoneNumber(profile.learner_cell_phone)) {
        toast.error('Please enter a valid South African cell phone number');
        return;
      }

      if (profile.learner_landline && !validatePhoneNumber(profile.learner_landline)) {
        toast.error('Please enter a valid landline number');
        return;
      }

      if (!profile.parent_guardian_contact || !validatePhoneNumber(profile.parent_guardian_contact)) {
        toast.error('Please enter a valid parent/guardian contact number');
        return;
      }

      if (profile.parent_guardian_landline && !validatePhoneNumber(profile.parent_guardian_landline)) {
        toast.error('Please enter a valid parent/guardian landline number');
        return;
      }

      // Validate email
      if (!profile.email || !validateEmail(profile.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Validate grade
      if (!profile.grade || !validateGrade(profile.grade)) {
        toast.error('Please enter a valid grade (8-12)');
        return;
      }

      // Validate household members
      if (!profile.household_members || !validateHouseholdMembers(profile.household_members)) {
        toast.error('Please enter a valid number of household members (1-20)');
        return;
      }

      // Validate essay
      if (!profile.original_essay || !validateEssay(profile.original_essay)) {
        toast.error('Essay must be between 300 and 500 words');
        return;
      }

      // Validate required fields
      const requiredFields: (keyof DatabaseProfile)[] = [
        'last_name', 'first_name', 'gender', 'population_group', 'grade', 'school',
        'high_school_situation', 'facilities', 'id_certificate', 'learner_cell_phone',
        'parent_guardian_name', 'parent_guardian_contact', 'household_members',
        'who_do_you_live_with', 'family_members_occupation', 'positive_impact',
        'plans_after_school', 'career_interest', 'personality_statements',
        'successful_community_member', 'tips_for_friend', 'kimberley_challenges',
        'original_essay', 'main_language', 'religious_affiliation', 'email',
        'school', // Ensure school is required
        'grade', // Ensure grade is required
        'gender', // Ensure gender is required
        'population_group', // Ensure population group is required
        'high_school_situation', // Ensure high school situation is required
        'religious_affiliation', // Ensure religious affiliation is required
        'family_members_occupation', // Ensure this text area is required
        // 'date_of_birth', // Date of birth is currently optional in schema, can add if needed
        // 'hobbies', // Optional
        // 'bio', // Optional
        // 'address', // Optional
        // 'student_number', // Optional
        // 'profile_status' // Handled internally
      ];

      const missingFields = requiredFields.filter(field => {
        const value = profile[field];
        // Check for null, undefined, empty string, or empty array for multi-selects
        return value === null || 
               value === undefined || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0);
      });

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(field => 
          field.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        );
        
        toast.error(`Please fill in all required fields: ${fieldNames.slice(0, 3).join(', ')}${fieldNames.length > 3 ? ` and ${fieldNames.length - 3} more...` : ''}`, {
          position: 'top-right',
          duration: 8000,
          icon: <Edit3 className="h-4 w-4" />,
        });
        return;
      }

      // Specific checks for multi-select fields (already covered by generic check, but good for clarity/redundancy)
      // if (!profile.facilities || profile.facilities.length === 0) {
      //   toast.error('Please select at least one facility at your high school.');
      //   return;
      // }
      
      // if (!profile.who_do_you_live_with || profile.who_do_you_live_with.length === 0) {
      //   toast.error('Please select who you live with.');
      //   return;
      // }
      
      // if (!profile.main_language || profile.main_language.length === 0) {
      //   toast.error('Please select at least one main language.');
      //   return;
      // }

    setIsLoading(true);
      
      // Save as submitted
      await saveProfileToDB({
        ...profile,
        profile_status: 'submitted',
        updated_at: new Date().toISOString()
      }, userId);
      
      toast.success('Profile Submitted: Your profile has been submitted successfully!', {
        position: 'top-right',
        duration: 3000,
        icon: <PartyPopper className="h-4 w-4" />,
      });

      // Show loading message and refresh the page to show updated data
      setTimeout(() => {
        toast.info('Refreshing to show updated data...', {
          position: 'top-right',
          duration: 1500,
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast.error(`${error instanceof Error ? error.message : 'Failed to submit profile. Please try again.'}`, {
        position: 'top-right',
        duration: 6000,
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
    setIsLoading(false);
    }
  };

  // Function to check if input contains only letters, spaces, and basic punctuation
  const isValidTextInput = (text: string): boolean => {
    // Allow letters, spaces, punctuation, and line breaks - no numbers
    const validPattern = /^[a-zA-Z\s.,!?;:()'"\-\n\r]*$/;
    return validPattern.test(text);
  };

  // Function to create friendly field names for error messages
  const getFriendlyFieldName = (fieldName: string): string => {
    const fieldNames: { [key: string]: string } = {
      // Personal Details
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'second_name': 'Second Name',
      // Contact Details
      'parent_guardian_name': 'Parent/Guardian Name',
      'parent_guardian_contact': 'Parent/Guardian Cell Phone',
      'parent_guardian_landline': 'Parent/Guardian Landline',
      'email': 'Email Address',
      // Family & Community
      'family_members_occupation': 'Family Members\' Occupation',
      // Interests & Future Plans
      'positive_impact': 'Person with Positive Impact',
      'plans_after_school': 'Plans After School',
      'career_interest': 'Career Interest',
      'personality_statements': 'Personality Statements',
      'successful_community_member': 'Successful Community Member',
      'tips_for_friend': 'Tips for Friend',
      'kimberley_challenges': 'Kimberley Challenges',
      'original_essay': 'Original Essay'
    };
    return fieldNames[fieldName] || fieldName.replace(/_/g, ' ');
  };

  // Text-only fields that should not contain numbers
  const textOnlyFields = [
    // Personal Details
    'first_name',
    'last_name', 
    'second_name',
    // Contact Details
    'parent_guardian_name',
    // Family and Community
    'family_members_occupation',
    // Interests and Future Plans
    'positive_impact', 
    'plans_after_school',
    'career_interest',
    'personality_statements',
    'successful_community_member',
    'tips_for_friend',
    'kimberley_challenges',
    'original_essay'
  ];

  // Number-only fields that should not contain letters
  const numberOnlyFields = [
    'id_certificate',
    'learner_cell_phone',
    'learner_landline', 
    'parent_guardian_contact',
    'parent_guardian_landline'
  ];

    // Restore handleChange for all input fields with validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Check if this is a text-only field and validate input
    if (textOnlyFields.includes(name) && value && type !== 'checkbox') {
      if (!isValidTextInput(value)) {
        toast.error(`Invalid input in "${getFriendlyFieldName(name)}". Please use only letters and punctuation - no numbers allowed.`, {
          duration: 4000,
        });
        return; // Don't update the field if invalid
      }
    }

    // Check if this is a number-only field and validate input
    if (numberOnlyFields.includes(name) && value && type !== 'checkbox') {
      // For ID field, validate South African ID format
      if (name === 'id_certificate') {
        const cleanValue = value.replace(/\s/g, ''); // Remove spaces
        if (!/^\d+$/.test(cleanValue)) {
          toast.error(`ID/Birth Certificate must contain only numbers (no letters or special characters)`, {
            duration: 4000,
          });
          return;
        }
        if (cleanValue.length > 13) {
          toast.error(`ID number cannot be longer than 13 digits`, {
            duration: 4000,
          });
          return;
        }
      }
      
      // For phone fields, validate phone format
      if (name.includes('phone') || name.includes('cell') || name.includes('landline')) {
        if (!/^[+]?[0-9\s\-()]+$/.test(value)) {
          toast.error(`${getFriendlyFieldName(name)} must contain only numbers, spaces, dashes, and + symbol`, {
            duration: 4000,
          });
          return;
        }
      }
    }
    
    setProfile((prev) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  // Handle input field validation on keydown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { name } = target;
    
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Tab', 'Enter', 'Escape', 'Space'
    ];
    
    // If this is a text-only field, prevent number keys
    if (textOnlyFields.includes(name)) {
      if ((e.key >= '0' && e.key <= '9') && !allowedKeys.includes(e.key)) {
        e.preventDefault();
        toast.error(`Numbers are not allowed in "${getFriendlyFieldName(name)}"`, {
          duration: 2000,
        });
      }
    }
    
    // If this is a number-only field, prevent letter keys
    if (numberOnlyFields.includes(name)) {
      const isLetter = /^[a-zA-Z]$/.test(e.key);
      const isSpecialChar = /^[!@#$%^&*()_+=\[\]{};':"\\|,.<>?~`]$/.test(e.key);
      
      // For ID field, only allow numbers
      if (name === 'id_certificate') {
        if ((isLetter || isSpecialChar) && !allowedKeys.includes(e.key)) {
          e.preventDefault();
          toast.error(`ID/Birth Certificate can only contain numbers`, {
            duration: 2000,
          });
        }
      }
      
      // For phone fields, allow numbers, +, -, (), and spaces
      if (name.includes('phone') || name.includes('cell') || name.includes('landline')) {
        const allowedPhoneChars = ['+', '-', '(', ')', ' '];
        if (isLetter && !allowedKeys.includes(e.key)) {
          e.preventDefault();
          toast.error(`${getFriendlyFieldName(name)} cannot contain letters`, {
            duration: 2000,
          });
        }
      }
    }
  };

  // Handle textarea input validation on keydown to prevent number entry
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { name } = target;
    
    // If this is a text-only field, prevent number keys
    if (textOnlyFields.includes(name)) {
      // Allow all non-number keys, backspace, delete, arrows, etc.
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'Tab', 'Enter', 'Escape', 'Space'
      ];
      
      // Check if it's a number key (0-9)
      if ((e.key >= '0' && e.key <= '9') && !allowedKeys.includes(e.key)) {
        e.preventDefault();
        toast.error(`Numbers are not allowed in "${getFriendlyFieldName(name)}"`, {
          duration: 2000,
        });
      }
    }
  };

  // Restore handleFileChange for file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, and DOCX are allowed.');
        e.target.value = ''; // Clear the input
        setSelectedFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 10MB. Please upload a smaller file.');
        e.target.value = ''; // Clear the input
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  // Simulate file upload (frontend only)
  const handleFileUpload = async () => {
    if (!selectedFile || !userId) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      console.log('Attempting to upload file to bucket:', 'reports');
      console.log('File path:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Create report object
      const newReport = {
        id: `${Date.now()}`,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString(),
        url: publicUrl,
        storage_path: fileName
      };

      // Update profile with new report
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          reports: [...(profile.reports || []), newReport],
          reports_count: (profile.reports_count || 0) + 1,
          last_report_upload: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update local state
      setReports([...reports, newReport]);
      setProfile(prev => ({
        ...prev,
        reports: profileData.reports,
        reports_count: profileData.reports_count,
        last_report_upload: profileData.last_report_upload
      }));

      toast.success('Report uploaded successfully! Your academic report is now saved.', {
        duration: 4000,
        icon: <FolderOpen className="h-4 w-4" />,
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload report');
    } finally {
      setSelectedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleDeleteReport = async (reportId: string, reportName: string) => {
    if (!userId) return;
    
    try {
      setIsDeleting(true);
      
      // Find the report in the profile data
      const report = profile.reports?.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      console.log('Attempting to delete file from bucket:', 'reports');
      console.log('File path:', report.storage_path);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('reports')
        .remove([report.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw storageError;
      }

      console.log('File deleted successfully from storage');

      // Update profile
      const updatedReports = profile.reports?.filter(r => r.id !== reportId) || [];
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          reports: updatedReports,
          reports_count: updatedReports.length,
          last_report_upload: updatedReports.length > 0 ? updatedReports[updatedReports.length - 1].uploadDate : null
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update local state
    setReports(reports.filter(r => r.id !== reportId));
      setProfile(prev => ({
        ...prev,
        reports: profileData.reports,
        reports_count: profileData.reports_count,
        last_report_upload: profileData.last_report_upload
      }));

      toast.success('Report deleted successfully! The report has been removed from your account.', {
        duration: 4000,
        icon: <Trash2 className="h-4 w-4" />,
      });
      
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  // Update the checkbox handlers
  const handleCheckboxChange = (field: keyof DatabaseProfile, value: string) => {
    setProfile(prev => {
      const currentValues = Array.isArray(prev[field]) ? prev[field] as string[] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  // Update the facilities checkbox handler
  const handleFacilitiesChange = (value: string) => {
    setProfile(prev => {
      const currentValues = Array.isArray(prev.facilities) ? prev.facilities : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, facilities: newValues };
    });
  };

  return (
    <>
      <Card className="border border-gray-200 shadow-sm rounded-2xl bg-gray-50 profile-form-container">
        <div className="flex items-center px-6 pt-6 pb-2">
          <div className="bg-red-100 p-2 rounded-lg mr-3">
            <User className="h-6 w-6 text-red-500" />
          </div>
        <div>
            <CardTitle className="text-lg font-bold text-gray-800">Profile Information</CardTitle>
            <CardDescription className="text-gray-500 text-sm">Update your personal information and preferences.</CardDescription>
          </div>
        </div>
        <hr className="border-gray-200 mx-6" />
        <CardContent className="pt-6 px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8" style={{ minHeight: 'auto' }}>
            {/* SECTION A: Personal Details */}
            <div className="border rounded mb-2 bg-gray-50">
              <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-red-100 hover:bg-red-200 text-left rounded-t" onClick={() => toggleSection('personal')}>
                <span className="flex items-center gap-2 text-xl font-bold text-red-700">
                  <User className="h-5 w-5" /> A. Personal Details
                </span>
                <span>{openSections.personal ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
              </button>
              {openSections.personal && (
                <section className="p-4 pt-0 bg-white rounded-b">
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Surname <span className="text-red-500">*</span></Label>
                      <Input id="last_name" name="last_name" value={profile.last_name || ''} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                      <Input id="first_name" name="first_name" value={profile.first_name || ''} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                      <Label htmlFor="second_name">Second Name</Label>
                      <Input id="second_name" name="second_name" value={profile.second_name || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex flex-col gap-2 mb-4">
                        <label className="flex items-center gap-1">
                          <input type="radio" name="gender" value="Male" checked={profile.gender === 'Male'} onChange={handleChange} /> Male
                        </label>
                        <label className="flex items-center gap-1">
                          <input type="radio" name="gender" value="Female" checked={profile.gender === 'Female'} onChange={handleChange} /> Female
                        </label>
                      </div>
                    </div>
            </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                      <Label>Population Group</Label>
                      <div className="flex flex-col gap-2 mb-4">
                        {['African','White','Coloured','Indian','Chinese','Other'].map(opt => (
                          <label key={opt} className="flex items-center gap-1">
                            <input type="radio" name="population_group" value={opt} checked={profile.population_group === opt} onChange={handleChange} /> {opt}
                          </label>
                        ))}
                      </div>
            </div>
            <div className="space-y-2">
                      <Label htmlFor="grade">Current Grade</Label>
                      <select id="grade" name="grade" value={profile.grade || ''} onChange={handleChange} required className="w-full border rounded px-2 py-1">
                        <option value="">Select grade</option>
                        {[10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4">
                    <Label htmlFor="school">High School</Label>
                    <select id="school" name="school" value={profile.school || ''} onChange={handleChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select your school</option>
                      <option value="Baitiredi Technical High School">Baitiredi Technical High School</option>
                      <option value="Bankhara Bodulong High School">Bankhara Bodulong High School</option>
                      <option value="Galaletsang High School">Galaletsang High School</option>
                      <option value="KP Toto Technical and Commercial High School">KP Toto Technical and Commercial High School</option>
                      <option value="Olebogeng High School">Olebogeng High School</option>
                      <option value="Lebang Secondary School">Lebang Secondary School</option>
                      <option value="Postmasburg High School">Postmasburg High School</option>
                      <option value="Blinkklip High School">Blinkklip High School</option>
                      <option value="Ratang Thuto High School">Ratang Thuto High School</option>
                      <option value="SA Van Wyk High School">SA Van Wyk High School</option>
                      <option value="AlexanderBaai High School">AlexanderBaai High School</option>
              </select>
            </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4">
                    <Label>Where is your high school situated?</Label>
                    <div className="flex flex-col gap-2 mb-4">
                      {['Suburb','Township','Rural','Other','Unknown'].map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input type="radio" name="high_school_situation" value={opt} checked={profile.high_school_situation === opt} onChange={handleChange} /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4">
                    <Label>Facilities at your high school</Label>
                    <div className="flex flex-col gap-2 mb-4">
                      {['Computer','Electricity','Science laboratory','Library','Playing and/or sport field'].map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            name="facilities"
                            value={opt}
                            checked={Array.isArray(profile.facilities) && profile.facilities.includes(opt)}
                            onChange={() => handleFacilitiesChange(opt)}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* SECTION B: Contact Details */}
            <div className="border rounded mb-2 bg-gray-50">
              <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-blue-100 hover:bg-blue-200 text-left rounded-t" onClick={() => toggleSection('contact')}>
                <span className="flex items-center gap-2 text-xl font-bold text-blue-700">
                  <Mail className="h-5 w-5" /> B. Contact Details
                </span>
                <span>{openSections.contact ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
              </button>
              {openSections.contact && (
                <section className="p-4 pt-0 bg-white rounded-b">
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="id_certificate">ID/Birth Certificate Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="id_certificate"
                        name="id_certificate"
                        value={profile.id_certificate || ''}
                        onChange={handleChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Enter your 13-digit South African ID number"
                        className={getFieldError('id_certificate') ? "border-red-500" : ""}
                      />
                      {getFieldError('id_certificate') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('id_certificate')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="learner_cell_phone">Cell Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="learner_cell_phone"
                        name="learner_cell_phone"
                        value={profile.learner_cell_phone || ''}
                        onChange={handleChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="+27 82 123 4567"
                        className={getFieldError('learner_cell_phone') ? "border-red-500" : ""}
                      />
                      {getFieldError('learner_cell_phone') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('learner_cell_phone')}</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="learner_landline">Landline Number (Optional)</Label>
                      <Input
                        id="learner_landline"
                        name="learner_landline"
                        value={profile.learner_landline || ''}
                        onChange={handleChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="+27 21 123 4567"
                        className={getFieldError('learner_landline') ? "border-red-500" : ""}
                      />
                      {getFieldError('learner_landline') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('learner_landline')}</p>
                      )}
                    </div>
            <div className="space-y-2">
              <Label htmlFor="parent_guardian_name">Parent/Guardian Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="parent_guardian_name" 
                        name="parent_guardian_name" 
                        value={profile.parent_guardian_name || ''} 
                        onChange={handleChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Enter parent/guardian full name"
                        className={getFieldError('parent_guardian_name') ? "border-red-500" : ""}
                      />
                      {getFieldError('parent_guardian_name') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('parent_guardian_name')}</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_guardian_contact">Parent/Guardian Cell Phone Number <span className="text-red-500">*</span></Label>
                      <Input 
                        id="parent_guardian_contact" 
                        name="parent_guardian_contact" 
                        value={profile.parent_guardian_contact || ''} 
                        onChange={handleChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="+27 82 123 4567"
                        className={getFieldError('parent_guardian_contact') ? "border-red-500" : ""}
                      />
                      {getFieldError('parent_guardian_contact') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('parent_guardian_contact')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_guardian_landline">Parent/Guardian Landline Number</Label>
                      <Input 
                        id="parent_guardian_landline" 
                        name="parent_guardian_landline" 
                        value={profile.parent_guardian_landline || ''} 
                        onChange={handleChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="+27 21 123 4567"
                        className={getFieldError('parent_guardian_landline') ? "border-red-500" : ""}
                      />
                      {getFieldError('parent_guardian_landline') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('parent_guardian_landline')}</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4">
                    <Label htmlFor="email">Learner Email Address <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profile.email || ''} 
                      onChange={handleChange} 
                      placeholder="your.email@example.com"
                      className={getFieldError('email') ? "border-red-500" : ""} 
                      required 
                    />
                    {getFieldError('email') && (
                      <p className="text-sm text-red-500">{getFieldHelperText('email')}</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* SECTION C: Family and Community */}
            <div className="border rounded mb-2 bg-gray-50">
              <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-green-100 hover:bg-green-200 text-left rounded-t" onClick={() => toggleSection('family')}>
                <span className="flex items-center gap-2 text-xl font-bold text-green-700">
                  <Home className="h-5 w-5" /> C. Family and Community
                </span>
                <span>{openSections.family ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
              </button>
              {openSections.family && (
                <section className="p-4 pt-0 bg-white rounded-b">
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Who do you live with?</Label>
                      <div className="flex flex-col gap-2 mb-4">
                        {['Father','Mother','Sister','Brother','Grandmother','Grandfather','Aunt','Uncle','Boarding school','Other'].map(opt => (
                          <label key={opt} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              name="who_do_you_live_with"
                              value={opt}
                              checked={Array.isArray(profile.who_do_you_live_with) && profile.who_do_you_live_with.includes(opt)}
                              onChange={() => handleCheckboxChange('who_do_you_live_with', opt)}
                            /> {opt}
                          </label>
                        ))}
                      </div>
                    </div>
            <div className="space-y-2">
                      <Label htmlFor="household_members">Number of Household Members <span className="text-red-500">*</span></Label>
                      <Input
                        id="household_members"
                        name="household_members"
                        type="number"
                        min="1"
                        max="20"
                        value={profile.household_members || ''}
                        onChange={handleChange}
                        className={getFieldError('household_members') ? "border-red-500" : ""}
                      />
                      {getFieldError('household_members') && (
                        <p className="text-sm text-red-500">{getFieldHelperText('household_members')}</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4">
                    <Label htmlFor="family_members_occupation">Family Members' Occupation and Education <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="family_members_occupation" 
                      name="family_members_occupation" 
                      value={profile.family_members_occupation || ''} 
                      onChange={handleChange} 
                      onKeyDown={handleTextareaKeyDown} 
                      placeholder="Example: A. Father/Guardian | Soldier | University PhD B. Mother/Guardian | Teacher | Diploma C. Sister | Student | Grade 12" 
                      rows={3}
                      className={getFieldError('family_members_occupation') ? "border-red-500" : ""}
                    />
                    <div className="mt-2">
                      <TextCounter text={profile.family_members_occupation || ''} />
                    </div>
                    {getFieldError('family_members_occupation') && (
                      <p className="text-sm text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* SECTION D: Interests and Future Plans */}
            <div className="border rounded mb-2 bg-gray-50">
              <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-left rounded-t" onClick={() => toggleSection('interests')}>
                <span className="flex items-center gap-2 text-xl font-bold text-yellow-700">
                  <Star className="h-5 w-5" /> D. Interests and Future Plans
                </span>
                <span>{openSections.interests ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
              </button>
              {openSections.interests && (
                <section className="p-4 pt-0 bg-white rounded-b">
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="positive_impact">Person who had a positive impact on you <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="positive_impact" 
                        name="positive_impact" 
                        value={profile.positive_impact || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="Describe a person who has had a positive impact on you..." 
                        rows={2}
                        className={getFieldError('positive_impact') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.positive_impact || ''} />
                      {getFieldError('positive_impact') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plans_after_school">Plans after school <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="plans_after_school" 
                        name="plans_after_school" 
                        value={profile.plans_after_school || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="What are your plans after you complete school?" 
                        rows={2}
                        className={getFieldError('plans_after_school') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.plans_after_school || ''} />
                      {getFieldError('plans_after_school') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="career_interest">Career(s) or job(s) interested in and why <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="career_interest" 
                        name="career_interest" 
                        value={profile.career_interest || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="What career(s) or job(s) are you interested in and why?" 
                        rows={2}
                        className={getFieldError('career_interest') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.career_interest || ''} />
                      {getFieldError('career_interest') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="personality_statements">Three statements about your personality/character <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="personality_statements" 
                        name="personality_statements" 
                        value={profile.personality_statements || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="Write three statements that describe your personality or character..." 
                        rows={2}
                        className={getFieldError('personality_statements') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.personality_statements || ''} />
                      {getFieldError('personality_statements') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="successful_community_member">Describe a successful community member and why <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="successful_community_member" 
                        name="successful_community_member" 
                        value={profile.successful_community_member || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="Describe any member of your community who you consider to be successful and why..." 
                        rows={2}
                        className={getFieldError('successful_community_member') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.successful_community_member || ''} />
                      {getFieldError('successful_community_member') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tips_for_friend">Three tips for a friend to succeed in TPP <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="tips_for_friend" 
                        name="tips_for_friend" 
                        value={profile.tips_for_friend || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="List three tips that you would give to a friend to help them succeed in a programme like the TPP..." 
                        rows={2}
                        className={getFieldError('tips_for_friend') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.tips_for_friend || ''} />
                      {getFieldError('tips_for_friend') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kimberley_challenges">Challenges you expect to face in TPP <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="kimberley_challenges" 
                        name="kimberley_challenges" 
                        value={profile.kimberley_challenges || ''} 
                        onChange={handleChange} 
                        onKeyDown={handleTextareaKeyDown} 
                        placeholder="What challenges would you expect to face in the Talent Pipeline Programme?" 
                        rows={2}
                        className={getFieldError('kimberley_challenges') ? "border-red-500" : ""}
                      />
                      <TextCounter text={profile.kimberley_challenges || ''} />
                      {getFieldError('kimberley_challenges') && (
                        <p className="text-sm text-red-500">This field is required</p>
                      )}
                    </div>
            <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="original_essay">
                        1. Write an original essay of 300 - 500 words that discusses BOTH topics below: <span className="text-red-500">*</span>
                      </Label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Describe your community and what influence it has on you.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Why did you apply to this programme and how do you think that being selected to participate in this programme would add value to your life?</span>
                          </li>
                        </ul>
                      </div>
                      <Textarea
                        id="original_essay"
                        name="original_essay"
                        value={profile.original_essay || ''}
                        onChange={handleChange}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder="Write your essay here addressing both topics above..."
                        rows={8}
                        className={getFieldError('original_essay') ? "border-red-500" : ""}
                      />
                      <div className="mt-2">
                        <TextCounter 
                          text={profile.original_essay || ''} 
                          wordLimit={{ min: 300, max: 500 }}
                      />
                      {getFieldError('original_essay') && (
                          <p className="text-sm text-red-500 mt-1">
                            {countWords(profile.original_essay || '') < 300 
                              ? 'Essay must be at least 300 words' 
                              : countWords(profile.original_essay || '') > 500 
                                ? 'Essay cannot exceed 500 words'
                                : 'Essay is required'}
                          </p>
                      )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* SECTION E: Language and Religion */}
            <div className="border rounded mb-2 bg-gray-50">
              <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-purple-100 hover:bg-purple-200 text-left rounded-t" onClick={() => toggleSection('language')}>
                <span className="flex items-center gap-2 text-xl font-bold text-purple-700">
                  <Globe className="h-5 w-5" /> E. Language and Religion
                </span>
                <span>{openSections.language ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
              </button>
              {openSections.language && (
                <section className="p-4 pt-0 bg-white rounded-b">
                  <div className="border rounded-xl bg-gray-50 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Home Language(s)</Label>
                      <div className="flex flex-col gap-2 mb-4">
                        {['English','Afrikaans','isiZulu','isiXhosa','siSwati','isiNdebele','sePedi','Sesotho','Setswana','Shangaan','Tshivenda','Xitsonga','Other'].map(opt => (
                          <label key={opt} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              name="main_language"
                              value={opt}
                              checked={Array.isArray(profile.main_language) && profile.main_language.includes(opt)}
                              onChange={() => handleCheckboxChange('main_language', opt)}
                            /> {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Religious Affiliation</Label>
                      <div className="flex flex-col gap-2 mb-4">
                        {['Christian','Hindu','Jewish','Muslim','Other'].map(opt => (
                          <label key={opt} className="flex items-center gap-1">
                            <input type="radio" name="religious_affiliation" value={opt} checked={profile.religious_affiliation === opt} onChange={handleChange} /> {opt}
                          </label>
                        ))}
            </div>
            </div>
          </div>
                </section>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                className="sm:w-1/3" 
                onClick={(e) => {
                  e.preventDefault();
                  handleSaveDraft(e);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Continue Later'
                )}
              </Button>
              <Button 
                type="button" 
                className="sm:w-2/3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold py-3 rounded-lg shadow"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
          </div>
        </form>
        </CardContent>
      </Card>
      {/* Academic Reports Section */}
      <Card className="overflow-hidden border border-gray-200 shadow-sm rounded-2xl bg-gradient-to-br from-blue-50/50 to-gray-50 mt-8">
        <div className="flex items-center px-6 pt-6 pb-4">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <FileText className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Academic Reports</CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">Upload and manage your academic reports securely.</CardDescription>
      </div>
        </div>
        <div className="border-b border-gray-200 mx-6"></div>
        <CardContent className="pt-6 px-6 pb-8">
        {/* File Upload Section */}
          <div className="bg-white p-3 sm:p-5 lg:p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="space-y-4 sm:space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload New Report</h3>
                <p className="text-sm text-gray-600 mb-4">Supported formats: PDF, DOC, DOCX (Maximum size: 10MB)</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <label className="flex-1">
                    <div className="flex flex-col items-center justify-center w-full p-4 md:px-6 md:py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
                      <Upload className="h-8 w-8 md:h-10 md:w-10 text-gray-400 group-hover:text-blue-500 mb-2 md:mb-3 transition-colors" />
                      <p className="text-sm md:text-base text-gray-700 text-center font-medium">
                      {selectedFile ? (
                          <span className="truncate max-w-[250px] block mx-auto text-blue-700">{selectedFile.name}</span>
                      ) : (
                          "Click to select a file"
                      )}
                    </p>
                      {!selectedFile && <p className="text-xs md:text-sm text-gray-500 mt-1">or drag and drop your report here</p>}
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  </div>
                </label>
                <Button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                    className="h-auto py-3 px-6 text-base font-medium min-w-[140px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isUploading ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Uploading...</span>
                    </>
                  ) : (
                    <span className="flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        <span>Upload File</span>
                    </span>
                  )}
                </Button>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                      style={{ width: `${uploadProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-right font-medium">{uploadProgress}% uploaded</p>
                </div>
              )}
            </div>
              
            {/* Uploaded Reports List */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-3 sm:mb-5">
                  <h3 className="text-lg font-semibold text-gray-900">Your Reports</h3>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {reports.length} {reports.length === 1 ? 'file' : 'files'}
              </div>
                  </div>
                </div>
                
              {reports.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">No reports uploaded yet</h4>
                    <p className="text-xs sm:text-sm text-gray-500">Upload your first academic report to get started</p>
                </div>
              ) : (
                  <div className="space-y-2 sm:space-y-3">
                  {reports.map((report) => (
                      <div key={report.id} className="group border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 sm:space-x-4 flex-1 min-w-0">
                            <div className="bg-blue-100 group-hover:bg-blue-200 p-2 sm:p-3 rounded-md sm:rounded-lg transition-colors flex-shrink-0">
                              <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium sm:font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors text-sm sm:text-base leading-tight">
                                {report.name}
                              </h4>
                              <div className="flex items-center space-x-2 sm:space-x-4 mt-1">
                                <span className="text-xs sm:text-sm text-gray-600">
                                  {new Date(report.uploadDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs sm:text-sm text-gray-600">{report.size}</span>
                            </div>
                          </div>
                        </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
                          <a
                            href={report.url}
                            download
                              className="p-2 sm:p-2.5 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200 transition-all duration-200 group/download min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                              title="Download report"
                          >
                              <Download className="h-4 w-4 sm:h-5 sm:w-5 group-hover/download:scale-110 transition-transform" />
                          </a>
                            <MobileIconButton
                              icon={X}
                            onClick={async (e) => {
                              e.preventDefault()
                              await handleDeleteReport(report.id, report.name)
                            }}
                              variant="delete"
                              title="Delete report"
                            disabled={isUploading}
                              size="sm"
                            />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </>
  )
}

