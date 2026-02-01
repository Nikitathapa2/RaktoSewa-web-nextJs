"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "../schema";
import { useRouter } from "next/navigation";
import { handleLogin } from "@/lib/actions/auth-action";
import { toast } from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const [userType, setUserType] = useState<"donor" | "organization">("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      setIsLoading(true);
      const response = await handleLogin(data, userType);
      console.log("Login response:", response);
      console.log("Response data:", response?.data);
      
      if (response && response.success) {
        toast.success(response.message || "Login successful!");
        
        // The response structure is: response.data contains the full API response
        // which has { success, message, token, data: { user object } }
        const apiResponse = response.data;
        
        if (apiResponse && apiResponse.data) {
          // Store user data and token in localStorage
          localStorage.setItem('user', JSON.stringify(apiResponse.data));
          localStorage.setItem('auth_token', apiResponse.token);
          
          const user = apiResponse.data;
          console.log("User data:", user);
          console.log("User role:", user.role);
          console.log("User type:", user.userType);
          
          // Redirect based on role and userType
          if (user.role === 'admin') {
            console.log("Redirecting to /admin");
            router.push('/admin');
          } else if (user.userType === 'donor') {
            console.log("Redirecting to /donor/dashboard");
            router.push('/donor/dashboard');
          } else if (user.userType === 'organization') {
            console.log("Redirecting to /organization/dashboard");
            router.push('/organization/dashboard');
          } else {
            console.log("Redirecting to /");
            router.push('/');
          }
        } else {
          console.log("No user data, redirecting to /");
          router.push('/');
        }
      } else {
        toast.error(response?.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="max-w-md mx-auto w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Login to Raktosewa
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome back! Please enter your details
      </p>

      {/* User Type Selection */}
      <div className="flex gap-4 p-1 bg-gray-100 rounded-lg mb-4">
        <button
          type="button"
          onClick={() => setUserType("donor")}
          className={`flex-1 py-2.5 rounded-md font-medium transition ${
            userType === "donor" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Blood Donor
        </button>
        <button
          type="button"
          onClick={() => setUserType("organization")}
          className={`flex-1 py-2.5 rounded-md font-medium transition ${
            userType === "organization" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
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
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-red-600 hover:text-red-700 font-medium">
            Register here
          </Link>
        </p>
      </form>
    </div>
    </>
  );
}
  