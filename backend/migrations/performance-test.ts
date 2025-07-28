import PocketBase from 'pocketbase';

/**
 * Performance testing utility for database indexes
 * This utility tests common query patterns to validate index effectiveness
 */
export class IndexPerformanceTester {
  private pb: PocketBase;
  
  constructor(pb: PocketBase) {
    this.pb = pb;
  }
  
  /**
   * Test calendar events queries
   */
  async testCalendarEventsQueries(): Promise<void> {
    console.log('Testing calendar events queries...');
    
    const startTime = Date.now();
    
    // Test date range query (should use idx_calendar_events_date)
    const dateRangeStart = performance.now();
    await this.pb.collection('calendar_events').getList(1, 50, {
      filter: `date >= '2024-01-01' && date <= '2024-12-31'`,
      sort: 'date'
    });
    const dateRangeEnd = performance.now();
    console.log(`  Date range query: ${(dateRangeEnd - dateRangeStart).toFixed(2)}ms`);
    
    // Test user-specific calendar query (should use idx_calendar_events_user_date)
    const userCalendarStart = performance.now();
    await this.pb.collection('calendar_events').getList(1, 50, {
      filter: `user = 'test_user_id' && date >= '2024-01-01'`,
      sort: 'date'
    });
    const userCalendarEnd = performance.now();
    console.log(`  User calendar query: ${(userCalendarEnd - userCalendarStart).toFixed(2)}ms`);
    
    // Test event type query (should use idx_calendar_events_type_date)
    const typeQueryStart = performance.now();
    await this.pb.collection('calendar_events').getList(1, 50, {
      filter: `type = 'meeting'`,
      sort: 'date'
    });
    const typeQueryEnd = performance.now();
    console.log(`  Event type query: ${(typeQueryEnd - typeQueryStart).toFixed(2)}ms`);
  }
  
  /**
   * Test users queries
   */
  async testUsersQueries(): Promise<void> {
    console.log('Testing users queries...');
    
    // Test department filter (should use idx_users_department)
    const deptStart = performance.now();
    await this.pb.collection('users').getList(1, 50, {
      filter: `department = 'Engineering'`,
      sort: 'name'
    });
    const deptEnd = performance.now();
    console.log(`  Department filter: ${(deptEnd - deptStart).toFixed(2)}ms`);
    
    // Test role filter (should use idx_users_role)
    const roleStart = performance.now();
    await this.pb.collection('users').getList(1, 50, {
      filter: `role = 'Teacher'`,
      sort: 'name'
    });
    const roleEnd = performance.now();
    console.log(`  Role filter: ${(roleEnd - roleStart).toFixed(2)}ms`);
    
    // Test name search (should use idx_users_name)
    const nameSearchStart = performance.now();
    await this.pb.collection('users').getList(1, 50, {
      filter: `name ~ 'John'`,
      sort: 'name'
    });
    const nameSearchEnd = performance.now();
    console.log(`  Name search: ${(nameSearchEnd - nameSearchStart).toFixed(2)}ms`);
    
    // Test email search (should use idx_users_email)
    const emailSearchStart = performance.now();
    await this.pb.collection('users').getList(1, 50, {
      filter: `email ~ 'john@'`,
      sort: 'name'
    });
    const emailSearchEnd = performance.now();
    console.log(`  Email search: ${(emailSearchEnd - emailSearchStart).toFixed(2)}ms`);
  }
  
  /**
   * Test emails queries
   */
  async testEmailsQueries(): Promise<void> {
    console.log('Testing emails queries...');
    
    // Test folder with timestamp sort (should use idx_emails_folder_timestamp)
    const folderStart = performance.now();
    await this.pb.collection('emails').getList(1, 50, {
      filter: `folder = 'Inbox'`,
      sort: '-timestamp'
    });
    const folderEnd = performance.now();
    console.log(`  Folder with timestamp: ${(folderEnd - folderStart).toFixed(2)}ms`);
    
    // Test sender emails (should use idx_emails_sender_timestamp)
    const senderStart = performance.now();
    await this.pb.collection('emails').getList(1, 50, {
      filter: `sender = 'user_id'`,
      sort: '-timestamp'
    });
    const senderEnd = performance.now();
    console.log(`  Sender emails: ${(senderEnd - senderStart).toFixed(2)}ms`);
    
    // Test unread emails (should use idx_emails_unread_folder)
    const unreadStart = performance.now();
    await this.pb.collection('emails').getList(1, 50, {
      filter: `unread = true && folder = 'Inbox'`
    });
    const unreadEnd = performance.now();
    console.log(`  Unread emails: ${(unreadEnd - unreadStart).toFixed(2)}ms`);
  }
  
