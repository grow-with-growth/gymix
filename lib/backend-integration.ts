import PocketBase from 'pocketbase';
import type { 
  SchoolUser, 
  CalendarEvent, 
  Email, 
  MarketplaceProduct,
  KnowledgeArticle,
  Game,
  MediaContent,
  SchoolHubDashboardData,
  AiInsight,
  MessageThread,
  ThreadMessage
} from '@/types';

// ============================================================
// POCKETBASE BACKEND INTEGRATION
// ============================================================

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

// Configure PocketBase
pb.autoCancellation(false);

// Authentication
export const auth = {
  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData.record;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async register(email: string, password: string, name: string, role: string = 'Student') {
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        name,
        role,
        department: role // For simplicity, use role as department
      };
      const record = await pb.collection('users').create(data);
      return record;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout() {
    pb.authStore.clear();
  },

  get user() {
    return pb.authStore.model;
  },

  get isAuthenticated() {
    return pb.authStore.isValid;
  }
};

// Calendar Events
export const calendar = {
  async getEvents(year?: number, month?: number): Promise<CalendarEvent[]> {
    try {
      let filter = '';
      if (year !== undefined && month !== undefined) {
        // Filter by year and month
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        filter = `date >= '${startDate}' && date <= '${endDate}'`;
      }
      
      const records = await pb.collection('calendar_events').getFullList({
        sort: 'date',
        filter
      });
      
      return records.map(record => ({
        id: record.id,
        date: record.date,
        title: record.title,
        description: record.description,
        time: record.time,
        type: record.type,
        recurrencePattern: record.recurrencePattern,
        recurrenceId: record.recurrenceId,
        isException: record.isException
      }));
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  },

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const record = await pb.collection('calendar_events').create(event);
      return {
        id: record.id,
        date: record.date,
        title: record.title,
        description: record.description,
        time: record.time,
        type: record.type,
        recurrencePattern: record.recurrencePattern,
        recurrenceId: record.recurrenceId,
        isException: record.isException
      };
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  },

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const record = await pb.collection('calendar_events').update(id, event);
      return {
        id: record.id,
        date: record.date,
        title: record.title,
        description: record.description,
        time: record.time,
        type: record.type,
        recurrencePattern: record.recurrencePattern,
        recurrenceId: record.recurrenceId,
        isException: record.isException
      };
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await pb.collection('calendar_events').delete(id);
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  },

  async getEventById(id: string): Promise<CalendarEvent | null> {
    try {
      const record = await pb.collection('calendar_events').getOne(id);
      return {
        id: record.id,
        date: record.date,
        title: record.title,
        description: record.description,
        time: record.time,
        type: record.type,
        recurrencePattern: record.recurrencePattern,
        recurrenceId: record.recurrenceId,
        isException: record.isException
      };
    } catch (error) {
      console.error('Failed to get event:', error);
      return null;
    }
  },

  // Real-time updates
  subscribeToEvents(callback: (data: any) => void) {
    return pb.collection('calendar_events').subscribe('*', callback);
  }
};

