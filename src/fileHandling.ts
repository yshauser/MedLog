// fileHandling.ts
interface FileSystemFileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write: (data: string) => Promise<void>;
  close: () => Promise<void>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  // startIn?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  // startIn?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

declare global {
  interface Window {
    showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    showOpenFilePicker: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  }
}

interface FileHandlerOptions {
  suggestedName: string;
  description: string;
  // startIn?: string;
}
export class FileHandler<T> {
  private options: FileHandlerOptions;
  constructor(options: FileHandlerOptions){
    this.options=options;
  }

  async saveToFile(data: T[]): Promise<void> {
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: this.options.suggestedName,
          // startIn: this.options.startIn,
          types: [{
            description: this.options.description,
            accept: {'application/json': ['.json']},
          }],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return;
        throw error;
      }
    } else {
      // Fallback for older browsers
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.options.suggestedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  async loadFromFile(): Promise<T[]> {
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          multiple: false,
          // startIn: this.options.startIn,
          types: [{
            description: this.options.description,
            accept: {'application/json': ['.json']},
          }],
        });
        
        const file = await fileHandle.getFile();
        return JSON.parse(await file.text()) as T[];
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [];
        }
        throw error;
      }
    } else {
      // Fallback for older browsers
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve([]);
            return;
          }

          try {
            const data = JSON.parse(await file.text()) as T[];
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        input.click();
      });
    }
  }

  async updateFile(newData: T[]): Promise<void> {
    try {
      const existingData = await this.loadFromFile();
      const mergedData = [...existingData, ...newData];
      await this.saveToFile(mergedData);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      throw error;
    }
  }

  async clearFile(): Promise<void> {
    await this.saveToFile([]);
  }
}