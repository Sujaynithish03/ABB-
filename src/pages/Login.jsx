import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import plcImage from "@/assets/plc.webp";

const ABB_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScIghZJCd7WFx6f3jIQ9A_eWu6tbJGoXzh-A&s";

export function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (isSignUp) {
        if (!formData.username.trim()) {
          setError("Username is required for sign up");
          return;
        }
        await signUpWithEmail(
          formData.email,
          formData.password,
          formData.username
        );
      } else {
        await signInWithEmail(formData.email, formData.password);
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already registered. Please sign in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(`Authentication failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#E2001A]/10 font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src={ABB_LOGO_URL}
                alt="ABB Logo"
                className="h-12 w-12 rounded-lg shadow-lg border-2 border-[#E2001A] bg-white"
                style={{ objectFit: "contain" }}
              />
              <h1 className="text-4xl font-extrabold text-[#E2001A] tracking-tight">
                ABB Chatbot
              </h1>
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
              Luxury Industrial Automation Platform powered by ABB
            </p>
          </div>
        </div>
      </header>

      {/* Main Login Section */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Left Side - Image and Info */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-gradient-to-br from-[#E2001A]/10 to-white">
          <div className="max-w-lg mx-auto">
            <div className="mb-8">
              <img
                src={plcImage}
                alt="PLC Control System"
                className="w-full h-auto rounded-2xl shadow-2xl border-2 border-[#E2001A]/30"
              />
            </div>
            <h2 className="text-4xl font-extrabold text-[#E2001A] mb-6">
              Industrial Automation & Control
            </h2>
            <p className="text-lg text-gray-700 mb-8 font-medium">
              Experience the power of ABB in modern industrial automation.
              Monitor, control, and optimize your manufacturing processes with
              luxury and precision.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#E2001A] rounded-full"></div>
                <span className="text-gray-800 font-semibold">
                  Real-time Processing & Control
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#E2001A] rounded-full"></div>
                <span className="text-gray-800 font-semibold">
                  Industrial Grade Reliability
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#E2001A] rounded-full"></div>
                <span className="text-gray-800 font-semibold">
                  Network Integration & Monitoring
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl bg-white/90">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src={ABB_LOGO_URL}
                  alt="ABB Logo"
                  className="h-10 w-10 rounded-lg border-2 border-[#E2001A] bg-white shadow"
                  style={{ objectFit: "contain" }}
                />
                <h1 className="text-2xl font-bold text-[#E2001A]">
                  ABB Chatbot
                </h1>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600 mt-2">
                {isSignUp
                  ? "Sign up to start your ABB automation journey"
                  : "Sign in to your ABB account"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#E2001A]/10 text-[#E2001A] rounded-lg font-medium">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#E2001A] hover:bg-[#b80014] text-white font-semibold rounded-lg shadow"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </div>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2001A]/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#E2001A] font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center gap-2 border-[#E2001A] text-[#E2001A] font-semibold rounded-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-6 text-center">
              <p className="text-gray-700 font-medium">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setFormData({
                      email: "",
                      password: "",
                      username: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-[#E2001A] hover:text-[#b80014] font-semibold underline"
                  disabled={loading}
                >
                  {isSignUp ? "Sign in here" : "Sign up here"}
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#E2001A] text-white py-8 mt-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src={ABB_LOGO_URL}
              alt="ABB Logo"
              className="h-8 w-8 rounded-lg border-2 border-white bg-white"
              style={{ objectFit: 'contain' }}
            />
            <span className="text-xl font-bold tracking-wide">ABB Chatbot</span>
          </div>
          <p className="text-sm text-white/80">
            &copy; {new Date().getFullYear()} ABB Industrial Automation. All rights reserved.
          </p>
        </div>
        {/* Additional luxury content below footer */}
        <div className="max-w-3xl mx-auto mt-8 px-4 text-center">
          <div className="bg-white/80 rounded-2xl shadow-lg p-8 border-0">
            <h3 className="text-2xl font-bold text-[#E2001A] mb-4">Why Choose ABB Chatbot?</h3>
            <ul className="space-y-3 text-gray-800 text-lg font-medium">
              <li>
                <span className="inline-block w-3 h-3 bg-[#E2001A] rounded-full mr-2 align-middle"></span>
                <span>Instant answers for industrial automation queries</span>
              </li>
              <li>
                <span className="inline-block w-3 h-3 bg-[#E2001A] rounded-full mr-2 align-middle"></span>
                <span>Luxury-grade UI for a premium experience</span>
              </li>
              <li>
                <span className="inline-block w-3 h-3 bg-[#E2001A] rounded-full mr-2 align-middle"></span>
                <span>Secure authentication powered by ABB and Google</span>
              </li>
              <li>
                <span className="inline-block w-3 h-3 bg-[#E2001A] rounded-full mr-2 align-middle"></span>
                <span>Save and manage your automation knowledge in your library</span>
              </li>
              <li>
                <span className="inline-block w-3 h-3 bg-[#E2001A] rounded-full mr-2 align-middle"></span>
                <span>Responsive design for desktop and mobile</span>
              </li>
            </ul>
            <div className="mt-6">
              <span className="text-[#E2001A] font-semibold">Ready to automate your future?</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
