'use client';

/**
 * UserTable component
 * Displays a table of users with columns: ID, Name, Email, Role, Actions
 * Used in /admin/users page
 */

import Link from 'next/link';
import Image from 'next/image';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/api/axios';
import { getProfilePictureUrl } from '@/lib/utils/imageUrl';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export interface UserRow {
  _id: string;
  fullName?: string;
  organizationName?: string;
  email: string;
  role: 'user' | 'admin';
  userType: 'donor' | 'organization';
  profilePicture?: string;
  createdAt?: string;
}

interface UserTableProps {
  users: UserRow[];
  onDelete?: (id: string) => void;
}

export function UserTable({ users, onDelete }: UserTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    const { id } = deleteConfirm;
    setIsDeleting(id);

    try {
      const response = await axiosInstance.delete(`/api/admin/users/${id}`);
      toast.success(response.data?.message || 'User deleted successfully');
      setDeleteConfirm(null);
      onDelete?.(id);
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Picture</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm">
                  {user.profilePicture ? (
                    <div className="w-10 h-10 relative">
                      <Image
                        src={getProfilePictureUrl(user.profilePicture) || ''}
                        alt="Profile"
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                        onError={() => {
                          // Fallback handled by placeholder or empty state
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                  {user._id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {user.fullName || user.organizationName || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.userType === 'donor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.userType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center space-x-2 flex justify-center">
                  {/* View Button */}
                  <Link
                    href={`/admin/users/${user._id}`}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="View details"
                  >
                    <Eye size={18} />
                  </Link>

                  {/* Edit Button */}
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="text-yellow-600 hover:text-yellow-800 transition"
                    title="Edit user"
                  >
                    <Edit size={18} />
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(user._id, user.fullName || user.organizationName || user.email)}
                    disabled={isDeleting === user._id}
                    className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
