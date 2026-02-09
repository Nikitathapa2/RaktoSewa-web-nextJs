'use client';

/**
 * UserForm component
 * Reusable form for creating or editing users
 * Handles FormData for file uploads
 * Submits to POST /api/admin/users (create) or PUT /api/admin/users/:id (edit)
 */

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';
import axiosInstance from '@/lib/api/axios';
import { getProfilePictureUrl } from '@/lib/utils/imageUrl';

interface UserFormProps {
  userId?: string;
  initialData?: {
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
  };
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ userId, initialData, mode, onSuccess, onCancel }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    getProfilePictureUrl(initialData?.profilePicture) || null
  );
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    organizationName: initialData?.organizationName || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
    role: (initialData?.role || 'user') as 'user' | 'admin',
    userType: (initialData?.userType || 'donor') as 'donor' | 'organization',
    phoneNumber: initialData?.phoneNumber || '',
    address: initialData?.address || '',
    bloodGroup: initialData?.bloodGroup || '',
    headOfOrganization: initialData?.headOfOrganization || '',
    dateOfBirth: initialData?.dateOfBirth || '',
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    if (mode === 'create') {
      if (!formData.password) {
        toast.error('Password is required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    if (formData.userType === 'donor' && !formData.fullName) {
      toast.error('Full name is required for donors');
      return;
    }

    if (mode === 'create') {
      if (formData.userType === 'donor' && !formData.bloodGroup) {
        toast.error('Blood group is required for donors');
        return;
      }

      if (formData.userType === 'organization' && !formData.organizationName) {
        toast.error('Organization name is required for organizations');
        return;
      }

      if (formData.userType === 'organization' && !formData.headOfOrganization) {
        toast.error('Head of organization is required');
        return;
      }

      if (formData.userType === 'organization' && !formData.phoneNumber) {
        toast.error('Phone number is required for organizations');
        return;
      }

      if (formData.userType === 'organization' && !formData.address) {
        toast.error('Address is required for organizations');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('email', formData.email);
      data.append('role', formData.role);
      data.append('userType', formData.userType);

      if (mode === 'create') {
        data.append('password', formData.password);
      }

      if (formData.userType === 'donor') {
        data.append('fullName', formData.fullName);
        // In create mode, always send bloodGroup. In edit mode, only send if provided
        if (mode === 'create' || formData.bloodGroup) {
          data.append('bloodGroup', formData.bloodGroup);
        }
        if (formData.dateOfBirth) data.append('dateOfBirth', formData.dateOfBirth);
        if (formData.phoneNumber) data.append('phoneNumber', formData.phoneNumber);
        if (formData.address) data.append('address', formData.address);
      } else {
        data.append('organizationName', formData.organizationName);
        // In create mode, always send. In edit mode, only send if provided
        if (mode === 'create' || formData.headOfOrganization) {
          data.append('headOfOrganization', formData.headOfOrganization);
        }
        data.append('phoneNumber', formData.phoneNumber);
        data.append('address', formData.address);
      }

      if (profileFile) data.append('profilePicture', profileFile);

      // Make API request
      let response;
      if (mode === 'create') {
        const res = await axiosInstance.post('/api/admin/users', data);
        response = res.data;
      } else {
        const res = await axiosInstance.put(`/api/admin/users/${userId}`, data);
        response = res.data;
      }

      toast.success(response.message || 'User saved successfully');
      onSuccess?.();
      // Only navigate if not in modal mode (when onCancel is provided, it's modal mode)
      if (!onCancel) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Container */}
      <div className="space-y-6">
        
        {/* User Type Selection - Create Mode Only */}
        {mode === 'create' && (
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6">
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-3">
              User Type *
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm font-medium transition-colors"
            >
              <option value="donor">👤 Donor</option>
              <option value="organization">🏢 Organization</option>
            </select>
          </div>
        )}

        {/* Name Fields Section */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Personal Information</h3>
          
          {formData.userType === 'donor' ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
              />
            </div>
          )}

          {/* Blood Group for Donors */}
          {formData.userType === 'donor' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                Blood Group *
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm font-medium transition-colors"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          )}

          {/* Date of Birth for Donors */}
          {formData.userType === 'donor' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm transition-colors"
              />
            </div>
          )}

          {/* Head of Organization */}
          {formData.userType === 'organization' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                Head of Organization *
              </label>
              <input
                type="text"
                name="headOfOrganization"
                value={formData.headOfOrganization}
                onChange={handleChange}
                placeholder="Enter head of organization name"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
              />
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Contact Information</h3>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              disabled={mode === 'edit'}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-zinc-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
              Phone Number {formData.userType === 'organization' && '*'}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              required={formData.userType === 'organization'}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
              Address {formData.userType === 'organization' && '*'}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              required={formData.userType === 'organization'}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Access & Security</h3>
          
          {/* Password (only for create) */}
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-sm transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">
              User Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm font-medium transition-colors"
            >
              <option value="user">👤 User</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>
        </div>

        {/* Profile Picture Upload Section */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-4">Profile Picture</h3>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg p-8 text-center hover:border-red-500 dark:hover:border-red-600 transition-colors bg-white dark:bg-zinc-900/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profile-picture"
            />
            <label htmlFor="profile-picture" className="cursor-pointer block">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">PNG, JPG, GIF up to 2MB</p>
            </label>
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-3">Preview</p>
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-red-600/20">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setProfileFile(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-zinc-700">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? '➕ Create User' : '✏️ Update User'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          }}
          className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
