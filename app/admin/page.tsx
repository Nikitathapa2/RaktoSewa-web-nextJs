'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import AdminSideBar from './_components/Sidebar';
import {
  BellIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  UsersIcon,
  CalendarIcon,
  CubeIcon,
  ChartBarIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getProfilePictureUrl } from '@/lib/utils/imageUrl';
import { getAllUsers } from '@/lib/api/admin/user';
import { handleLogout as handleLogoutServer } from '@/lib/actions/auth-action';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [donorCount, setDonorCount] = useState(0);

  // Check authorization on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }
      setCurrentUser(userData);
    } catch {
      router.push('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  // Fetch users and calculate donor count
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchUsersData = async () => {
      try {
        const response = await getAllUsers();
        if (response.success && response.data) {
          // Filter donors (users with userType === 'donor')
          const donors = response.data.filter((user: any) => user.userType === 'donor');
          setDonorCount(donors.length);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsersData();
  }, [isAuthorized]);

  const handleLogout = async () => {
    
      await handleLogoutServer();
    toast.success('Logged out successfully');
  };

  if (!isAuthorized) {
    return null;
  }

  const stats = [
    { icon: <UsersIcon className="w-8 h-8" />, label: 'Total Donors', value: donorCount.toString(), color: 'red' },
    { icon: <CalendarIcon className="w-8 h-8" />, label: 'Ongoing Camps', value: '12', color: 'blue' },
    { icon: <CubeIcon className="w-8 h-8" />, label: 'Blood Units', value: '1,248', color: 'purple' },
    { icon: <HeartIcon className="w-8 h-8" />, label: 'Lives Saved', value: '3,892', color: 'green' },
  ];

  const navItems = [
    { label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" />, active: true, href: '/admin' },
    { label: 'User Management', icon: <UsersIcon className="w-5 h-5" />, href: '/admin/users' },
    { label: 'Appointments', icon: <CalendarIcon className="w-5 h-5" />, href: '/admin/appointments' },
    { label: 'Inventory', icon: <CubeIcon className="w-5 h-5" />, href: '/admin/inventory' },
    { label: 'Reports', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin/reports' },
  ];

  return (
    <>
      <Head>
        <title>Raktosewa Admin Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
        <div className="flex h-screen overflow-hidden">

          {/* Sidebar */}
          <AdminSideBar navItems={navItems} onLogout={handleLogout} />

          {/* Main */}
          <main className="flex-1 flex flex-col overflow-hidden">

            {/* Header */}
            <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input
                    className="w-full rounded-xl border-0 py-2 pl-10 pr-3 text-sm bg-slate-100 dark:bg-zinc-800 placeholder:text-slate-500 focus:ring-2 focus:ring-red-600/20"
                    placeholder="Search data, requests, or activity..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600"></span>
                </button>
                <button className="p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                  <QuestionMarkCircleIcon className="w-6 h-6" />
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 mx-2"></div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold">{currentUser?.fullName || currentUser?.email || 'Admin User'}</p>
                    <p className="text-xs text-slate-500">Super Admin</p>
                  </div>
                  {currentUser?.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(currentUser.profilePicture) || 'https://via.placeholder.com/40?text=A'}
                      alt="Profile"
                      className="size-10 rounded-full object-cover border-2 border-red-600/20"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/40?text=A';
                      }}
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border-2 border-red-600/20">
                      {(currentUser?.fullName || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Dashboard Overview</h2>
              <p className="text-slate-500 dark:text-zinc-400 mb-8">
                Real-time statistics and critical alerts for the Raktosewa network.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                  const colorMap: any = {
                    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                  };

                  return (
                    <div
                      key={stat.label}
                      className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className={`size-14 ${colorMap[stat.color]} rounded-xl flex items-center justify-center mb-4`}>
                        {stat.icon}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity Section */}
              <div className="mt-12">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6">
                  <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-zinc-400">No recent activity yet</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
