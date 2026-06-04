export interface Member {
  id: string;
  name: string;
  avatar: string;
  activity: 'High' | 'Medium' | 'Low';
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Link' | 'Doc';
  uploadedBy: string;
  date: string;
}

export interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface Circle {
  id: number;
  name: string;
  description: string;
  membersCount: number;
  activity: 'High' | 'Medium' | 'Low';
  category: string;
  members: Member[];
  resources: Resource[];
  messages: Message[];
}

export const studyCircles: Circle[] = [
  {
    id: 1,
    name: "Quantum Physics Masters",
    description: "Deep dive into quantum mechanics and particle physics concepts. Join us for weekly sessions!",
    membersCount: 42,
    activity: 'High',
    category: "Physics",
    members: [
      { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1', activity: 'High' },
      { id: '2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=2', activity: 'High' },
      { id: '3', name: 'Michael Ross', avatar: 'https://i.pravatar.cc/150?u=3', activity: 'Medium' },
    ],
    resources: [
      { id: 'r1', title: 'Schrödinger Equation Notes', type: 'PDF', uploadedBy: 'Sarah Chen', date: '2024-03-20' },
      { id: 'r2', title: 'Quantum Computing Intro', type: 'Link', uploadedBy: 'Alex Johnson', date: '2024-03-21' },
    ],
    messages: [
      { id: 'm1', user: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1', content: 'Does anyone have the link for the quantum entanglement lecture?', timestamp: '10:30 AM' },
      { id: 'm2', user: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=2', content: 'Yes! Let me share it in the resources section.', timestamp: '10:32 AM' },
    ]
  },
  {
    id: 2,
    name: "Architectural Wonders",
    description: "Discussing modern architecture and eco-friendly structural designs across the globe.",
    membersCount: 28,
    activity: 'Medium',
    category: "Design",
    members: [],
    resources: [],
    messages: []
  },
  {
    id: 3,
    name: "Data Structures & Algos",
    description: "Prepping for coding interviews with a focus on LeetCode hard problems and complexity analysis.",
    membersCount: 156,
    activity: 'High',
    category: "Computer Science",
    members: [],
    resources: [],
    messages: []
  },
  {
    id: 4,
    name: "Literature & Coffee",
    description: "Weekly book reviews and deep discussions about classic and contemporary literature.",
    membersCount: 18,
    activity: 'Low',
    category: "Arts",
    members: [],
    resources: [],
    messages: []
  }
];
