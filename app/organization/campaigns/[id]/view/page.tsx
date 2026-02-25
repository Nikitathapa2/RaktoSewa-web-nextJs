'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getCampaignById, getCampaignParticipants, deleteCampaign, removeApplicantFromCampaign } from '@/lib/api/campaigns';
import { getCampaignImageUrl } from '@/lib/utils/imageUrl';
import { ArrowLeft, Calendar, MapPin, Target, User, Phone, Mail, Trash2, Edit2 } from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import { PaginatedResponse, hasPagination } from '@/lib/utils/pagination';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '@/app/components/DeleteConfirmationModal';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  targetUnits?: number;
  participants?: string[];
  imageName?: string;
  organization: any;
  createdAt?: string;
  updatedAt?: string;
}

export default function ViewCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for participants
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Applicant deletion states
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [isRemovingApplicant, setIsRemovingApplicant] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      const userData = currentUser.user;
      
      // Check if user is organization
      if (userData.userType !== 'organization') {
        router.push('/organization/campaigns');
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
  }, [isAuthorized, campaignId, currentPage]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCampaignById(campaignId);
      if (response.success && response.data) {
        setCampaign(response.data);
      } else if (response.data) {
        setCampaign(response.data);
      } else {
        setError('Campaign not found');
      }

      // Load participants
      try {
        const participantsResponse = await getCampaignParticipants(campaignId, currentPage, pageSize);
        console.log('🔍 Campaign Participants Response:', participantsResponse);

        // Try multiple patterns to extract pagination
        let participantsToSet: any[] = [];
        let pagination = { totalItems: 0, totalPages: 0 };
        
        if (hasPagination(participantsResponse)) {
          const paginatedData = participantsResponse as PaginatedResponse<any>;
          participantsToSet = paginatedData.data || [];
          pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
          console.log('✅ Pattern 1 matched');
        } 
        else if (participantsResponse?.data && Array.isArray(participantsResponse.data) && participantsResponse?.pagination) {
          participantsToSet = participantsResponse.data;
          pagination = { totalItems: participantsResponse.pagination.totalItems, totalPages: participantsResponse.pagination.totalPages };
          console.log('✅ Pattern 2 matched');
        }
        else if (Array.isArray(participantsResponse)) {
          participantsToSet = participantsResponse;
          pagination = { totalItems: participantsResponse.length, totalPages: Math.ceil(participantsResponse.length / pageSize) };
          console.log('✅ Pattern 3 matched');
        }
        else if (participantsResponse?.data && Array.isArray(participantsResponse.data)) {
          participantsToSet = participantsResponse.data;
          pagination = { totalItems: participantsResponse.data.length, totalPages: Math.ceil(participantsResponse.data.length / pageSize) };
          console.log('✅ Pattern 4 matched');
        }
        else {
          const participantsData = participantsResponse.success ? participantsResponse.data : participantsResponse.data;
          participantsToSet = Array.isArray(participantsData) ? participantsData : [];
        }

        setParticipants(participantsToSet);
        setTotalItems(pagination.totalItems);
        setTotalPages(pagination.totalPages);
        console.log('📊 Participants pagination state:', pagination);
      } catch (err: any) {
        console.error('Error loading participants:', err);
        setParticipants([]);
      }
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      setError(err.message || 'Failed to load campaign');
      toast.error(err.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setIsDeleting(true);
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      router.push('/organization/campaigns');
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete campaign');
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveApplicant = async () => {
    if (!selectedApplicant) return;
    
    try {
      setIsRemovingApplicant(true);
      await removeApplicantFromCampaign(campaignId, selectedApplicant);
      
      // Remove applicant from local state
      setParticipants(participants.filter(p => p._id !== selectedApplicant));
      
      toast.success('Applicant removed successfully');
      setSelectedApplicant(null);
    } catch (err: any) {
      console.error('Error removing applicant:', err);
      toast.error(err.message || 'Failed to remove applicant');
      setSelectedApplicant(null);
    } finally {
      setIsRemovingApplicant(false);
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <Link
          href="/organization/campaigns"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Campaigns
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Campaign not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/organization/campaigns"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Campaigns
        </Link>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {campaign.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Campaign Details
            </p>
          </div>
          <Link
            href={`/organization/campaigns/${campaign._id}/edit`}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
          >
            Edit Campaign
          </Link>
        </div>
      </div>

      {/* Campaign Banner */}
      {campaign.imageName && (
        <div className="w-full h-80 rounded-xl overflow-hidden mb-8 bg-gray-200 dark:bg-slate-800 relative">
          <Image
            src={getCampaignImageUrl(campaign.imageName) || ''}
            alt={campaign.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Campaign Details */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md space-y-6">
        
        {/* Status and Key Info */}
        <div className="flex flex-wrap gap-4 items-center">
          {campaign.targetUnits && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Target size={20} className="text-blue-600" />
              <span>
                {campaign.participants?.length || 0} / {campaign.targetUnits} Units
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {campaign.description}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4">
          <MapPin size={24} className="text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
            <p className="text-gray-600 dark:text-gray-300">{campaign.location}</p>
          </div>
        </div>

        {/* Dates and Times */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <Calendar size={24} className="text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Campaign Date</h3>
              <p className="text-gray-600 dark:text-gray-300">{formatDate(campaign.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Calendar size={24} className="text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Start Time</h3>
              <p className="text-gray-600 dark:text-gray-300">{campaign.startTime || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Calendar size={24} className="text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">End Time</h3>
              <p className="text-gray-600 dark:text-gray-300">{campaign.endTime || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Created Date */}
        {campaign.createdAt && (
          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created on {formatDate(campaign.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end mt-8">
        <Link
          href="/organization/campaigns"
          className="px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
        >
          Back to Campaigns
        </Link>
        <Link
          href={`/organization/campaigns/${campaign._id}/edit`}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
        >
          Edit Campaign
        </Link>
        <button
          onClick={() => setDeleteConfirm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition"
          title="Delete Campaign"
        >
          <Trash2 size={18} />
          Delete Campaign
        </button>
      </div>

      {/* Applicants Section */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <User size={28} className="text-green-600" />
          Campaign Applicants ({participants.length})
        </h2>

        {participants.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No applicants yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Donors will appear here when they apply for your campaign
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Blood Group</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((applicant) => (
                  <tr key={applicant._id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{applicant.fullName || applicant.name || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded font-semibold text-sm">
                        {applicant.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {applicant.phoneNumber || applicant.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                      {applicant.email || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedApplicant(applicant._id)}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition text-sm font-medium"
                        title="Remove applicant"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalItems > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, totalPages)}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  isLoading={loading}
                />
                <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {Math.max(1, totalPages)} • {totalItems} total items
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm}
        itemName="Campaign"
        onConfirm={handleDeleteCampaign}
        onCancel={() => setDeleteConfirm(false)}
        isLoading={isDeleting}
      />

      <DeleteConfirmationModal
        isOpen={!!selectedApplicant}
        itemName="Applicant"
        onConfirm={handleRemoveApplicant}
        onCancel={() => setSelectedApplicant(null)}
        isLoading={isRemovingApplicant}
      />
    </div>
  );
}
