import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Validation rules interface
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Form field state interface
export interface FieldState {
  value: any
  touched: boolean
  errors: string[]
}

// Validation utilities
export class FormValidator {
  static validateField(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = []

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rules.message || 'This field is required')
      return { isValid: false, errors }
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: true, errors: [] }
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters`)
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`Must not exceed ${rules.maxLength} characters`)
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push(rules.message || 'Invalid format')
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        errors.push(customError)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateForm(formData: Record<string, any>, validationSchema: Record<string, ValidationRule>): ValidationResult {
    const allErrors: string[] = []
    
    for (const [fieldName, rules] of Object.entries(validationSchema)) {
      const fieldValue = formData[fieldName]
      const fieldValidation = this.validateField(fieldValue, rules)
      
      if (!fieldValidation.isValid) {
        allErrors.push(...fieldValidation.errors.map(error => `${fieldName}: ${error}`))
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    }
  }
}

// Pre-defined validation rules
export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  },
  
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name should only contain letters and spaces'
  },
  
  grade: {
    custom: (value: string) => {
      const validGrades = ['8', '9', '10', '11', '12', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
      return validGrades.includes(value) ? null : 'Please select a valid grade (8-12)'
    }
  },
  
  school: {
    minLength: 2,
    maxLength: 100,
    message: 'Please select or enter a valid school name'
  },
  
  search: {
    maxLength: 100,
    pattern: /^[a-zA-Z\s]*$/,
    message: 'Search can only contain letters and spaces'
  }
}

// Form field component with validation
interface ValidatedInputProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'search'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  validation?: ValidationRule
  placeholder?: string
  disabled?: boolean
  className?: string
  touched?: boolean
  errors?: string[]
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  validation,
  placeholder,
  disabled = false,
  className = '',
  touched = false,
  errors = []
}) => {
  const hasErrors = touched && errors.length > 0
  const isValid = touched && errors.length === 0 && value.trim() !== ''

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            hasErrors && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            isValid && 'border-green-300 focus:ring-green-500 focus:border-green-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            !hasErrors && !isValid && 'border-gray-300'
          )}
        />
        
        {/* Validation icons */}
        {touched && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error messages */}
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Help text */}
      {validation?.minLength && !hasErrors && (
        <p className="text-xs text-gray-500">
          Minimum {validation.minLength} characters
        </p>
      )}
    </div>
  )
}

// Select field with validation
interface ValidatedSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  validation?: ValidationRule
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
  touched?: boolean
  errors?: string[]
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  validation,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  touched = false,
  errors = []
}) => {
  const hasErrors = touched && errors.length > 0
  const isValid = touched && errors.length === 0 && value !== ''

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            hasErrors && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            isValid && 'border-green-300 focus:ring-green-500 focus:border-green-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            !hasErrors && !isValid && 'border-gray-300'
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Validation icons */}
        {touched && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error messages */}
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// Form validation summary component
interface ValidationSummaryProps {
  errors: string[]
  className?: string
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  className = ''
}) => {
  if (errors.length === 0) return null

  return (
    <div className={cn(
      'bg-red-50 border border-red-200 rounded-md p-4',
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please correct the following errors:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for form validation
export const useFormValidation = (
  initialValues: Record<string, any>,
  validationSchema: Record<string, ValidationRule>
) => {
  const [values, setValues] = React.useState(initialValues)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [errors, setErrors] = React.useState<Record<string, string[]>>({})

  const validateField = React.useCallback((name: string, value: any) => {
    const rule = validationSchema[name]
    if (!rule) return

    const result = FormValidator.validateField(value, rule)
    setErrors(prev => ({
      ...prev,
      [name]: result.errors
    }))
  }, [validationSchema])

  const handleChange = React.useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      validateField(name, value)
    }
  }, [touched, validateField])

  const handleBlur = React.useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, values[name])
  }, [values, validateField])

  const validateForm = React.useCallback(() => {
    const result = FormValidator.validateForm(values, validationSchema)
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    // Set field-specific errors
    const fieldErrors: Record<string, string[]> = {}
    Object.keys(validationSchema).forEach(fieldName => {
      const fieldResult = FormValidator.validateField(values[fieldName], validationSchema[fieldName])
      fieldErrors[fieldName] = fieldResult.errors
    })
    setErrors(fieldErrors)

    return result
  }, [values, validationSchema])

  const resetForm = React.useCallback(() => {
    setValues(initialValues)
    setTouched({})
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    isValid: Object.values(errors).every(fieldErrors => fieldErrors.length === 0)
  }
} 