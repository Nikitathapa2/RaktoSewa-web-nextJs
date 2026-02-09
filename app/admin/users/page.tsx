'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import {
  UsersIcon,
  CalendarIcon,
  CubeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { getAllUsers } from '@/lib/api/admin/user';
import { getProfilePictureUrl } from '@/lib/utils/imageUrl';
import axiosInstance from '@/lib/api/axios';
import { UserForm } from '@/app/components/UserForm';
import AdminSideBar from '../_components/Sidebar';
import { handleLogout as handleLogoutServer } from '@/lib/actions/auth-action';

interface User {
  _id: string;
  fullName?: string;
  organizationName?: string;
  email: string;
  role: 'user' | 'admin';
  userType: 'donor' | 'organization';
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
  bloodGroup?: string;
  headOfOrganization?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal states
  const [viewModalUser, setViewModalUser] = useState<User | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  // Check authorization on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }
      setCurrentUser(userData);
    } catch {
      router.push('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  // Fetch users on mount
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers();
      console.log('API Response:', response);
      
      const userData = Array.isArray(response.data) ? response.data : [];
      setUsers(userData);
      if (userData.length === 0) {
        toast('No users found. Create a new user to get started.');
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error(error.message || 'Failed to load users from backend');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(user => user._id !== id));
      setDeleteModalUser(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleExportCSV = () => {
    try {
      if (filteredUsers.length === 0) {
        toast.error('No users to export');
        return;
      }

      // Define CSV headers
      const headers = ['Full Name', 'Email', 'Phone Number', 'Role', 'User Type', 'Organization', 'Blood Group', 'Created Date'];

      // Map users data to CSV rows
      const rows = filteredUsers.map(user => [
        user.fullName || user.organizationName || 'N/A',
        user.email || 'N/A',
        user.phoneNumber || 'N/A',
        user.role || 'N/A',
        user.userType || 'N/A',
        user.organizationName || 'N/A',
        user.bloodGroup || 'N/A',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Users exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    }
  };

  const handleadminLogout = async () => {
      await handleLogoutServer();
      toast.success('Logged out successfully');
  };

  // Filter users based on selected tab and search
  const filteredUsers = users.filter(user => {
    // Filter by tab
    let tabMatch = true;
    if (selectedTab === 'donors') {
      tabMatch = user.userType === 'donor';
    } else if (selectedTab === 'organizations') {
      tabMatch = user.userType === 'organization';
    } else if (selectedTab === 'admins') {
      tabMatch = user.role === 'admin';
    }

    // Filter by search
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = (user.fullName || user.organizationName || '').toLowerCase().includes(searchLower);
    const emailMatch = user.email.toLowerCase().includes(searchLower);

    return tabMatch && (nameMatch || emailMatch);
  });

  // Count users by type
  const donorCount = users.filter(u => u.userType === 'donor').length;
  const orgCount = users.filter(u => u.userType === 'organization').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const getUserType = (user: User) => {
    if (user.role === 'admin') return 'Admin';
    return user.userType === 'donor' ? 'Donor' : 'Organization';
  };

  const getTypeColor = (user: User) => {
    if (user.role === 'admin') {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
    if (user.userType === 'donor') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  const navItems = [
    { label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin' },
    { label: 'User Management', icon: <UsersIcon className="w-5 h-5" />, active: true, href: '/admin/users' },
    { label: 'Appointments', icon: <CalendarIcon className="w-5 h-5" />, href: '/admin/appointments' },
    { label: 'Inventory', icon: <CubeIcon className="w-5 h-5" />, href: '/admin/inventory' },
    { label: 'Reports', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin/reports' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
    <AdminSideBar navItems={navItems} onLogout={handleadminLogout} />
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 py-2 pl-10 pr-3 text-sm bg-slate-100 dark:bg-zinc-800 placeholder:text-slate-500 focus:ring-2 focus:ring-red-600/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600"></span>
            </button>
            <button className="p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{currentUser?.fullName || currentUser?.email || 'Admin User'}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              {currentUser?.profilePicture ? (
                <img
                  src={getProfilePictureUrl(currentUser.profilePicture) || 'https://via.placeholder.com/40?text=A'}
                  alt="Profile"
                  className="size-10 rounded-full object-cover border-2 border-red-600/20"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/40?text=A';
                  }}
                />
              ) : (
                <div className="size-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border-2 border-red-600/20">
                  {(currentUser?.fullName || 'A').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <a href="#" className="text-sm text-slate-500 hover:text-red-600 transition-colors">
              Dashboard
            </a>
            <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">User Management</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                User Management
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 mt-1">
                Manage donors, organizations, and admin users within the Raktosewa ecosystem.
              </p>
            </div>
            <Link
              href="/admin/users/create"
              onClick={(e) => {
                e.preventDefault();
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Add New User</span>
            </Link>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            {/* Tabs & Filters */}
            <div className="border-b border-slate-200 dark:border-zinc-800 px-6 flex flex-wrap items-center justify-between">
              <div className="flex gap-8 overflow-x-auto">
                {['all', 'donors', 'organizations', 'admins'].map((tab, idx) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex items-center gap-2 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                      selectedTab === tab
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                    }`}
                  >
                    {['All Users', 'Donors', 'Organizations', 'Admins'][idx]}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedTab === tab
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-slate-100 dark:bg-zinc-800'
                    }`}>
                      {[users.length, donorCount, orgCount, adminCount][idx]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 py-3">
                <button
                  onClick={fetchUsers}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="text-gray-600 mt-4">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found.</p>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="text-red-600 hover:text-red-700 font-semibold mt-2 inline-block"
                  >
                    Create your first user
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        User Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Type
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Address
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Created
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profilePicture ? (
                              <img
                                src={getProfilePictureUrl(user.profilePicture) || 'https://via.placeholder.com/40?text=U'}
                                alt="Profile"
                                className="size-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/40?text=U';
                                }}
                              />
                            ) : (
                              <div className="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold border-2 border-white dark:border-zinc-800 shadow-sm">
                                {(user.fullName || user.organizationName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold">
                                {user.fullName || user.organizationName || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${getTypeColor(
                              user
                            )}`}
                          >
                            {getUserType(user)}
                            {user.bloodGroup && ` (${user.bloodGroup})`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {user.phoneNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {user.address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setViewModalUser(user)}
                              title="View Profile"
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-600/5"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditModalUser(user)}
                              title="Edit"
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-600/5"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeleteModalUser(user)}
                              title="Delete"
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-600/5"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && filteredUsers.length > 0 && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {filteredUsers.length} of {users.length} total users
                </p>
                <div className="flex gap-2">
                  <button
                    disabled
                    className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-red-600 text-white border border-red-600 rounded-lg text-sm font-bold">
                    1
                  </button>
                  <button
                    disabled
                    className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View User Modal */}
      {viewModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewModalUser(null)} />
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-zinc-800">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">User Details</h3>
                <button
                  onClick={() => setViewModalUser(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="flex items-start gap-6 mb-6">
                  {viewModalUser.profilePicture ? (
                    <img
                      src={getProfilePictureUrl(viewModalUser.profilePicture) || 'https://via.placeholder.com/96?text=U'}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-red-600/20"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/96?text=U';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-red-600/20">
                      {(viewModalUser.fullName || viewModalUser.organizationName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                      {viewModalUser.fullName || viewModalUser.organizationName}
                    </h4>
                    <p className="text-slate-500 dark:text-zinc-400">{viewModalUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(viewModalUser)}`}>
                        {getUserType(viewModalUser)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        viewModalUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {viewModalUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {viewModalUser.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {viewModalUser.address || 'N/A'}
                    </p>
                  </div>
                  {viewModalUser.bloodGroup && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Blood Group</p>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                        {viewModalUser.bloodGroup}
                      </p>
                    </div>
                  )}
                  {viewModalUser.headOfOrganization && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Head of Org</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                        {viewModalUser.headOfOrganization}
                      </p>
                    </div>
                  )}
                  {viewModalUser.dateOfBirth && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Date of Birth</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                        {new Date(viewModalUser.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Joined</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {viewModalUser.createdAt ? new Date(viewModalUser.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setViewModalUser(null);
                    setEditModalUser(viewModalUser);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Edit User
                </button>
                <button
                  onClick={() => setViewModalUser(null)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Create New User</h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <UserForm
                  mode="create"
                  onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchUsers();
                  }}
                  onCancel={() => setCreateModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditModalUser(null)} />
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Edit User</h3>
                <button
                  onClick={() => setEditModalUser(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <UserForm
                  mode="edit"
                  userId={editModalUser._id}
                  initialData={{
                    fullName: editModalUser.fullName,
                    organizationName: editModalUser.organizationName,
                    email: editModalUser.email,
                    role: editModalUser.role,
                    userType: editModalUser.userType,
                    phoneNumber: editModalUser.phoneNumber,
                    address: editModalUser.address,
                    profilePicture: editModalUser.profilePicture,
                    bloodGroup: editModalUser.bloodGroup,
                    headOfOrganization: editModalUser.headOfOrganization,
                    dateOfBirth: editModalUser.dateOfBirth,
                  }}
                  onSuccess={() => {
                    setEditModalUser(null);
                    fetchUsers();
                  }}
                  onCancel={() => setEditModalUser(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModalUser(null)} />
            
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-zinc-800">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Confirm Delete</h3>
                <button
                  onClick={() => setDeleteModalUser(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-medium">
                      Are you sure you want to delete this user?
                    </p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                      {deleteModalUser.fullName || deleteModalUser.organizationName} ({deleteModalUser.email})
                    </p>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                    ⚠️ This action cannot be undone. All user data will be permanently deleted.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => handleDelete(deleteModalUser._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Delete User
                </button>
                <button
                  onClick={() => setDeleteModalUser(null)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}