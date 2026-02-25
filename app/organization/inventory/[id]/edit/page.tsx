'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getMyInventory, updateInventory } from '@/lib/api/inventory';
import { ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryItem {
  _id: string;
  bloodGroup: string;
  quantity: number;
}

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const inventoryId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState('1');

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
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (isAuthorized && inventoryId) {
      loadInventoryData();
    }
  }, [isAuthorized, inventoryId]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const response = await getMyInventory();
      const allInventory = response.data || [];
      
      // Find the specific inventory item
      const item = allInventory.find((inv: InventoryItem) => inv._id === inventoryId);
      
      if (item) {
        setInventory(item);
        setQuantity(item.quantity.toString());
      } else {
        toast.error('Inventory item not found');
        router.push('/organization/inventory');
      }
    } catch (err: any) {
      console.error('Error loading inventory:', err);
      toast.error(err.message || 'Failed to load inventory');
      router.push('/organization/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!quantity || Number(quantity) < 1) {
      toast.error('Quantity must be at least 1 unit');
      return;
    }

    if (!inventory) {
      toast.error('Inventory data not found');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updateInventory({
        bloodGroup: inventory.bloodGroup,
        quantity: Number(quantity),
        operation: 'set'
      });

      if (response.success || response.data) {
        toast.success(response.message || 'Inventory updated successfully!');
        router.push('/organization/inventory');
      } else {
        toast.error(response.message || 'Failed to update inventory');
      }
    } catch (error: any) {
      console.error('Update inventory error:', error);
      toast.error(error.message || 'Failed to update inventory');
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
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">Inventory item not found</p>
        </div>
      </div>
    );
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
          Update Blood Stock
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update inventory quantity for {inventory.bloodGroup}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md space-y-6">
          
          {/* Blood Group Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Blood Group
            </label>
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-6 text-center">
              <p className="text-5xl font-extrabold text-red-600 dark:text-red-200">
                {inventory.bloodGroup}
              </p>
            </div>
          </div>

          {/* Current Quantity Display */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Current Quantity</p>
            <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{inventory.quantity} units</p>
            </div>
          </div>

          {/* New Quantity Input */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Update Quantity (units) *
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 15"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white transition"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter the new quantity for this blood group
            </p>
          </div>

          {/* Quantity Change Preview */}
          {quantity && Number(quantity) !== inventory.quantity && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">Change:</span>{' '}
                {Number(quantity) > inventory.quantity ? '+' : ''}{Number(quantity) - inventory.quantity} units
              </p>
            </div>
          )}
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
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Quantity'}
          </button>
        </div>
      </form>
    </div>
  );
}
