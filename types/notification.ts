export type NotificationKind = 'follow' | 'like' | 'comment' | 'machine_alert';

export type MachineAlertMetric = 'waterLevel' | 'tankLevel' | 'ppm' | 'ph' | 'offline';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  actorName?: string;
  postTitle?: string;
  machineId?: string;
  machineName?: string;
  metric?: MachineAlertMetric;
  metricValue?: number | string;
  message?: string;
};
