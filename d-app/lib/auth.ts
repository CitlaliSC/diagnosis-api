// Simple authentication utilities for the medical diagnosis app
// In production, this should use a proper auth service like Supabase or Auth.js

export interface User {
  id: string
  email: string
  name: string
  role: "doctor" | "admin"
}

// Mock user database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "doctor@example.com": {
    password: "password123",
    user: {
      id: "1",
      email: "doctor@example.com",
      name: "Dr. María González",
      role: "doctor",
    },
  },
  "admin@example.com": {
    password: "admin123",
    user: {
      id: "2",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    },
  },
}

export function login(email: string, password: string): User | null {
  const userRecord = MOCK_USERS[email]
  if (userRecord && userRecord.password === password) {
    return userRecord.user
  }
  return null
}

export function saveAuth(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      return JSON.parse(userStr)
    }
  }
  return null
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}
