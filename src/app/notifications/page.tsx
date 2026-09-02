'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AppNotification } from '@/types/notification';
import { fetchNotifications, markNotificationAsRead } from '@/lib/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { Bell, ShieldAlert, CheckCircle2, RefreshCw, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'major'>('all');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchNotifications(user?.role);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'major') return n.type === 'major_breakdown';
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />

      <main className="pl-64">
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Notification Center
              </h1>
              <p className="text-xs text-slate-500">
                Real-time breakdown alerts, status state changes, and manager approval updates
              </p>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-all shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-amber-500/10 text-amber-900 border border-amber-500/30'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-stone-50'
              }`}
            >
              All Notifications ({notifications.length})
            </button>

            <button
              onClick={() => setFilter('unread')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-amber-500/10 text-amber-900 border border-amber-500/30'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-stone-50'
              }`}
            >
              Unread ({notifications.filter((n) => !n.is_read).length})
            </button>

            <button
              onClick={() => setFilter('major')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === 'major'
                  ? 'bg-slate-900 text-white border border-slate-900 font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-stone-50'
              }`}
            >
              🚨 Major Breakdown Alerts
            </button>
          </div>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-2">
              <Bell className="h-8 w-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Notifications</h3>
              <p className="text-xs text-slate-500">You are all caught up! No recent alerts or status updates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-4 transition-all flex items-start justify-between gap-4 shadow-xs ${
                    n.is_read
                      ? 'bg-white border-slate-200'
                      : 'bg-amber-500/5 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${
                      n.type === 'major_breakdown'
                        ? 'bg-slate-900 text-amber-400'
                        : n.type === 'ticket_approval'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-stone-100 text-slate-700'
                    }`}>
                      {n.type === 'major_breakdown' ? (
                        <ShieldAlert className="h-4 w-4" />
                      ) : n.type === 'ticket_approval' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono block pt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as Read"
                      className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-400/40 px-2.5 py-1 rounded-lg transition-all flex-shrink-0"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
