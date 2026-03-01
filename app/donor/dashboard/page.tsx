'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getProfilePictureUrl, getCampaignImageUrl } from '@/lib/utils/imageUrl';
import { handleGetCampaignsByMonth } from '@/lib/actions/donor/campaign-action';
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
  Loader,
} from 'lucide-react';
import NotificationDropdown from '@/app/components/NotificationDropdown';

interface CampaignForCalendar {
  _id: string;
  title: string;
  date: string;
  location: string;
  imageName?: string;
  organization?: {
    organizationName: string;
  };
}

export default function DonorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [campaigns, setCampaigns] = useState<CampaignForCalendar[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [campaignsByDate, setCampaignsByDate] = useState<Record<string, CampaignForCalendar[]>>({});

  const loadCampaigns = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const result = await handleGetCampaignsByMonth(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
        100
      );

      if (result.success && result.data) {
        const campaignList = result.data.data ?? result.data.campaigns ?? [];
        setCampaigns(campaignList);

        // Group campaigns by date (YYYY-MM-DD format)
        const grouped: Record<string, CampaignForCalendar[]> = {};
        campaignList.forEach((campaign: CampaignForCalendar) => {
          const dateKey = new Date(campaign.date).toISOString().split('T')[0];
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(campaign);
        });
        setCampaignsByDate(grouped);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaigns([]);
      setCampaignsByDate({});
    } finally {
      setCalendarLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser.user);
      setLoading(false);
    };
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      loadCampaigns();
    }
  }, [loading, user, currentDate, loadCampaigns]);

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
    <>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-end">
        <NotificationDropdown />
      </header>

      <div className="p-8 space-y-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 w-full">
               
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

          
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-8">
            {/* Calendar */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Campaign Calendar</h3>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-bold min-w-32 text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {calendarLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Loader size={20} className="animate-spin" />
                          <span>Loading campaigns...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-4">
                          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                            <div key={day}>{day}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {(() => {
                            const year = currentDate.getFullYear();
                            const month = currentDate.getMonth();
                            const firstDay = new Date(year, month, 1);
                            const lastDay = new Date(year, month + 1, 0);
                            const prevLastDay = new Date(year, month, 0).getDate();
                            const days: { date: number; isCurrentMonth: boolean; }[] = [];

                            // Previous month's days
                            for (let i = firstDay.getDay() - 1; i >= 0; i--) {
                              days.push({ date: prevLastDay - i, isCurrentMonth: false });
                            }

                            // Current month's days
                            for (let i = 1; i <= lastDay.getDate(); i++) {
                              days.push({ date: i, isCurrentMonth: true });
                            }

                            // Next month's days
                            const totalCells = Math.ceil(days.length / 7) * 7;
                            for (let i = 1; i <= totalCells - days.length; i++) {
                              days.push({ date: i, isCurrentMonth: false });
                            }

                            return days.map((day, idx) => {
                              const cellDate = new Date(year, month, day.date);
                              if (!day.isCurrentMonth) {
                                if (days[idx - 1]?.isCurrentMonth) {
                                  cellDate.setMonth(month + 1);
                                } else {
                                  cellDate.setMonth(month - 1);
                                }
                              }

                              const dateKey = cellDate.toISOString().split('T')[0];
                              const dayCampaigns = campaignsByDate[dateKey] || [];
                              const hasMultipleCampaigns = dayCampaigns.length > 1;

                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (dayCampaigns.length > 0 && day.isCurrentMonth) {
                                      router.push(`/donor/campaigns?date=${dateKey}`);
                                    }
                                  }}
                                  className={`aspect-square flex flex-col items-center justify-center font-medium rounded-lg cursor-pointer transition ${
                                    !day.isCurrentMonth
                                      ? 'text-slate-400'
                                      : dayCampaigns.length > 0
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="text-sm">{day.date}</span>
                                  {dayCampaigns.length > 0 && (
                                    <span className={`text-xs font-bold ${day.isCurrentMonth ? 'text-white' : 'text-red-600'}`}>
                                      {dayCampaigns.length} {dayCampaigns.length === 1 ? 'campaign' : 'campaigns'}
                                    </span>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                        <div className="mt-6 flex gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-600 rounded-full" />
                            Active Campaigns
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} 
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Campaigns */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Upcoming Campaigns</h3>
                  {campaigns.length > 0 ? (
                    campaigns.slice(0, 3).map((campaign) => (
                      <div
                        key={campaign._id}
                        onClick={() => router.push(`/donor/campaigns/${campaign._id}`)}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:border-red-600 transition"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {campaign.imageName && (
                            <img
                              src={getCampaignImageUrl(campaign.imageName) || ''}
                              alt={campaign.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-sm">{campaign.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {new Date(campaign.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {campaign.organization && (
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {campaign.organization.organizationName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/donor/campaigns/${campaign._id}`);
                            }}
                            className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400">
                      <p className="text-sm">No campaigns scheduled for this month</p>
                    </div>
                  )}
                </div>

                {/* Map Preview */}
              </div>
            </div>
          </div>
    </>
  );
}