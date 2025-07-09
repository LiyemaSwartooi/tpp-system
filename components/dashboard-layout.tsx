"use client"

import { useState, createContext, useContext, type ReactNode, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, ChevronLeft, ChevronRight, User, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { smartToast } from "@/lib/smart-toast"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"

type SidebarContextType = {
  isCollapsed: boolean
  toggleSidebar: () => void
  closeMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

type DashboardLayoutProps = {
  children: ReactNode
  sidebarContent: ReactNode
  portalType: "Student" | "Coordinator" | "Admin"
  title: string
  userInfo: {
    name: string
    firstName?: string
    lastName?: string
    email: string
    avatarFallback: string
    role?: string
    studentNumber?: string
    school?: string
    grade?: string
  }
}

export function DashboardLayout({ children, sidebarContent, userInfo, portalType, title }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [user, setUser] = useState(userInfo)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/access-portal')
          return
        }

        // Fetch the latest user data from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profile) {
          setUser({
            name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            avatarFallback: [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'U',
            role: profile.role || 'student', // Default to 'student' if role is not set
            firstName: profile.first_name,
            lastName: profile.last_name
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/access-portal')
      }
    }

    fetchUser()
  }, [router, supabase])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      smartToast.success("You have been successfully logged out.", {
        category: 'authentication',
        priority: 'medium'
      })
      router.push("/access-portal")
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      smartToast.error("Failed to log out. Please try again.", {
        category: 'authentication',
        priority: 'high'
      })
    }
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, closeMobileSidebar }}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={cn(
            "bg-white border-r border-gray-200 flex flex-col relative min-h-full",
            // Desktop behavior
            "hidden md:flex md:relative md:translate-x-0 transition-all duration-300",
            isCollapsed ? "md:w-[70px]" : "md:w-64",
            // Mobile behavior
            "md:flex",
            isMobileSidebarOpen ? "flex fixed inset-y-0 left-0 z-50 w-80 sm:w-64 transform translate-x-0" : "fixed inset-y-0 left-0 z-50 w-80 sm:w-64 transform -translate-x-full",
            "transition-transform duration-300 ease-in-out"
          )}
        >
          {/* Toggle Button for Desktop */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-5 bg-white border border-gray-200 rounded-full p-1.5 shadow-md z-10 hover:bg-gray-50 transition-colors hidden md:block"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b h-14 sm:h-16 flex items-center justify-between">
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">TPP</span>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-base sm:text-lg font-semibold">TPP System</h1>
                  <p className="text-xs text-gray-500">{portalType} Portal</p>
                </div>
              )}
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4 sm:py-6 overflow-hidden">{sidebarContent}</div>

          {/* Sidebar Footer */}
          <div className="border-t p-3 sm:p-4">
            {isCollapsed ? (
              <div className="flex justify-center">
                <Avatar className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                  <AvatarFallback className="bg-transparent">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      {user.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="dashboard-layout bg-white shadow-sm border-b h-14 sm:h-16 flex items-center px-3 sm:px-6 flex-shrink-0 relative z-10">
            <div className="flex items-center justify-between w-full">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 flex-shrink-0 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold truncate flex-1 text-center md:text-left">{title}</h1>
              {/* Spacer for mobile to center title */}
              <div className="w-10 h-10 md:hidden flex-shrink-0"></div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6 relative" style={{ WebkitOverflowScrolling: 'touch', overflowScrolling: 'touch' }}>{children}</main>
        </div>
      </div>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}
    </SidebarContext.Provider>
  )
}

export function SidebarNavGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="px-4 mb-6">
      {!useSidebar().isCollapsed && (
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {title}
        </h2>
      )}
      <nav className="space-y-1">{children}</nav>
    </div>
  )
}

export function SidebarNavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
}) {
  const { isCollapsed, closeMobileSidebar } = useSidebar()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    // Close mobile sidebar when navigation item is clicked
    closeMobileSidebar()
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100",
        isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "text-gray-700",
        isCollapsed && "justify-center",
      )}
      onClick={handleClick}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </Button>
  )
}
