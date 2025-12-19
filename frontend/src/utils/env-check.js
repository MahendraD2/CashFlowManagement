// This file helps debug environment variable issues
console.log("Environment Variables Check:")
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL || "Not set")

// Check if the base URL is properly formatted
if (import.meta.env.VITE_API_BASE_URL) {
  try {
    new URL(import.meta.env.VITE_API_BASE_URL)
    console.log("Base URL is valid")
  } catch (error) {
    console.error("Base URL is invalid:", error.message)
  }
}

export const isEnvValid = () => {
  return !!import.meta.env.VITE_API_BASE_URL
}
