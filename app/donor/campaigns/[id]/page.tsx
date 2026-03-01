'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getCampaignById, applyForCampaign } from '@/lib/api/campaigns';
import { getCampaignImageUrl } from '@/lib/utils/imageUrl';
import { ArrowLeft, MapPin, Calendar, Clock, Droplet, Users, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  targetUnits: number;
  imageName?: string;
  organizationId: any;
  appliedDonors?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userData = currentUser.user;

      // Check if user is donor
      if (userData.userType !== 'donor') {
        router.push('/donor/dashboard');
        return;
      }

      setUser(userData);
      setIsAuthorized(true);
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (isAuthorized && campaignId) {
      loadCampaign();
    }
  }, [isAuthorized, campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response = await getCampaignById(campaignId);
      const campaignData = response.success ? response.data : response.data;

      if (campaignData) {
        setCampaign(campaignData);
        // Check if current user has already applied
        const hasAppliedToThisCampaign = campaignData.appliedDonors?.includes(user?._id);
        setHasApplied(!!hasAppliedToThisCampaign);
      }
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      toast.error(err.message || 'Failed to load campaign');
      router.push('/donor/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (hasApplied) {
      toast.success('You have already applied for this campaign');
      return;
    }

    try {
      setIsApplying(true);
      const response = await applyForCampaign(campaignId);

      if (response.success || response.data) {
        toast.success(response.message || 'Successfully applied for campaign!');
        setHasApplied(true);
        // Refresh campaign data to update applicant count
        await loadCampaign();
      } else {
        toast.error(response.message || 'Failed to apply for campaign');
      }
    } catch (error: any) {
      console.error('Apply error:', error);
      toast.error(error.message || 'Failed to apply for campaign');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">Campaign not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/donor/campaigns"
        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Campaigns
      </Link>

      {/* Campaign Image */}
      {campaign.imageName && (
        <div className="w-full h-96 bg-gray-200 dark:bg-slate-800 rounded-xl overflow-hidden mb-8 relative">
          <Image
            src={getCampaignImageUrl(campaign.imageName)}
            alt={campaign.title}
            sizes=''
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Campaign Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md mb-8 space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          {campaign.title}
        </h1>

        {/* Application Status */}
        {hasApplied && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">Application Submitted</p>
              <p className="text-sm text-green-700 dark:text-green-200">You have already applied for this campaign</p>
            </div>
          </div>
        )}

        {/* Campaign Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <Calendar className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(campaign.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {campaign.startTime} - {campaign.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {campaign.location}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Droplet className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Target Units</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {campaign.targetUnits} units
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Description */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Campaign</h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
          {campaign.description}
        </p>
      </div>

      {/* Organization Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users size={24} className="text-orange-600" />
          Organizing Organization
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {campaign.organizationId?.fullName || campaign.organizationId?.organizationName || 'Organization Details'}
        </p>
      </div>

      {/* Apply Button */}
      {!hasApplied && (
        <div className="flex gap-4">
          <Link
            href="/donor/campaigns"
            className="flex-1 px-6 py-4 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1 px-6 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? 'Applying...' : 'Apply for Campaign'}
          </button>
        </div>
      )}

      {hasApplied && (
        <div className="flex gap-4">
          <Link
            href="/donor/campaigns"
            className="flex-1 px-6 py-4 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-700 transition text-center"
          >
            Back to Campaigns
          </Link>
        </div>
      )}
    </div>
  );
}
