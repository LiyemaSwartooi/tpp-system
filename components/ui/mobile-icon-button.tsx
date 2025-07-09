import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MobileIconButtonProps {
  icon: LucideIcon
  onClick?: (e: React.MouseEvent) => void
  className?: string
  title?: string
  disabled?: boolean
  variant?: 'delete' | 'download' | 'view' | 'default'
  size?: 'sm' | 'md' | 'lg'
}

export const MobileIconButton: React.FC<MobileIconButtonProps> = ({
  icon: Icon,
  onClick,
  className = '',
  title,
  disabled = false,
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = 'transition-all duration-200 flex items-center justify-center border border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    delete: 'text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 active:bg-red-100 active:scale-95',
    download: 'text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 active:bg-green-100 active:scale-95',
    view: 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:bg-blue-100 active:scale-95',
    default: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-200 active:bg-gray-100 active:scale-95'
  }
  
  const sizeClasses = {
    sm: 'p-2 sm:p-2 min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] rounded-lg sm:rounded-md',
    md: 'p-3 sm:p-2.5 min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-[auto] rounded-xl sm:rounded-lg',
    lg: 'p-4 sm:p-3 min-h-[48px] min-w-[48px] sm:min-h-[auto] sm:min-w-[auto] rounded-xl sm:rounded-lg'
  }
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6 sm:h-5 sm:w-5',
    lg: 'h-7 w-7 sm:h-6 sm:w-6'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      title={title}
      disabled={disabled}
      type="button"
    >
      <Icon className={cn(iconSizes[size], 'transition-transform group-hover:scale-110')} />
    </button>
  )
}

export default MobileIconButton 