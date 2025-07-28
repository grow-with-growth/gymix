import { useState, useEffect, useCallback, useRef } from 'react';
import { ThreadUpdateEvent, ThreadMessage, MessageThread } from '@/types';
import { getWebSocketService } from '@/lib/websocket-service';

interface UseThreadUpdatesOptions {
  threadId?: string;
  onNewMessage?: (message: ThreadMessage) => void;
  onThreadUpdate?: (thread: MessageThread) => void;
}

interface UseThreadUpdatesReturn {
  messages: ThreadMessage[];
  threads: MessageThread[];
  isConnected: boolean;
  sendMessage: (message: Omit<ThreadMessage, 'id' | 'timestamp'>) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  createThread: (subject: string, participants: string[]) => Promise<MessageThread>;
  refreshMessages: () => Promise<void>;
  refreshThreads: () => Promise<void>;
}

export const useThreadUpdates = (options: UseThreadUpdatesOptions = {}): UseThreadUpdatesReturn => {
  const { threadId, onNewMessage, onThreadUpdate } = options;
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketService = useRef(getWebSocketService());
  const isSubscribed = useRef(false);

  // Handle real-time updates
  const handleThreadUpdate = useCallback((event: ThreadUpdateEvent) => {
    switch (event.type) {
      case 'message_added':
        if (event.message) {
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg.id === event.message!.id);
            if (exists) return prev;
            
            const newMessages = [...prev, event.message!].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            // Call callback if provided
            if (onNewMessage) {
              onNewMessage(event.message!);
            }
            
            return newMessages;
          });

          // Update thread's last message timestamp and count
          setThreads(prev => prev.map(thread => 
            thread.id === event.threadId 
              ? {
                  ...thread,
                  lastMessageTimestamp: event.message!.timestamp,
                  messageCount: thread.messageCount + 1,
                  unreadCount: thread.unreadCount + (event.message!.isRead ? 0 : 1)
                }
              : thread
          ));
        }
        break;

      case 'message_updated':
        if (event.message) {
          setMessages(prev => prev.map(msg => 
            msg.id === event.message!.id ? event.message! : msg
          ));
        }
        break;

      case 'thread_updated':
        if (event.thread) {
          setThreads(prev => {
            const exists = prev.some(thread => thread.id === event.thread!.id);
            if (exists) {
              return prev.map(thread => 
                thread.id === event.thread!.id ? event.thread! : thread
              );
            } else {
              return [...prev, event.thread!].sort(
                (a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
              );
            }
          });

          if (onThreadUpdate) {
            onThreadUpdate(event.thread);
          }
        }
        break;
    }
  }, [onNewMessage, onThreadUpdate]);

  // Subscribe to updates
  useEffect(() => {
    const service = webSocketService.current;
    
    const setupSubscription = async () => {
      try {
        if (!isSubscribed.current) {
          if (threadId) {
            await service.subscribeToThread(threadId, handleThreadUpdate);
          } else {
            await service.subscribeToThreadUpdates(handleThreadUpdate);
          }
          isSubscribed.current = true;
          setIsConnected(service.isConnected());
        }
      } catch (error) {
        console.error('Failed to setup WebSocket subscription:', error);
        setIsConnected(false);
      }
    };

    setupSubscription();

    return () => {
      if (isSubscribed.current) {
        if (threadId) {
          service.unsubscribeFromThread(threadId);
        } else {
          service.unsubscribeFromThreadUpdates();
        }
        isSubscribed.current = false;
      }
    };
  }, [threadId, handleThreadUpdate]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const service = webSocketService.current;
      
      try {
        if (threadId) {
          const threadMessages = await service.getThreadMessages(threadId);
          setMessages(threadMessages);
        } else {
          const allThreads = await service.getMessageThreads();
          setThreads(allThreads);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [threadId]);

  // Send message function
  const sendMessage = useCallback(async (message: Omit<ThreadMessage, 'id' | 'timestamp'>) => {
    const service = webSocketService.current;
    try {
      await service.sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  // Mark message as read function
  const markAsRead = useCallback(async (messageId: string) => {
    const service = webSocketService.current;
    try {
      await service.markMessageAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }, []);

  // Create thread function
  const createThread = useCallback(async (subject: string, participants: string[]): Promise<MessageThread> => {
    const service = webSocketService.current;
    try {
      return await service.createThread(subject, participants);
    } catch (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
  }, []);

  // Refresh functions
  const refreshMessages = useCallback(async () => {
    if (!threadId) return;
    
    const service = webSocketService.current;
    try {
      const threadMessages = await service.getThreadMessages(threadId);
      setMessages(threadMessages);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
  }, [threadId]);

  const refreshThreads = useCallback(async () => {
    const service = webSocketService.current;
    try {
      const allThreads = await service.getMessageThreads();
      setThreads(allThreads);
    } catch (error) {
      console.error('Failed to refresh threads:', error);
    }
  }, []);

  return {
    messages,
    threads,
    isConnected,
    sendMessage,
    markAsRead,
    createThread,
    refreshMessages,
    refreshThreads
  };
};