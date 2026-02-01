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
      picUrl = `http://localhost:5050/public/profile_pictures${cleanPath}`;
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
                href="/donor/history"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/history')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <History size={20} />
                <p className="text-sm font-medium">Donation History</p>
              </Link>
              <Link
                href="/donor/appointments"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/appointments')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar size={20} />
                <p className="text-sm font-medium">Appointments</p>
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
              <Link
                href="/donor/settings"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive('/donor/settings')
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Settings size={20} />
                <p className="text-sm font-medium">Settings</p>
              </Link>
            </nav>
          </div>

          {/* Schedule Button */}
          <button className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
            Schedule Donation
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <div className="flex-1 max-w-md">
              <label className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-slate-400" />
                <input
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-12 pr-4 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                  placeholder="Search blood camps, hospitals..."
                />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" />
              </button>
              <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <MessageCircle size={20} />
              </button>
            </div>
          </header>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
