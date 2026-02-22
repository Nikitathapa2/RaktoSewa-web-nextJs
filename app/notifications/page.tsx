'use client';

import React, { useEffect, useState } from 'react';
import { handleGetNotifications } from '@/lib/actions/notification-action';
import { Loader, AlertCircle, Bell } from 'lucide-react';

interface Notification {
  _id: string;
  type: 'CAMPAIGN' | 'BLOOD_REQUEST';
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: string;
  relatedEntityId?: string;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await handleGetNotifications();
        if (result.success && result.data) {
          setNotifications(result.data);
        } else {
          setError(result.message || 'Failed to load notifications');
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CAMPAIGN':
        return '📢';
      case 'BLOOD_REQUEST':
        return '🩸';
     
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'CAMPAIGN':
        return 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-600';
      case 'BLOOD_REQUEST':
        return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600';
     
      default:
        return 'bg-slate-50 dark:bg-slate-800/20';
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const filteredNotifications =
    filterType === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8 p-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Bell size={28} className="text-slate-600 dark:text-slate-400" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3">
        {['all', 'CAMPAIGN', 'BLOOD_REQUEST'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filterType === type
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {type === 'all'
              ? 'All'
              : type === 'CAMPAIGN'
                ? 'Campaigns'
                : 'Blood Requests'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader size={32} className="animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading notifications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-900 dark:text-red-100">Error loading notifications</h3>
            <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Bell size={48} className="mx-auto mb-4 text-slate-400 opacity-50" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {filterType === 'all' ? 'No notifications yet' : `No ${filterType.toLowerCase()} notifications`}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {filterType === 'all'
              ? "You're all caught up! Check back later for updates."
              : 'No notifications of this type have been sent yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-all hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 ${getNotificationColor(
                notification.type
              )}`}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{notification.type.replace('_', ' ')}</p>
                      <p className="text-slate-700 dark:text-slate-200 mt-1.5 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>

                
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
