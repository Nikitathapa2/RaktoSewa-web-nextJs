'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { 
  getMyBloodRequests, 
  deleteBloodRequest
} from '@/lib/api/bloodRequests';
import { 
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Syringe,
  Users,
} from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import { PaginatedResponse, hasPagination } from '@/lib/utils/pagination';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '@/app/components/DeleteConfirmationModal';

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: 'NORMAL' | 'CRITICAL';
  location: string;
  contactNumber: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  acceptedBy: any[];
  createdAt: string;
  updatedAt: string;
}

export default function BloodRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
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
      loadBloodRequests();
    }
  }, [isAuthorized, currentPage]);

  const loadBloodRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBloodRequests(currentPage, pageSize);
      console.log('🔍 MyBloodRequests Response:', response);

      // Try multiple patterns to extract pagination
      let requestsToSet: BloodRequest[] = [];
      let pagination = { totalItems: 0, totalPages: 0 };
      
      if (hasPagination(response)) {
        const paginatedData = response as PaginatedResponse<BloodRequest>;
        requestsToSet = paginatedData.data || [];
        pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
        console.log('✅ Pattern 1 matched (direct pagination)');
      } 
      else if (response?.data && Array.isArray(response.data) && response?.pagination) {
        requestsToSet = response.data;
        pagination = { totalItems: response.pagination.totalItems, totalPages: response.pagination.totalPages };
        console.log('✅ Pattern 2 matched (nested pagination)');
      }
      else if (Array.isArray(response)) {
        requestsToSet = response;
        pagination = { totalItems: response.length, totalPages: Math.ceil(response.length / pageSize) };
        console.log('✅ Pattern 3 matched (array only)');
      }
      else if (response?.data && Array.isArray(response.data)) {
        requestsToSet = response.data;
        pagination = { totalItems: response.data.length, totalPages: Math.ceil(response.data.length / pageSize) };
        console.log('✅ Pattern 4 matched (success+data only)');
      }

      setRequests(requestsToSet);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      console.log('📊 Set pagination state:', pagination);
    } catch (err: any) {
      console.error('Error loading blood requests:', err);
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

  const handleDeleteClick = (id: string, patientName: string) => {
    setDeleteConfirm({ id, name: patientName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    const { id } = deleteConfirm;
    setIsDeleting(id);

    try {
      const response = await deleteBloodRequest(id);
      toast.success(response?.message || 'Blood request deleted successfully');
      setDeleteConfirm(null);
      setRequests(requests.filter(r => r._id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete blood request');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FULFILLED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <Syringe size={32} className="text-red-600" />
            Blood Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage blood donation requests for your organization
          </p>
        </div>
        <Link
          href="/organization/blood-requests/create"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
        >
          <Plus size={20} />
          New Request
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
            <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading blood requests...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <Syringe size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Blood Requests</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a new blood request to reach donors and fulfill your blood donation needs.
          </p>
          <Link
            href="/organization/blood-requests/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            <Plus size={20} />
            Create Your First Request
          </Link>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Acceptances</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
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
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Users size={16} />
                      <span>{request.acceptedBy?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/organization/blood-requests/${request._id}`}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        title="View Details"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(request._id, request.patientName)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        title="Delete Request"
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
