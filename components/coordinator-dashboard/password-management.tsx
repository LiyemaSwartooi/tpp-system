"use client"

import React, { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Key, 
  Search, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Shield
} from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  created_at: string
  updated_at: string
}

interface PasswordResetRequest {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  reason: string
  status: 'pending' | 'completed' | 'rejected'
  requested_at: string
  completed_at?: string
  completed_by?: string
}

export function PasswordManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      console.error('Error fetching users:', err)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  // Reset password function
  const resetPassword = async () => {
    if (!selectedUser) return

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      setError("Password must contain at least one letter and one number")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Call the API route to reset password
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      toast.success(data.message || `Password reset successfully for ${selectedUser.first_name} ${selectedUser.last_name}`)
      
      // Reset form
      setNewPassword("")
      setConfirmPassword("")
      setSelectedUser(null)
      setIsDialogOpen(false)
      
    } catch (err: any) {
      console.error('Error resetting password:', err)
      setError(err.message || 'Failed to reset password')
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
    setConfirmPassword(password)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="h-6 w-6 text-red-600" />
            Password Management
          </h1>
          <p className="text-gray-600 mt-1">
            Reset passwords for students and coordinators
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Users</CardTitle>
          <CardDescription>
            Find users by name or email to reset their passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by name or email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Enter name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="role-filter">Filter by role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="coordinator">Coordinators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Click on a user to reset their password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || roleFilter !== "all" ? "No users found matching your criteria" : "No users available"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {user.first_name} {user.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'coordinator' ? 'default' : 'secondary'}>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setIsDialogOpen(open)
                          if (!open) {
                            setSelectedUser(null)
                            setNewPassword("")
                            setConfirmPassword("")
                            setError("")
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Reset Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Reset password for {user.first_name} {user.last_name} ({user.email})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                  <Input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={error ? "border-red-500" : ""}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                  id="confirm-password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Confirm new password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className={error ? "border-red-500" : ""}
                                />
                              </div>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={generateRandomPassword}
                                className="w-full"
                              >
                                Generate Random Password
                              </Button>
                              {error && (
                                <Alert variant="destructive">
                                  <AlertDescription>{error}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsDialogOpen(false)
                                  setSelectedUser(null)
                                  setNewPassword("")
                                  setConfirmPassword("")
                                  setError("")
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={resetPassword}
                                disabled={isLoading || !newPassword || !confirmPassword}
                              >
                                {isLoading ? "Resetting..." : "Reset Password"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Password Requirements</p>
              <p className="text-sm text-gray-600">
                Passwords must be at least 6 characters and contain at least one letter and one number.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">Security Notice</p>
              <p className="text-sm text-gray-600">
                Password resets are logged and the user will need to sign in with their new password immediately.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium">Random Password Generator</p>
              <p className="text-sm text-gray-600">
                Use the "Generate Random Password" button to create a secure 12-character password automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 