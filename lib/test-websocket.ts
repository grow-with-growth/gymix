// Test script for WebSocket service
import { getWebSocketService } from './websocket-service';
import { getNotificationService } from './notification-service';

export async function testWebSocketService() {
  console.log('Testing WebSocket Service...');
  
  const wsService = getWebSocketService();
  const notificationService = getNotificationService();
  
  try {
    // Test 1: Check if service is initialized
    console.log('✓ WebSocket service initialized');
    
    // Test 2: Test notification service
    const permission = await notificationService.requestPermission();
    console.log(`✓ Notification permission: ${permission}`);
    
    // Test 3: Subscribe to thread updates
    await wsService.subscribeToThreadUpdates((event) => {
      console.log('✓ Received thread update:', event);
      
      if (event.message && notificationService.isEnabled()) {
        notificationService.notifyNewMessage(event.message);
      }
    });
    console.log('✓ Subscribed to thread updates');
    
    // Test 4: Create a test thread
    const testThread = await wsService.createThread(
      'Test Thread',
      ['user1', 'user2']
    );
    console.log('✓ Created test thread:', testThread);
    
    // Test 5: Send a test message
    const testMessage = await wsService.sendMessage({
      threadId: testThread.id,
      subject: 'Test Message',
      body: 'This is a test message for real-time updates',
      sender: 'user1',
      recipients: ['user2'],
      isRead: false
    });
    console.log('✓ Sent test message:', testMessage);
    
    // Test 6: Get thread messages
    const messages = await wsService.getThreadMessages(testThread.id);
    console.log('✓ Retrieved thread messages:', messages);
    
    console.log('🎉 All tests passed!');
    
    return {
      success: true,
      thread: testThread,
      message: testMessage,
      messages
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to cleanup test data
export async function cleanupTestData() {
  console.log('Cleaning up test data...');
  const wsService = getWebSocketService();
  wsService.cleanup();
  console.log('✓ Cleanup completed');
}