// Message Threads
export const messageThreads = {
  async getAll(): Promise<MessageThread[]> {
    try {
      const records = await pb.collection('message_threads').getFullList({
        sort: '-lastMessageTimestamp',
        expand: 'participants'
      });
      
      return records.map(record => ({
        id: record.id,
        subject: record.subject,
        participants: record.expand?.participants?.map((p: any) => p.id) || record.participants,
        lastMessageTimestamp: record.lastMessageTimestamp,
        messageCount: record.messageCount || 0,
        unreadCount: record.unreadCount || 0
      }));
    } catch (error) {
      console.error('Failed to fetch message threads:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<MessageThread | null> {
    try {
      const record = await pb.collection('message_threads').getOne(id, {
        expand: 'participants'
      });
      
      return {
        id: record.id,
        subject: record.subject,
        participants: record.expand?.participants?.map((p: any) => p.id) || record.participants,
        lastMessageTimestamp: record.lastMessageTimestamp,
        messageCount: record.messageCount || 0,
        unreadCount: record.unreadCount || 0
      };
    } catch (error) {
      console.error('Failed to fetch message thread:', error);
      return null;
    }
  },

  async create(subject: string, participants: string[]): Promise<MessageThread> {
    try {
      const data = {
        subject,
        participants,
        lastMessageTimestamp: new Date().toISOString(),
        messageCount: 0,
        unreadCount: 0
      };
      
      const record = await pb.collection('message_threads').create(data);
      
      return {
        id: record.id,
        subject: record.subject,
        participants: record.participants,
        lastMessageTimestamp: record.lastMessageTimestamp,
        messageCount: record.messageCount || 0,
        unreadCount: record.unreadCount || 0
      };
    } catch (error) {
      console.error('Failed to create message thread:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<MessageThread>): Promise<MessageThread> {
    try {
      const record = await pb.collection('message_threads').update(id, data);
      
      return {
        id: record.id,
        subject: record.subject,
        participants: record.participants,
        lastMessageTimestamp: record.lastMessageTimestamp,
        messageCount: record.messageCount || 0,
        unreadCount: record.unreadCount || 0
      };
    } catch (error) {
      console.error('Failed to update message thread:', error);
      throw error;
    }
  },

  // Real-time subscriptions
  subscribeToThreads(callback: (data: any) => void) {
    return pb.collection('message_threads').subscribe('*', callback);
  },

  subscribeToThread(threadId: string, callback: (data: any) => void) {
    return pb.collection('message_threads').subscribe(threadId, callback);
  }
};

// Thread Messages
export const threadMessages = {
  async getByThreadId(threadId: string): Promise<ThreadMessage[]> {
    try {
      const records = await pb.collection('thread_messages').getFullList({
        filter: `threadId = "${threadId}"`,
        sort: 'timestamp',
        expand: 'sender,recipients'
      });
      
      return records.map(record => ({
        id: record.id,
        threadId: record.threadId,
        subject: record.subject,
        body: record.body,
        sender: record.expand?.sender?.id || record.sender,
        recipients: record.expand?.recipients?.map((r: any) => r.id) || record.recipients,
        timestamp: record.timestamp,
        parentId: record.parentId,
        isRead: record.isRead || false,
        attachments: record.attachments || []
      }));
    } catch (error) {
      console.error('Failed to fetch thread messages:', error);
      throw error;
    }
  },

  async create(message: Omit<ThreadMessage, 'id' | 'timestamp'>): Promise<ThreadMessage> {
    try {
      const data = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      const record = await pb.collection('thread_messages').create(data);
      
      // Update thread's message count and last message timestamp
      await pb.collection('message_threads').update(message.threadId, {
        'messageCount+': 1,
        'unreadCount+': message.isRead ? 0 : 1,
        lastMessageTimestamp: data.timestamp
      });
      
      return {
        id: record.id,
        threadId: record.threadId,
        subject: record.subject,
        body: record.body,
        sender: record.sender,
        recipients: record.recipients,
        timestamp: record.timestamp,
        parentId: record.parentId,
        isRead: record.isRead || false,
        attachments: record.attachments || []
      };
    } catch (error) {
      console.error('Failed to create thread message:', error);
      throw error;
    }
  },

  async markAsRead(messageId: string): Promise<void> {
    try {
      await pb.collection('thread_messages').update(messageId, { isRead: true });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  },

  // Real-time subscriptions
  subscribeToMessages(callback: (data: any) => void) {
    return pb.collection('thread_messages').subscribe('*', callback);
  },

  subscribeToThreadMessages(threadId: string, callback: (data: any) => void) {
    const filter = `threadId = "${threadId}"`;
    return pb.collection('thread_messages').subscribe('*', callback, { filter });
  }
};

// School Users
export const users = {
  async getByDepartment(department: string): Promise<SchoolUser[]> {
    try {
      const filter = department === 'School' ? '' : `department = '${department}'`;
      const records = await pb.collection('users').getFullList({
        filter,
        sort: 'name'
      });
      
      return records.map(record => ({
        id: record.id,
        name: record.name,
        role: record.role,
        department: record.department,
        avatarUrl: record.avatarUrl || `https://i.pravatar.cc/150?u=${record.id}`,
        email: record.email
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async search(query: string): Promise<SchoolUser[]> {
    try {
      const records = await pb.collection('users').getFullList({
        filter: `name ~ '${query}' || email ~ '${query}' || department ~ '${query}'`,
        sort: 'name'
      });
      
      return records.map(record => ({
        id: record.id,
        name: record.name,
        role: record.role,
        department: record.department,
        avatarUrl: record.avatarUrl || `https://i.pravatar.cc/150?u=${record.id}`,
        email: record.email
      }));
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }
};

// Knowledge Base
export const knowledge = {
  async getArticles(): Promise<KnowledgeArticle[]> {
    try {
      const records = await pb.collection('knowledge_articles').getFullList({
        sort: 'title'
      });
      
      return records.map(record => ({
        title: record.title,
        content: record.content
      }));
    } catch (error) {
      console.error('Failed to fetch knowledge articles:', error);
      return [];
    }
  },
  
  async search(query: string): Promise<KnowledgeArticle[]> {
    try {
      const records = await pb.collection('knowledge_articles').getFullList({
        filter: `title ~ '${query}' || content ~ '${query}'`,
        sort: 'title'
      });
      
      return records.map(record => ({
        title: record.title,
        content: record.content
      }));
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }
};

// Emails
export const emails = {
  async getByFolder(folder: string): Promise<Email[]> {
    try {
      const records = await pb.collection('emails').getFullList({
        filter: `folder = '${folder}'`,
        sort: '-timestamp',
        expand: 'sender,recipients'
      });
      
      return records.map(record => ({
        id: parseInt(record.id),
        sender: record.expand?.sender?.name || record.sender,
        subject: record.subject,
        snippet: record.body.substring(0, 100) + '...',
        time: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: record.unread,
        body: record.body,
        folder: record.folder
      }));
    } catch (error) {
      console.error(`Failed to fetch emails for folder: ${folder}`, error);
      return [];
    }
  },
  
  async send(email: { subject: string, body: string, recipients: string[] }): Promise<Email> {
    try {
      const newEmail = await pb.collection('emails').create({
        sender: pb.authStore.model?.id,
        recipients: email.recipients,
        subject: email.subject,
        body: email.body,
        folder: 'Sent',
        unread: false,
        timestamp: new Date().toISOString()
      });
      
      return {
        id: parseInt(newEmail.id),
        sender: pb.authStore.model?.name || 'You',
        subject: newEmail.subject,
        snippet: newEmail.body.substring(0, 100) + '...',
        time: new Date(newEmail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: newEmail.unread,
        body: newEmail.body,
        folder: newEmail.folder
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
};

// Marketplace Products
export const marketplace = {
  async getProducts(): Promise<MarketplaceProduct[]> {
    try {
      const records = await pb.collection('marketplace_products').getFullList({
        sort: 'name'
      });
      
      return records.map(record => ({
        id: record.id,
        name: record.name,
        category: record.category,
        price: record.price,
        imageUrl: record.imageUrl,
        stock: record.stock
      }));
    } catch (error) {
      console.error('Failed to fetch marketplace products:', error);
      return [];
    }
  },
  
  async getProductsByCategory(category: string): Promise<MarketplaceProduct[]> {
    try {
      const records = await pb.collection('marketplace_products').getFullList({
        filter: `category = '${category}'`,
        sort: 'name'
      });
      
      return records.map(record => ({
        id: record.id,
        name: record.name,
        category: record.category,
        price: record.price,
        imageUrl: record.imageUrl,
        stock: record.stock
      }));
    } catch (error) {
      console.error(`Failed to fetch products for category: ${category}`, error);
      return [];
    }
  }
};

// Games
export const games = {
  async getGames(): Promise<Game[]> {
    try {
      const records = await pb.collection('games').getFullList({
        sort: 'title'
      });
      
      return records.map(record => ({
        id: record.id,
        title: record.title,
        category: record.category,
        description: record.description,
        imageUrl: record.imageUrl
      }));
    } catch (error) {
      console.error('Failed to fetch games:', error);
      return [];
    }
  },
  
  async getGamesByCategory(category: string): Promise<Game[]> {
    try {
      const records = await pb.collection('games').getFullList({
        filter: `category = '${category}'`,
        sort: 'title'
      });
      
      return records.map(record => ({
        id: record.id,
        title: record.title,
        category: record.category,
        description: record.description,
        imageUrl: record.imageUrl
      }));
    } catch (error) {
      console.error(`Failed to fetch games for category: ${category}`, error);
      return [];
    }
  }
};

// Media Content
export const media = {
  async getMediaByType(type: 'Movies' | 'Series'): Promise<MediaContent[]> {
    try {
      const records = await pb.collection('media_content').getFullList({
        filter: `type = '${type}'`,
        sort: 'title'
      });
      
      return records.map(record => ({
        id: record.id,
        title: record.title,
        type: record.type,
        imageUrl: record.imageUrl
      }));
    } catch (error) {
      console.error(`Failed to fetch media for type: ${type}`, error);
      return [];
    }
  }
};

// School Hub Dashboard
export const schoolHub = {
  async getDashboardData(department: string): Promise<SchoolHubDashboardData> {
    try {
      const record = await pb.collection('school_hub_dashboard').getFirstListItem(`department = '${department}'`);
      
      if (!record) {
        throw new Error(`Dashboard data not found for department: ${department}`);
      }
      
      return {
        metrics: JSON.parse(record.metrics),
        events: JSON.parse(record.events),
        announcement: JSON.parse(record.announcement)
      };
    } catch (error) {
      console.error(`Failed to fetch dashboard data for department: ${department}`, error);
      throw error;
    }
  }
};

// File Storage
export const storage = {
  async uploadFile(file: File, folder: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const record = await pb.collection('files').create(formData);
      return {
        id: record.id,
        url: pb.getFileUrl(record, record.file),
        name: record.file
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },
  
  getFileUrl(record: any, filename: string) {
    return pb.getFileUrl(record, filename);
  }
};

// AI Insights (simulated with PocketBase)
export const ai = {
  async generateInsights(): Promise<AiInsight[]> {
    // This would normally call an AI service, but we'll simulate it with static data
    return [
      {
        title: "Attendance Trend",
        summary: "Student attendance has increased by 5% this month compared to last month.",
        icon: "TrendingUp",
        actionText: "View Attendance Report",
        actionLink: "/analytics?report=attendance"
      },
      {
        title: "Performance Alert",
        summary: "3 students in Grade 10 are showing declining performance in Mathematics.",
        icon: "AlertTriangle",
        actionText: "Review Student Performance",
        actionLink: "/analytics?report=performance"
      },
      {
        title: "Resource Utilization",
        summary: "The library resources are underutilized. Consider promoting reading activities.",
        icon: "BookOpen",
        actionText: "Create Reading Campaign",
        actionLink: "/communications?template=reading-campaign"
      }
    ];
  },
  
  async generateText(prompt: string): Promise<string> {
    // This would normally call an AI service, but we'll simulate it
    const responses = {
      "Write a short paragraph about the importance of education.": 
        "Education is the cornerstone of personal and societal growth. It empowers individuals with knowledge, critical thinking skills, and the ability to navigate an increasingly complex world. Beyond academic learning, education fosters creativity, builds character, and promotes social cohesion. In today's rapidly evolving global landscape, quality education serves as the great equalizer, opening doors to opportunities and enabling people to reach their full potential regardless of their background.",
      
      "Generate a welcome message for new students.":
        "Welcome to our school community! We're thrilled to have you join us on this exciting journey of discovery and growth. Here, you'll find a supportive environment where curiosity is celebrated, challenges are embraced, and every achievement is recognized. Our dedicated faculty and staff are committed to helping you develop not just academically, but as a well-rounded individual prepared for future success. We look forward to seeing you thrive and contribute your unique talents to our vibrant community!",
      
      "Create a brief description of a science project.":
        "In this engaging science project, students will investigate the effects of different natural fertilizers on plant growth. Using controlled experiments with identical plants, they'll apply various organic compounds and document growth rates, leaf health, and overall plant vitality over a four-week period. The project incorporates data collection, statistical analysis, and environmental science principles while promoting sustainable gardening practices. Students will present their findings through visual displays and oral presentations, demonstrating their understanding of scientific methodology and ecological concepts."
    };
    
    // Return a matching response or a default one
    return responses[prompt as keyof typeof responses] || 
      "I'm an AI assistant here to help with your educational needs. Please let me know how I can assist you with information, planning, or creative content for your school activities.";
  },
  
  async streamText(prompt: string, onChunk: (text: string) => void): Promise<void> {
    // Simulate streaming by breaking the text into chunks
    const fullText = await this.generateText(prompt);
    const chunks = fullText.split('. ');
    
    // Send each chunk with a delay
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 300));
      onChunk(chunk + (chunk.endsWith('.') ? '' : '.') + ' ');
    }
  }
};

// Search functionality
export const search = {
  async searchAll(query: string) {
    try {
      // Search users
      const usersPromise = users.search(query);
      
      // Search knowledge articles
      const articlesPromise = knowledge.search(query);
      
      // Search emails (across all folders)
      const emailsPromise = pb.collection('emails').getFullList({
        filter: `subject ~ '${query}' || body ~ '${query}'`,
        sort: '-timestamp',
        expand: 'sender,recipients'
      });
      
      // Wait for all searches to complete
      const [usersResult, articlesResult, emailsRecords] = await Promise.all([
        usersPromise,
        articlesPromise,
        emailsPromise
      ]);
      
      // Transform email records
      const emailsResult = emailsRecords.map(record => ({
        id: parseInt(record.id),
        subject: record.subject,
        sender: record.expand?.sender?.name || record.sender,
        snippet: record.body.substring(0, 100) + '...',
        folder: record.folder
      }));
      
      return {
        knowledgeBase: articlesResult.map(article => ({
          title: article.title,
          snippet: article.content.substring(0, 150) + '...'
        })),
        emails: emailsResult,
        users: usersResult.map(user => ({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          department: user.department
        }))
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        knowledgeBase: [],
        emails: [],
        users: []
      };
    }
  }
};

// ============================================================
// API ADAPTERS FOR YOUR EXISTING APP
// ============================================================

// These functions match your existing API routes but use the real backend

export async function fetchCalendarEvents(year: number, month: number) {
  return calendar.getEvents(year, month);
}

export async function addCalendarEvent(event: Omit<CalendarEvent, 'id'>) {
  return calendar.createEvent(event);
}

export async function updateCalendarEvent(id: string, event: Partial<CalendarEvent>) {
  return calendar.updateEvent(id, event);
}

export async function deleteCalendarEvent(id: string) {
  return calendar.deleteEvent(id);
}

export async function getCalendarEventById(id: string) {
  return calendar.getEventById(id);
}

export async function fetchSchoolUsers(department: string) {
  return users.getByDepartment(department);
}

export async function fetchEmails(folder: string) {
  return emails.getByFolder(folder);
}

export async function fetchKnowledgeBase() {
  return knowledge.getArticles();
}

export async function searchKnowledge(query: string) {
  return knowledge.search(query);
}

export async function fetchSchoolHubDashboardData(department: string) {
  return schoolHub.getDashboardData(department);
}

export async function fetchMarketplaceProducts() {
  return marketplace.getProducts();
}

export async function fetchGames() {
  return games.getGames();
}

export async function fetchMedia(type: 'Movies' | 'Series') {
  return media.getMediaByType(type);
}