'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  UsersIcon,
  CalendarIcon,
  CubeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import AdminSideBar from '../_components/Sidebar';
import { handleLogout as handleLogoutServer } from '@/lib/actions/auth-action';
import { PaginationMetadata } from '@/lib/utils/pagination';
import { getCampaignImageUrl } from '@/lib/utils/imageUrl';
import {
  deleteCampaign,
  getAllCampaigns,
} from '@/lib/api/admin/campaign';
import { getAllUsers } from '@/lib/api/admin/user';
import { CampaignForm } from '@/app/components/CampaignForm';

interface CampaignOrganization {
  _id: string;
  organizationName?: string;
  fullName?: string;
  email?: string;
}

interface Campaign {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  targetUnits?: number;
  imageName?: string;
  participants?: string[];
  createdAt?: string;
  updatedAt?: string;
  organization?: CampaignOrganization;
}

interface OrganizationOption {
  _id: string;
  organizationName?: string;
  fullName?: string;
  email: string;
}

const ITEMS_PER_PAGE = 5;

export default function AdminCampaignsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [pagination, setPagination] = useState<PaginationMetadata>({
    currentPage: 1,
    pageSize: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [viewModalCampaign, setViewModalCampaign] = useState<Campaign | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalCampaign, setEditModalCampaign] = useState<Campaign | null>(null);
  const [deleteModalCampaign, setDeleteModalCampaign] = useState<Campaign | null>(null);

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
      setIsAuthorized(true);
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchCampaigns();
      fetchOrganizations();
    }
  }, [isAuthorized, currentPage]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCampaigns(currentPage, ITEMS_PER_PAGE);
      const campaignData = Array.isArray(response.data) ? response.data : [];
      setCampaigns(campaignData);

      if (response.pagination) {
        setPagination(response.pagination);
      } else {
        const totalItems = campaignData.length;
        setPagination({
          currentPage,
          pageSize: ITEMS_PER_PAGE,
          totalItems,
          totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
          hasNextPage: currentPage < Math.ceil(totalItems / ITEMS_PER_PAGE),
          hasPreviousPage: currentPage > 1,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await getAllUsers(1, 1000);
      const users = Array.isArray(response?.data) ? response.data : [];
      const organizationsOnly = users.filter((u: any) => u.userType === 'organization');
      setOrganizations(organizationsOnly);
    } catch {
      setOrganizations([]);
    }
  };

  const filteredCampaigns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return campaigns;

    return campaigns.filter((campaign) => {
      const orgName = campaign.organization?.organizationName || campaign.organization?.fullName || '';
      return (
        campaign.title.toLowerCase().includes(query) ||
        campaign.location.toLowerCase().includes(query) ||
        orgName.toLowerCase().includes(query)
      );
    });
  }, [campaigns, searchQuery]);

  const filteredPaginationMetadata: PaginationMetadata = {
    currentPage: pagination.currentPage,
    pageSize: ITEMS_PER_PAGE,
    totalItems: filteredCampaigns.length,
    totalPages: Math.max(1, Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE)),
    hasNextPage: pagination.currentPage < Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE),
    hasPreviousPage: pagination.currentPage > 1,
  };

  const handleDelete = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      setDeleteModalCampaign(null);
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete campaign');
    }
  };

  const handleExportCSV = () => {
    if (filteredCampaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }

    const headers = [
      'Title',
      'Organization',
      'Location',
      'Date',
      'Time',
      'Target Units',
      'Participants',
    ];

    const rows = filteredCampaigns.map((campaign) => [
      campaign.title,
      campaign.organization?.organizationName || campaign.organization?.fullName || 'N/A',
      campaign.location,
      campaign.date ? new Date(campaign.date).toLocaleDateString() : 'N/A',
      `${campaign.startTime || 'N/A'} - ${campaign.endTime || 'N/A'}`,
      campaign.targetUnits || 0,
      campaign.participants?.length || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `campaigns-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Campaigns exported successfully');
  };

  const handleAdminLogout = async () => {
    await handleLogoutServer();
    toast.success('Logged out successfully');
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    const totalPages = Math.max(1, pagination.totalPages);
    const current = pagination.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...');
      } else if (current >= totalPages - 2) {
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('...', current - 1, current, current + 1, '...');
      }
    }

    return pages;
  };

  const navItems = [
    { label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin' },
    { label: 'User Management', icon: <UsersIcon className="w-5 h-5" />, href: '/admin/users' },
    { label: 'Campaign Management', icon: <MegaphoneIcon className="w-5 h-5" />, active: true, href: '/admin/campaigns' },
    { label: 'Appointments', icon: <CalendarIcon className="w-5 h-5" />, href: '/admin/appointments' },
    { label: 'Inventory', icon: <CubeIcon className="w-5 h-5" />, href: '/admin/inventory' },
    { label: 'Reports', icon: <ChartBarIcon className="w-5 h-5" />, href: '/admin/reports' },
    { label: 'Profile', icon: <UserCircleIcon className="w-5 h-5" />, href: '/admin/profile' },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <AdminSideBar navItems={navItems} onLogout={handleAdminLogout} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns by title, location, or organization..."
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
              <div className="size-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border-2 border-red-600/20">
                {(currentUser?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-slate-500">Dashboard</span>
            <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Campaign Management</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Campaign Management</h2>
              <p className="text-slate-500 dark:text-zinc-400 mt-1">
                Manage blood donation campaigns across all organizations.
              </p>
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add New Campaign</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-zinc-800 px-6 flex flex-wrap items-center justify-between">
              <div className="py-4">
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Total Campaigns: <span className="font-bold text-slate-900 dark:text-white">{pagination.totalItems}</span>
                </p>
              </div>

              <div className="flex gap-3 py-3">
                <button
                  onClick={fetchCampaigns}
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

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="text-gray-600 mt-4">Loading campaigns...</p>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No campaigns found.</p>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="text-red-600 hover:text-red-700 font-semibold mt-2 inline-block"
                  >
                    Create your first campaign
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Campaign</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Organization</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Schedule</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Location</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Participants</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {campaign.imageName ? (
                              <img
                                src={getCampaignImageUrl(campaign.imageName) || ''}
                                alt={campaign.title}
                                className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-zinc-700"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500 font-bold">
                                {campaign.title.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{campaign.title}</p>
                              <p className="text-xs text-slate-500 max-w-xs truncate">{campaign.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-zinc-300 font-medium">
                          {campaign.organization?.organizationName || campaign.organization?.fullName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-400">
                          <div>{campaign.date ? new Date(campaign.date).toLocaleDateString() : 'N/A'}</div>
                          <div className="text-xs">{campaign.startTime} - {campaign.endTime}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-400">{campaign.location}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-400">
                          {campaign.participants?.length || 0}
                          {campaign.targetUnits ? ` / ${campaign.targetUnits}` : ''}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setViewModalCampaign(campaign)}
                              title="View"
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-600/5"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditModalCampaign(campaign)}
                              title="Edit"
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-600/5"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeleteModalCampaign(campaign)}
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

            {!isLoading && filteredCampaigns.length > 0 && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Showing page {pagination.currentPage} of {Math.max(1, pagination.totalPages)} ({filteredPaginationMetadata.totalItems} results)
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!pagination.hasPreviousPage}
                    className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-slate-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          page === pagination.currentPage
                            ? 'bg-red-600 text-white border border-red-600'
                            : 'border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {viewModalCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewModalCampaign(null)} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Campaign Details</h3>
                <button
                  onClick={() => setViewModalCampaign(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {viewModalCampaign.imageName && (
                  <img
                    src={getCampaignImageUrl(viewModalCampaign.imageName) || ''}
                    alt={viewModalCampaign.title}
                    className="w-full h-56 rounded-xl object-cover border border-slate-200 dark:border-zinc-800"
                  />
                )}

                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{viewModalCampaign.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{viewModalCampaign.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Organization</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {viewModalCampaign.organization?.organizationName || viewModalCampaign.organization?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Location</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{viewModalCampaign.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Date</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {viewModalCampaign.date ? new Date(viewModalCampaign.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Time</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {viewModalCampaign.startTime} - {viewModalCampaign.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Target Units</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{viewModalCampaign.targetUnits || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Participants</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{viewModalCampaign.participants?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setViewModalCampaign(null);
                    setEditModalCampaign(viewModalCampaign);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Edit Campaign
                </button>
                <button
                  onClick={() => setViewModalCampaign(null)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Create New Campaign</h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                <CampaignForm
                  mode="create"
                  organizations={organizations}
                  onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchCampaigns();
                  }}
                  onCancel={() => setCreateModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {editModalCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditModalCampaign(null)} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Edit Campaign</h3>
                <button
                  onClick={() => setEditModalCampaign(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                <CampaignForm
                  mode="edit"
                  campaignId={editModalCampaign._id}
                  organizations={organizations}
                  initialData={{
                    title: editModalCampaign.title,
                    description: editModalCampaign.description,
                    location: editModalCampaign.location,
                    date: editModalCampaign.date,
                    startTime: editModalCampaign.startTime,
                    endTime: editModalCampaign.endTime,
                    targetUnits: editModalCampaign.targetUnits,
                    imageName: editModalCampaign.imageName,
                    organizationId: editModalCampaign.organization?._id,
                  }}
                  onSuccess={() => {
                    setEditModalCampaign(null);
                    fetchCampaigns();
                  }}
                  onCancel={() => setEditModalCampaign(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModalCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModalCampaign(null)} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Confirm Delete</h3>
                <button
                  onClick={() => setDeleteModalCampaign(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-medium">Are you sure you want to delete this campaign?</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{deleteModalCampaign.title}</p>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                    ⚠️ This action cannot be undone. The campaign record will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => handleDelete(deleteModalCampaign._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Delete Campaign
                </button>
                <button
                  onClick={() => setDeleteModalCampaign(null)}
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
