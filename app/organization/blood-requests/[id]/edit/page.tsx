'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getBloodRequestById, updateBloodRequest } from '@/lib/api/bloodRequests';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['PENDING', 'FULFILLED', 'CANCELLED'];

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

export default function EditBloodRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsRequired: '1',
    urgency: 'NORMAL' as 'NORMAL' | 'CRITICAL',
    location: '',
    contactNumber: '',
    status: 'PENDING' as 'PENDING' | 'FULFILLED' | 'CANCELLED',
  });

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
      loadBloodRequest();
    }
  }, [isAuthorized, requestId]);

  const loadBloodRequest = async () => {
    try {
      setLoading(true);
      const response = await getBloodRequestById(requestId);
      const requestData = response.success ? response.data : response.data;
      
      if (requestData) {
        setRequest(requestData);
        setFormData({
          patientName: requestData.patientName || '',
          bloodGroup: requestData.bloodGroup || 'O+',
          unitsRequired: requestData.unitsRequired?.toString() || '1',
          urgency: requestData.urgency || 'NORMAL',
          location: requestData.location || '',
          contactNumber: requestData.contactNumber || '',
          status: requestData.status || 'PENDING',
        });
      }
    } catch (err: any) {
      console.error('Error loading request:', err);
      toast.error(err.message || 'Failed to load blood request');
      router.push('/organization/blood-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as any
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.patientName.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!formData.bloodGroup) {
      toast.error('Blood group is required');
      return;
    }
    if (!formData.unitsRequired || Number(formData.unitsRequired) < 1) {
      toast.error('Units required must be at least 1');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.contactNumber.trim()) {
      toast.error('Contact number is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updateBloodRequest(requestId, {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        unitsRequired: Number(formData.unitsRequired),
        urgency: formData.urgency,
        location: formData.location,
        contactNumber: formData.contactNumber,
        status: formData.status,
      });

      if (response.success || response.data) {
        toast.success(response.message || 'Blood request updated successfully!');
        router.push('/organization/blood-requests');
      } else {
        toast.error(response.message || 'Failed to update blood request');
      }
    } catch (error: any) {
      console.error('Update request error:', error);
      toast.error(error.message || 'Failed to update blood request');
    } finally {
      setIsSubmitting(false);
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
          <p className="text-gray-600 dark:text-gray-400">Loading blood request...</p>
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/organization/blood-requests"
          className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Blood Requests
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Edit Blood Request
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update blood donation request details
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md space-y-6">
          
          {/* Patient Name */}
          <div>
            <label htmlFor="patientName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              placeholder="Enter patient name"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
            />
          </div>

          {/* Blood Group and Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Blood Group *
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
              >
                {BLOOD_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="unitsRequired" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Units Required *
              </label>
              <input
                type="number"
                id="unitsRequired"
                name="unitsRequired"
                value={formData.unitsRequired}
                onChange={handleInputChange}
                placeholder="1"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
              />
            </div>
          </div>

          {/* Urgency and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="urgency" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Urgency *
              </label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
              >
                <option value="NORMAL">Normal</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Medical Center"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
              />
            </div>
          </div>

          {/* Contact Number and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="e.g., +1 (555) 123-4567"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white transition"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/organization/blood-requests"
            className="px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
