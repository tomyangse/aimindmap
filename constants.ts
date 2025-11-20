import { MindMapData } from './types';

export const INITIAL_DATA: MindMapData = {
  id: 'root',
  label: 'AI Assistant Module Summary',
  color: '#F59E0B', // Amber-500
  children: [
    {
      id: 'c1',
      label: 'Existing Core Modules (V1.0)',
      color: '#3B82F6', // Blue-500
      children: [
        { id: 'c1-1', label: 'Shopping List Module', color: '#60A5FA' },
        { id: 'c1-2', label: 'Task Management', color: '#60A5FA' }
      ]
    },
    {
      id: 'c2',
      label: 'Suggested Future Modules (V2.0 Expansion)',
      color: '#EF4444', // Red-500
      children: [
        { 
            id: 'c2-1', 
            label: 'Work Schedule', 
            color: '#F87171',
            children: [
                { id: 'c2-1-1', label: 'Daily Weather' },
                { id: 'c2-1-2', label: 'Full Day Schedule' },
                { id: 'c2-1-3', label: 'Todos' }
            ]
        },
        { 
            id: 'c2-2', 
            label: 'Weight Management', 
            color: '#F87171',
            children: [
                { id: 'c2-2-1', label: 'Photo Logging' },
                { id: 'c2-2-2', label: 'Calorie Calculation' }
            ]
        },
        { id: 'c2-3', label: 'Fitness Module', color: '#F87171' },
        { 
            id: 'c2-4', 
            label: 'Daily Reminders', 
            color: '#F87171',
            children: [
                { id: 'c2-4-1', label: 'Create via Photo/Voice' },
                { id: 'c2-4-2', label: 'Google Calendar Sync' }
            ]
        }
      ]
    },
    {
        id: 'c3',
        label: 'Simple Notepad / Diary',
        color: '#F59E0B'
    }
  ]
};

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 50;
export const HORIZONTAL_SPACING = 250;
export const VERTICAL_SPACING = 60;
