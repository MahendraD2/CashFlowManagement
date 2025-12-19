"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import card from "../../assets/sidecard.png";

export default function OTPVerification() {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(0, 1); // Only take the first character
    setOtpValues(newOtpValues);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key press
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpValues(digits);

      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = () => {
    const otp = otpValues.join("");
    if (otp === "123456") {
      navigate("/dashboard");
    } else {
      alert("Invalid OTP");
    }
  };

  // Background image URL - use the same as in previous components for consistency
  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80";

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image background with branding */}
      <div
        className="hidden md:flex md:w-5/12 flex-col p-8 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.2), rgba(147, 51, 234, 0.2)), url(${new URL(
            card,
            import.meta.url
          )})`,
          backgroundSize: "cover",
          backgroundPosition: "0px -370px",
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
      {/* Right side - OTP Verification form */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex justify-end mb-16">
          <div className="text-gray-400 mr-4 self-center">
            Already have an account?
          </div>
          <Link
            to="/"
            className="border border-purple-400 text-purple-400 px-6 py-2 rounded-full hover:bg-purple-50 transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-4xl font-semibold text-gray-700 mb-2">
            CONFIRM YOUR NUMBER
          </h1>
          <p className="text-gray-500 mb-8">
            Enter the 6-digit code we just sent to your email address.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-8"
          >
            <div className="flex justify-between gap-2">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : null}
                  className="w-12 h-14 text-center text-xl font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-purple-500 hover:underline text-sm"
                onClick={() => setOtpValues(["", "", "", "", "", ""])}
              >
                Didn't get a code?{" "}
                <span className="font-medium">Resend Code</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-400 text-white py-3 rounded-full hover:bg-purple-500 transition-colors font-medium"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
