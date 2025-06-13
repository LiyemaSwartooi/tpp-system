"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"
import { createProfile } from "@/app/actions/create-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, LogOut, AlertCircle, PartyPopper, XCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

const signInSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  userType: z.enum(["student", "coordinator"], {
    required_error: "Please select whether you are a student or coordinator",
  }),
})

const signUpSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens and apostrophes"),
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens and apostrophes"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .toLowerCase(),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Password must contain at least one letter and one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
  userType: z.enum(["student", "coordinator"], {
    required_error: "Please select whether you are a student or coordinator",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  userType: 'student' | 'coordinator'
}

export default function AccessPortal() {
  const [activeTab, setActiveTab] = useState("signin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: "student",
    },
  })

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "student",
    },
  })

  const onSignIn = async (formData: SignInForm) => {
    setIsLoading(true)
    setError("")

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error
      if (!data.user) throw new Error("User not found")

      // Fetch the user's profile to check their role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, first_name, last_name")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile) {
        // If no profile exists, sign them out and show an error
        await supabase.auth.signOut()
        throw new Error("User profile not found. Please contact support.")
      }

      // Check if selected role matches actual role
      if (profile.role !== formData.userType) {
        await supabase.auth.signOut()
        const selectedRole = formData.userType === 'student' ? 'Student' : 'Coordinator'
        const actualRole = profile.role === 'student' ? 'Student' : 'Coordinator'
        throw new Error(`Role mismatch: You selected "${selectedRole}" but your account is registered as "${actualRole}". Please select "${actualRole}" from the dropdown and try again.`)
      }

      // Show success message
      toast.success(`Welcome back, ${profile.first_name}! Signing you in...`, {
        icon: <PartyPopper className="w-5 h-5 text-green-500" />,
        position: 'top-right',
        duration: 3000,
      });

      // Redirect based on role (now we know it matches the selection)
      const redirectPath = profile.role === "coordinator" ? "/coordinator" : "/student"
      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
      console.error("Sign in error:", error)
      
      let errorMessage = error.message;
      let toastDuration = 5000;
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Role mismatch")) {
        errorMessage = error.message;
        toastDuration = 8000; // Longer duration for role mismatch errors
        
        // Also highlight the role selection field
        const roleField = document.querySelector('[name="userType"]');
        if (roleField) {
          roleField.classList.add('border-red-500', 'bg-red-50');
          setTimeout(() => {
            roleField.classList.remove('border-red-500', 'bg-red-50');
          }, 3000);
        }
      }
      
      toast.error(errorMessage, {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        position: 'top-right',
        duration: toastDuration,
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const onSignUp = async (formData: SignUpForm) => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Check if email already exists
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (emailCheckError) {
        console.error('Error checking email:', emailCheckError);
        throw new Error('Failed to check email availability. Please try again.');
      }

      if (existingUser) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      // 2. Check coordinator limit if user is registering as coordinator
      if (formData.userType === 'coordinator') {
        const { data: coordinators, error: coordinatorCountError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'coordinator');

        if (coordinatorCountError) {
          console.error('Error checking coordinator count:', coordinatorCountError);
          throw new Error('Failed to verify coordinator availability. Please try again.');
        }

        if (coordinators && coordinators.length >= 3) {
          throw new Error('Registration limit reached. Maximum of 3 coordinators allowed. Please contact support if you need coordinator access.');
        }
      }

      // 3. Validate input
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // 4. Create the user with email and password (without requiring email confirmation)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            user_type: formData.userType,
            email_confirm: true // This is a custom claim to bypass email confirmation
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      console.log('Sign up response:', { signUpData, signUpError });

      if (signUpError) {
        console.error('Auth error:', signUpError);
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('already in use')) {
          throw new Error('This email is already registered. Please sign in.');
        }
        throw signUpError;
      }

      if (!signUpData?.user) throw new Error('Failed to create user');

      // 5. Sign in the user automatically since email confirmation is disabled
      console.log('Signing in after registration...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError || !signInData?.user) {
        console.error('Auto sign-in error:', signInError);
        // If auto sign-in fails, still show success but prompt to sign in manually
        toast.success('Account created successfully! Please sign in with your new credentials.', {
          icon: <PartyPopper className="w-5 h-5 text-green-500" />,
          position: 'top-right',
          duration: 6000,
        });
        setActiveTab('signin');
        setIsLoading(false);
        return;
      }

      // 6. Create profile using the API route
      let profileResponse;
      try {
        const profilePayload = {
          userId: signInData.user.id,
          email: formData.email,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          userType: formData.userType,
        };
        
        console.log('Sending profile creation request:', JSON.stringify(profilePayload, null, 2));
        
        profileResponse = await fetch('/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profilePayload),
        });
        
        console.log('Profile creation response status:', profileResponse.status);

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          console.error('Profile creation error:', {
            status: profileResponse.status,
            statusText: profileResponse.statusText,
            error: profileData
          });
          
          // Clean up the auth user
          try {
            await supabase.auth.admin.deleteUser(signInData.user.id);
          } catch (deleteError) {
            console.error('Error cleaning up auth user:', deleteError);
          }
          
          // Clear the session
          await supabase.auth.signOut();
          
          let errorMessage = profileData?.error || 'Failed to create profile';
          
          // Handle specific error cases
          if (errorMessage.includes('already exists') || 
              errorMessage.includes('duplicate') ||
              errorMessage.includes('already registered') ||
              profileData?.code === '23505') {
            errorMessage = 'This email is already registered. Please sign in.';
          } else if (errorMessage.includes('First name is required') || 
                    errorMessage.includes('Last name is required')) {
            errorMessage = 'Please provide both first and last name';
          }
          
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        console.error('Profile creation failed:', error);
        // If we have a response but JSON parsing failed
        if (error instanceof SyntaxError && profileResponse) {
          throw new Error('Failed to process profile creation. Please try again.');
        }
        // Re-throw the error to be caught by the outer catch block
        throw error;
      }

      // 7. Store user data in localStorage
      const userData = {
        id: signInData.user.id,
        email: formData.email,
        role: formData.userType,
        name: `${formData.firstName} ${formData.lastName}`,
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Show success message
      toast.success(`Welcome to TPP, ${formData.firstName}! Your account has been created successfully!`, {
        icon: <PartyPopper className="w-5 h-5 text-green-500" />,
        position: 'top-right',
        duration: 4000,
      });

      // 8. Redirect based on user type
      setTimeout(() => {
        router.push(formData.userType === 'coordinator' ? '/coordinator' : '/student');
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = '';
      // Handle specific error cases
      if (error.message.includes('already registered') || 
          error.message.includes('already in use')) {
        errorMessage = 'This email is already registered. Please sign in.';
      } else if (error.message.includes('password')) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message || 'An error occurred during sign up. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        position: 'top-right',
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex flex-col">
      {/* Header */}
      <header className="bg-white py-3 sm:py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-red-600 text-white font-bold rounded-md p-1 text-xs sm:text-sm">TPP</div>
            <span className="font-semibold text-sm sm:text-base">Talent Pipeline Programme</span>
          </div>
          <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center whitespace-nowrap">
            <ArrowLeft className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left Column - Visible on all screens */}
          <div className="w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-6">
              <div className="mb-6 sm:mb-8">
                <div className="text-red-600 mb-3 sm:mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Welcome to TPP Portal</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Access your personalized dashboard to track academic performance and student success.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white p-3 sm:p-4 rounded-lg flex items-start">
                  <div className="bg-red-50 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Track Academic Progress</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Monitor grades and performance metrics</p>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg flex items-start">
                  <div className="bg-red-50 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Student Management</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Coordinate and support student success</p>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg flex items-start">
                  <div className="bg-red-50 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Data-Driven Insights</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Make informed decisions with analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Full width on mobile, half on larger screens */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold">TPP Access Portal</h2>
                <p className="text-xs sm:text-sm text-gray-600">Sign in to your account or create a new one</p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className={signInForm.formState.errors.email ? "border-red-500 focus:border-red-500" : ""}
                      {...signInForm.register("email")}
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                    
                    <div className="mt-4">
                      <Label htmlFor="userType">I am a</Label>
                      <Select
                        value={signInForm.watch("userType")}
                        onValueChange={(value) => signInForm.setValue("userType", value as "student" | "coordinator")}
                      >
                        <SelectTrigger className={signInForm.formState.errors.userType ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                        </SelectContent>
                      </Select>
                      {signInForm.formState.errors.userType && (
                        <p className="text-red-500 text-xs mt-1">
                          {signInForm.formState.errors.userType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                    <Input
                      id="password"
                        type={showSignInPassword ? "text" : "password"}
                      placeholder="••••••••"
                        className={signInForm.formState.errors.password ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                      {...signInForm.register("password")}
                    />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                      >
                        {showSignInPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                    <div className="text-right">
                      <Link href="/auth/forgot-password" className="text-sm text-red-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signup")}
                      className="text-red-600 hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div>
                    <Label htmlFor="userType">I am a</Label>
                    <Select
                      value={signUpForm.watch("userType")}
                      onValueChange={(value) => signUpForm.setValue("userType", value as "student" | "coordinator")}
                    >
                      <SelectTrigger className={signUpForm.formState.errors.userType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="coordinator">Coordinator (Limited to 3 max)</SelectItem>
                      </SelectContent>
                    </Select>
                    {signUpForm.formState.errors.userType && (
                      <p className="text-red-500 text-xs mt-1">
                        {signUpForm.formState.errors.userType.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Note: Coordinator registration is limited to 3 users maximum
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter your first name" 
                        className={signUpForm.formState.errors.firstName ? "border-red-500 focus:border-red-500" : ""}
                        {...signUpForm.register("firstName")} 
                      />
                      {signUpForm.formState.errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                          {signUpForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter your last name" 
                        className={signUpForm.formState.errors.lastName ? "border-red-500 focus:border-red-500" : ""}
                        {...signUpForm.register("lastName")} 
                      />
                      {signUpForm.formState.errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                          {signUpForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className={signUpForm.formState.errors.email ? "border-red-500 focus:border-red-500" : ""}
                      {...signUpForm.register("email")}
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                    <Input
                      id="password"
                        type={showSignUpPassword ? "text" : "password"}
                      placeholder="••••••••"
                        className={signUpForm.formState.errors.password ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                      {...signUpForm.register("password")}
                    />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                    <Input
                      id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                        className={signUpForm.formState.errors.confirmPassword ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                      {...signUpForm.register("confirmPassword")}
                    />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signin")}
                      className="text-red-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              © 2024 Talent Pipeline Programme. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <Link href="/privacy-policy" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
                Terms of Service
              </Link>
              <Link href="/contact-support" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

      