'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getBloodRequestById, getBloodRequestApplicants, deleteBloodRequest, removeApplicantFromRequest } from '@/lib/api/bloodRequests';
import { ArrowLeft, Edit2, AlertCircle, Check, User, Phone, MapPin, Droplets, Clock, Trash2 } from 'lucide-react';
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

interface Applicant {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bloodGroup: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'FULFILLED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getUrgencyColor = (urgency: string) => {
  return urgency === 'CRITICAL' 
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
};

export default function ViewBloodRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  // Applicant deletion states
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [isRemovingApplicant, setIsRemovingApplicant] = useState(false);

  // Blood request deletion states
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        router.push('/organization/blood-requests');
        return;
      }
      
      setUser(userData);
      setIsAuthorized(true);
    };
    
    loadUser();
  }, [router]);

  useEffect(() => {
    if (isAuthorized && requestId) {
      loadBloodRequestData();
    }
  }, [isAuthorized, requestId]);

  const loadBloodRequestData = async () => {
    try {
      setLoading(true);
      
      // Load blood request details
      const requestResponse = await getBloodRequestById(requestId);
      const requestData = requestResponse.success ? requestResponse.data : requestResponse.data;
      
      if (requestData) {
        setRequest(requestData);
      }

      // Load applicants
      const applicantsResponse = await getBloodRequestApplicants(requestId);
      const applicantsData = applicantsResponse.success ? applicantsResponse.data : applicantsResponse.data;
      
      if (Array.isArray(applicantsData)) {
        setApplicants(applicantsData);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error(err.message || 'Failed to load blood request details');
      router.push('/organization/blood-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplicant = async () => {
    if (!selectedApplicant) return;
    
    try {
      setIsRemovingApplicant(true);
      await removeApplicantFromRequest(requestId, selectedApplicant);
      
      // Remove applicant from local state
      setApplicants(applicants.filter(a => a._id !== selectedApplicant));
      
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

  const handleDeleteRequest = async () => {
    try {
      setIsDeleting(true);
      await deleteBloodRequest(requestId);
      toast.success('Blood request deleted successfully');
      router.push('/organization/blood-requests');
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete blood request');
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blood request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">Blood request not found</p>
        </div>
      </div>
    );
  }

  const acceptanceCount = applicants.filter(a => a.status === 'ACCEPTED').length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/organization/blood-requests"
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Blood Requests
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Blood Request Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Request ID: {request._id}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/organization/blood-requests/${requestId}/edit`}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
            >
              <Edit2 size={18} />
              Edit Request
            </Link>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition"
              title="Delete Request"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
              Patient Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Patient Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{request.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Droplets className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Blood Group</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{request.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Contact Number</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{request.contactNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
              Request Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Droplets className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Units Required</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{request.unitsRequired} units</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className={`flex-shrink-0 mt-1 ${request.urgency === 'CRITICAL' ? 'text-red-600' : 'text-blue-600'}`} size={20} />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Urgency</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Location</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{request.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Dates */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">
                {new Date(request.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Acceptances</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">{acceptanceCount}/{request.unitsRequired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applicants Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Donor Acceptances ({applicants.length})
        </h2>

        {applicants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <User className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No donors have accepted this request yet</p>
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <tr key={applicant._id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{applicant.fullName}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded font-semibold text-sm">
                        {applicant.bloodGroup}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{applicant.phoneNumber}</td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">{applicant.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        applicant.status === 'ACCEPTED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : applicant.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {applicant.status === 'ACCEPTED' && <Check size={16} />}
                        {applicant.status}
                      </span>
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
          </div>
        )}
      </div>

      {/* Delete Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm}
        itemName="Blood Request"
        onConfirm={handleDeleteRequest}
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
