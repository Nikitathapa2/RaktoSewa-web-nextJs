"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOTPSchema, VerifyOTPSchemaType } from "../schema";
import { useRouter } from "next/navigation";
import { handleVerifyOTP, handleResendOTP } from "@/lib/actions/auth-action";
import { toast } from "react-hot-toast";
import { ArrowLeft, Clock } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"donor" | "organization">("donor");
  const [canResend, setCanResend] = useState(false);

  // Get email and userType from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    const storedUserType = sessionStorage.getItem("resetUserType");

    if (!storedEmail || !storedUserType) {
      toast.error("Please start from the forgot password page");
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setUserType(storedUserType as "donor" | "organization");
  }, [router]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyOTPSchemaType>({
    resolver: zodResolver(verifyOTPSchema),
  });

  const otpValue = watch("otp");

  const onSubmit = async (data: VerifyOTPSchemaType) => {
    try {
      setIsLoading(true);
      const response = await handleVerifyOTP(email, data.otp, userType);

      if (response.success) {
        toast.success(response.message);
        // Store OTP for reset password step
        sessionStorage.setItem("resetOTP", data.otp);
        // Navigate to reset password page
        router.push("/reset-password");
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      const response = await handleResendOTP(email, userType);

      if (response.success) {
        toast.success(response.message);
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/forgot-password"
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
              alt="OTP verification illustration"
              fill
              className="object-cover"
            />
          </div>

          {/* Right side form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Verify OTP
                </h1>
                <p className="text-gray-600">
                  We've sent a 6-digit code to{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    {...register("otp")}
                    className="w-full px-4 py-3 text-center text-2xl font-bold letter-spacing tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                {/* Timer */}
                {!canResend && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>OTP expires in: <span className="font-mono font-bold">{formatTime(timeLeft)}</span></span>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || !otpValue || otpValue.length !== 6}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? "Resending..." : "Resend OTP"}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Didn't receive the code?{" "}
                      <span className="text-gray-400">You can resend after timer expires</span>
                    </p>
                  )}
                </div>
              </form>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <span className="font-medium">⏰ Note:</span> Your OTP is valid for 10 minutes. If it expires, you can request a new one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
