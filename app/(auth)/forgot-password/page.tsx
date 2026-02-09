"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordSchemaType } from "../schema";
import { useRouter, useSearchParams } from "next/navigation";
import { handleForgotPassword } from "@/lib/actions/auth-action";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"donor" | "organization">("donor");

  // Get userType from URL params if available
  useEffect(() => {
    const paramUserType = searchParams.get("userType");
    if (paramUserType === "donor" || paramUserType === "organization") {
      setUserType(paramUserType);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      userType: userType,
    },
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    try {
      setIsLoading(true);
      const response = await handleForgotPassword(data.email, data.userType);

      if (response.success) {
        toast.success(response.message);
        // Store email and userType in sessionStorage for next step
        sessionStorage.setItem("resetEmail", data.email);
        sessionStorage.setItem("resetUserType", data.userType);
        // Navigate to OTP verification page
        router.push("/verify-otp");
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left side image */}
          <div className="relative w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden hidden md:block">
            <Image
              src="/images/loginpagebg.png"
              alt="Password reset illustration"
              fill
              className="object-cover"
            />
          </div>

          {/* Right side form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you an OTP to reset your password.
                </p>
              </div>

              {/* User Type Selection */}
              <div className="flex gap-4 p-1 bg-gray-100 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setUserType("donor")}
                  className={`flex-1 py-2.5 rounded-md font-medium transition ${
                    userType === "donor"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Blood Donor
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("organization")}
                  className={`flex-1 py-2.5 rounded-md font-medium transition ${
                    userType === "organization"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Organization
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Send OTP Button */}
                <button
                  type="submit"
                  {...register("userType")}
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>

                {/* Back to Login Link */}
                <p className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Back to login
                  </Link>
                </p>
              </form>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">💡 Tip:</span> We'll send an OTP to your registered email address. Check your spam folder if you don't see it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
