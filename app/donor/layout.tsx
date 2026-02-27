'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth-action';
import {
  Droplet,
  Grid3x3,
  History,
  Calendar,
  User,
  Settings,
  Search,
  Bell,
  MessageCircle,
  Zap,
  Heart,
} from 'lucide-react';

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser.user);
    };
    loadUser();

    // Listen for custom userUpdated event
    const handleUserUpdate = (event: any) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setUser(updatedUser);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, [router]);

  const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return null;
    
    let picUrl = profilePicture;
    if (!picUrl.startsWith('http')) {
      const cleanPath = picUrl.startsWith('/') ? picUrl : `/${picUrl}`;
      picUrl = `http://localhost:5000/uploads/profile_pictures${cleanPath}`;
    }
    return picUrl;
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen`}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6">
          <div className="flex flex-col gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-red-600">
             <div className="w-9 h-9 relative">
                         <Image
                           src="/images/logo.png"
                           alt="Rakto Sewa Logo"
                           fill
                           className="object-contain"
                           priority
                         />
                       </div>
              <h2 className="text-xl font-bold tracking-tight">Raktosewa</h2>
            </Link>

            {/* Profile Brief */}
            <div className="flex gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div
                className="w-12 h-12 bg-center bg-cover rounded-full border-2 border-red-600 flex-shrink-0 bg-gray-300 flex items-center justify-center"
                style={getProfilePictureUrl(user?.profilePicture) ? {
                  backgroundImage: `url("${getProfilePictureUrl(user?.profilePicture)}")`,
                  backgroundSize: 'cover',
                } : {}}
              >
                {!getProfilePictureUrl(user?.profilePicture) && (
                  <span className="text-gray-600 font-bold text-sm">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-sm font-bold truncate">{user?.fullName || 'Loading...'}</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {user?.email || 'Donor'}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/donor/dashboard"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive('/donor/dashboard')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Grid3x3 size={20} />
                <p className="text-sm font-bold">Dashboard</p>
              </Link>
            
              <Link
                href="/donor/campaigns"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/campaigns')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Zap size={20} />
                <p className="text-sm font-medium">Campaigns</p>
              </Link>
              <Link
                href="/donor/blood-requests"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/blood-requests')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Droplet size={20} />
                <p className="text-sm font-medium">Blood Requests</p>
              </Link>
              <Link
                href="/donor/blood-donation"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/blood-donation')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Heart size={20} />
                <p className="text-sm font-medium">Blood Donation</p>
              </Link>
              <Link
                href="/donor/blood-inventory"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/blood-inventory')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <History size={20} />
                <p className="text-sm font-medium">Blood Inventory</p>
              </Link>
             
              <Link
                href="/donor/profile"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/profile')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <User size={20} />
                <p className="text-sm font-medium">Profile</p>
              </Link>
            
            </nav>
          </div>

          {/* Schedule Button */}
       
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
      

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
