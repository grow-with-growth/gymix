// PocketBase implementation of ArticleVersionRepository
import PocketBase from 'pocketbase';
import { ArticleVersion } from '../../../types';
import { ArticleVersionRepository } from '../interfaces';
import { articleVersionCreateSchema, articleVersionUpdateSchema } from '../../validation/schemas';

/**
 * PocketBase implementation of ArticleVersionRepository
 */
export class PocketBaseArticleVersionRepository implements ArticleVersionRepository {
  private pb: PocketBase;
  private collectionName = 'article_versions';

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Find all article versions
   */
  async findAll(): Promise<ArticleVersion[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        sort: '-createdAt',
      });
      return records.map(record => this.mapToArticleVersion(record));
    } catch (error) {
      console.error('Error finding all article versions:', error);
      throw new Error('Failed to retrieve article versions');
    }
  }

  /**
   * Find article version by ID
   */
  async findById(id: string): Promise<ArticleVersion | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getOne(id);
      return this.mapToArticleVersion(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding article version by ID:', error);
      throw new Error('Failed to retrieve article version');
    }
  }

  /**
   * Find all versions for a specific article
   */
  async findByArticleId(articleId: string): Promise<ArticleVersion[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `articleId="${articleId}"`,
        sort: '-version',
      });
      return records.map(record => this.mapToArticleVersion(record));
    } catch (error) {
      console.error('Error finding article versions by article ID:', error);
      throw new Error('Failed to retrieve article versions');
    }
  }

  /**
   * Find a specific version of an article
   */
  async findByArticleIdAndVersion(articleId: string, version: number): Promise<ArticleVersion | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getFirstListItem(
        `articleId="${articleId}" && version=${version}`
      );
      return this.mapToArticleVersion(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding article version by article ID and version:', error);
      throw new Error('Failed to retrieve article version');
    }
  }

  /**
   * Find the latest version of an article
   */
  async findLatestByArticleId(articleId: string): Promise<ArticleVersion | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getFirstListItem(
        `articleId="${articleId}"`,
        {
          sort: '-version',
        }
      );
      return this.mapToArticleVersion(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding latest article version:', error);
      throw new Error('Failed to retrieve latest article version');
    }
  }

  /**
   * Find published versions of an article
   */
  async findPublishedByArticleId(articleId: string): Promise<ArticleVersion[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `articleId="${articleId}" && isPublished=true`,
        sort: '-version',
      });
      return records.map(record => this.mapToArticleVersion(record));
    } catch (error) {
      console.error('Error finding published article versions:', error);
      throw new Error('Failed to retrieve published article versions');
    }
  }

  /**
   * Find article versions by author
   */
  async findByAuthor(author: string): Promise<ArticleVersion[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `author="${author}"`,
        sort: '-createdAt',
      });
      return records.map(record => this.mapToArticleVersion(record));
    } catch (error) {
      console.error('Error finding article versions by author:', error);
      throw new Error('Failed to retrieve article versions by author');
    }
  }

  /**
   * Get the next version number for an article
   */
  async getNextVersionNumber(articleId: string): Promise<number> {
    try {
      const latestVersion = await this.findLatestByArticleId(articleId);
      return latestVersion ? latestVersion.version + 1 : 1;
    } catch (error) {
      console.error('Error getting next version number:', error);
      throw new Error('Failed to get next version number');
    }
  }

  /**
   * Create a new article version
   */
  async create(versionData: Omit<ArticleVersion, 'id'>): Promise<ArticleVersion> {
    try {
      // Validate the version data
      const validatedData = articleVersionCreateSchema.parse(versionData);
      
      const record = await this.pb.collection(this.collectionName).create(validatedData);
      return this.mapToArticleVersion(record);
    } catch (error) {
      console.error('Error creating article version:', error);
      throw new Error('Failed to create article version');
    }
  }

  /**
   * Update an existing article version
   */
  async update(id: string, versionData: Partial<ArticleVersion>): Promise<ArticleVersion> {
    try {
      // Validate the version data
      const validatedData = articleVersionUpdateSchema.parse({ id, ...versionData });
      
      const record = await this.pb.collection(this.collectionName).update(id, validatedData);
      return this.mapToArticleVersion(record);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('Article version not found');
      }
      console.error('Error updating article version:', error);
      throw new Error('Failed to update article version');
    }
  }

  /**
   * Delete an article version
   */
  async delete(id: string): Promise<void> {
    try {
      await this.pb.collection(this.collectionName).delete(id);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('Article version not found');
      }
      console.error('Error deleting article version:', error);
      throw new Error('Failed to delete article version');
    }
  }

  /**
   * Map PocketBase record to ArticleVersion
   */
  private mapToArticleVersion(record: any): ArticleVersion {
    return {
      id: record.id,
      articleId: record.articleId,
      title: record.title,
      content: record.content,
      author: record.author,
      createdAt: record.created,
      version: record.version,
      isPublished: record.isPublished,
      changeDescription: record.changeDescription || undefined,
    };
  }
}