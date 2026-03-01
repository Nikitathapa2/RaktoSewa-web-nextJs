'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { 
  getMyCampaigns, 
  deleteCampaign,
  updateCampaign 
} from '@/lib/api/campaigns';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Calendar,
} from 'lucide-react';
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

export default function CampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
        router.push('/login');
        return;
      }
      
      setUser(userData);
      setIsAuthorized(true);
    };
    
    loadUser();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      loadCampaigns();
    }
  }, [isAuthorized, currentPage]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyCampaigns(currentPage, pageSize);
      console.log('🔍 MyCampaigns Response:', response);

      // Try multiple patterns to extract pagination
      let campaignsToSet: Campaign[] = [];
      let pagination = { totalItems: 0, totalPages: 0 };
      
      if (hasPagination(response)) {
        const paginatedData = response as PaginatedResponse<Campaign>;
        campaignsToSet = paginatedData.data || [];
        pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
        console.log('✅ Pattern 1 matched (direct pagination)');
      } 
      else if (response?.data && Array.isArray(response.data) && response?.pagination) {
        campaignsToSet = response.data;
        pagination = { totalItems: response.pagination.totalItems, totalPages: response.pagination.totalPages };
        console.log('✅ Pattern 2 matched (nested pagination)');
      }
      else if (Array.isArray(response)) {
        campaignsToSet = response;
        pagination = { totalItems: response.length, totalPages: Math.ceil(response.length / pageSize) };
        console.log('✅ Pattern 3 matched (array only)');
      }
      else if (response?.data && Array.isArray(response.data)) {
        campaignsToSet = response.data;
        pagination = { totalItems: response.data.length, totalPages: Math.ceil(response.data.length / pageSize) };
        console.log('✅ Pattern 4 matched (success+data only)');
      }
      else {
        campaignsToSet = [];
      }

      setCampaigns(campaignsToSet);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      console.log('📊 Set pagination state:', pagination);
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns');
      toast.error(err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirm({ id, name: title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    const { id } = deleteConfirm;
    setIsDeleting(id);

    try {
      const response = await deleteCampaign(id);
      toast.success(response?.message || 'Campaign deleted successfully');
      setDeleteConfirm(null);
      setCampaigns(campaigns.filter(c => c._id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.message || 'Failed to delete campaign';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
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
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const isCampaignPast = (dateString: string) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch (e) {
      return false;
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar size={32} className="text-green-600" />
            Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage blood donation campaigns for your organization
          </p>
        </div>
        <Link
          href="/organization/campaigns/create"
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
        >
          <Plus size={20} />
          Create Campaign
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Campaigns Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by creating your first blood donation campaign to reach more donors and save lives.
          </p>
          <Link
            href="/organization/campaigns/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <>
        {/* Campaigns Table */}
        <div className="overflow-x-auto shadow-md rounded-lg bg-white dark:bg-slate-900">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Campaign Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Time</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign._id}
                  className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {campaign.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {campaign.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {campaign.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(campaign.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {campaign.startTime} - {campaign.endTime}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/organization/campaigns/${campaign._id}/view`}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/organization/campaigns/${campaign._id}/edit`}
                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                        title="Edit Campaign"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(campaign._id, campaign.title)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        title="Delete Campaign"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div>
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        itemName={deleteConfirm?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={!!isDeleting}
      />
    </div>
  );
}
