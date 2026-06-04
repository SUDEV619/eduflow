export interface ProfileData {
  name: string;
  email: string;
  photo: string | null;
  description: string;
  role: string;
  date_joined: string;
}

export interface ProfileStats {
  total_hours: number;
  daily_average: number;
  weekly_progress: number;
  streak: number;
  today_hours: number;
}

export interface TimelineItem {
  type: 'study' | 'mock';
  date: string;
  title: string;
  text: string;
}
