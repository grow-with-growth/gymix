import { Migration } from '../types';
import PocketBase from 'pocketbase';

/**
 * Add Database Indexes
 * This migration adds indexes to improve query performance based on common query patterns
 */
const migration: Migration = {
  id: 'add_database_indexes_001',
  name: 'Add Database Indexes',
  timestamp: 1737825600000,
  
  /**
   * Apply the migration
   * @param pb PocketBase instance
   */
  async up(pb: PocketBase): Promise<void> {
    console.log('Adding database indexes for improved query performance...');
    
    try {
      // Calendar Events Indexes
      console.log('Adding calendar_events indexes...');
      const calendarEvents = await pb.collections.getOne('calendar_events');
      await pb.collections.update(calendarEvents.id, {
        indexes: [
          'CREATE INDEX idx_calendar_events_date ON calendar_events (date)',
          'CREATE INDEX idx_calendar_events_user_date ON calendar_events (user, date)',
          'CREATE INDEX idx_calendar_events_type_date ON calendar_events (type, date)',
        ],
      });
      
      // Users Collection Indexes (Auth collection)
      console.log('Adding users indexes...');
      const users = await pb.collections.getOne('users');
      await pb.collections.update(users.id, {
        indexes: [
          'CREATE INDEX idx_users_department ON users (department)',
          'CREATE INDEX idx_users_role ON users (role)',
          'CREATE INDEX idx_users_name ON users (name)',
          'CREATE INDEX idx_users_email ON users (email)',
        ],
      });
      
      // Emails Collection Indexes
      console.log('Adding emails indexes...');
      const emails = await pb.collections.getOne('emails');
      await pb.collections.update(emails.id, {
        indexes: [
          'CREATE INDEX idx_emails_folder_timestamp ON emails (folder, timestamp DESC)',
          'CREATE INDEX idx_emails_sender_timestamp ON emails (sender, timestamp DESC)',
          'CREATE INDEX idx_emails_timestamp ON emails (timestamp DESC)',
          'CREATE INDEX idx_emails_unread_folder ON emails (unread, folder)',
        ],
      });
      
      // Knowledge Articles Indexes
      console.log('Adding knowledge_articles indexes...');
      const knowledgeArticles = await pb.collections.getOne('knowledge_articles');
      await pb.collections.update(knowledgeArticles.id, {
        indexes: [
          'CREATE INDEX idx_knowledge_articles_author ON knowledge_articles (author)',
          'CREATE INDEX idx_knowledge_articles_title ON knowledge_articles (title)',
          'CREATE INDEX idx_knowledge_articles_tags ON knowledge_articles (tags)',
        ],
      });
      
      // Marketplace Products Indexes
      console.log('Adding marketplace_products indexes...');
      const marketplaceProducts = await pb.collections.getOne('marketplace_products');
      await pb.collections.update(marketplaceProducts.id, {
        indexes: [
          'CREATE INDEX idx_marketplace_products_category_name ON marketplace_products (category, name)',
          'CREATE INDEX idx_marketplace_products_price ON marketplace_products (price)',
          'CREATE INDEX idx_marketplace_products_stock ON marketplace_products (stock)',
        ],
      });
      
      // Games Collection Indexes
      console.log('Adding games indexes...');
      const games = await pb.collections.getOne('games');
      await pb.collections.update(games.id, {
        indexes: [
          'CREATE INDEX idx_games_category_title ON games (category, title)',
        ],
      });
      
      // Media Content Indexes
      console.log('Adding media_content indexes...');
      const mediaContent = await pb.collections.getOne('media_content');
      await pb.collections.update(mediaContent.id, {
        indexes: [
          'CREATE INDEX idx_media_content_type_title ON media_content (type, title)',
        ],
      });
      
      // Files Collection Indexes
      console.log('Adding files indexes...');
      const files = await pb.collections.getOne('files');
      await pb.collections.update(files.id, {
        indexes: [
          'CREATE INDEX idx_files_folder ON files (folder)',
          'CREATE INDEX idx_files_uploader ON files (uploader)',
          'CREATE INDEX idx_files_folder_uploader ON files (folder, uploader)',
        ],
      });
      
      console.log('Database indexes added successfully!');
      
    } catch (error) {
      console.error('Error adding database indexes:', error);
      throw error;
    }
  },
  
  /**
   * Rollback the migration
   * @param pb PocketBase instance
   */
  async down(pb: PocketBase): Promise<void> {
    console.log('Removing database indexes...');
    
    try {
      // Remove Calendar Events Indexes
      console.log('Removing calendar_events indexes...');
      const calendarEvents = await pb.collections.getOne('calendar_events');
      await pb.collections.update(calendarEvents.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_calendar_events_date',
          'DROP INDEX IF EXISTS idx_calendar_events_user_date',
          'DROP INDEX IF EXISTS idx_calendar_events_type_date',
        ],
      });
      
      // Remove Users Collection Indexes
      console.log('Removing users indexes...');
      const users = await pb.collections.getOne('users');
      await pb.collections.update(users.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_users_department',
          'DROP INDEX IF EXISTS idx_users_role',
          'DROP INDEX IF EXISTS idx_users_name',
          'DROP INDEX IF EXISTS idx_users_email',
        ],
      });
      
      // Remove Emails Collection Indexes
      console.log('Removing emails indexes...');
      const emails = await pb.collections.getOne('emails');
      await pb.collections.update(emails.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_emails_folder_timestamp',
          'DROP INDEX IF EXISTS idx_emails_sender_timestamp',
          'DROP INDEX IF EXISTS idx_emails_timestamp',
          'DROP INDEX IF EXISTS idx_emails_unread_folder',
        ],
      });
      
      // Remove Knowledge Articles Indexes
      console.log('Removing knowledge_articles indexes...');
      const knowledgeArticles = await pb.collections.getOne('knowledge_articles');
      await pb.collections.update(knowledgeArticles.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_knowledge_articles_author',
          'DROP INDEX IF EXISTS idx_knowledge_articles_title',
          'DROP INDEX IF EXISTS idx_knowledge_articles_tags',
        ],
      });
      
      // Remove Marketplace Products Indexes
      console.log('Removing marketplace_products indexes...');
      const marketplaceProducts = await pb.collections.getOne('marketplace_products');
      await pb.collections.update(marketplaceProducts.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_marketplace_products_category_name',
          'DROP INDEX IF EXISTS idx_marketplace_products_price',
          'DROP INDEX IF EXISTS idx_marketplace_products_stock',
        ],
      });
      
      // Remove Games Collection Indexes
      console.log('Removing games indexes...');
      const games = await pb.collections.getOne('games');
      await pb.collections.update(games.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_games_category_title',
        ],
      });
      
      // Remove Media Content Indexes
      console.log('Removing media_content indexes...');
      const mediaContent = await pb.collections.getOne('media_content');
      await pb.collections.update(mediaContent.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_media_content_type_title',
        ],
      });
      
      // Remove Files Collection Indexes
      console.log('Removing files indexes...');
      const files = await pb.collections.getOne('files');
      await pb.collections.update(files.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_files_folder',
          'DROP INDEX IF EXISTS idx_files_uploader',
          'DROP INDEX IF EXISTS idx_files_folder_uploader',
        ],
      });
      
      console.log('Database indexes removed successfully!');
      
    } catch (error) {
      console.error('Error removing database indexes:', error);
      throw error;
    }
  },
};

export default migration;