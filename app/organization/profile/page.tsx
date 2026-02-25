'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { handleLogout as logoutAction, updateUserDataInCookies } from '@/lib/actions/auth-action';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { updateOrganizationProfileAction, uploadOrganizationPhotoAction } from '@/lib/actions/organization-action';
import LogoutConfirmationModal from '@/app/components/LogoutConfirmationModal';
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
  Lock,
  ChevronRight,
} from 'lucide-react';

export default function OrganizationProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    headOfOrganization: '',
    email: '',
    phone: '',
    address: '',
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
            picUrl = `http://localhost:5000/uploads/profile_pictures/${cleanPath}`;
          }
          console.log('Profile Picture URL:', picUrl);

          setProfilePicture(picUrl);
        }

        // Initialize form data with user data
        setFormData({
          organizationName: userData.organizationName || '',
          headOfOrganization: userData.headOfOrganization || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          address: userData.address || '',
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

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
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
        headOfOrganization: formData.headOfOrganization,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
      };

      // Update profile using server action
      const profileResponse = await updateOrganizationProfileAction(user.id, updatePayload);
      console.log('Profile update response:', profileResponse);

      if (profileResponse.success) {
        // Handle profile picture upload if changed
        if (profilePictureFile) {
          console.log('Uploading profile picture...');
          const photoFormData = new FormData();
          photoFormData.append('profilePicture', profilePictureFile);

          const photoResponse = await uploadOrganizationPhotoAction(photoFormData);
          console.log('Photo upload response:', photoResponse);

          if (photoResponse.success && photoResponse.data) {
            const updatedProfilePicture = photoResponse.data.profilePicture;
            console.log('Updated profile picture path:', updatedProfilePicture);

            let picUrl = updatedProfilePicture;

            if (!picUrl.startsWith('http')) {
              const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
              picUrl = `http://localhost:5000/uploads/profile_pictures/${cleanPath}`;
            }

            console.log('Final profile picture URL:', picUrl);
            const urlWithTimestamp = `${picUrl}?t=${Date.now()}`;
            setProfilePicture(urlWithTimestamp);
            toast.success('Profile picture updated successfully');
          } else {
            console.warn('Photo upload response missing data:', photoResponse);
            toast.error('Profile updated but photo upload failed');
          }
        } else {
          toast.success('Profile updated successfully');
        }

        setIsEditing(false);
        setProfilePictureFile(null);

        // Reload user data to ensure everything is in sync
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser.user);
        }
      } else {
        toast.error(profileResponse.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      organizationName: user?.organizationName || '',
      headOfOrganization: user?.headOfOrganization || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      address: user?.address || '',
    });
    setEmailError(false);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 bg-center bg-cover rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-md flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 relative">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt="Organization Profile"
                    fill
                    className="object-cover rounded-2xl"
                    unoptimized
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

                {/* Head of Organization */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Head of Organization
                  </label>
                  {!isEditing ? (
                    <p className="text-sm font-medium mt-1">{formData.headOfOrganization}</p>
                  ) : (
                    <input
                      type="text"
                      name="headOfOrganization"
                      value={formData.headOfOrganization}
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
              </div>
            </section>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Blood Inventory Card */}
          

            {/* Active Donors Card */}
         

             {/* Account Settings Section */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <Settings size={20} className="text-red-600" />
                    Account Settings
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <button 
                    onClick={async () => {
                      await handleSignOut();
                      router.push(`/forgot-password?userType=organization`);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-sm font-medium">Change Password</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                  </button>

               

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={handleSignOutClick}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-bold">Sign Out</span>
                    </button>
                  </div>
                </div>
              </section>
        
          </div>
        </div>
      </div>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
