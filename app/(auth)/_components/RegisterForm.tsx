"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchemaType } from "../schema";
import Link from "next/link";

export default function RegisterForm() {
  const [userType, setUserType] = useState<"donor" | "organization">("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    unregister,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userType: "donor", terms: false },
  });

  // Unregister fields not relevant for current userType
  useEffect(() => {
    if (userType === "donor") {
      unregister(["organizationName", "headOfOrganization"]);
    } else {
      unregister(["fullName", "bloodGroup", "dateOfBirth"]);
    }
  }, [userType, unregister]);

  const onSubmit = (data: RegisterSchemaType) => {
    console.log("Register submitted", data);
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Register to Raktosewa</h1>
      <p className="text-gray-600 mb-8">Join our community and help save lives</p>

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

      {/* Hidden input to sync userType with schema */}
      <input type="hidden" {...register("userType")} value={userType} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Donor Fields */}
        {userType === "donor" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                {...register("fullName")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
              />
         
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  {...register("bloodGroup")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
          
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                />
           
              </div>
            </div>
          </>
        )}

        {/* Organization Fields */}
        {userType === "organization" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
              <input
                type="text"
                placeholder="Enter organization name"
                {...register("organizationName")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
              />
            
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Head of Organization</label>
              <input
                type="text"
                placeholder="Enter head of organization"
                {...register("headOfOrganization")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
              />
         
            </div>
          </>
        )}

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
          />
          {errors.email?.message && <p className="text-red-600 text-sm">{errors.email?.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            {...register("phoneNumber")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
          />
          {errors.phoneNumber?.message && (
            <p className="text-red-600 text-sm">{errors.phoneNumber?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            placeholder="Enter your address"
            {...register("address")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
          />
          {errors.address?.message && <p className="text-red-600 text-sm">{errors.address?.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              {...register("password")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "👁" : "🙈"}
            </button>
          </div>
          {errors.password?.message && <p className="text-red-600 text-sm">{errors.password?.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? "👁" : "🙈"}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-red-600 text-sm">{errors.confirmPassword?.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start">
          <input
            type="checkbox"
            {...register("terms")}
            className="w-4 h-4 mt-1 text-red-600 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <Link href="/terms" className="text-red-600 hover:text-red-700">Terms</Link> and{' '}
            <Link href="/privacy" className="text-red-600 hover:text-red-700">Privacy Policy</Link>
          </label>
          {errors.terms?.message && <p className="text-red-600 text-sm">{errors.terms?.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Register Now
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">Log in here</Link>
        </p>
      </form>
    </div>
  );
}
