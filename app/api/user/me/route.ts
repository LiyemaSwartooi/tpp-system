import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, this would fetch user data from a database
  // based on the authenticated user's session

  // For now, we'll return mock data
  return NextResponse.json({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "student",
  })
}
