"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Send } from "lucide-react"

interface FormActionsProps {
  handleReset: () => void
  isSubmitted: boolean
  subjectsCount: number
}

export const FormActions: React.FC<FormActionsProps> = ({ handleReset, isSubmitted, subjectsCount }) => {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <Button type="button" variant="outline" onClick={handleReset} className="flex items-center space-x-2">
        <RotateCcw className="h-4 w-4" />
        <span>Reset</span>
      </Button>
      <Button
        type="submit"
        disabled={subjectsCount === 0}
        className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
      >
        <Send className="h-4 w-4" />
        <span>Submit Results</span>
      </Button>
    </div>
  )
}
