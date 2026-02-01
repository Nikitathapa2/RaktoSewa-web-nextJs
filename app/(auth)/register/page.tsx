"use client"
import Image from 'next/image';
import RegisterForm from '../_components/RegisterForm';
import Header from '@/app/(public)/_components/Header';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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