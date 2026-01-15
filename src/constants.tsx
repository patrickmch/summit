
import React from 'react';
import { 
  Mountain, 
  Wind, 
  Flame, 
  Trophy, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Dumbbell,
  Clock,
  Zap
} from 'lucide-react';
import { Workout, MetricData } from './types';

export const COLORS = {
  bg: '#1a1a1a',
  surface: '#262626',
  text: '#f5f2ed',
  accent: '#d97706',
  accentLight: '#f59e0b',
  muted: '#737373',
};

export const NAVIGATION = [
  { name: 'Today', icon: <Flame size={20} />, path: '/' },
  { name: 'Plan', icon: <Calendar size={20} />, path: '/plan' },
  { name: 'Chat', icon: <MessageSquare size={20} />, path: '/chat' },
  { name: 'Progress', icon: <BarChart3 size={20} />, path: '/progress' },
  { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

export const MOCK_WORKOUT: Workout = {
  id: 'w1',
  title: 'Strength + Limit Bouldering',
  type: 'Technical',
  duration: '120 min',
  phase: 'Base Building',
  week: 3,
  blocks: [
    {
      title: 'Warm-up',
      duration: '20 min',
      instructions: 'Dynamic stretching followed by easy bouldering (V0-V1).',
      details: ['5 min mobility', '10 min easy climbing', '5 min focused recruitment']
    },
    {
      title: 'Hangboard (Max Hangs)',
      duration: '30 min',
      instructions: 'Targeting finger strength on 20mm edge.',
      details: ['6 sets of 10s hangs', '3 min rest between sets', 'Targeting 90% max']
    },
    {
      title: 'Limit Bouldering',
      duration: '60 min',
      instructions: 'Work 2-3 boulders at or above your current maximum grade.',
      details: ['Full rest (3-5 mins) between attempts', 'Focus on precision and maximum power']
    }
  ]
};

export const MOCK_METRICS: MetricData[] = [
  { date: 'Mon', load: 85, hrv: 62, sleep: 7.5, completed: true },
  { date: 'Tue', load: 120, hrv: 58, sleep: 6.8, completed: true },
  { date: 'Wed', load: 40, hrv: 65, sleep: 8.2, completed: true },
  { date: 'Thu', load: 150, hrv: 55, sleep: 7.1, completed: true },
  { date: 'Fri', load: 30, hrv: 68, sleep: 8.5, completed: false },
  { date: 'Sat', load: 200, hrv: 52, sleep: 6.5, completed: false },
  { date: 'Sun', load: 0, hrv: 72, sleep: 9.0, completed: false },
];
