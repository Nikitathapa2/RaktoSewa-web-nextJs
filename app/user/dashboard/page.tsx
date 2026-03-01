'use client';

/**
 * User Dashboard Page
 * Homepage for logged-in donors
 * Shows user information and quick actions
 * Protected: only logged-in users can access
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Droplet, User, Heart, History, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleLogout as logoutAction } from '@/lib/actions/auth-action';

interface UserData {
  _id: string;
  fullName?: string;
  organizationName?: string;
  email: string;
  userType: 'donor' | 'organization';
  bloodGroup?: string;
  profilePicture?: string;
  createdAt?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        
        // Check if user is a donor
        if (parsedUser.userType !== 'donor') {
          router.push('/');
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Clear client-side storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      toast.success('Logged out successfully');

      // Call server action to clear cookies
      await logoutAction();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still redirect even if error
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome, {user.fullName || user.organizationName}! 👋
            </h1>
            <p className="text-gray-600 mt-2">Donor Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Blood Group Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Blood Group</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {user.bloodGroup || 'N/A'}
                </p>
              </div>
              <Droplet size={48} className="text-red-600 opacity-30" />
            </div>
          </div>

          {/* Donations Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Donations</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">0</p>
              </div>
              <Heart size={48} className="text-blue-600 opacity-30" />
            </div>
          </div>

          {/* Last Donation Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Last Donation</p>
                <p className="text-lg font-semibold text-green-600 mt-2">Never</p>
              </div>
              <History size={48} className="text-green-600 opacity-30" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Edit Profile */}
          <Link
            href="/user/profile"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition border-l-4 border-blue-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                <p className="text-gray-600 mt-2">Update your personal information</p>
              </div>
              <User size={32} className="text-blue-600" />
            </div>
          </Link>

          {/* Donation History */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-600 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Donation History</h3>
                <p className="text-gray-600 mt-2">View your past donations (Coming Soon)</p>
              </div>
              <History size={32} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="text-center py-12">
            <p className="text-gray-600">No activity yet</p>
            <p className="text-sm text-gray-500 mt-2">Your donations will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
