'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  UsersIcon,
  CalendarIcon,
  CubeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import AdminSideBar from '../_components/Sidebar';
import { handleLogout as handleLogoutServer } from '@/lib/actions/auth-action';
import { getAdminProfile, changeAdminPassword } from '@/lib/api/admin/profile';

interface AdminProfile {
  _id: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsAuthorized(true);
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchProfile();
    }
  }, [isAuthorized]);

  const fetchProfile = async () => {
    setIsPageLoading(true);
    try {
      const response = await getAdminProfile();
      setProfile(response?.data || null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleLogout = async () => {
    await handleLogoutServer();
    toast.success('Logged out successfully');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('All password fields are required');
      return false;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await changeAdminPassword(formData);
      toast.success(response?.message || 'Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin' },
    { label: 'User Management', icon: <UsersIcon className="w-5 h-5" />, href: '/admin/users' },
    { label: 'Campaign Management', icon: <MegaphoneIcon className="w-5 h-5" />, href: '/admin/campaigns' },
    { label: 'Appointments', icon: <CalendarIcon className="w-5 h-5" />, href: '/admin/appointments' },
    { label: 'Inventory', icon: <CubeIcon className="w-5 h-5" />, href: '/admin/inventory' },
    { label: 'Reports', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin/reports' },
    { label: 'Profile', icon: <UserCircleIcon className="w-5 h-5" />, href: '/admin/profile', active: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <AdminSideBar navItems={navItems} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                className="w-full rounded-xl border-0 py-2 pl-10 pr-3 text-sm bg-slate-100 dark:bg-zinc-800 placeholder:text-slate-500 focus:ring-2 focus:ring-red-600/20"
                placeholder="Search..."
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
              <div className="size-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border-2 border-red-600/20">
                {(currentUser?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-slate-500">Dashboard</span>
            <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Profile</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Admin Profile</h2>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">
              View your account details and update your password.
            </p>
          </div>

          {isPageLoading ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="text-gray-600 mt-4">Loading profile...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(profile?.email || currentUser?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Admin Account</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Profile Information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 break-all">{profile?.email || currentUser?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Role</p>
                    <span className="inline-flex mt-1 items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {profile?.role || 'admin'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Admin ID</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 break-all">{profile?._id || currentUser?._id || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Created</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Change Password</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors disabled:opacity-70"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors disabled:opacity-70"
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors disabled:opacity-70"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      Password must be at least 6 characters and different from your current password.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
