'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getAllBloodStockAction } from '@/lib/actions/inventory-action';
import { Building2, AlertCircle, Droplet, Loader2 } from 'lucide-react';
import Pagination from '@/app/components/Pagination';
import toast from 'react-hot-toast';

interface BloodStockItem {
  bloodGroup: string;
  quantity: number;
}

interface OrganizationStock {
  organization: {
    _id: string;
    organizationName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  bloodStock: BloodStockItem[];
  totalUnits: number;
}

export default function BloodInventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [organizationStocks, setOrganizationStocks] = useState<OrganizationStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    if (isAuthorized) {
      loadInventory();
    }
  }, [isAuthorized, currentPage]);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 Loading blood inventory - Page:', currentPage, 'Limit:', pageSize);
      const response = await getAllBloodStockAction(currentPage, pageSize);
      console.log('🔍 Response:', response);

      // Handle error responses
      if (response?.success === false) {
        throw new Error(response?.message || 'Failed to fetch inventory');
      }

      // Extract organized data
      const data = response?.data || [];
      const pagination = response?.pagination || { totalItems: 0, totalPages: 0 };

      console.log('✅ Organizations loaded:', data.length);
      console.log('📄 Pagination:', pagination);

      setOrganizationStocks(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch (err: any) {
      console.error('❌ Error loading inventory:', err);
      setError(err.message || 'Failed to load blood inventory');
      toast.error(err.message || 'Failed to load blood inventory');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
    if (quantity < 5) return 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
    if (quantity < 15) return 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
    return 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600';
  };

  const getStockBadgeColor = (quantity: number) => {
    if (quantity === 0) return 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    if (quantity < 5) return 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    if (quantity < 15) return 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    return 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
  };

  const getStockLabel = (quantity: number) => {
    if (quantity === 0) return 'Out';
    if (quantity < 5) return 'Low';
    if (quantity < 15) return 'Medium';
    return 'Good';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-slate-700 dark:text-slate-300">Loading blood inventory...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Droplet className="h-8 w-8 text-red-600 dark:text-red-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Blood Inventory</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            View available blood units across all registered organizations
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Error</h3>
              <p className="text-slate-700 dark:text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && organizationStocks.length === 0 && !error && (
          <div className="text-center py-12">
            <Droplet className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Blood Inventory Available
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              There are no blood units available from any organization at this time.
            </p>
          </div>
        )}

        {/* Organizations Grid */}
        {organizationStocks.length > 0 && (
          <div className="space-y-6">
            {organizationStocks.map((orgStock) => (
              <div
                key={orgStock.organization._id}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Organization Header */}
                <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {orgStock.organization.organizationName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {orgStock.organization.address}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <a
                            href={`mailto:${orgStock.organization.email}`}
                            className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:underline transition"
                          >
                            {orgStock.organization.email}
                          </a>
                          <a
                            href={`tel:${orgStock.organization.phoneNumber}`}
                            className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:underline transition"
                          >
                            {orgStock.organization.phoneNumber}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Total Units</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {orgStock.totalUnits}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blood Stock Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {orgStock.bloodStock.map((blood) => (
                      <div
                        key={blood.bloodGroup}
                        className={`p-4 rounded-lg border transition-all ${getStockColor(
                          blood.quantity
                        )}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg">{blood.bloodGroup}</span>
                          <Droplet className="h-5 w-5 opacity-60" />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold">{blood.quantity}</span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${getStockBadgeColor(
                              blood.quantity
                            )}`}
                          >
                            {getStockLabel(blood.quantity)}
                          </span>
                        </div>
                        <p className="text-xs mt-2 opacity-70">units available</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {organizationStocks.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>
    </div>
  );
}
