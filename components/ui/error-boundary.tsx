"use client"

import React from 'react'
import { Button } from './button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error?: Error
    resetError: () => void
  }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to external service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{
  error?: Error
  resetError: () => void
}> = ({ error, resetError }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto">
              {error.toString()}
              {error.stack && `\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="space-y-3">
          <Button
            onClick={resetError}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )
}

// Specific error boundary for dashboard components
export const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="bg-white rounded-lg border border-red-200 p-6 m-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Dashboard Error</h3>
              <p className="text-sm text-gray-600">
                There was a problem loading this section
              </p>
            </div>
          </div>
          
          <Button
            onClick={resetError}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Here you would send to your error tracking service
        console.error('Dashboard Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
} 