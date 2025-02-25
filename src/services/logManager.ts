// logManager.ts
import { LogEntry } from '../types';
// import { FileHandler } from '../fileHandling';

export class LogManager {
  // private static fileHandler = new FileHandler<LogEntry>({
  //   suggestedName: 'medicineLog.json',
  //   description: 'Medicine Log Data File',
  //   // startIn: 'documents'
  // });

  static async loadLogs(): Promise<LogEntry[]> {
    try {
      // return await this.fileHandler.loadFromFile();
      const response = await fetch('/db/medicineLog.json');
      if (!response.ok) {
        throw new Error(`Failed to load log file. Status: ${response.status}`);
      }
      const data = await response.json();
      console.log ('Log manager load ', {data});

      return data;

    } catch (error) {
      console.error('Error loading logs:', error);
      throw error;
    }
  }

  static async saveLogs(logs: LogEntry[]): Promise<void> {
    try {
      // await this.fileHandler.saveToFile(logs);
      await fetch('/api/saveToJsonFile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'medicineLog',
          data: logs,
          type: 'log',
        })
      });
    } catch (error) {
      console.error('Error saving logs:', error);
      throw error;
    }
  }

  static async updateLog(newLog: LogEntry): Promise<void> {
    try {
      const logs = await this.loadLogs();
      const logIndex = logs.findIndex(log => log.id === newLog.id);
      
      if (logIndex !== -1) {
        logs[logIndex] = newLog;
      } else {
        logs.push(newLog);
      }
      
      await this.saveLogs(logs);
    } catch (error) {
      console.error('Error updating log:', error);
      throw error;
    }
  }

  static async deleteLog(logId: string): Promise<void> {
    try {
      // const logs = await this.loadLogs();
      // const filteredLogs = logs.filter(log => log.id !== logId);
      // await this.saveLogs(filteredLogs);
      console.log('in delete manager');
      const logs = await this.loadLogs();
      console.log ('in delete before set', {logs})
      const updatedLog = logs.filter(log => log.id !== logId);
      console.log ('in delete after set', {updatedLog})

      await fetch(`/api/saveToJsonFile/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'medicineLog',
          data: updatedLog,
          type: 'log',
        })
      });
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