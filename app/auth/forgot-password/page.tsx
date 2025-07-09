"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Lock, User, Mail, HelpCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const forgotPasswordSchema = z.object({
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
    .toLowerCase(),
  reason: z.enum(["forgot_password", "account_locked", "other"], {
    required_error: "Please select a reason",
  }),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMessageSent, setIsMessageSent] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError("")

    try {
      // Check if email exists in the database
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('email', data.email)
        .single()

      if (userError || !userData) {
        throw new Error("This email is not registered in our system. Please check your email address.")
      }

      // Verify that the provided name matches the database
      if (userData.first_name.toLowerCase() !== data.firstName.toLowerCase() || 
          userData.last_name.toLowerCase() !== data.lastName.toLowerCase()) {
        throw new Error("The name provided does not match our records. Please check your details.")
      }

      // Format the message for WhatsApp
      const message = `*TPP System - Password Reset Request*\n\n` +
        `*Name:* ${data.firstName} ${data.lastName}\n` +
        `*Email:* ${data.email}\n` +
        `*Reason:* ${data.reason === 'forgot_password' ? 'Forgot Password' : 
                    data.reason === 'account_locked' ? 'Account Locked' : 'Other'}\n\n` +
        `Please assist with password reset.`

      // Encode the message for WhatsApp URL
      const encodedMessage = encodeURIComponent(message)
      
      // Create WhatsApp URL with the phone number
      const whatsappUrl = `https://wa.me/27694654988?text=${encodedMessage}`

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank')

      setIsMessageSent(true)
      toast.success("Your request has been sent. Please wait for assistance.", {
        position: "top-right",
        duration: 5000,
      })
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Failed to send request. Please try again.")
      toast.error(err.message || "Failed to send request. Please try again.", {
        position: "top-right",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Request Password Reset</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please fill in your details and we'll assist you with resetting your password.
          </p>
        </div>

        <Card className="mt-8 shadow-lg">
          <CardContent className="pt-6">
            {isMessageSent ? (
              <div className="text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Request Sent</h3>
                <p className="text-sm text-gray-600">
                  Your request has been sent. Please wait for assistance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-500" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      className={errors.firstName ? "border-red-500 focus:border-red-500" : ""}
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-500" />
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      className={errors.lastName ? "border-red-500 focus:border-red-500" : ""}
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reason" className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                    Reason for Reset
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("reason", value as "forgot_password" | "account_locked" | "other")}
                  >
                    <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forgot_password">Forgot Password</SelectItem>
                      <SelectItem value="account_locked">Account Locked</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.reason && (
                    <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Request"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/access-portal"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 