'use client';

/**
 * User Profile Page
 * Allows logged-in donors to view and update their own profile
 * Protected: only logged-in users can access
 * API: GET user from localStorage, PUT /api/auth/:id with FormData
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/api/axios';
import { updateOwnProfile } from '@/lib/api/auth';
import { Upload, X, ArrowLeft, Edit2, Check } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  fullName?: string;
  organizationName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string | null;
  userType: 'donor' | 'organization';
  bloodGroup?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    organizationName: '',
    phoneNumber: '',
    address: '',
    bloodGroup: 'O+',
  });

  // Load user from localStorage and fetch full profile
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
        
        // Set user data
        setUser(parsedUser);
        setFormData({
          fullName: parsedUser.fullName || '',
          organizationName: parsedUser.organizationName || '',
          phoneNumber: parsedUser.phoneNumber || '',
          address: parsedUser.address || '',
          bloodGroup: parsedUser.bloodGroup || 'O+',
        });

        if (parsedUser.profilePicture) {
          setPreviewImage(parsedUser.profilePicture);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error('User ID not found');
      return;
    }

    setIsSaving(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      
      if (user.userType === 'donor') {
        data.append('fullName', formData.fullName);
      } else {
        data.append('organizationName', formData.organizationName);
      }

      if (formData.phoneNumber) data.append('phoneNumber', formData.phoneNumber);
      if (formData.address) data.append('address', formData.address);
      if (formData.bloodGroup) data.append('bloodGroup', formData.bloodGroup);
      if (profileFile) data.append('profilePicture', profileFile);

      // Make API request to update own profile
      const response = await updateOwnProfile(user._id, data);

      toast.success(response.message || 'Profile updated successfully');
      
      // Update localStorage with new user data
      const updatedUser = { ...user, ...formData, profilePicture: previewImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <Link href="/login" className="text-red-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/user/dashboard" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-start gap-6">
            <div>
              {previewImage ? (
                <div className="relative w-32 h-32">
                  <Image
                    src={previewImage}
                    alt="Profile"
                    fill
                    className="object-cover rounded-lg"
                    unoptimized
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setProfileFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-picture"
                  />
                  <label htmlFor="profile-picture" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </label>
                </div>
              </div>
            )}
          </div>

          <hr />

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            {user.userType === 'donor' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter organization name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700"
              />
            </div>

            {/* Blood Group (for donors only) */}
            {user.userType === 'donor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700"
                >
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

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700"
              />
            </div>
          </div>

          <hr />

          {/* Buttons */}
          <div className="flex gap-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                >
                  <Check size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
