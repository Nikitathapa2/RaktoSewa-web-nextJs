'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getBloodRequestById, acceptBloodRequest } from '@/lib/api/bloodRequests';
import { ArrowLeft, MapPin, Calendar, Droplet, Phone, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function BloodRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

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
        // Check if current user has already accepted
        const hasAcceptedThisRequest = requestData.acceptedBy?.includes(user?._id);
        setHasAccepted(!!hasAcceptedThisRequest);
      }
    } catch (err: any) {
      console.error('Error loading request:', err);
      toast.error(err.message || 'Failed to load blood request');
      router.push('/donor/blood-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDonateNow = async () => {
    if (hasAccepted) {
      toast.success('You have already submitted a donation for this request');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await acceptBloodRequest(requestId);

      if (response.success || response.data) {
        toast.success(response.message || 'Thank you for your donation!');
        setHasAccepted(true);
        // Refresh request data
        await loadBloodRequest();
      } else {
        toast.error(response.message || 'Failed to submit donation');
      }
    } catch (error: any) {
      console.error('Donate error:', error);
      toast.error(error.message || 'Failed to submit donation');
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

  const getUrgencyColor = (urgency: string) => {
    return urgency === 'CRITICAL' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/donor/blood-requests"
        className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Blood Requests
      </Link>

      {/* Request Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md mb-8 space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          {request.patientName}
        </h1>

        {/* Donation Status */}
        {hasAccepted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">Donation Submitted</p>
              <p className="text-sm text-green-700 dark:text-green-200">Thank you for your donation commitment!</p>
            </div>
          </div>
        )}

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <Droplet className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Group</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {request.bloodGroup}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Droplet className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Units Required</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {request.unitsRequired} units
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <AlertCircle 
              className={`flex-shrink-0 mt-1 ${request.urgency === 'CRITICAL' ? 'text-red-600' : 'text-blue-600'}`} 
              size={24} 
            />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgency</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getUrgencyColor(request.urgency)}`}>
                {request.urgency}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {request.location}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="text-purple-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Number</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {request.contactNumber}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Calendar className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Request Created</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Request Status</p>
            <p className={`text-sm font-bold mt-1 px-3 py-1 rounded-full w-fit ${
              request.status === 'PENDING' 
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : request.status === 'FULFILLED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {request.status}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Donations Received</p>
            <p className="text-sm font-bold mt-1 text-gray-900 dark:text-white">
              {request.acceptedBy?.length || 0} / {request.unitsRequired}
            </p>
          </div>
        </div>
      </div>

      {/* Important Info */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
        <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">Why Your Donation Matters</h3>
        <ul className="text-red-800 dark:text-red-200 space-y-1 text-sm">
          <li>✓ One blood donation can save up to 3 lives</li>
          <li>✓ Your commitment helps hospitals prepare for critical situations</li>
          <li>✓ Every unit of blood is crucial during emergencies</li>
        </ul>
      </div>

      {/* Action Buttons */}
      {!hasAccepted ? (
        <div className="flex gap-4">
          <Link
            href="/donor/blood-requests"
            className="flex-1 px-6 py-4 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleDonateNow}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Donation'}
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/donor/blood-requests"
            className="flex-1 px-6 py-4 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-slate-700 transition text-center"
          >
            Back to Requests
          </Link>
          <div className="flex-1 px-6 py-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 font-bold rounded-xl text-center border border-green-300 dark:border-green-700">
            ✓ Donation Submitted
          </div>
        </div>
      )}
    </div>
  );
}
