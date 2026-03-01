'use client';

import { useEffect, useState } from 'react';import Image from 'next/image';import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { createCampaign } from '@/lib/api/campaigns';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    targetUnits: '',
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
        router.push('/organization/campaigns');
        return;
      }
      
      setUser(userData);
      setIsAuthorized(true);
    };
    
    loadUser();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Campaign title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Campaign description is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.date) {
      toast.error('Campaign date is required');
      return;
    }
    if (!formData.startTime) {
      toast.error('Start time is required');
      return;
    }
    if (!formData.endTime) {
      toast.error('End time is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const campaignFormData = new FormData();
      campaignFormData.append('title', formData.title);
      campaignFormData.append('description', formData.description);
      campaignFormData.append('location', formData.location);
      campaignFormData.append('date', formData.date);
      campaignFormData.append('startTime', formData.startTime);
      campaignFormData.append('endTime', formData.endTime);
      if (formData.targetUnits) {
        campaignFormData.append('targetUnits', formData.targetUnits);
      }
      if (imageFile) {
        campaignFormData.append('campaignImage', imageFile);
      }

      const response = await createCampaign(campaignFormData);

      if (response.success || response.data) {
        toast.success(response.message || 'Campaign created successfully!');
        router.push('/organization/campaigns');
      } else {
        toast.error(response.message || 'Failed to create campaign');
      }
    } catch (error: any) {
      console.error('Create campaign error:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return null;
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
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Create New Campaign
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up a new blood donation campaign to reach more donors
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md space-y-6">
          
          {/* Campaign Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Summer Blood Drive 2024"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
            />
          </div>

          {/* Campaign Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your campaign, goals, and impact..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition resize-none"
            />
          </div>

          {/* Location */}
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
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
            />
          </div>

          {/* Dates and Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Campaign Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                End Time *
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
              />
            </div>
          </div>

          {/* Target Units */}
          <div>
            <label htmlFor="targetUnits" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Target Units (Optional)
            </label>
            <input
              type="number"
              id="targetUnits"
              name="targetUnits"
              value={formData.targetUnits}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
            />
          </div>

          {/* Campaign Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Campaign Image (Optional)
            </label>
            <div className="flex gap-6">
              {/* Image Preview */}
              {imagePreview && (
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              {/* Upload Area */}
              <label className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-6 cursor-pointer hover:border-green-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/organization/campaigns"
            className="px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
