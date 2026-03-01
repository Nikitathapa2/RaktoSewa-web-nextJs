'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getDonationHistory } from '@/lib/api/donations';
import { getAllBloodRequests } from '@/lib/api/bloodRequests';
import { Heart, AlertCircle, Heart as HeartIcon, Calendar, AlertTriangle, Droplet, ArrowRight } from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import { PaginatedResponse, hasPagination } from '@/lib/utils/pagination';
import toast from 'react-hot-toast';

interface DonationRecord {
  _id: string;
  donorId?: string;
  organizationId?: string;
  bloodGroup: string;
  unitsDonated?: number;
  donationDate: string;
  donationStatus?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BloodDonationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for donation history
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    if (isAuthorized) {
      loadDonationHistory();
    }
  }, [isAuthorized, currentPage]);

  const loadDonationHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDonationHistory(currentPage, pageSize);
      console.log('🔍 DonationHistory Response:', response);

      // Try multiple patterns to extract pagination
      let donationsToSet: DonationRecord[] = [];
      let pagination = { totalItems: 0, totalPages: 0 };
      
      if (hasPagination(response)) {
        const paginatedData = response as PaginatedResponse<DonationRecord>;
        donationsToSet = paginatedData.data || [];
        pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
        console.log('✅ Pattern 1 matched');
      } 
      else if (response?.data && Array.isArray(response.data) && response?.pagination) {
        donationsToSet = response.data;
        pagination = { totalItems: response.pagination.totalItems, totalPages: response.pagination.totalPages };
        console.log('✅ Pattern 2 matched');
      }
      else if (Array.isArray(response)) {
        donationsToSet = response;
        pagination = { totalItems: response.length, totalPages: Math.ceil(response.length / pageSize) };
        console.log('✅ Pattern 3 matched');
      }
      else if (response?.data && Array.isArray(response.data)) {
        donationsToSet = response.data;
        pagination = { totalItems: response.data.length, totalPages: Math.ceil(response.data.length / pageSize) };
        console.log('✅ Pattern 4 matched');
      }
      else {
        const donationData = response.success ? response.data : response.data;
        donationsToSet = Array.isArray(donationData) ? donationData : [];
      }

      setDonations(donationsToSet);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      console.log('📊 Donations pagination state:', pagination);

      // Load blood requests
      try {
        const requestsResponse = await getAllBloodRequests();
        const requestsData = requestsResponse.success ? requestsResponse.data : requestsResponse.data;
        let pendingRequests = Array.isArray(requestsData) ? requestsData : [];
        
        // Extract data if paginated
        if (hasPagination(requestsResponse)) {
          const paginatedReqs = requestsResponse as PaginatedResponse<any>;
          pendingRequests = paginatedReqs.data || [];
        }
        
        pendingRequests = pendingRequests.filter(
          (req: any) => req.status === 'PENDING'
        ).slice(0, 3); // Show only top 3
        setBloodRequests(pendingRequests);
      } catch (err: any) {
        console.error('Error loading blood requests:', err);
        setBloodRequests([]);
      }
    } catch (err: any) {
      console.error('Error loading donation history:', err);
      setError(err.message || 'Failed to load donation history');
      toast.error(err.message || 'Failed to load donation history');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'FAILED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Heart size={32} className="text-red-600 fill-red-600" />
          Blood Donation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your blood donation history and manage donation records
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Heart className="text-red-600 fill-red-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Make a Difference</h3>
            <p className="text-red-800 dark:text-red-200">
              Your blood donation can save up to 3 lives. Join our campaigns and donate blood regularly to help those in need.
            </p>
          </div>
        </div>
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
            <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading donation history...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Total Donations</p>
                <HeartIcon className="text-red-600 fill-red-600" size={24} />
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {donations.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                donations on record
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-600 dark:text-gray-400 font-medium">Blood Type</p>
                <Heart className="text-blue-600" size={24} />
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {user?.bloodGroup || '-'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                your blood type
              </p>
            </div>

           
          </div>

          {/* Donation History */}
          {donations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
              <Heart size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Donation History</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't donated blood yet. Visit our campaigns to get started and make a difference.
              </p>
              <a
                href="/donor/campaigns"
                className="inline-block px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
              >
                Browse Campaigns
              </a>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Blood Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Units Donated
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr
                          key={donation._id}
                          className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="font-medium">
                                {new Date(donation.donationDate || donation.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full font-semibold text-xs">
                              {donation.bloodGroup}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {donation.unitsDonated || 1} unit{donation.unitsDonated !== 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {donation.location || 'Donation Center'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full font-semibold text-xs inline-block ${getStatusColor(
                                donation.donationStatus
                              )}`}
                            >
                              {donation.donationStatus || 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
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
            </>
          )}

          {/* Call to Action */}
          {donations.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to Donate Again?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Blood donations are needed regularly. Check out our active campaigns and schedule your next donation.
              </p>
              <a
                href="/donor/campaigns"
                className="inline-block px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition"
              >
                View Campaigns
              </a>
            </div>
          )}

          {/* Active Blood Requests Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Droplet className="text-red-600 fill-red-600" size={28} />
                Active Blood Requests
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Organizations are actively seeking blood donations
              </p>
            </div>

            <div className="p-6">
              {bloodRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Droplet className="mx-auto text-gray-400 mb-4" size={40} />
                  <p className="text-gray-600 dark:text-gray-400">No active blood requests at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bloodRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-start justify-between p-4 border border-gray-100 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {request.patientName} - {request.bloodGroup}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.unitsRequired} units needed • {request.location}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            request.urgency === 'CRITICAL'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {request.urgency} URGENCY
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/donor/blood-requests/${request._id}`}
                        className="ml-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        Donate <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                  
                  <Link
                    href="/donor/blood-requests"
                    className="block text-center mt-6 w-full py-3 border-2 border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    View All Blood Requests
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
