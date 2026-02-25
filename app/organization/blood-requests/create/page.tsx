'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { createBloodRequest } from '@/lib/api/bloodRequests';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function CreateBloodRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsRequired: '1',
    urgency: 'NORMAL' as 'NORMAL' | 'CRITICAL',
    location: '',
    contactNumber: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'urgency' ? value as 'NORMAL' | 'CRITICAL' : value
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

      const response = await createBloodRequest({
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        unitsRequired: Number(formData.unitsRequired),
        urgency: formData.urgency,
        location: formData.location,
        contactNumber: formData.contactNumber,
      });

      if (response.success || response.data) {
        toast.success(response.message || 'Blood request created successfully!');
        router.push('/organization/blood-requests');
      } else {
        toast.error(response.message || 'Failed to create blood request');
      }
    } catch (error: any) {
      console.error('Create request error:', error);
      toast.error(error.message || 'Failed to create blood request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return null;
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
          Create Blood Request
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Post a new blood donation request to reach donors
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

          {/* Contact Number */}
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
            {isSubmitting ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
