// logManager.ts
import { LogEntry } from '../types';
import { getLogs, addLog, updateLog as updateLogDoc, deleteLog as deleteLogDoc, batchUpdate } from './firestoreService';

export class LogManager {
  static async loadLogs(): Promise<LogEntry[]> {
    try {
      const data = await getLogs();
      console.log('Log manager load from Firestore', { data });
      return data;
    } catch (error) {
      console.error('Error loading logs:', error);
      throw error;
    }
  }

  static async saveLogs(logs: LogEntry[]): Promise<void> {
    try {
      // Use batch update to save all logs at once
      await batchUpdate('logs', logs);
    } catch (error) {
      console.error('Error saving logs:', error);
      throw error;
    }
  }

  static async updateLog(newLog: LogEntry): Promise<void> {
    try {
      if (newLog.id) {
        // Update existing log
        await updateLogDoc(newLog.id, newLog);
      } else {
        // Add new log with generated ID
        newLog.id = Date.now().toString();
        await addLog(newLog);
      }
    } catch (error) {
      console.error('Error updating log:', error);
      throw error;
    }
  }

  static async deleteLog(logId: string): Promise<void> {
    try {
      await deleteLogDoc(logId);
    } catch (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  }

  // Export filtered data to JSON file
  static exportLog = (dataToExport: LogEntry[]) => {
    // const dataToExport = sortedAndFilteredData;
    console.log ('export Log', {dataToExport});
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Medicines-Log.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

}
