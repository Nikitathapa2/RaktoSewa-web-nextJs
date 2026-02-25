'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { getOrganizationDashboardStatsAction, getOrganizationBloodInventoryAction } from '@/lib/actions/organization-action';
import { 
  Droplet, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import NotificationDropdown from '@/app/components/NotificationDropdown';

interface DashboardStats {
  totalBloodUnits: number;
  totalDonorsCount: number;
  totalCampaigns: number;
}

interface BloodInventoryItem {
  _id: string;
  organization: string;
  bloodGroup: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export default function OrganizationDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      const userData = currentUser.user;
      console.log('Loaded user data:', userData.userType);
      
      setUser(userData);
      setIsAuthorized(true);
    };
    
    loadUser();
  }, [router]);

  // Fetch dashboard statistics
  useEffect(() => {
    if (!isAuthorized) return;

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        console.log('📊 Fetching dashboard stats...');
        const response = await getOrganizationDashboardStatsAction();
        
        if (response.success && response.data) {
          console.log('✅ Stats loaded:', response.data);
          setStats(response.data);
        } else {
          console.error('❌ Failed to load stats:', response.message);
        }
      } catch (error) {
        console.error('❌ Error loading stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [isAuthorized]);

  // Fetch blood inventory
  useEffect(() => {
    if (!isAuthorized) return;

    const loadInventory = async () => {
      setInventoryLoading(true);
      try {
        console.log('🩸 Fetching blood inventory...');
        const response = await getOrganizationBloodInventoryAction(1, 100);
        
        if (response.success && response.data) {
          console.log('✅ Inventory loaded:', response.data);
          setBloodInventory(response.data);
        } else {
          console.error('❌ Failed to load inventory:', response.message);
        }
      } catch (error) {
        console.error('❌ Error loading inventory:', error);
      } finally {
        setInventoryLoading(false);
      }
    };

    loadInventory();
  }, [isAuthorized]);

  if (!isAuthorized) {
    return null;
  }

  // Helper function to determine blood status based on quantity
  const getBloodStatus = (quantity: number): string => {
    if (quantity < 5) return 'Critical';
    if (quantity < 10) return 'Low';
    return 'Good';
  };

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-end">
        <NotificationDropdown />
      </header>

      <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl p-8 shadow-lg">
        <h1 className="text-4xl font-extrabold">
          Welcome, {user?.organizationName || 'Blood Bank'}! 🩸
        </h1>
        <p className="text-green-100 mt-2 text-lg">
          Manage your blood inventory and donor network efficiently
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blood Units Available */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Blood Units In Stock</p>
              {statsLoading ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stats?.totalBloodUnits ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available across all blood types</p>
                </>
              )}
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-950 rounded-lg">
              <Droplet size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Donors */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Total Donors</p>
              {statsLoading ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stats?.totalDonorsCount ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registered in the system</p>
                </>
              )}
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Campaigns */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Total Camps</p>
              {statsLoading ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stats?.totalCampaigns ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Campaigns organized</p>
                </>
              )}
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
              <Calendar size={24} className="text-green-600" />
            </div>
          </div>
        </div>

       
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blood Inventory Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Droplet size={24} className="text-red-600" />
                Blood Type Inventory
              </h2>
              <Link href="/organization/inventory" className="text-green-600 hover:text-green-700 text-sm font-semibold">
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {inventoryLoading ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                  <p className="text-sm text-slate-500">Loading blood inventory...</p>
                </div>
              ) : bloodInventory && bloodInventory.length > 0 ? (
                bloodInventory.slice(0, 3).map((blood) => {
                  const status = getBloodStatus(blood.quantity);
                  return (
                    <div key={blood._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-red-600">{blood.bloodGroup}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{blood.quantity} units</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{status}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'Critical' ? 'bg-red-100 text-red-700' :
                        status === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {status}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
                  <AlertCircle size={18} />
                  <p className="text-sm">No blood inventory data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Donations */}
         
          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/organization/profile"
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/40 transition border border-green-200 dark:border-green-900"
              >
                <Users size={18} />
                <span className="font-semibold text-sm">Edit Profile</span>
              </Link>
              
              <button className="w-full flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/40 transition border border-blue-200 dark:border-blue-900">
                <Plus size={18} />
                <span className="font-semibold text-sm">New Donation Camp</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition border border-red-200 dark:border-red-900">
                <Droplet size={18} />
                <span className="font-semibold text-sm">Update Inventory</span>
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
        

          {/* Statistics */}
         
        </div>
      </div>
      </div>
    </>
  );
}
