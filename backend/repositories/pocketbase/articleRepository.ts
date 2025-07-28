// PocketBase implementation of ArticleRepository
import PocketBase from 'pocketbase';
import { Article } from '../../../types';
import { ArticleRepository } from '../interfaces';
import { articleSchema } from '../../validation/schemas';

/**
 * PocketBase implementation of ArticleRepository
 */
export class PocketBaseArticleRepository implements ArticleRepository {
  private pb: PocketBase;
  private collectionName = 'articles';

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Find all articles
   */
  async findAll(): Promise<Article[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        sort: '-updatedAt',
      });
      return records.map(record => this.mapToArticle(record));
    } catch (error) {
      console.error('Error finding all articles:', error);
      throw new Error('Failed to retrieve articles');
    }
  }

  /**
   * Find article by ID
   */
  async findById(id: string): Promise<Article | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getOne(id);
      return this.mapToArticle(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding article by ID:', error);
      throw new Error('Failed to retrieve article');
    }
  }

  /**
   * Find article by current version ID
   */
  async findByCurrentVersion(versionId: string): Promise<Article | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getFirstListItem(
        `currentVersionId="${versionId}"`
      );
      return this.mapToArticle(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding article by current version:', error);
      throw new Error('Failed to retrieve article');
    }
  }

  /**
   * Create a new article
   */
  async create(articleData: Omit<Article, 'id'>): Promise<Article> {
    try {
      // Validate the article data
      const validatedData = articleSchema.omit({ id: true }).parse(articleData);
      
      const record = await this.pb.collection(this.collectionName).create(validatedData);
      return this.mapToArticle(record);
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Failed to create article');
    }
  }

  /**
   * Update an existing article
   */
  async update(id: string, articleData: Partial<Article>): Promise<Article> {
    try {
      // Validate the article data
      const validatedData = articleSchema.partial().parse(articleData);
      
      const record = await this.pb.collection(this.collectionName).update(id, validatedData);
      return this.mapToArticle(record);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('Article not found');
      }
      console.error('Error updating article:', error);
      throw new Error('Failed to update article');
    }
  }

  /**
   * Delete an article
   */
  async delete(id: string): Promise<void> {
    try {
      await this.pb.collection(this.collectionName).delete(id);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('Article not found');
      }
      console.error('Error deleting article:', error);
      throw new Error('Failed to delete article');
    }
  }

  /**
   * Map PocketBase record to Article
   */
  private mapToArticle(record: any): Article {
    return {
      id: record.id,
      currentVersionId: record.currentVersionId,
      latestVersion: record.latestVersion,
      createdAt: record.created,
      updatedAt: record.updated,
    };
  }
}