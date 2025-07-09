import React from 'react'
import { Loader2, User, FileText, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// Basic spinner component
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin text-blue-600',
        sizeClasses[size],
        className
      )} 
    />
  )
}

// Full page loading
export const PageLoading: React.FC<{
  message?: string
}> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* TPP Logo */}
        <div className="mb-8">
          <img
            src="/TPP Logo - Red.png"
            alt="TPP Logo"
            className="w-32 h-32 mx-auto object-contain"
          />
          <h1 className="text-red-600 text-lg font-extrabold mt-4 text-center tracking-wide">
            TALENT PIPELINE PROGRAMME
          </h1>
        </div>
        
        {/* Loading Animation */}
        <div className="relative mb-6">
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-loading"></div>
          </div>
        </div>
        
        {/* Loading Message */}
        <p className="text-gray-700 font-medium text-lg mb-2">{message}</p>
        <p className="text-gray-500 text-sm">Please wait while we prepare your dashboard...</p>
        
        <style jsx>{`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
              width: 100%;
            }
            50% {
              transform: translateX(0%);
              width: 100%;
            }
            100% {
              transform: translateX(100%);
              width: 100%;
            }
          }
          .animate-loading {
            animation: loading 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}

// Card skeleton for dashboard cards
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  )
}

// Table skeleton for student table
export const TableSkeleton: React.FC<{
  rows?: number
  columns?: number
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="border-b p-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-gray-100 rounded animate-pulse"
                  style={{ animationDelay: `${(rowIndex * columns + colIndex) * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mobile card skeleton
export const MobileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  )
}

// Summary cards skeleton
export const SummaryCardsLoadingSkeleton: React.FC = () => {
  const cards = [
    { icon: Users, color: 'bg-blue-500' },
    { icon: FileText, color: 'bg-green-500' },
    { icon: TrendingUp, color: 'bg-purple-500' },
    { icon: User, color: 'bg-red-500' }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg opacity-20`}></div>
          </div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

// Chart loading component
export const ChartLoading: React.FC<{
  height?: number
  title?: string
}> = ({ height = 400, title = 'Loading chart...' }) => {
  return (
    <div 
      className="bg-white rounded-lg border p-6 flex flex-col items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <div className="relative mb-4">
        <TrendingUp className="w-16 h-16 text-gray-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      </div>
      <p className="text-gray-600 font-medium">{title}</p>
    </div>
  )
}

// Button loading state
export const ButtonLoading: React.FC<{
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
}> = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '',
  onClick,
  variant = 'default'
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors'
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:bg-transparent'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

// Search loading state
export const SearchLoading: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border p-4 text-center">
      <Spinner className="mx-auto mb-2" />
      <p className="text-gray-600">Searching students...</p>
    </div>
  )
}

// Data loading wrapper
export const DataLoading: React.FC<{
  loading: boolean
  error?: string | null
  children: React.ReactNode
  skeleton?: React.ReactNode
}> = ({ loading, error, children, skeleton }) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Error loading data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (loading) {
    return <>{skeleton || <Spinner className="mx-auto" />}</>
  }

  return <>{children}</>
}
