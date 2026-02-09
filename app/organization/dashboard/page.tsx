'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth-action';
import { 
  Droplet, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function OrganizationDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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

  if (!isAuthorized) {
    return null;
  }

  return (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Blood Units Available */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Blood Units In Stock</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">240</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">+12 this week</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-950 rounded-lg">
              <Droplet size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Active Donors */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Active Donors</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1,240</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">+45 new this month</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Camps */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Scheduled Camps</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">5</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Next: Feb 15</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
              <Calendar size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Critical Stock Alert */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Critical Alerts</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">2</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">O- and B+ low</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
              <AlertCircle size={24} className="text-yellow-600" />
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
              {[
                { type: 'O+', units: 45, status: 'Good' },
                { type: 'O-', units: 12, status: 'Critical' },
                { type: 'A+', units: 38, status: 'Good' },
                { type: 'B+', units: 8, status: 'Low' },
              ].map((blood) => (
                <div key={blood.type} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-red-600">{blood.type}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{blood.units} units</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{blood.status}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    blood.status === 'Critical' ? 'bg-red-100 text-red-700' :
                    blood.status === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {blood.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={24} className="text-blue-600" />
                Recent Donors
              </h2>
              <Link href="/organization/donors" className="text-green-600 hover:text-green-700 text-sm font-semibold">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: 'John Doe', blood: 'O+', time: '2 hours ago' },
                { name: 'Jane Smith', blood: 'A-', time: '5 hours ago' },
                { name: 'Mike Johnson', blood: 'B+', time: 'Yesterday' },
              ].map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{donor.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{donor.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{donor.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                    {donor.blood}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {[
                { title: 'Winter Blood Drive', date: 'Feb 15, 2024', status: 'In 3 days' },
                { title: 'University Campus', date: 'Feb 22, 2024', status: 'In 10 days' },
              ].map((event, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-sm">{event.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{event.date}</p>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">{event.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">Collections</p>
                <p className="font-bold">152 units</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">Distributions</p>
                <p className="font-bold">138 units</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">New Donors</p>
                <p className="font-bold">+45</p>
              </div>
              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded my-3" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Efficiency Rate</p>
                <p className="font-bold text-green-600">91%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
