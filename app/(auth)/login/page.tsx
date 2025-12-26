"use client"
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginForm from '../_components/LoginForm';
import Header from '@/app/(public)/_components/Header';

export default function LoginPage() {


  return (
    <div className="min-h-screen bg-gray-50">
    <Header/>

      {/* Main Content */}
   <div className="max-w-7xl mx-auto py-12">
  <div className="grid md:grid-cols-2 gap-0">
    {/* Left side image */}
    <div className="relative w-full h-[400px] md:h-[600px] rounded-none overflow-hidden">
      <Image
        src="/images/loginpagebg.png"
        alt="Medical staff drawing blood"
        fill
        className="object-cover"
        priority
      />
    </div>

    {/* Right side form */}
    <div className="flex items-center justify-center">
      <LoginForm />
    </div>
  </div>
</div>

    </div>
  );
}