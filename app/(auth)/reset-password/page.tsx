"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordSchemaType } from "../schema";
import { useRouter } from "next/navigation";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-hot-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userType, setUserType] = useState<"donor" | "organization">("donor");

  // Get email, OTP and userType from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    const storedOTP = sessionStorage.getItem("resetOTP");
    const storedUserType = sessionStorage.getItem("resetUserType");

    if (!storedEmail || !storedOTP || !storedUserType) {
      toast.error("Please verify your OTP first");
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setOtp(storedOTP);
    setUserType(storedUserType as "donor" | "organization");
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    try {
      setIsLoading(true);
      const response = await handleResetPassword(
        email,
        otp,
        data.newPassword,
        data.confirmPassword,
        userType
      );

      if (response.success) {
        toast.success(response.message);
        // Clear sessionStorage
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetOTP");
        sessionStorage.removeItem("resetUserType");
        // Show success message and redirect to login
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/verify-otp"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={20} />
            Back
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
              alt="Reset password illustration"
              fill
              className="object-cover"
            />
          </div>

          {/* Right side form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reset Password
                </h1>
                <p className="text-gray-600">
                  Create a new password for your account. Make sure it's strong and unique.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      {...register("newPassword")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-medium mb-1">Password requirements:</p>
                    <ul className="space-y-1">
                      <li className={newPassword?.length >= 6 ? "text-green-600" : ""}>
                        ✓ At least 6 characters
                      </li>
                      <li className={/[a-z]/.test(newPassword || "") ? "text-green-600" : ""}>
                        ✓ Contains lowercase letters
                      </li>
                      <li className={/[A-Z]/.test(newPassword || "") ? "text-green-600" : ""}>
                        ✓ Contains uppercase letters
                      </li>
                      <li className={/[0-9]/.test(newPassword || "") ? "text-green-600" : ""}>
                        ✓ Contains numbers
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      {...register("confirmPassword")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                  {passwordsMatch && confirmPassword && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={16} />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={isLoading || !passwordsMatch}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </button>

                {/* Back to Login */}
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

              {/* Security Tips */}
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <span className="font-medium">🔒 Security Tip:</span> Use a unique password that's different from your other accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
