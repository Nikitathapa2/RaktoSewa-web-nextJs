'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';
import { createCampaign, updateCampaign } from '@/lib/api/admin/campaign';
import { getCampaignImageUrl } from '@/lib/utils/imageUrl';

interface OrganizationOption {
  _id: string;
  organizationName?: string;
  fullName?: string;
  email: string;
}

interface CampaignFormProps {
  mode: 'create' | 'edit';
  campaignId?: string;
  organizations: OrganizationOption[];
  initialData?: {
    title?: string;
    description?: string;
    location?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    targetUnits?: number;
    imageName?: string;
    organizationId?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const toDateInputValue = (dateValue?: string) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export function CampaignForm({ mode, campaignId, organizations, initialData, onSuccess, onCancel }: CampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignImage, setCampaignImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.imageName ? getCampaignImageUrl(initialData.imageName) : null
  );

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    date: toDateInputValue(initialData?.date),
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    targetUnits: initialData?.targetUnits ? String(initialData.targetUnits) : '',
    organizationId: initialData?.organizationId || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCampaignImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.organizationId) {
      toast.error('Organization is required');
      return;
    }
    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill all required campaign details');
      return;
    }
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Date and time fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('organizationId', formData.organizationId);
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('location', formData.location);
      payload.append('date', formData.date);
      payload.append('startTime', formData.startTime);
      payload.append('endTime', formData.endTime);

      if (formData.targetUnits) {
        payload.append('targetUnits', formData.targetUnits);
      }

      if (campaignImage) {
        payload.append('campaignImage', campaignImage);
      }

      if (mode === 'create') {
        await createCampaign(payload);
      } else if (campaignId) {
        await updateCampaign(campaignId, payload);
      }

      toast.success(mode === 'create' ? 'Campaign created successfully' : 'Campaign updated successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Campaign Basics</h3>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Organization *</label>
          <select
            name="organizationId"
            value={formData.organizationId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm font-medium transition-colors"
            required
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.organizationName || org.fullName || org.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Title *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter campaign title"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the campaign"
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors"
            required
          />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Schedule & Location</h3>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Location *</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter campaign location"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white text-sm transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-white mb-2">Target Units (Optional)</label>
          <input
            type="number"
            min="1"
            name="targetUnits"
            value={formData.targetUnits}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:text-white placeholder:text-slate-400 text-sm transition-colors"
          />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">Campaign Image</h3>

        {previewImage ? (
          <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <Image src={previewImage} alt="Campaign preview" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => {
                setPreviewImage(null);
                setCampaignImage(null);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-red-500 dark:hover:border-red-500 transition-colors bg-white dark:bg-zinc-900">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">Click to upload image</span>
            <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG, GIF up to 2MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Campaign' : 'Update Campaign'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white px-4 py-3 rounded-lg font-bold transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
