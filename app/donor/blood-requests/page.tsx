'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getAllBloodRequestsAction, getMyAcceptedBloodRequestsAction } from '@/lib/actions/blood-request-action';
import { Droplet, AlertCircle } from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { PaginatedResponse, hasPagination } from '@/lib/utils/pagination';
import toast from 'react-hot-toast';

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: 'NORMAL' | 'CRITICAL';
  location: string;
  contactNumber: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  acceptedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DonorBloodRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [acceptedRequestIds, setAcceptedRequestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search and filter states
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

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
      setCurrentPage(1);
      loadBloodRequests({
        bloodGroup: bloodGroupFilter,
        location: locationFilter,
        urgency: urgencyFilter,
      });
    }
  }, [isAuthorized, bloodGroupFilter, locationFilter, urgencyFilter]);

  useEffect(() => {
    if (isAuthorized && currentPage !== 1) {
      loadBloodRequests({
        bloodGroup: bloodGroupFilter,
        location: locationFilter,
        urgency: urgencyFilter,
      });
    }
  }, [currentPage]);

  const loadBloodRequests = async (filters?: { bloodGroup?: string; location?: string; urgency?: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Load paginated blood requests and accepted requests
      console.log('📋 Loading blood requests with filters:', filters);
      const allResponse = await getAllBloodRequestsAction(currentPage, pageSize, filters);
      console.log('🔍 BloodRequests Response:', allResponse);

      // Check if the response has data
      if (!allResponse) {
        throw new Error('No response from server');
      }

      // Try multiple patterns to extract pagination
      let requestsToSet: BloodRequest[] = [];
      let pagination = { totalItems: 0, totalPages: 0 };
      
      if (hasPagination(allResponse)) {
        const paginatedData = allResponse as PaginatedResponse<BloodRequest>;
        requestsToSet = paginatedData.data || [];
        pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
        console.log('✅ Pattern 1 matched (direct pagination):', { dataCount: requestsToSet.length, ...pagination });
      } 
      else if (allResponse?.data && Array.isArray(allResponse.data) && allResponse?.pagination) {
        requestsToSet = allResponse.data;
        pagination = { totalItems: allResponse.pagination.totalItems, totalPages: allResponse.pagination.totalPages };
        console.log('✅ Pattern 2 matched (nested pagination):', { dataCount: requestsToSet.length, ...pagination });
      }
      else if (Array.isArray(allResponse)) {
        requestsToSet = allResponse;
        pagination = { totalItems: allResponse.length, totalPages: Math.ceil(allResponse.length / pageSize) };
        console.log('✅ Pattern 3 matched (array only):', { dataCount: requestsToSet.length, ...pagination });
      }
      else if (allResponse?.data && Array.isArray(allResponse.data)) {
        requestsToSet = allResponse.data;
        pagination = { totalItems: allResponse.data.length, totalPages: Math.ceil(allResponse.data.length / pageSize) };
        console.log('✅ Pattern 4 matched (success+data only):', { dataCount: requestsToSet.length, ...pagination });
      }
      else {
        console.log('⚠️ No pattern matched. Response structure:', Object.keys(allResponse || {}));
        // Last resort: check if allResponse has a message indicating an error
        if (allResponse?.message && !allResponse?.success) {
          throw new Error(allResponse.message);
        }
        requestsToSet = [];
      }

      setRequests(requestsToSet);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      console.log('📊 Set pagination state:', { currentPage, totalItems: pagination.totalItems, totalPages: pagination.totalPages, requestCount: requestsToSet.length });

      // Extract accepted requests
      const acceptedResponse = await getMyAcceptedBloodRequestsAction(1, 1000);
      const acceptedData = acceptedResponse.success ? acceptedResponse.data : acceptedResponse.data || [];
      setAcceptedRequestIds(Array.isArray(acceptedData) ? acceptedData.map((r: any) => r._id) : []);
    } catch (err: any) {
      console.error('❌ Error loading blood requests:', err);
      setError(err.message || 'Failed to load blood requests');
      toast.error(err.message || 'Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'FULFILLED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED':
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
          <Droplet size={32} className="text-red-600 fill-red-600" />
          Active Blood Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and respond to blood donation requests from organizations
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Blood Group
            </label>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            >
              <option value="">All Blood Groups</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
      
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Urgency
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            >
              <option value="">All Urgencies</option>
              <option value="NORMAL">Normal</option>
              <option value="CRITICAL">Critical</option>
            </select>
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
            <p className="text-gray-600 dark:text-gray-400">Loading blood requests...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <Droplet size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Blood Requests</h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are currently no active blood donation requests. Check back soon!
          </p>
        </div>
      ) : (
        <>
          {/* Requests Table */}
          <div className="overflow-x-auto shadow-md rounded-lg bg-white dark:bg-slate-900">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Patient Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Blood Group</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Units</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Urgency</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {request.patientName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {request.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {request.bloodGroup}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {request.unitsRequired} units
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/donor/blood-requests/${request._id}`}
                        className="inline-block px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        {acceptedRequestIds.includes(request._id) ? 'View' : 'Donate Now'}
                      </Link>
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
    </div>
  );
}
