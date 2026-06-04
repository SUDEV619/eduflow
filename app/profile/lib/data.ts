export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface ActivityItem {
  id: string;
  type: 'study' | 'test' | 'achievement';
  title: string;
  timestamp: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  preferredSubjects: string[];
  studyGoals: string;
  stats: {
    totalStudyHours: number;
    dailyAverage: number;
    weeklyProgress: number;
    currentStreak: number;
  };
  achievements: Achievement[];
  activity: ActivityItem[];
  isPublic: boolean;
}

export const userProfile: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  bio: "Passionate learner exploring the frontiers of Physics and Computer Science. Always up for a coding challenge!",
  avatar: "https://i.pravatar.cc/150?u=alexjohnson",
  preferredSubjects: ["Quantum Physics", "Data Structures", "Web Development"],
  studyGoals: "Become a proficient Full-Stack Architect and master Quantum Computing fundamentals.",
  stats: {
    totalStudyHours: 124,
    dailyAverage: 3.5,
    weeklyProgress: 85,
    currentStreak: 7,
  },
  achievements: [
    { id: 'a1', name: "Early Bird", description: "Completed study sessions 5 days in a row before 8 AM.", unlocked: true, icon: "🌅" },
    { id: 'a2', name: "Math Whiz", description: "Scored 100% in a Mathematics mock test.", unlocked: true, icon: "🔢" },
    { id: 'a3', name: "Community Star", description: "Created a Study Circle with more than 50 members.", unlocked: false, icon: "⭐" },
    { id: 'a4', name: "Consistently Focused", description: "Successfully tracked 50+ hours of focused study.", unlocked: true, icon: "🎯" },
    { id: 'a5', name: "Knowledge Sharer", description: "Uploaded 20+ resources in Study Circles Vault.", unlocked: false, icon: "📚" },
  ],
  activity: [
    { id: 't1', type: 'study', title: "Focused Study: Data Structures", timestamp: "2 hours ago", icon: "📖" },
    { id: 't2', type: 'test', title: "Completed: Physics Mock Test #4", timestamp: "Yesterday", icon: "✅" },
    { id: 't3', type: 'achievement', title: "Unlocked Achievement: Consistently Focused", timestamp: "2 days ago", icon: "🏆" },
    { id: 't4', type: 'study', title: "Group Session: Quantum Masters", timestamp: "3 days ago", icon: "👥" },
  ],
  isPublic: true,
};
