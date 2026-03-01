'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, X, Loader, AlertCircle } from 'lucide-react';
import { handleGetNotifications } from '@/lib/actions/notification-action';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'CAMPAIGN' | 'BLOOD_REQUEST' | 'APPLICATION' | 'DONATION';
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: string;
  relatedEntityId?: string;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine user type from pathname
  const getUserTypeFromPath = () => {
    if (pathname.startsWith('/donor')) return 'donor';
    if (pathname.startsWith('/organization')) return 'organization';
    if (pathname.startsWith('/admin')) return 'admin';
    return 'donor'; // Default fallback
  };

  const userType = getUserTypeFromPath();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await handleGetNotifications();
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError(result.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CAMPAIGN':
        return '📢';
      case 'BLOOD_REQUEST':
        return '🩸';
      case 'APPLICATION':
        return '📋';
      case 'DONATION':
        return '❤️';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={20} className="animate-spin text-slate-600" />
              </div>
            ) : error ? (
              <div className="p-4 flex items-start gap-3 text-red-600">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !notification.isRead
                        ? 'bg-blue-50 dark:bg-blue-950/20'
                        : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                onClick={() => router.push(`/${userType}/notifications`)}
                className="text-sm font-medium text-red-600 hover:underline transition"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
