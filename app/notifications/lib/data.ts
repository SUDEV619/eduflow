export type NotificationType = 'study' | 'mock' | 'circle' | 'admin' | 'system';

export interface AppNotification {
  id: string | number;
  db_id?: number; // Internal DB ID for UserBroadcastLink tracking
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  date_label: 'Today' | 'Yesterday' | 'Earlier';
}

export const notificationSettings = [
  { id: 'reminders', label: 'Study Reminders', description: 'Get notified when it\'s time for your scheduled study sessions.', initialValue: true },
  { id: 'tests', label: 'Mock Test Alerts', description: 'Receive updates when new tests are available or results are ready.', initialValue: true },
  { id: 'circles', label: 'Study Circle Activity', description: 'Stay updated with new messages and resources in your circles.', initialValue: false },
  { id: 'achievements', label: 'Achievement Alerts', description: 'Be the first to know when you unlock a new milestone or badge.', initialValue: true },
];
