'use client';

/**
 * DeleteConfirmationModal component
 * Custom overlay modal for delete confirmation
 * Replaces window.confirm() with a styled modal
 */

import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
          {/* Header */}
          <div className="bg-red-50 border-b border-red-200 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-600" />
              <h2 className="text-lg font-bold text-red-600">Delete User</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{itemName}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. The user and all associated data will be permanently deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
