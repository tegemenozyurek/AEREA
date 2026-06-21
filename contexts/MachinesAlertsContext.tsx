import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { MOCK_ROOMS } from '../data/mockMachines';
import type { Room } from '../types/room';
import { countAllRoomAlerts } from '../utils/roomEnvironmentAlerts';

type MachinesAlertsContextValue = {
  alertCount: number;
  syncRooms: (rooms: Room[]) => void;
};

const MachinesAlertsContext = createContext<MachinesAlertsContextValue | null>(null);

export function MachinesAlertsProvider({ children }: { children: ReactNode }) {
  const [alertCount, setAlertCount] = useState(() => countAllRoomAlerts(MOCK_ROOMS));

  const syncRooms = useCallback((rooms: Room[]) => {
    setAlertCount(countAllRoomAlerts(rooms));
  }, []);

  const value = useMemo<MachinesAlertsContextValue>(
    () => ({ alertCount, syncRooms }),
    [alertCount, syncRooms],
  );

  return (
    <MachinesAlertsContext.Provider value={value}>{children}</MachinesAlertsContext.Provider>
  );
}

export function useMachinesAlerts(): MachinesAlertsContextValue {
  const ctx = useContext(MachinesAlertsContext);
  if (!ctx) {
    throw new Error('useMachinesAlerts must be used within MachinesAlertsProvider');
  }
  return ctx;
}
