// Migration: Add article versioning schema
import PocketBase from 'pocketbase';
import { Migration } from '../types';

const migration: Migration = {
  id: '1737826500000_add_article_versioning',
  name: 'Add article versioning schema',
  timestamp: 1737826500000,

  async up(pb: PocketBase): Promise<void> {
    try {
      console.log('Creating articles collection...');
      
      // Create articles collection
      await pb.collections.create({
        name: 'articles',
        type: 'base',
        schema: [
          {
            name: 'currentVersionId',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 255,
            },
          },
          {
            name: 'latestVersion',
            type: 'number',
            required: true,
            options: {
              min: 1,
            },
          },
        ],
        indexes: [
          'CREATE INDEX idx_articles_current_version ON articles (currentVersionId)',
        ],
      });

      console.log('Creating article_versions collection...');
      
      // Create article_versions collection
      await pb.collections.create({
        name: 'article_versions',
        type: 'base',
        schema: [
          {
            name: 'articleId',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 255,
            },
          },
          {
            name: 'title',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 300,
            },
          },
          {
            name: 'content',
            type: 'editor',
            required: true,
            options: {
              maxSize: 50000,
            },
          },
          {
            name: 'author',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 255,
            },
          },
          {
            name: 'version',
            type: 'number',
            required: true,
            options: {
              min: 1,
            },
          },
          {
            name: 'isPublished',
            type: 'bool',
            required: true,
          },
          {
            name: 'changeDescription',
            type: 'text',
            required: false,
            options: {
              max: 500,
            },
          },
        ],
        indexes: [
          'CREATE INDEX idx_article_versions_article_id ON article_versions (articleId)',
          'CREATE INDEX idx_article_versions_version ON article_versions (articleId, version)',
          'CREATE INDEX idx_article_versions_published ON article_versions (articleId, isPublished)',
          'CREATE INDEX idx_article_versions_author ON article_versions (author)',
          'CREATE UNIQUE INDEX idx_article_versions_unique ON article_versions (articleId, version)',
        ],
      });

      console.log('Article versioning schema created successfully');
    } catch (error) {
      console.error('Error creating article versioning schema:', error);
      throw error;
    }
  },

  async down(pb: PocketBase): Promise<void> {
    try {
      console.log('Dropping article versioning collections...');
      
      // Drop article_versions collection first (to avoid foreign key issues)
      try {
        await pb.collections.delete('article_versions');
        console.log('Dropped article_versions collection');
      } catch (error) {
        console.warn('Could not drop article_versions collection:', error);
      }

      // Drop articles collection
      try {
        await pb.collections.delete('articles');
        console.log('Dropped articles collection');
      } catch (error) {
        console.warn('Could not drop articles collection:', error);
      }

      console.log('Article versioning schema dropped successfully');
    } catch (error) {
      console.error('Error dropping article versioning schema:', error);
      throw error;
    }
  },
};

export default migration;