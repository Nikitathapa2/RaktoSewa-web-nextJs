'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getProfilePictureUrl } from '@/lib/utils/imageUrl';
import {
  Heart,
  TrendingUp,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

export default function DonorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser.user);
      console.log("user from dahsbaord:", currentUser.user);
      setLoading(false);
    };
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Profile Header */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 w-full">
                <div
                  className="w-24 h-24 bg-center bg-cover rounded-full border-4 border-slate-100 dark:border-slate-800 flex-shrink-0 flex items-center justify-center bg-gray-300"
                  style={getProfilePictureUrl(user?.profilePicture) ? {
                    backgroundImage: `url("${getProfilePictureUrl(user?.profilePicture)}")`,
                    backgroundSize: 'cover',
                  } : {}}
                >
                  {!getProfilePictureUrl(user?.profilePicture) && (
                    <span className="text-gray-700 font-bold text-2xl">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Welcome back, {user?.fullName || 'Donor'}!</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                      Blood Type: {user?.bloodGroup || 'O+'}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                      <Calendar size={14} /> Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2023'}
                    </span>
                  </div>
                </div>
              </div>
             
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Total Donations</p>
                  <Heart size={20} className="text-red-600" />
                </div>
                <p className="text-4xl font-bold">5</p>
                <p className="text-green-600 text-sm font-semibold flex items-center gap-1">
                  <TrendingUp size={16} /> +1 this year
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Lives Saved</p>
                  <Heart size={20} className="text-red-600 fill-red-600" />
                </div>
                <p className="text-4xl font-bold">15</p>
                <p className="text-green-600 text-sm font-semibold flex items-center gap-1">
                  <TrendingUp size={16} /> +3 estimated
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Next Eligibility</p>
                  <Clock size={20} className="text-red-600" />
                </div>
                <p className="text-4xl font-bold">Oct 12</p>
                <p className="text-red-600 text-sm font-semibold">14 days left</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-8">
                {/* Calendar */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Donation Calendar</h3>
                    <div className="flex gap-2 items-center">
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition">
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-bold min-w-32 text-center">October 2023</span>
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-4">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        24, 25, 26, 27, 28, 29, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                        19, 20, 21,
                      ].map((day, idx) => (
                        <div
                          key={idx}
                          className={`aspect-square flex items-center justify-center font-medium rounded-lg ${
                            day < 10
                              ? 'text-slate-400'
                              : day === 3
                                ? 'bg-red-100 dark:bg-red-950 text-red-600 ring-2 ring-red-600'
                                : day === 12
                                  ? 'bg-red-600 text-white font-bold'
                                  : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full" />
                        Next Eligibility
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-200 dark:bg-red-950 rounded-full ring-1 ring-red-600" />
                        Previous Donation
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Upcoming Appointments</h3>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                        <MapPin size={20} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold">City Central Hospital</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Oct 15, 2023 • 10:30 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        Reschedule
                      </button>
                      <button className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Urgent Blood Needs */}
                <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-xl space-y-4 relative overflow-hidden border border-slate-800">
                  <div className="absolute -right-4 -top-4 text-red-600/10">
                    <AlertCircle size={120} />
                  </div>
                  <h3 className="text-lg font-bold relative z-10">Urgent Blood Needs</h3>
                  <p className="text-sm text-slate-300 relative z-10">Critical demand in your area (Kathmandu)</p>

                  <div className="space-y-3 relative z-10">
                    <div className="bg-red-600/20 border border-red-600/30 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white">
                          B-
                        </div>
                        <div>
                          <p className="text-sm font-bold">Red Cross Center</p>
                          <p className="text-xs text-slate-300">2.4 km away</p>
                        </div>
                      </div>
                      <AlertTriangle size={16} className="text-red-400" />
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white">
                          O-
                        </div>
                        <div>
                          <p className="text-sm font-bold">Model Hospital</p>
                          <p className="text-xs text-slate-300">5.1 km away</p>
                        </div>
                      </div>
                      <AlertCircle size={16} className="text-yellow-400" />
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-white">
                          AB+
                        </div>
                        <div>
                          <p className="text-sm font-bold">Teaching Hospital</p>
                          <p className="text-xs text-slate-300">3.8 km away</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors mt-4">
                    View All Emergency Needs
                  </button>
                </div>

                {/* Map Preview */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div
                    className="h-40 bg-slate-300 relative"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDA9KSyII2qroLPOgb5odaP_hg1lJCB57fJjCpRqYTt4s27c5NRPwW4DdijDAY2DatfCuzPlTwnC-LnY1XiK2Heg30MFvE3yxVmg5gJ904sgNzOZCrxzr0zBm34ms9x54U_J6iWb8SDcZrMYDNS3TM122izSjAmQ2kmJn-AaTJxtShSuGpDhqkGAd9jrsxPvIhmCjFixrDa2fF5HaDWN4tW-61Hm9yjAExKqiPdSxtYEZUKGxnv4gAXaiomS66XO91vOcpNBQMqBppu")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-white animate-pulse" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm">Nearby Donation Camps</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">4 active camps found today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      
  );
}