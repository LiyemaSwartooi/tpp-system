import { toast as sonnerToast } from "sonner"

// Toast queue and deduplication
const toastQueue = new Map<string, { timer: NodeJS.Timeout; count: number }>()
const recentToasts = new Set<string>()

// Configuration for smart toast behavior
const SMART_TOAST_CONFIG = {
  // Debounce time for similar toasts
  DEBOUNCE_TIME: 2000,
  
  // Time to remember recent toasts to prevent duplicates
  RECENT_TOAST_TIME: 5000,
  
  // Maximum toasts in queue before dropping older ones
  MAX_QUEUE_SIZE: 3,
  
  // Suppressed toast types (less important)
  SUPPRESS_SUCCESS_FOR: [
    'grade selection',
    'school selection', 
    'form input',
    'data loading'
  ],
  
  // Important toasts that should always show
  ALWAYS_SHOW: [
    'error',
    'authentication',
    'data save',
    'profile submit'
  ]
}

interface SmartToastOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  duration?: number
  category?: string
  priority?: 'low' | 'medium' | 'high'
  suppressDuplicates?: boolean
}

class SmartToastManager {
  private isEnabled = true
  
  // Enable/disable all toasts (for testing or user preference)
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }
  
  // Generate unique key for toast deduplication
  private generateToastKey(message: string, type: string, category?: string): string {
    return `${type}:${category || 'general'}:${message.slice(0, 50)}`
  }
  
  // Check if toast should be suppressed
  private shouldSuppressToast(type: string, category?: string, priority?: string): boolean {
    if (!this.isEnabled) return true
    
    // Never suppress high priority or always-show categories
    if (priority === 'high' || SMART_TOAST_CONFIG.ALWAYS_SHOW.some(cat => category?.includes(cat))) {
      return false
    }
    
    // Suppress success toasts for certain categories
    if (type === 'success' && category && SMART_TOAST_CONFIG.SUPPRESS_SUCCESS_FOR.some(cat => category.includes(cat))) {
      return true
    }
    
    return false
  }
  
  // Show smart toast with deduplication and grouping
  private showSmartToast(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning',
    options: SmartToastOptions = {}
  ) {
    const { category, priority = 'medium', suppressDuplicates = true, ...toastOptions } = options
    
    // Check if should suppress
    if (this.shouldSuppressToast(type, category, priority)) {
      return
    }
    
    const toastKey = this.generateToastKey(message, type, category)
    
    // Check for recent duplicate
    if (suppressDuplicates && recentToasts.has(toastKey)) {
      return
    }
    
    // Clear old queue items if at capacity
    if (toastQueue.size >= SMART_TOAST_CONFIG.MAX_QUEUE_SIZE) {
      const oldestKey = toastQueue.keys().next().value
      const oldestItem = toastQueue.get(oldestKey)
      if (oldestItem) {
        clearTimeout(oldestItem.timer)
        toastQueue.delete(oldestKey)
      }
    }
    
    // Check if similar toast is already queued
    if (toastQueue.has(toastKey)) {
      const existing = toastQueue.get(toastKey)!
      existing.count++
      
      // Update message with count if there are multiple
      const updatedMessage = existing.count > 1 ? `${message} (${existing.count})` : message
      
      // Clear existing timer and set new one
      clearTimeout(existing.timer)
      existing.timer = setTimeout(() => {
        this.executeToast(updatedMessage, type, toastOptions)
        toastQueue.delete(toastKey)
      }, SMART_TOAST_CONFIG.DEBOUNCE_TIME)
      
      return
    }
    
    // Queue new toast
    const timer = setTimeout(() => {
      this.executeToast(message, type, toastOptions)
      toastQueue.delete(toastKey)
    }, SMART_TOAST_CONFIG.DEBOUNCE_TIME)
    
    toastQueue.set(toastKey, { timer, count: 1 })
    
    // Add to recent toasts to prevent duplicates
    recentToasts.add(toastKey)
    setTimeout(() => {
      recentToasts.delete(toastKey)
    }, SMART_TOAST_CONFIG.RECENT_TOAST_TIME)
  }
  
  // Execute the actual toast
  private executeToast(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning',
    options: Omit<SmartToastOptions, 'category' | 'priority' | 'suppressDuplicates'> = {}
  ) {
    const defaultOptions = {
      position: 'top-right' as const,
      duration: type === 'error' ? 5000 : 3000
    }
    
    const finalOptions = { ...defaultOptions, ...options }
    
    switch (type) {
      case 'success':
        sonnerToast.success(message, finalOptions)
        break
      case 'error':
        sonnerToast.error(message, finalOptions)
        break
      case 'info':
        sonnerToast.info(message, finalOptions)
        break
      case 'warning':
        sonnerToast.warning(message, finalOptions)
        break
    }
  }
  
  // Public methods
  success(message: string, options: SmartToastOptions = {}) {
    this.showSmartToast(message, 'success', options)
  }
  
  error(message: string, options: SmartToastOptions = {}) {
    this.showSmartToast(message, 'error', { ...options, priority: 'high' })
  }
  
  info(message: string, options: SmartToastOptions = {}) {
    this.showSmartToast(message, 'info', options)
  }
  
  warning(message: string, options: SmartToastOptions = {}) {
    this.showSmartToast(message, 'warning', options)
  }
  
  // Force show important toast (bypasses all filtering)
  forceShow(message: string, type: 'success' | 'error' | 'info' | 'warning', options: Omit<SmartToastOptions, 'priority'> = {}) {
    this.executeToast(message, type, options)
  }
  
  // Group related toasts into one
  group(messages: string[], type: 'success' | 'error' | 'info' | 'warning', options: SmartToastOptions = {}) {
    if (messages.length === 1) {
      this.showSmartToast(messages[0], type, options)
    } else if (messages.length > 1) {
      const groupedMessage = `Multiple updates: ${messages.slice(0, 2).join(', ')}${messages.length > 2 ? ` and ${messages.length - 2} more` : ''}`
      this.showSmartToast(groupedMessage, type, options)
    }
  }
  
  // Clear all pending toasts
  clearAll() {
    toastQueue.forEach(({ timer }) => clearTimeout(timer))
    toastQueue.clear()
    recentToasts.clear()
  }
}

// Export singleton instance
export const smartToast = new SmartToastManager()

// Export types
export type { SmartToastOptions } 