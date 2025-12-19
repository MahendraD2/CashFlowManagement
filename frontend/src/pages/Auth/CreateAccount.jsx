"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye } from "lucide-react"
// Import the image correctly
import sidecard from "../../assets/sidecard.png"
import { useAuth } from "../../context/AuthContext"

export default function CreateAccount() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSignup = async (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      setErrorMessage("Please fill all fields")
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage("")

      await register({ name, email, password })

      // Redirect to login page after successful registration
      navigate("/")
    } catch (error) {
      console.error("Registration error:", error)
      setErrorMessage(error.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image background with branding */}
      <div
        className="hidden md:flex md:w-5/12 flex-col p-8 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.2), rgba(147, 51, 234, 0.2)), url(${sidecard})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#9333EA", // Fallback color if image fails to load
        }}
      >
        <div className="font-bold text-2xl text-white mb-20">
          <span>💰</span>CashVista
        </div>
        <div className="text-white text-5xl font-bold space-y-4">
          <div>
            VISUALIZE <span className="text-[#7762A7]">NOW</span>
          </div>
          <div>
            ANALYZE <span className="text-[#7762A7]">SMARTER</span>
          </div>
          <div>
            CAPITALIZE <span className="text-[#7762A7]">BIGGER</span>
          </div>
        </div>

        {/* Graph visualization - this would be an actual image in production */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-50">
          {/* You could add an SVG here for the graph visualization */}
        </div>
      </div>

      {/* Right side - Create Account form */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex justify-end mb-16">
          <div className="text-gray-400 mr-4 self-center">Already have an account?</div>
          <Link
            to="/"
            className="border border-purple-400 text-purple-400 px-6 py-2 rounded-full hover:bg-purple-50 transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-4xl font-semibold text-gray-700 mb-2">GET STARTED</h1>
          <p className="text-gray-500 mb-8">Create an account to start managing your finances.</p>

          {errorMessage && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">{errorMessage}</div>}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-gray-600">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Sample@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-purple-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-500 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <button
              type="submit"
              className={`w-full bg-purple-400 text-white py-3 rounded-full hover:bg-purple-500 transition-colors font-medium ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
