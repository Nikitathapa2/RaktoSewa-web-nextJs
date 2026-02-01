'use client';

/**
 * Edit User Page
 * Form to edit user details
 * Protected: only admins can access
 * API: GET /api/admin/users/:id, PUT /api/admin/users/:id with FormData
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserForm } from '@/app/components/UserForm';
import axiosInstance from '@/lib/api/axios';

interface UserDetail {
  _id: string;
  fullName?: string;
  organizationName?: string;
  email: string;
  role: 'user' | 'admin';
  userType: 'donor' | 'organization';
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  bloodGroup?: string;
  headOfOrganization?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditUserPage() {
  // Protect route - only admins can access
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authorization on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchUser();
    }
  }, [userId, isAuthorized]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/admin/users/${userId}`);
      setUser(response.data.data || null);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="flex items-center text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Users
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">User not found</p>
          <p className="text-red-600 mt-2">
            The user you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/admin/users/${userId}`}
        className="flex items-center text-blue-600 hover:text-blue-700 font-semibold"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to User Details
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-1">
          Update information for {user.fullName || user.organizationName || user.email}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-8">
        <UserForm mode="edit" userId={userId} initialData={user} />
      </div>
    </div>
  );
}
