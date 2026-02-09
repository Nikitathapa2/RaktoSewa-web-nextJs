'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { handleLogout as logoutAction, updateUserDataInCookies } from '@/lib/actions/auth-action';
import { getCurrentUser } from '@/lib/actions/auth-action';
import axiosInstance from '@/lib/api/axios';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Settings,
  Bell,
  LogOut,
  Edit2,
  Check,
  X,
  Camera,
  Users,
  Droplet,
  Clock,
} from 'lucide-react';

export default function OrganizationProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    website: '',
    bloodBankLicense: '',
    registrationNumber: '',
  });

  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const userData = currentUser.user;
        console.log('Organization Data:', userData);
        setUser(userData);

        // Load profile picture
        if (userData.profilePicture) {
          let picUrl = userData.profilePicture;

          if (!picUrl.startsWith('http')) {
            const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
            picUrl = `http://localhost:5050/public/profile_pictures/${cleanPath}`;
          }
          console.log('Profile Picture URL:', picUrl);

          setProfilePicture(picUrl);
        }

        // Initialize form data with user data
        setFormData({
          organizationName: userData.organizationName || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          postalCode: userData.postalCode || '',
          website: userData.website || '',
          bloodBankLicense: userData.bloodBankLicense || '',
          registrationNumber: userData.registrationNumber || '',
        });
      } catch (error) {
        console.error('Failed to load organization data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      toast.success('Signed out successfully');

      await logoutAction();
    } catch (error: any) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(!emailRegex.test(value));
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (emailError) return;

    try {
      const updatePayload = {
        organizationName: formData.organizationName,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        website: formData.website,
        bloodBankLicense: formData.bloodBankLicense,
        registrationNumber: formData.registrationNumber,
      };

      const response = await axiosInstance.put(`/api/v1/organizations/${user.id}`, updatePayload);
      console.log('Profile update response:', response.data);
      let updatedProfilePicture = user.profilePicture;

      if (response.data.success) {
        if (profilePictureFile) {
          console.log('Uploading profile picture...');
          const photoFormData = new FormData();
          photoFormData.append('profilePicture', profilePictureFile);

          try {
            const photoResponse = await axiosInstance.post(`/api/v1/organizations/upload-photo`, photoFormData);
            console.log('Photo upload response:', photoResponse.data);

            if (photoResponse.data.success && photoResponse.data.data) {
              updatedProfilePicture = photoResponse.data.data.profilePicture;
              console.log('Updated profile picture path:', updatedProfilePicture);

              let picUrl = updatedProfilePicture;

              if (!picUrl.startsWith('http')) {
                const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
                picUrl = `http://localhost:5050/public/profile_pictures/${cleanPath}`;
              }

              console.log('Final profile picture URL:', picUrl);
              const urlWithTimestamp = `${picUrl}?t=${Date.now()}`;
              setProfilePicture(urlWithTimestamp);
              toast.success('Profile picture updated successfully');
            } else {
              console.warn('Photo upload response missing data:', photoResponse.data);
              toast.error('Profile updated but photo upload failed');
            }
          } catch (photoError: any) {
            console.error('Photo upload error:', photoError);
            toast.error(photoError.response?.data?.message || 'Failed to upload profile picture');
          }
        } else {
          toast.success('Profile updated successfully');
        }

        setIsEditing(false);
        setProfilePictureFile(null);

        const updatedUser = {
          ...user,
          organizationName: formData.organizationName,
          email: formData.email,
          phoneNumber: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          website: formData.website,
          bloodBankLicense: formData.bloodBankLicense,
          registrationNumber: formData.registrationNumber,
          profilePicture: updatedProfilePicture,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));

        try {
          await updateUserDataInCookies(updatedUser);
        } catch (error) {
          console.error('Failed to update user data in cookies:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      organizationName: user?.organizationName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postalCode: user?.postalCode || '',
      website: user?.website || '',
      bloodBankLicense: user?.bloodBankLicense || '',
      registrationNumber: user?.registrationNumber || '',
    });
    setEmailError(false);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <span className="px-4 py-2 bg-green-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-600/20">
              {user?.bloodBankLicense ? 'Verified' : 'Pending'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 bg-center bg-cover rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-md flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Organization Profile"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700 rounded-2xl">
                    <span className="text-3xl font-bold text-white">
                      {(user?.organizationName || 'O').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="profilePictureInput"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePictureInput"
                    className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:text-green-600 transition-colors cursor-pointer"
                  >
                    <Camera size={16} />
                  </label>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-extrabold">{user?.organizationName || 'Organization Profile'}</h1>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Building2 size={16} />
                  Org ID: {user?._id || 'ORG-XXXX'}
                </p>
              </div>

              {/* Profile Completion */}
              <div className="max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Profile Completion</span>
                  <span className="text-sm font-bold text-green-600">90%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-600 h-full w-[90%] transition-all" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                  Complete your profile to maximize visibility!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Organization Information Section */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                <h3 className="font-bold flex items-center gap-2">
                  <Building2 size={20} className="text-green-600" />
                  Organization Information
                </h3>
                <div className="flex items-center gap-3">
                  {isEditing && (
                    <>
                      <button
                        onClick={handleCancel}
                        className="text-slate-600 text-sm font-bold hover:text-green-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={emailError}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm shadow-green-600/20"
                      >
                        Save Changes
                      </button>
                    </>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-green-600 text-sm font-bold hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Organization Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Organization Name
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.organizationName}</p>
                  ) : (
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Email
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.email}</p>
                  ) : (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-100 dark:bg-slate-800 border ${
                          emailError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                        } rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none`}
                      />
                      {emailError && <p className="text-xs text-red-600 mt-1">Invalid email address</p>}
                    </>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.phone}</p>
                  ) : (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Website
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.website || 'Not provided'}</p>
                  ) : (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Street Address
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.address}</p>
                  ) : (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    City
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.city}</p>
                  ) : (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    State/Province
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.state}</p>
                  ) : (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* Postal Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Postal Code
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.postalCode}</p>
                  ) : (
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* Blood Bank License */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Blood Bank License Number
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.bloodBankLicense || 'Not provided'}</p>
                  ) : (
                    <input
                      type="text"
                      name="bloodBankLicense"
                      value={formData.bloodBankLicense}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                {/* Registration Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Registration Number
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.registrationNumber || 'Not provided'}</p>
                  ) : (
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Blood Inventory Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-950 rounded-lg">
                  <Droplet size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Blood Units</p>
                  <p className="text-2xl font-bold">240</p>
                </div>
              </div>
            </div>

            {/* Active Donors Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                  <Users size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Active Donors</p>
                  <p className="text-2xl font-bold">1,240</p>
                </div>
              </div>
            </div>

            {/* Last Updated Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <Clock size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Last Updated</p>
                  <p className="text-sm font-bold">Today, 2:30 PM</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors border border-red-200 dark:border-red-900"
            >
              <LogOut size={18} />
              <span className="font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
