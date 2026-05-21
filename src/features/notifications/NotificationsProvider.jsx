import { createContext, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { notificationsApi } from '../../services/api/notificationsApi';
import { formatRelativeTimeLabel } from '../../utils/formatters';
import { selectAuth } from '../auth/authSlice';

export const NotificationsContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: '',
  markingIds: [],
  reloadNotifications: async () => {},
  markNotificationAsRead: async () => {},
});

function getNotificationErrorMessage(error) {
  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.detail) {
    return responseData.detail;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.title) {
    return responseData.title;
  }

  return error.message || 'Notifications request failed.';
}

function normalizeNotification(record, index) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const rawTime = record.createdAt || '';

  return {
    id: record.id ?? `notification-${index}`,
    userName: record.userName || '',
    title: record.title || 'Notification',
    description: record.content || '',
    time: formatRelativeTimeLabel(rawTime),
    rawTime,
    isUnread: record.isRead === false,
    isRead: Boolean(record.isRead),
    link: record.link || '',
  };
}

export function NotificationsProvider({ children }) {
  const auth = useAppSelector(selectAuth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markingIds, setMarkingIds] = useState([]);

  const reloadNotifications = async () => {
    if (!auth.isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError('');
      setMarkingIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await notificationsApi.getAll({
        unreadOnly: true,
        page: 1,
        pageSize: 20,
      });
      const nextNotifications = (Array.isArray(response?.notifications) ? response.notifications : [])
        .map((item, index) => normalizeNotification(item, index))
        .filter(Boolean);

      setNotifications(nextNotifications);
      setUnreadCount(
        typeof response?.total === 'number' ? response.total : nextNotifications.length,
      );
    } catch (requestError) {
      setNotifications([]);
      setUnreadCount(0);
      setError(getNotificationErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId || markingIds.includes(notificationId)) {
      return;
    }

    setMarkingIds((current) => [...current, notificationId]);

    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (requestError) {
      setError(getNotificationErrorMessage(requestError));
    } finally {
      setMarkingIds((current) => current.filter((id) => id !== notificationId));
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError('');
      setMarkingIds([]);
      setLoading(false);
      return;
    }

    void reloadNotifications();
  }, [auth.isAuthenticated]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      markingIds,
      reloadNotifications,
      markNotificationAsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      markingIds,
      reloadNotifications,
      markNotificationAsRead,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
