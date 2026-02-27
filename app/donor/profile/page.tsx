'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { handleLogout as logoutAction, updateUserDataInCookies } from '@/lib/actions/auth-action';
import { getCurrentUser } from '@/lib/actions/auth-action';
import LogoutConfirmationModal from '@/app/components/LogoutConfirmationModal';
import {
  updateDonorProfileAction,
  uploadDonorProfilePhotoAction,
  updateOrganizationProfileAction,
  uploadOrganizationProfilePhotoAction,
} from '@/lib/actions/profile-action';
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
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [userType, setUserType] = useState<'donor' | 'organization' | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Donor profile form data
  const [donorFormData, setDonorFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
  });

  // Organization profile form data
  const [organizationFormData, setOrganizationFormData] = useState({
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
        console.log('User Data:', userData);
        setUser(userData);
        
        // Determine user type
        const uType = userData.userType as 'donor' | 'organization';
        setUserType(uType);
        
        console.log(userData.profilePicture);
        // Load profile picture
        if (userData.profilePicture) {
          let picUrl = userData.profilePicture;
          
          // If not already a full URL, construct it
          if (!picUrl.startsWith('http')) {
            // Remove leading slash if present and ensure proper formatting
            const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
            picUrl = `http://localhost:5000/uploads/profile_pictures/${cleanPath}`;
          }
          console.log('Profile Picture URL:', picUrl);
          
          setProfilePicture(picUrl);
        }
        
        // Initialize form data based on user type
        if (uType === 'donor') {
          setDonorFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phoneNumber || '',
            dateOfBirth: userData.dateOfBirth || '',
            address: userData.address || '',
            bloodGroup: userData.bloodGroup || '',
          });
        } else if (uType === 'organization') {
          setOrganizationFormData({
            organizationName: userData.organizationName || '',
            headOfOrganization: userData.headOfOrganization || '',
            email: userData.email || '',
            phone: userData.phoneNumber || '',
            address: userData.address || '',
          });
        }
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

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (userType === 'donor') {
      setDonorFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (userType === 'organization') {
      setOrganizationFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
    
    setIsSaving(true);
    try {
      let response: any;
      let updatedProfilePicture = user.profilePicture;

      if (userType === 'donor') {
        // Update donor profile
        const updatePayload = {
          fullName: donorFormData.fullName,
          email: donorFormData.email,
          phoneNumber: donorFormData.phone,
          dateOfBirth: donorFormData.dateOfBirth,
          address: donorFormData.address,
          bloodGroup: donorFormData.bloodGroup,
        };

        response = await updateDonorProfileAction(user.id, updatePayload);
        console.log('Profile update response:', response);

        if (response?.success) {
          // If profile picture file is selected, upload it
          if (profilePictureFile) {
            console.log('Uploading profile picture...');
            try {
              const photoResponse = await uploadDonorProfilePhotoAction(profilePictureFile);
              console.log('Photo upload response:', photoResponse);
              
              if (photoResponse?.success && photoResponse?.data?.profilePicture) {
                // Update profile picture from response
                updatedProfilePicture = photoResponse.data.profilePicture;
                console.log('Updated profile picture path:', updatedProfilePicture);
                
                // Construct the URL properly
                let picUrl = updatedProfilePicture;
                
                // If not already a full URL, construct it
                if (!picUrl.startsWith('http')) {
                  // Remove leading slash if present and ensure proper formatting
                  const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
                  picUrl = `http://localhost:5000/uploads/profile_pictures/${cleanPath}`;
                }
                
                console.log('Final profile picture URL:', picUrl);
                // Add timestamp to force refresh
                const urlWithTimestamp = `${picUrl}?t=${Date.now()}`;
                setProfilePicture(urlWithTimestamp);
                toast.success('Profile picture updated successfully');
              } else {
                console.warn('Photo upload response missing data:', photoResponse);
                toast.error('Profile updated but photo upload failed');
              }
            } catch (photoError: any) {
              console.error('Photo upload error:', photoError);
              toast.error(photoError?.message || 'Failed to upload profile picture');
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
            fullName: donorFormData.fullName,
            email: donorFormData.email,
            phoneNumber: donorFormData.phone,
            dateOfBirth: donorFormData.dateOfBirth,
            address: donorFormData.address,
            bloodGroup: donorFormData.bloodGroup,
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
        } else {
          toast.error(response?.message || 'Failed to update profile');
        }
      } else if (userType === 'organization') {
        // Update organization profile
        const updatePayload = {
          organizationName: organizationFormData.organizationName,
          headOfOrganization: organizationFormData.headOfOrganization,
          email: organizationFormData.email,
          phoneNumber: organizationFormData.phone,
          address: organizationFormData.address,
        };

        response = await updateOrganizationProfileAction(user.id, updatePayload);
        console.log('Organization profile update response:', response);

        if (response?.success) {
          // If profile picture file is selected, upload it
          if (profilePictureFile) {
            console.log('Uploading profile picture...');
            try {
              const photoResponse = await uploadOrganizationProfilePhotoAction(profilePictureFile);
              console.log('Photo upload response:', photoResponse);
              
              if (photoResponse?.success && photoResponse?.data?.profilePicture) {
                // Update profile picture from response
                updatedProfilePicture = photoResponse.data.profilePicture;
                console.log('Updated profile picture path:', updatedProfilePicture);
                
                // Construct the URL properly
                let picUrl = updatedProfilePicture;
                
                // If not already a full URL, construct it
                if (!picUrl.startsWith('http')) {
                  // Remove leading slash if present and ensure proper formatting
                  const cleanPath = picUrl.startsWith('/') ? picUrl.substring(1) : picUrl;
                  picUrl = `http://localhost:5000/uploads/profile_pictures/${cleanPath}`;
                }
                
                console.log('Final profile picture URL:', picUrl);
                // Add timestamp to force refresh
                const urlWithTimestamp = `${picUrl}?t=${Date.now()}`;
                setProfilePicture(urlWithTimestamp);
                toast.success('Profile picture updated successfully');
              } else {
                console.warn('Photo upload response missing data:', photoResponse);
                toast.error('Profile updated but photo upload failed');
              }
            } catch (photoError: any) {
              console.error('Photo upload error:', photoError);
              toast.error(photoError?.message || 'Failed to upload profile picture');
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
            organizationName: organizationFormData.organizationName,
            headOfOrganization: organizationFormData.headOfOrganization,
            email: organizationFormData.email,
            phoneNumber: organizationFormData.phone,
            address: organizationFormData.address,
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
        } else {
          toast.error(response?.message || 'Failed to update profile');
        }
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userType === 'donor') {
      // Reset to original donor data
      setDonorFormData({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth || '',
        address: user?.address || '',
        bloodGroup: user?.bloodGroup || '',
      });
    } else if (userType === 'organization') {
      // Reset to original organization data
      setOrganizationFormData({
        organizationName: user?.organizationName || '',
        headOfOrganization: user?.headOfOrganization || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        address: user?.address || '',
      });
    }
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
            {/* Blood Group Badge - Only for Donor */}
            {userType === 'donor' && (
              <div className="absolute top-0 right-0 p-6">
                <span className="px-4 py-2 bg-red-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-red-600/20">
                  {donorFormData.bloodGroup || 'Not Set'}
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 bg-center bg-cover rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-md flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 relative">
                  {profilePicture ? (
                    <Image
                      src={profilePicture}
                      alt="Profile"
                      fill
                      className="object-cover rounded-2xl"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 rounded-2xl">
                      <span className="text-3xl font-bold text-white">
                        {userType === 'donor'
                          ? (user?.fullName || 'U').charAt(0).toUpperCase()
                          : (user?.organizationName || 'O').charAt(0).toUpperCase()}
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
                  <h1 className="text-3xl font-extrabold">
                    {userType === 'donor' ? user?.fullName : user?.organizationName || 'User Profile'}
                  </h1>
                  {userType === 'organization' && user?.headOfOrganization && (
                    <p className="text-slate-600 dark:text-slate-400">Head: {user.headOfOrganization}</p>
                  )}
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <UserIcon size={16} />
                    {userType === 'donor' ? 'Donor ID' : 'Organization ID'}: {user?.id || 'RS-XXXX'}
                  </p>
                </div>

                {/* Profile Completion - Only for Donor */}
                {userType === 'donor' && (
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
                )}
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
                    {userType === 'donor' ? 'Personal Information' : 'Organization Information'}
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
                          disabled={emailError || isSaving}
                          className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm shadow-red-600/20"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
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
                  {/* Donor-specific fields */}
                  {userType === 'donor' && (
                    <>
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Full Name
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-medium mt-1">{donorFormData.fullName}</p>
                        ) : (
                          <input
                            type="text"
                            name="fullName"
                            value={donorFormData.fullName}
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
                          <p className="text-sm font-medium mt-1">{donorFormData.email}</p>
                        ) : (
                          <>
                            <input
                              type="email"
                              name="email"
                              value={donorFormData.email}
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
                          <p className="text-sm font-medium mt-1">{donorFormData.phone}</p>
                        ) : (
                          <input
                            type="tel"
                            name="phone"
                            value={donorFormData.phone}
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
                          <p className="text-sm font-medium mt-1">
                            {donorFormData.dateOfBirth ? formatDate(donorFormData.dateOfBirth) : 'Not set'}
                          </p>
                        ) : (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={donorFormData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                          />
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Address
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-medium mt-1">{donorFormData.address}</p>
                        ) : (
                          <input
                            type="text"
                            name="address"
                            value={donorFormData.address}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                          />
                        )}
                      </div>

                      {/* Blood Group */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Blood Group
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-medium mt-1">
                            <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full font-bold">
                              {donorFormData.bloodGroup || 'Not specified'}
                            </span>
                          </p>
                        ) : (
                          <select
                            name="bloodGroup"
                            value={donorFormData.bloodGroup}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
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
                        )}
                      </div>
                    </>
                  )}

                  {/* Organization-specific fields */}
                  {userType === 'organization' && (
                    <>
                      {/* Organization Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Organization Name
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-medium mt-1">{organizationFormData.organizationName}</p>
                        ) : (
                          <input
                            type="text"
                            name="organizationName"
                            value={organizationFormData.organizationName}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                          />
                        )}
                      </div>

                      {/* Head of Organization */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Head of Organization
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-medium mt-1">{organizationFormData.headOfOrganization}</p>
                        ) : (
                          <input
                            type="text"
                            name="headOfOrganization"
                            value={organizationFormData.headOfOrganization}
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
                          <p className="text-sm font-medium mt-1">{organizationFormData.email}</p>
                        ) : (
                          <>
                            <input
                              type="email"
                              name="email"
                              value={organizationFormData.email}
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
                          <p className="text-sm font-medium mt-1">{organizationFormData.phone}</p>
                        ) : (
                          <input
                            type="tel"
                            name="phone"
                            value={organizationFormData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                          />
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Address
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-medium mt-1">{organizationFormData.address}</p>
                        ) : (
                          <input
                            type="text"
                            name="address"
                            value={organizationFormData.address}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>

           

             
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Achievements Section - Only for Donors */}
              

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
                      router.push(`/forgot-password?userType=${userType}`);
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
      </main>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}