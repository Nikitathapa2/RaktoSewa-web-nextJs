'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getMyInventory, deleteInventory } from '@/lib/api/inventory';
import { Package, Plus, Trash2, AlertCircle, Edit2, Plus as PlusIcon } from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import { PaginatedResponse, hasPagination } from '@/lib/utils/pagination';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '@/app/components/DeleteConfirmationModal';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface InventoryItem {
  _id: string;
  bloodGroup: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; bloodGroup: string } | null>(null);
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
      loadInventory();
    }
  }, [isAuthorized, currentPage]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyInventory(currentPage, pageSize);
      console.log('🔍 MyInventory Response:', response);

      // Try multiple patterns to extract pagination
      let inventoryToSet: InventoryItem[] = [];
      let pagination = { totalItems: 0, totalPages: 0 };
      
      if (hasPagination(response)) {
        const paginatedData = response as PaginatedResponse<InventoryItem>;
        inventoryToSet = paginatedData.data || [];
        pagination = { totalItems: paginatedData.pagination.totalItems, totalPages: paginatedData.pagination.totalPages };
        console.log('✅ Pattern 1 matched (direct pagination)');
      } 
      else if (response?.data && Array.isArray(response.data) && response?.pagination) {
        inventoryToSet = response.data;
        pagination = { totalItems: response.pagination.totalItems, totalPages: response.pagination.totalPages };
        console.log('✅ Pattern 2 matched (nested pagination)');
      }
      else if (Array.isArray(response)) {
        inventoryToSet = response;
        pagination = { totalItems: response.length, totalPages: Math.ceil(response.length / pageSize) };
        console.log('✅ Pattern 3 matched (array only)');
      }
      else if (response?.data && Array.isArray(response.data)) {
        inventoryToSet = response.data;
        pagination = { totalItems: response.data.length, totalPages: Math.ceil(response.data.length / pageSize) };
        console.log('✅ Pattern 4 matched (success+data only)');
      }

      setInventory(inventoryToSet);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      console.log('📊 Set pagination state:', pagination);
    } catch (err: any) {
      console.error('Error loading inventory:', err);
      setError(err.message || 'Failed to load inventory');
      toast.error(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string, bloodGroup: string) => {
    setDeleteConfirm({ id, name: `${bloodGroup} blood inventory`, bloodGroup });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    const { bloodGroup } = deleteConfirm;
    setIsDeleting(bloodGroup);

    try {
      // Ensure blood group is uppercase (e.g., B-, O+)
      const formattedBloodGroup = bloodGroup.toUpperCase();
      const response = await deleteInventory(formattedBloodGroup);
      toast.success(response?.message || 'Inventory deleted successfully');
      setDeleteConfirm(null);
      setInventory(inventory.filter(i => i.bloodGroup !== bloodGroup));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete inventory');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get blood groups not yet in inventory
  const availableGroups = BLOOD_GROUPS.filter(
    bg => !inventory.some(inv => inv.bloodGroup === bg)
  );

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={32} className="text-green-600" />
            Blood Inventory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your organization's blood inventory by blood group
          </p>
        </div>
        {availableGroups.length > 0 && (
          <Link
            href="/organization/inventory/add"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Add Blood Stock
          </Link>
        )}
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
            <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
          </div>
        </div>
      ) : inventory.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Blood Inventory</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by adding blood inventory for your organization to manage blood stock effectively.
          </p>
          <Link
            href="/organization/inventory/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Add Your First Blood Stock
          </Link>
        </div>
      ) : (
        <>
          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventory.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md hover:shadow-lg transition border border-gray-200 dark:border-slate-700"
              >
                {/* Blood Group Header */}
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-4 text-center mb-4">
                    <p className="text-5xl font-extrabold text-red-600 dark:text-red-200">
                      {item.bloodGroup}
                    </p>
                  </div>
                </div>

                {/* Quantity Display */}
                <div className="text-center mb-6">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Available Units
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {item.quantity}
                  </p>
                </div>

                {/* Last Updated */}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/organization/inventory/${item._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition font-semibold text-sm"
                    title="Update Quantity"
                  >
                    <Edit2 size={16} />
                    Update
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(item._id, item.bloodGroup)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition"
                    title="Delete Inventory"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Blood Group Card */}
            {availableGroups.length > 0 && (
              <Link
                href="/organization/inventory/add"
                className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md hover:shadow-lg transition border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:bg-green-50 dark:hover:bg-slate-800"
              >
                <PlusIcon size={40} className="text-green-400 mb-2" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Add New Blood Type
                </p>
              </Link>
            )}
          </div>

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