  /**
   * Test knowledge articles queries
   */
  async testKnowledgeArticlesQueries(): Promise<void> {
    console.log('Testing knowledge articles queries...');
    
    // Test author filter (should use idx_knowledge_articles_author)
    const authorStart = performance.now();
    await this.pb.collection('knowledge_articles').getList(1, 50, {
      filter: `author = 'author_id'`,
      sort: 'title'
    });
    const authorEnd = performance.now();
    console.log(`  Author filter: ${(authorEnd - authorStart).toFixed(2)}ms`);
    
    // Test title search (should use idx_knowledge_articles_title)
    const titleStart = performance.now();
    await this.pb.collection('knowledge_articles').getList(1, 50, {
      filter: `title ~ 'tutorial'`,
      sort: 'title'
    });
    const titleEnd = performance.now();
    console.log(`  Title search: ${(titleEnd - titleStart).toFixed(2)}ms`);
  }
  
  /**
   * Test marketplace products queries
   */
  async testMarketplaceProductsQueries(): Promise<void> {
    console.log('Testing marketplace products queries...');
    
    // Test category with name sort (should use idx_marketplace_products_category_name)
    const categoryStart = performance.now();
    await this.pb.collection('marketplace_products').getList(1, 50, {
      filter: `category = 'Electronics'`,
      sort: 'name'
    });
    const categoryEnd = performance.now();
    console.log(`  Category with name sort: ${(categoryEnd - categoryStart).toFixed(2)}ms`);
    
    // Test price filter (should use idx_marketplace_products_price)
    const priceStart = performance.now();
    await this.pb.collection('marketplace_products').getList(1, 50, {
      filter: `price >= 100 && price <= 500`
    });
    const priceEnd = performance.now();
    console.log(`  Price range filter: ${(priceEnd - priceStart).toFixed(2)}ms`);
    
    // Test stock filter (should use idx_marketplace_products_stock)
    const stockStart = performance.now();
    await this.pb.collection('marketplace_products').getList(1, 50, {
      filter: `stock > 0`
    });
    const stockEnd = performance.now();
    console.log(`  Stock filter: ${(stockEnd - stockStart).toFixed(2)}ms`);
  }
  
  /**
   * Test files queries
   */
  async testFilesQueries(): Promise<void> {
    console.log('Testing files queries...');
    
    // Test folder filter (should use idx_files_folder)
    const folderStart = performance.now();
    await this.pb.collection('files').getList(1, 50, {
      filter: `folder = 'Documents'`
    });
    const folderEnd = performance.now();
    console.log(`  Folder filter: ${(folderEnd - folderStart).toFixed(2)}ms`);
    
    // Test uploader filter (should use idx_files_uploader)
    const uploaderStart = performance.now();
    await this.pb.collection('files').getList(1, 50, {
      filter: `uploader = 'user_id'`
    });
    const uploaderEnd = performance.now();
    console.log(`  Uploader filter: ${(uploaderEnd - uploaderStart).toFixed(2)}ms`);
    
    // Test combined folder and uploader (should use idx_files_folder_uploader)
    const combinedStart = performance.now();
    await this.pb.collection('files').getList(1, 50, {
      filter: `folder = 'Documents' && uploader = 'user_id'`
    });
    const combinedEnd = performance.now();
    console.log(`  Combined folder/uploader: ${(combinedEnd - combinedStart).toFixed(2)}ms`);
  }
  
  /**
   * Run all performance tests
   */
  async runAllTests(): Promise<void> {
    console.log('Starting database index performance tests...\n');
    
    const overallStart = performance.now();
    
    try {
      await this.testCalendarEventsQueries();
      console.log();
      
      await this.testUsersQueries();
      console.log();
      
      await this.testEmailsQueries();
      console.log();
      
      await this.testKnowledgeArticlesQueries();
      console.log();
      
      await this.testMarketplaceProductsQueries();
      console.log();
      
      await this.testFilesQueries();
      console.log();
      
    } catch (error) {
      console.error('Error during performance testing:', error);
    }
    
    const overallEnd = performance.now();
    console.log(`Total test time: ${(overallEnd - overallStart).toFixed(2)}ms`);
    console.log('Performance tests completed!');
  }
}

/**
 * CLI runner for performance tests
 */
if (require.main === module) {
  const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
  const tester = new IndexPerformanceTester(pb);
  
  tester.runAllTests().catch(console.error);
}