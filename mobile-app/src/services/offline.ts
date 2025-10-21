import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiClient } from '../config/api';

interface QueuedTransaction {
  id: string;
  type: 'send' | 'request';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineService {
  private queue: QueuedTransaction[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private readonly QUEUE_KEY = 'offline_queue';
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadQueue();
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        console.log('Back online, syncing queue...');
        this.syncQueue();
      }
    });
  }

  async addToQueue(type: 'send' | 'request', data: any): Promise<string> {
    const transaction: QueuedTransaction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(transaction);
    await this.saveQueue();

    if (this.isOnline) {
      this.syncQueue();
    }

    return transaction.id;
  }

  async syncQueue() {
    if (this.isSyncing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isSyncing = true;

    while (this.queue.length > 0 && this.isOnline) {
      const transaction = this.queue[0];

      try {
        await this.processTransaction(transaction);
        this.queue.shift(); // Remove successful transaction
        await this.saveQueue();
      } catch (error) {
        console.error('Transaction sync failed:', error);
        transaction.retries++;

        if (transaction.retries >= this.MAX_RETRIES) {
          console.log('Max retries reached, removing transaction');
          this.queue.shift();
          await this.saveQueue();
        } else {
          break; // Stop syncing on error, will retry later
        }
      }
    }

    this.isSyncing = false;
  }

  private async processTransaction(transaction: QueuedTransaction) {
    switch (transaction.type) {
      case 'send':
        await apiClient.post('/api/wallet/send', transaction.data);
        break;
      case 'request':
        await apiClient.post('/api/wallet/request', transaction.data);
        break;
      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }
  }

  async getQueue(): Promise<QueuedTransaction[]> {
    return [...this.queue];
  }

  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  private async loadQueue() {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      this.queue = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load queue:', error);
      this.queue = [];
    }
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const offlineService = new OfflineService();
