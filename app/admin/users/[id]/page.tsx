'use client';

/**
 * User Detail Page
 * Displays user information
 * Protected: only admins can access
 * API: GET /api/admin/users/:id
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/api/axios';
import { getProfilePictureUrl } from '@/lib/utils/imageUrl';

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
  createdAt?: string;
  updatedAt?: string;
}

export default function UserDetailPage() {
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
    if (!isAuthorized) {
      return null; // Will redirect via useEffect
    }

    const response = await axiosInstance.get(`/api/admin/users/${userId}`);
    setUser(response.data.data || null);

  } catch (error) {
    console.error('Failed to fetch user:', error);
    toast.error('Failed to load user details');

    // Dummy data for demonstration
    setUser({
      _id: userId,
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      userType: 'donor',
      phoneNumber: '+1234567890',
      address: '123 Main Street, City',
      createdAt: '2024-01-15',
    });

  } finally {
    setIsLoading(false);
  }
};


  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="text-gray-600 mt-4">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
        <Link
          href="/admin/users"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.fullName || user.organizationName || 'User'}
            </h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/users/${user._id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={18} />
            Edit
          </Link>
        </div>
      </div>

      {/* User Details Card */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg text-gray-900 font-semibold">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">User Type</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  user.userType === 'donor'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {user.userType}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600">Role</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  user.role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.role}
              </span>
            </div>

            {user.phoneNumber && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-lg text-gray-900">{user.phoneNumber}</p>
              </div>
            )}

            {user.address && (
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-lg text-gray-900">{user.address}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {user.profilePicture && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Profile Picture</p>
                <img
                  src={getProfilePictureUrl(user.profilePicture) || ''}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                  }}
                />
              </div>
            )}

            {user.createdAt && (
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-lg text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {user.updatedAt && (
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
