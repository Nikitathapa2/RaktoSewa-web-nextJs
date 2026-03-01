'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getAllCampaignsAction, getMyAppliedCampaignsAction } from '@/lib/actions/campaign-action';
import { getCampaignImageUrl } from '@/lib/utils/imageUrl';
import { Zap, AlertCircle, FileText } from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { PaginatedResponse, hasPagination } from '@/lib/utils/pagination';
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
  createdAt: string;
  updatedAt: string;
}

export default function DonorCampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [appliedCampaignIds, setAppliedCampaignIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-old');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userData = currentUser.user;
      const normalizedUserType = String(userData.userType || '').toLowerCase();

      // Check if user is donor
      if (normalizedUserType !== 'donor') {
        router.push('/donor/dashboard');
        return;
      }

      setUser(userData);
      setIsAuthorized(true);
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      setCurrentPage(1);
      loadCampaigns({
        search: searchTerm,
        location: locationFilter,
        sortBy: sortBy,
      });
    }
  }, [isAuthorized, searchTerm, locationFilter, sortBy]);

  useEffect(() => {
    if (isAuthorized && currentPage !== 1) {
      loadCampaigns({
        search: searchTerm,
        location: locationFilter,
        sortBy: sortBy,
      });
    }
  }, [currentPage]);

  const loadCampaigns = async (filters?: { search?: string; location?: string; sortBy?: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Load paginated campaigns and applied campaigns
      const allResponse = await getAllCampaignsAction(currentPage, pageSize, filters);
      if (!allResponse?.success) {
        throw new Error(allResponse?.message || 'Failed to load campaigns');
      }
      console.log('🔍 AllCampaigns Response Keys:', Object.keys(allResponse));
      console.log('🔍 AllCampaigns Response:', allResponse);
      console.log('🔍 hasPagination result:', hasPagination(allResponse));
      
      // Try multiple patterns to extract pagination
      let campaignsToSet: Campaign[] = [];
      let pagination = { totalItems: 0, totalPages: 0 };
      
      // Pattern 1: Direct structure {data, pagination}
      if (hasPagination(allResponse)) {
        const paginatedData = allResponse as PaginatedResponse<Campaign>;
        campaignsToSet = paginatedData.data || [];
        pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
        console.log('✅ Pattern 1 matched (direct pagination)');
      } 
      // Pattern 2: Nested {success, data, pagination}
      else if (allResponse?.data && Array.isArray(allResponse.data) && allResponse?.pagination) {
        campaignsToSet = allResponse.data;
        pagination = { totalItems: allResponse.pagination.totalItems, totalPages: allResponse.pagination.totalPages };
        console.log('✅ Pattern 2 matched (nested pagination)');
      }
      // Pattern 3: Just an array (no pagination)
      else if (Array.isArray(allResponse)) {
        campaignsToSet = allResponse;
        pagination = { totalItems: allResponse.length, totalPages: Math.ceil(allResponse.length / pageSize) };
        console.log('✅ Pattern 3 matched (array only)');
      }
      // Pattern 4: {success, data} (no pagination)
      else if (allResponse?.data && Array.isArray(allResponse.data)) {
        campaignsToSet = allResponse.data;
        pagination = { totalItems: allResponse.data.length, totalPages: Math.ceil(allResponse.data.length / pageSize) };
        console.log('✅ Pattern 4 matched (success+data only)');
      }
      else {
        console.log('⚠️ No pattern matched, attempting direct use');
        campaignsToSet = allResponse || [];
      }

      setCampaigns(campaignsToSet);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      console.log('📊 Set state:', { totalItems: pagination.totalItems, totalPages: pagination.totalPages, campaignsCount: campaignsToSet.length });

      // Load applied campaigns
      const appliedResponse = await getMyAppliedCampaignsAction(1, 1000);
      if (!appliedResponse?.success) {
        throw new Error(appliedResponse?.message || 'Failed to load applied campaigns');
      }
      const appliedData = appliedResponse.data || [];
      setAppliedCampaignIds(Array.isArray(appliedData) ? appliedData.map((c: any) => c._id) : []);
    } catch (err: any) {
      console.error('❌ Error loading campaigns:', err);
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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap size={32} className="text-orange-500" />
            Available Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse and apply for blood donation campaigns in your area
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
        <SearchBar
          placeholder="Search campaigns by title or description..."
          onSearch={(value) => setSearchTerm(value)}
          onClear={() => setSearchTerm('')}
          additionalFilters={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                >
                  <option value="date-old">Date (Earliest First)</option>
                  <option value="date-new">Date (Latest First)</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          }
        />
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
            <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <Zap size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Campaigns Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back soon for new blood donation campaigns in your area.
          </p>
        </div>
      ) : (
        <>
          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition border border-gray-200 dark:border-slate-700"
              >
                {/* Campaign Image */}
                {campaign.imageName && (
                  <div className="w-full h-40 bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
                    <Image
                      src={getCampaignImageUrl(campaign.imageName) || ''}
                      alt={campaign.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                )}

                {/* Campaign Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                    {campaign.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Campaign Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">📅</span>
                      <span>{new Date(campaign.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">⏰</span>
                      <span>{campaign.startTime} - {campaign.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">📍</span>
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">🩸</span>
                      <span>Target: {campaign.targetUnits} units</span>
                    </div>
                  </div>

                  {/* Applied Badge */}
                  {appliedCampaignIds.includes(campaign._id) && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-200">✓ Already Applied</p>
                    </div>
                  )}

                  {/* View Button */}
                  <Link
                    href={`/donor/campaigns/${campaign._id}`}
                    className="block w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition text-center"
                  >
                    {appliedCampaignIds.includes(campaign._id) ? 'View Details' : 'View & Apply'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

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
    </div>
  );
}
