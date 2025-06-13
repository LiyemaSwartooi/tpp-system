import { useCallback, useEffect, useState } from 'react'

interface UseMobileInteractionsOptions {
  hapticFeedback?: boolean
  highlightOnTouch?: boolean
}

export const useMobileInteractions = (options: UseMobileInteractionsOptions = {}) => {
  const { hapticFeedback = true, highlightOnTouch = true } = options
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    // Detect if device supports touch
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkMobile()
    checkTouch()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleTouchFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback || !navigator.vibrate) return

    // Provide haptic feedback for mobile devices
    switch (type) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(25)
        break
      case 'heavy':
        navigator.vibrate(50)
        break
    }
  }, [hapticFeedback])

  const getMobileButtonProps = useCallback((variant: 'delete' | 'action' | 'primary' = 'action') => {
    if (!isMobile) return {}

    return {
      onTouchStart: () => {
        if (highlightOnTouch) {
          // Add visual feedback for touch
          const event = new CustomEvent('mobile-touch-start', { detail: { variant } })
          document.dispatchEvent(event)
        }
      },
      onTouchEnd: () => {
        handleTouchFeedback(variant === 'delete' ? 'medium' : 'light')
        
        if (highlightOnTouch) {
          const event = new CustomEvent('mobile-touch-end', { detail: { variant } })
          document.dispatchEvent(event)
        }
      },
      style: {
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }
    }
  }, [isMobile, highlightOnTouch, handleTouchFeedback])

  const getTouchTargetSize = useCallback((size: 'sm' | 'md' | 'lg' = 'md') => {
    if (!isMobile) return {}

    const sizes = {
      sm: { minHeight: '40px', minWidth: '40px' },
      md: { minHeight: '44px', minWidth: '44px' },
      lg: { minHeight: '48px', minWidth: '48px' }
    }

    return sizes[size]
  }, [isMobile])

  return {
    isMobile,
    isTouch,
    handleTouchFeedback,
    getMobileButtonProps,
    getTouchTargetSize
  }
} 