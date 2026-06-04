export interface DashboardData {
  overview: {
    total_hours: number;
    today_hours: number;
    today_minutes: number;
    streak: number;
    focus_score: number;
    unread_notifications: number;
  };
  recent_activity: {
    study_sessions: Array<{
      id: number;
      subject: string;
      subject_display: string;
      duration: number;
      date: string;
      created_at: string;
    }>;
    mock_tests: Array<{
      id: number;
      test_title: string;
      score: number;
      date: string;
    }>;
  };
  circles: Array<{
    id: number;
    name: string;
    members_count: number;
    subject: string;
  }>;
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }>;
  trend: Array<{
    date: string;
    total: number;
  }>;
}
