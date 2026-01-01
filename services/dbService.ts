
import { BentoCardData, UserSettings } from '../types';

const DB_NAME = 'BentoDashboardDB';
const DB_VERSION = 1;
const STORES = {
  SETTINGS: 'settings',
  CARDS: 'cards'
};

export class DashboardDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS);
        }
        if (!db.objectStoreNames.contains(STORES.CARDS)) {
          db.createObjectStore(STORES.CARDS, { keyPath: 'id' });
        }
      };
    });
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    return this.put(STORES.SETTINGS, settings, 'user_prefs');
  }

  async getSettings(): Promise<UserSettings | null> {
    return this.get(STORES.SETTINGS, 'user_prefs');
  }

  async saveCards(cards: BentoCardData[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(STORES.CARDS, 'readwrite');
      const store = transaction.objectStore(STORES.CARDS);
      
      // Clear existing to maintain order and sync state
      store.clear();
      cards.forEach(card => store.add(card));
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCards(): Promise<BentoCardData[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction(STORES.CARDS, 'readonly');
      const store = transaction.objectStore(STORES.CARDS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async put(storeName: string, data: any, key?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = key ? store.put(data, key) : store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async get(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DashboardDB();
