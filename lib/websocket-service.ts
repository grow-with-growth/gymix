import PocketBase from 'pocketbase';
import { ThreadUpdateEvent, ThreadMessage, MessageThread } from '@/types';

export class WebSocketService {
  private pb: PocketBase;
  private subscriptions: Map<string, () => void> = new Map();
  private eventListeners: Map<string, ((event: ThreadUpdateEvent) => void)[]> = new Map();

  constructor(pocketbaseUrl: string = 'http://127.0.0.1:8090') {
    this.pb = new PocketBase(pocketbaseUrl);
    this.pb.autoCancellation(false);
  }

  /**
   * Subscribe to real-time updates for message threads
   */
  async subscribeToThreadUpdates(callback: (event: ThreadUpdateEvent) => void): Promise<void> {
    try {
      // Subscribe to thread messages
      const messageUnsubscribe = await this.pb.collection('thread_messages').subscribe('*', (e) => {
        const event: ThreadUpdateEvent = {
          type: e.action === 'create' ? 'message_added' : 'message_updated',
          threadId: e.record.threadId,
          message: this.mapToThreadMessage(e.record),
          timestamp: new Date().toISOString()
        };
        callback(event);
      });

      // Subscribe to message threads
      const threadUnsubscribe = await this.pb.collection('message_threads').subscribe('*', (e) => {
        const event: ThreadUpdateEvent = {
          type: 'thread_updated',
          threadId: e.record.id,
          thread: this.mapToMessageThread(e.record),
          timestamp: new Date().toISOString()
        };
        callback(event);
      });

      // Store unsubscribe functions
      this.subscriptions.set('thread_messages', messageUnsubscribe);
      this.subscriptions.set('message_threads', threadUnsubscribe);

      // Store callback for cleanup
      const callbackId = `callback_${Date.now()}`;
      if (!this.eventListeners.has('thread_updates')) {
        this.eventListeners.set('thread_updates', []);
      }
      this.eventListeners.get('thread_updates')!.push(callback);

    } catch (error) {
      console.error('Failed to subscribe to thread updates:', error);
      throw error;
    }
  }

  /**
   * Subscribe to updates for a specific thread
   */
  async subscribeToThread(threadId: string, callback: (event: ThreadUpdateEvent) => void): Promise<void> {
    try {
      const filter = `threadId = "${threadId}"`;
      
      const unsubscribe = await this.pb.collection('thread_messages').subscribe('*', (e) => {
        if (e.record.threadId === threadId) {
          const event: ThreadUpdateEvent = {
            type: e.action === 'create' ? 'message_added' : 'message_updated',
            threadId: e.record.threadId,
            message: this.mapToThreadMessage(e.record),
            timestamp: new Date().toISOString()
          };
          callback(event);
        }
      }, { filter });

      this.subscriptions.set(`thread_${threadId}`, unsubscribe);

    } catch (error) {
      console.error(`Failed to subscribe to thread ${threadId}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from thread updates
   */
  unsubscribeFromThreadUpdates(): void {
    this.subscriptions.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error(`Failed to unsubscribe from ${key}:`, error);
      }
    });
    this.subscriptions.clear();
    this.eventListeners.clear();
  }

  /**
   * Unsubscribe from a specific thread
   */
  unsubscribeFromThread(threadId: string): void {
    const key = `thread_${threadId}`;
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      try {
        unsubscribe();
        this.subscriptions.delete(key);
      } catch (error) {
        console.error(`Failed to unsubscribe from thread ${threadId}:`, error);
      }
    }
  }

  /**
   * Send a new message to a thread
   */
  async sendMessage(message: Omit<ThreadMessage, 'id' | 'timestamp'>): Promise<ThreadMessage> {
    try {
      const messageData = {
        ...message,
        timestamp: new Date().toISOString()
      };

      const record = await this.pb.collection('thread_messages').create(messageData);
      return this.mapToThreadMessage(record);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await this.pb.collection('thread_messages').update(messageId, { isRead: true });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  /**
   * Get thread messages with real-time updates
   */
  async getThreadMessages(threadId: string): Promise<ThreadMessage[]> {
    try {
      const records = await this.pb.collection('thread_messages').getFullList({
        filter: `threadId = "${threadId}"`,
        sort: 'timestamp'
      });

      return records.map(record => this.mapToThreadMessage(record));
    } catch (error) {
      console.error('Failed to get thread messages:', error);
      throw error;
    }
  }

  /**
   * Get all message threads
   */
  async getMessageThreads(): Promise<MessageThread[]> {
    try {
      const records = await this.pb.collection('message_threads').getFullList({
        sort: '-lastMessageTimestamp'
      });

      return records.map(record => this.mapToMessageThread(record));
    } catch (error) {
      console.error('Failed to get message threads:', error);
      throw error;
    }
  }

  /**
   * Create a new message thread
   */
  async createThread(subject: string, participants: string[]): Promise<MessageThread> {
    try {
      const threadData = {
        subject,
        participants,
        lastMessageTimestamp: new Date().toISOString(),
        messageCount: 0,
        unreadCount: 0
      };

      const record = await this.pb.collection('message_threads').create(threadData);
      return this.mapToMessageThread(record);
    } catch (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
  }

  /**
   * Map PocketBase record to ThreadMessage
   */
  private mapToThreadMessage(record: any): ThreadMessage {
    return {
      id: record.id,
      threadId: record.threadId,
      subject: record.subject,
      body: record.body,
      sender: record.sender,
      recipients: record.recipients || [],
      timestamp: record.timestamp,
      parentId: record.parentId,
      isRead: record.isRead || false,
      attachments: record.attachments || []
    };
  }

  /**
   * Map PocketBase record to MessageThread
   */
  private mapToMessageThread(record: any): MessageThread {
    return {
      id: record.id,
      subject: record.subject,
      participants: record.participants || [],
      lastMessageTimestamp: record.lastMessageTimestamp,
      messageCount: record.messageCount || 0,
      unreadCount: record.unreadCount || 0
    };
  }

  /**
   * Check if WebSocket connection is active
   */
  isConnected(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Authenticate with PocketBase for real-time features
   */
  async authenticate(email: string, password: string): Promise<void> {
    try {
      await this.pb.collection('users').authWithPassword(email, password);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.unsubscribeFromThreadUpdates();
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService();
  }
  return webSocketService;
};