// TaskManager.ts
import { TaskEntry } from '../types';
import { getTasks } from './firestoreService';

export class TaskManager {
  static async loadTasks(): Promise<TaskEntry[]> {
    try {
      const data = await getTasks();
      console.log('Tasks manager load ', { data });

      return data;
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  }
}

export const calculateRemainingDays = (endDate: string): number => {
  if (!endDate) return 0;
  const [day, month, year] = endDate.split('/');
  const end = new Date(Number(year), Number(month) - 1, Number(day));
 
  // Get today's date (set time to 00:00:00 to avoid inconsistencies)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, remainingDays);
  };
