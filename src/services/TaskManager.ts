// TaskManager.ts
import { TaskEntry } from '../types';

export class TaskManager {
  static async loadTasks(): Promise<TaskEntry[]> {
try {
      const response = await fetch('/db/tasks.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load tasks file. Status: ${response.status}`);
      }
      const data = await response.json();
      console.log ('Tasks manager load ', {data});

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