// TaskManager.ts
import { TaskEntry } from '../types';

export const formatDateForUI = (dateStr: string): string => {
  if (!dateStr) return '';
  let date: Date;
  if (dateStr.includes('/')) {
    // If date is in DD/MM/YYYY format
    const [day, month, year] = dateStr.split('/');
    date = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    // If date is in other format
    date = new Date(dateStr);
  }
  // console.log ('in fd2ui', {dateStr,date});
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;

};

export const formatDateForCalc = (dateStr: string): string => {
  if (!dateStr) return '';
  let date: Date;
  if (dateStr.includes('/')) {
    // If date is in DD/MM/YYYY format
    const [day, month, year] = dateStr.split('/');
    date = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    // If date is in other format
    date = new Date(dateStr);
  }
  // console.log ('in fd2calc', {dateStr,date});
  if (isNaN(date.getTime())) return '';
  return date.toString();
};

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