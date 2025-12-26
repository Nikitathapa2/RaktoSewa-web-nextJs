"use client"
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RegisterForm from '../_components/RegisterForm';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bloodGroup: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('donor'); // 'donor' or 'recipient'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add registration logic here
    console.log('Registration submitted', { ...formData, userType });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold">
                Rakto<span className="font-normal">Sewa</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900">
                About Us
              </Link>
              <Link href="/donate" className="text-gray-700 hover:text-gray-900">
                Donate
              </Link>
              <div className="relative">
                <button className="text-gray-700 hover:text-gray-900 flex items-center">
                  Register Now
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <Link href="/login" className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Side - Image */}
          <div className="relative h-[800px] rounded-2xl overflow-hidden bg-gray-200 sticky top-8">
            <Image
              src="/images/regitserpage.png"
              alt="Blood donation concept"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Side - Registration Form */}
         <RegisterForm/>
        </div>
      </div>
    </div>
  );
}