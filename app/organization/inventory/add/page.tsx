'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { updateInventory, getMyInventory } from '@/lib/api/inventory';
import { ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AddInventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingInventory, setExistingInventory] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    bloodGroup: '',
    quantity: '1',
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
        router.push('/organization/inventory');
        return;
      }

      setUser(userData);
      setIsAuthorized(true);

      // Load existing inventory to prevent duplicates
      try {
        const response = await getMyInventory();
        const existingGroups = (response.data || []).map((item: any) => item.bloodGroup);
        setExistingInventory(existingGroups);

        // Set default to first available blood group
        const firstAvailableGroup = BLOOD_GROUPS.find(group => !existingGroups.includes(group));
        setFormData(prev => ({
          ...prev,
          bloodGroup: firstAvailableGroup || ''
        }));
      } catch (err) {
        console.error('Error loading inventory:', err);
        // Default to first blood group if error occurs
        setFormData(prev => ({
          ...prev,
          bloodGroup: BLOOD_GROUPS[0]
        }));
      }
    };

    loadUser();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.bloodGroup) {
      toast.error('Blood group is required');
      return;
    }
    if (existingInventory.includes(formData.bloodGroup)) {
      toast.error(`Inventory for ${formData.bloodGroup} already exists. Use the Update option instead.`);
      return;
    }
    if (!formData.quantity || Number(formData.quantity) < 1) {
      toast.error('Quantity must be at least 1 unit');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updateInventory({
        bloodGroup: formData.bloodGroup,
        quantity: Number(formData.quantity),
        operation: 'add'
      });

      if (response.success || response.data) {
        toast.success(response.message || 'Blood inventory added successfully!');
        router.push('/organization/inventory');
      } else {
        toast.error(response.message || 'Failed to add blood inventory');
      }
    } catch (error: any) {
      console.error('Add inventory error:', error);
      toast.error(error.message || 'Failed to add blood inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available groups (excluding existing ones)
  const availableGroups = BLOOD_GROUPS.filter(bg => !existingInventory.includes(bg));

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/organization/inventory"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Package size={32} className="text-green-600" />
          Add Blood Stock
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Add new blood inventory to your organization
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md space-y-6">
          
          {/* Blood Group Select */}
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Blood Group *
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition text-lg"
            >
              {availableGroups.length === 0 ? (
                <option disabled>All blood groups already exist</option>
              ) : (
                availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))
              )}
            </select>
            {availableGroups.length === 0 && (
              <p className="text-sm text-orange-600 mt-2">All blood groups already have inventory entries. Use update to modify quantities.</p>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Initial Quantity (units) *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="e.g., 10"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter the number of blood units to add to inventory
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-semibold">Tip:</span> You can update inventory quantities later from the inventory list.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/organization/inventory"
            className="px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || availableGroups.length === 0}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Blood Stock'}
          </button>
        </div>
      </form>
    </div>
  );
}
