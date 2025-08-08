interface Node {
  id: number;
  content: string;
  level: number;
  note: string;
  isLinked: boolean;
  isTask: boolean;
  isCompleted: boolean;
  isNew: boolean;
}

interface AppData {
  nodes: Node[];
  theme: string;
  version: string;
  lastModified: string;
}

const STORAGE_KEY = 'atomicListMobile';
const CURRENT_VERSION = '2.0.0';

export class StorageManager {
  static save(data: Omit<AppData, 'version' | 'lastModified'>): boolean {
    try {
      const fullData: AppData = {
        ...data,
        version: CURRENT_VERSION,
        lastModified: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));
      
      // Also save to IndexedDB for better reliability
      this.saveToIndexedDB(fullData);
      
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  static load(): AppData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as AppData;
      
      // Migrate data if needed
      const migrated = this.migrateData(data);
      
      return migrated;
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // Try loading from IndexedDB as fallback
      return this.loadFromIndexedDB();
    }
  }

  static export(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  }

  static import(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as Partial<AppData>;
      
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('Invalid data format');
      }

      // Validate and clean data
      const cleanedData = {
        nodes: data.nodes.filter(node => 
          typeof node.id === 'number' && 
          typeof node.content === 'string'
        ),
        theme: data.theme || 'matcha'
      };

      return this.save(cleanedData);
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.clearIndexedDB();
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  private static migrateData(data: any): AppData {
    // Handle migration from older versions
    if (!data.version || data.version === '0.0.0') {
      // Migrate from original format
      return {
        nodes: data.nodes || data || [],
        theme: data.theme || 'matcha',
        version: CURRENT_VERSION,
        lastModified: new Date().toISOString()
      };
    }

    return data;
  }

  private static async saveToIndexedDB(data: AppData): Promise<void> {
    try {
      const request = indexedDB.open('AtomicListDB', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('appData')) {
          db.createObjectStore('appData', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['appData'], 'readwrite');
        const store = transaction.objectStore('appData');
        store.put({ key: 'main', data });
      };
    } catch (error) {
      console.debug('IndexedDB not available:', error);
    }
  }

  private static loadFromIndexedDB(): AppData | null {
    // This would need to be implemented with promises/async
    // For now, return null as fallback
    return null;
  }

  private static async clearIndexedDB(): Promise<void> {
    try {
      const request = indexedDB.open('AtomicListDB', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['appData'], 'readwrite');
        const store = transaction.objectStore('appData');
        store.clear();
      };
    } catch (error) {
      console.debug('Failed to clear IndexedDB:', error);
    }
  }

  static getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (5MB typical limit)
      const available = 5 * 1024 * 1024 - used;

      return { used, available };
    } catch {
      return { used: 0, available: 0 };
    }
  }
}