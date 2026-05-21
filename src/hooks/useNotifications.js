import { useContext } from 'react';
import { NotificationsContext } from '../features/notifications/NotificationsProvider';

export function useNotifications() {
  return useContext(NotificationsContext);
}
