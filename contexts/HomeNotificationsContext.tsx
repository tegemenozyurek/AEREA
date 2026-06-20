import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { mockNotifications } from '../data/mockNotifications';
import { getUnreadCount } from '../data/notificationUtils';
import type { AppNotification } from '../types/notification';

type HomeNotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  deleteAll: () => void;
  deleteOne: (id: string) => void;
};

const HomeNotificationsContext = createContext<HomeNotificationsContextValue | null>(null);

export function HomeNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    mockNotifications.map((n) => ({ ...n })),
  );

  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const deleteOne = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo<HomeNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAllRead,
      deleteAll,
      deleteOne,
    }),
    [notifications, unreadCount, markAllRead, deleteAll, deleteOne],
  );

  return (
    <HomeNotificationsContext.Provider value={value}>
      {children}
    </HomeNotificationsContext.Provider>
  );
}

export function useHomeNotifications(): HomeNotificationsContextValue {
  const ctx = useContext(HomeNotificationsContext);
  if (!ctx) {
    throw new Error('useHomeNotifications must be used within HomeNotificationsProvider');
  }
  return ctx;
}
