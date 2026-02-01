'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { handleLogout as logoutAction, updateUserDataInCookies } from '@/lib/actions/auth-action';
import { getCurrentUser } from '@/lib/actions/auth-action';
import axiosInstance from '@/lib/api/axios';
import {
  Droplet,
  Grid3x3,
  History,
  Calendar,
  User,
  Settings,
  Bell,
  LogOut,
  Edit2,
  Check,
  X,
  Camera,
  AlertCircle,
  Lock,
  Bell as BellIcon,
  Shield,
  User as UserIcon,
  Heart,
  Award,
  Trophy,
  ChevronRight,
} from 'lucide-react';

export default function DonorProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
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
        console.log('User Data:', userData);
        setUser(userData);
        
        console.log(userData.profilePicture);
        // Load profile picture
        if (userData.profilePicture) {
          let picUrl = userData.profilePicture;
          
          // If not already a full URL, construct it
          if (!picUrl.startsWith('http')) {
            // Remove leading slash if present and ensure proper formatting
            const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
            picUrl = `http://localhost:5050/public/profile_pictures/${cleanPath}`;
          }
          console.log('Profile Picture URL:', picUrl);
          
          setProfilePicture(picUrl);
        }
        
        // Initialize form data with user data
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth ?? '',
          gender: userData.gender || '',
          address: userData.address || '',
          bloodGroup: userData.bloodGroup || '',
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      // Clear client-side storage
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      // Show success message
      toast.success('Signed out successfully');

      // Call server action to clear cookies
      await logoutAction();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still redirect even if error
      router.push('/login');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate email
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
      // First, update profile data
      const updatePayload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
      };

      const response = await axiosInstance.put(`/api/v1/donorusers/${user.id}`, updatePayload);
      console.log('Profile update response:', response.data);
      let updatedProfilePicture = user.profilePicture;
      
      if (response.data.success) {
        // If profile picture file is selected, upload it
        if (profilePictureFile) {
          console.log('Uploading profile picture...');
          const photoFormData = new FormData();
          photoFormData.append('profilePicture', profilePictureFile);
          
          try {
            const photoResponse = await axiosInstance.post(`/api/v1/donorusers/upload-photo`, photoFormData);
            console.log('Photo upload response:', photoResponse.data);
            
            if (photoResponse.data.success && photoResponse.data.data) {
              // Update profile picture from response
              updatedProfilePicture = photoResponse.data.data.profilePicture;
              console.log('Updated profile picture path:', updatedProfilePicture);
              
              // Construct the URL properly
              let picUrl = updatedProfilePicture;
              
              // If not already a full URL, construct it
              if (!picUrl.startsWith('http')) {
                // Remove leading slash if present and ensure proper formatting
                const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
                picUrl = `http://localhost:5050/public/profile_pictures/${cleanPath}`;
              }
              
              console.log('Final profile picture URL:', picUrl);
              // Add timestamp to force refresh
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
            // Don't throw, continue with profile update
          }
        } else {
          toast.success('Profile updated successfully');
        }

        setIsEditing(false);
        setProfilePictureFile(null);
        
        // Update local user data
        const updatedUser = {
          ...user,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          bloodGroup: formData.bloodGroup,
          profilePicture: updatedProfilePicture,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Emit custom event to notify other components of user update
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        
        // Also update server-side user data in cookies
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
  // Reset to original user data
  setFormData({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '+977 9841234567', // default if user.phoneNumber is undefined
    dateOfBirth: user?.dateOfBirth || '1992-05-15',
    gender: user?.gender || 'Male',
    address: user?.address || 'Baneshwor, Kathmandu, Nepal',
    bloodGroup: user?.bloodGroup || '',
  });
  setEmailError(false);
  setIsEditing(false);
};

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
     

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
       

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <span className="px-4 py-2 bg-red-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-red-600/20">
                {formData.bloodGroup || 'Not Set'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 bg-center bg-cover rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-md flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-2xl"
                    
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 rounded-2xl">
                      <span className="text-3xl font-bold text-white">
                        {(user?.fullName || 'U').charAt(0).toUpperCase()}
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
                      className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Camera size={16} />
                    </label>
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-extrabold">{user?.fullName || 'User Profile'}</h1>
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <UserIcon size={16} />
                    Donor ID: {user?.id || 'RS-XXXX'}
                  </p>
                </div>

                {/* Profile Completion */}
                <div className="max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Profile Completion</span>
                    <span className="text-sm font-bold text-red-600">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full w-[85%] transition-all" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                    Complete your profile to unlock more achievements!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Section */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <User size={20} className="text-red-600" />
                    Personal Information
                  </h3>
                  <div className="flex items-center gap-3">
                    {isEditing && (
                      <>
                        <button
                          onClick={handleCancel}
                          className="text-slate-600 text-sm font-bold hover:text-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={emailError}
                          className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm shadow-red-600/20"
                        >
                          Save Changes
                        </button>
                      </>
                    )}
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-red-600 text-sm font-bold hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    {!isEditing ? (
                      <p className="text-sm font-medium mt-1">{formData.fullName}</p>
                    ) : (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Email Address
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
                          className={`w-full bg-slate-100 dark:bg-slate-800 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:border-transparent outline-none transition-all ${
                            emailError
                              ? 'border-red-600 focus:ring-red-600'
                              : 'border border-slate-200 dark:border-slate-700 focus:ring-red-600'
                          }`}
                        />
                        {emailError && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Please enter a valid email address
                          </p>
                        )}
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
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Date of Birth
                    </label>
                    {!isEditing ? (
                      <p className="text-sm font-medium mt-1">{formatDate(formData.dateOfBirth)}</p>
                    ) : (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Gender
                    </label>
                    {!isEditing ? (
                      <p className="text-sm font-medium mt-1">{formData.gender}</p>
                    ) : (
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Address
                    </label>
                    {!isEditing ? (
                      <p className="text-sm font-medium mt-1">{formData.address}</p>
                    ) : (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* Medical Information Section */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    Medical Information
                  </h3>
                  <button className="text-red-600 text-sm font-bold hover:underline">Update</button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Weight
                    </label>
                    <p className="text-sm font-medium mt-1">74 kg</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Last Donation Date
                    </label>
                    <p className="text-sm font-medium mt-1">July 12, 2023</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Chronic Illnesses
                    </label>
                    <p className="text-sm font-medium mt-1">None Reported</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Current Medications
                    </label>
                    <p className="text-sm font-medium mt-1">None</p>
                  </div>
                </div>
              </section>

              {/* Donation Preferences Section */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <Heart size={20} className="text-red-600" />
                    Donation Preferences
                  </h3>
                  <button className="text-red-600 text-sm font-bold hover:underline">Edit</button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Frequency of Donation
                    </label>
                    <p className="text-sm font-medium mt-1">Regular (Every 3-4 months)</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                      Preferred Donation Centers
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                        City Central Hospital
                      </span>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                        Nepal Red Cross Society
                      </span>
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                        Teaching Hospital
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Achievements Section */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <Trophy size={20} className="text-red-600" />
                    Achievements
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* First Time Donor */}
                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                        <Trophy size={24} />
                      </div>
                      <p className="text-xs font-bold">First Time Donor</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">Jan 2023</p>
                    </div>

                    {/* Silver Donor */}
                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mb-2">
                        <Award size={24} />
                      </div>
                      <p className="text-xs font-bold">Silver Donor</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">5 Donations</p>
                    </div>

                    {/* Gold Donor (Locked) */}
                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-center opacity-50">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/10 text-orange-400 rounded-full flex items-center justify-center mb-2">
                        <Trophy size={24} />
                      </div>
                      <p className="text-xs font-bold">Gold Donor</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">Locked</p>
                    </div>

                    {/* Life Saver (Locked) */}
                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-center opacity-50">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 text-red-400 rounded-full flex items-center justify-center mb-2">
                        <Heart size={24} />
                      </div>
                      <p className="text-xs font-bold">Life Saver</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">Locked</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account Settings Section */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <Settings size={20} className="text-red-600" />
                    Account Settings
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-sm font-medium">Change Password</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center gap-3">
                      <BellIcon size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-sm font-medium">Notification Settings</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors" />
                      <span className="text-sm font-medium">Privacy & Security</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                  </button>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={handleSignOut}
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
      </main>
    </div>
  );
}