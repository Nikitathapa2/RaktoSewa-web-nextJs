'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPublicCampaignsAction } from '@/lib/actions/campaign-action';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { Calendar, Clock, MapPin, Loader2, X } from 'lucide-react';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  imageName?: string;
  targetUnits?: number;
  organization?: {
    _id: string;
    organizationName: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const getCampaignImageUrl = (imageName?: string) => {
  if (!imageName) return null;
  if (imageName.startsWith('http')) return imageName;
  return `${BASE_URL}/uploads/campaigns/${imageName}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate().toString().padStart(2, '0'),
  };
};

export default function UpcomingCamps() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const result = await getPublicCampaignsAction(3);
        if (result.success && result.data) {
          setCampaigns(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleRegister = async (campaignId: string) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/donor/campaigns`);
  };

  return (
    <section className="w-full bg-neutral-50 dark:bg-neutral-900/50 py-20 border-y border-neutral-100 dark:border-neutral-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-[#181111] dark:text-white text-3xl font-bold">Upcoming Blood Donation Camps</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Join a camp near you and make a difference.</p>
          </div>
          <a
            href="/donor/campaigns"
            className="hidden sm:flex text-[#ec1313] font-bold items-center gap-1 hover:underline"
          >
            See All Camps →
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={36} className="animate-spin text-[#ec1313]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
            <Calendar size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium">No upcoming camps at the moment.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const date = formatDate(camp.date);
              const imageUrl = getCampaignImageUrl(camp.imageName);

              return (
                <div
                  key={camp._id}
                  className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-700 group flex flex-col"
                >
                  {/* Image */}
                  <div
                    className="h-48 bg-cover bg-center relative bg-red-100 dark:bg-red-900/20"
                    style={
                      imageUrl
                        ? {
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${imageUrl}')`,
                          }
                        : {}
                    }
                  >
                    {!imageUrl && (
                      <div className="h-full flex items-center justify-center">
                        <Calendar size={48} className="text-red-300" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="bg-white/90 text-black text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        📍 {camp.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="text-lg font-bold text-[#181111] dark:text-white group-hover:text-[#ec1313] truncate">
                          {camp.title}
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 truncate">
                          {camp.organization?.organizationName || 'Organization'}
                        </p>
                      </div>
                      <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-2 min-w-[60px] flex-shrink-0">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">{date.month}</p>
                        <p className="text-xl font-bold text-[#181111] dark:text-white">{date.day}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <Clock size={14} className="flex-shrink-0" />
                        <span>{camp.startTime} - {camp.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{camp.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegister(camp._id)}
                      className="w-full mt-auto py-2.5 rounded-lg bg-[#ec1313] text-white font-bold hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Register
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in scale-95">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
            >
              <X size={20} className="text-neutral-600 dark:text-neutral-400" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 mb-4">
                <Calendar size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#181111] dark:text-white mb-2">
                Join a Donation Camp
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                You need to log in to register for this donation camp.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                Save lives by donating blood. Create an account to get started today.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/login');
                }}
                className="w-full py-3 rounded-lg bg-[#ec1313] text-white font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/register');
                }}
                className="w-full py-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-[#181111] dark:text-white font-bold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-3 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
