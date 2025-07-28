import { ThreadMessage, MessageThread } from '@/types';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  onClick?: () => void;
}

export class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show a notification
   */
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications are not available or permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      });

      if (options.onClick) {
        notification.onclick = options.onClick;
      }

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  /**
   * Show notification for new message
   */
  async notifyNewMessage(message: ThreadMessage, thread?: MessageThread): Promise<void> {
    const threadSubject = thread?.subject || message.subject;
    const senderName = this.extractSenderName(message.sender);
    
    await this.showNotification({
      title: `New message from ${senderName}`,
      body: `${threadSubject}: ${this.truncateText(message.body, 100)}`,
      tag: `message_${message.id}`,
      requireInteraction: false,
      onClick: () => {
        // Focus the window and navigate to the thread
        window.focus();
        this.navigateToThread(message.threadId);
      }
    });
  }

  /**
   * Show notification for thread update
   */
  async notifyThreadUpdate(thread: MessageThread, messageCount: number): Promise<void> {
    if (messageCount <= 1) return; // Don't notify for first message

    await this.showNotification({
      title: 'Thread Updated',
      body: `${thread.subject} has ${messageCount} new messages`,
      tag: `thread_${thread.id}`,
      requireInteraction: false,
      onClick: () => {
        window.focus();
        this.navigateToThread(thread.id);
      }
    });
  }

  /**
   * Show notification for multiple new messages
   */
  async notifyMultipleMessages(count: number): Promise<void> {
    await this.showNotification({
      title: 'New Messages',
      body: `You have ${count} new messages`,
      tag: 'multiple_messages',
      requireInteraction: false,
      onClick: () => {
        window.focus();
        this.navigateToMessages();
      }
    });
  }

  /**
   * Check if notifications are supported and enabled
   */
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Clear all notifications with a specific tag
   */
  clearNotifications(tag: string): void {
    // Note: There's no direct way to clear notifications by tag in the Web API
    // This is a placeholder for potential future implementation
    console.log(`Clearing notifications with tag: ${tag}`);
  }

  /**
   * Extract sender name from email or ID
   */
  private extractSenderName(sender: string): string {
    if (sender.includes('@')) {
      return sender.split('@')[0];
    }
    return sender;
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Navigate to specific thread
   */
  private navigateToThread(threadId: string): void {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/communications')) {
      // Update URL to show specific thread
      const url = new URL(window.location.href);
      url.searchParams.set('threadId', threadId);
      window.history.pushState({}, '', url.toString());
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('navigateToThread', { 
        detail: { threadId } 
      }));
    } else {
      // Navigate to communications module with thread ID
      window.location.href = `/communications?threadId=${threadId}`;
    }
  }

  /**
   * Navigate to messages/communications module
   */
  private navigateToMessages(): void {
    if (!window.location.pathname.includes('/communications')) {
      window.location.href = '/communications';
    }
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
};

// Auto-request permission when service is first used
export const initializeNotifications = async (): Promise<NotificationPermission> => {
  const service = getNotificationService();
  return await service.requestPermission();
};