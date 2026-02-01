'use client';

/**
 * Create User Page
 * Form to create a new user
 * Protected: only admins can access
 * API: POST /api/admin/users with FormData (for file upload)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm } from '@/app/components/UserForm';

export default function CreateUserPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

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
    } catch {
      router.push('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-1">
          Add a new donor or organization to the system
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-8">
        <UserForm mode="create" />
      </div>
    </div>
  );
}
