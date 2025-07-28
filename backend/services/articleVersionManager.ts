// Article Version Manager - handles article versioning logic
import PocketBase from 'pocketbase';
import { Article, ArticleVersion } from '../../types';
import { PocketBaseArticleRepository } from '../repositories/pocketbase/articleRepository';
import { PocketBaseArticleVersionRepository } from '../repositories/pocketbase/articleVersionRepository';

/**
 * ArticleVersionManager class for handling article versioning operations
 */
export class ArticleVersionManager {
  private pb: PocketBase;
  private articleRepository: PocketBaseArticleRepository;
  private versionRepository: PocketBaseArticleVersionRepository;

  constructor(pb: PocketBase) {
    this.pb = pb;
    this.articleRepository = new PocketBaseArticleRepository(pb);
    this.versionRepository = new PocketBaseArticleVersionRepository(pb);
  }

  /**
   * Create a new article with its initial version
   * @param title Article title
   * @param content Article content
   * @param author Author ID or name
   * @param isPublished Whether the initial version should be published
   * @param changeDescription Optional description of changes
   * @returns Promise containing the created article and version
   */
  async createArticle(
    title: string,
    content: string,
    author: string,
    isPublished: boolean = false,
    changeDescription?: string
  ): Promise<{ article: Article; version: ArticleVersion }> {
    try {
      // Create the initial version first
      const versionData: Omit<ArticleVersion, 'id'> = {
        articleId: '', // Will be updated after article creation
        title,
        content,
        author,
        createdAt: new Date().toISOString(),
        version: 1,
        isPublished,
        changeDescription: changeDescription || 'Initial version',
      };

      // Create a temporary version to get an ID
      const tempVersion = await this.versionRepository.create(versionData);

      // Create the article with reference to the version
      const articleData: Omit<Article, 'id'> = {
        currentVersionId: tempVersion.id,
        latestVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const article = await this.articleRepository.create(articleData);

      // Update the version with the correct article ID
      const updatedVersion = await this.versionRepository.update(tempVersion.id, {
        articleId: article.id,
      });

      return { article, version: updatedVersion };
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Failed to create article');
    }
  }

  /**
   * Create a new version of an existing article
   * @param articleId ID of the article to version
   * @param title New title (can be same as previous)
   * @param content New content
   * @param author Author ID or name
   * @param isPublished Whether this version should be published
   * @param changeDescription Description of changes made
   * @returns Promise containing the new version
   */
  async createVersion(
    articleId: string,
    title: string,
    content: string,
    author: string,
    isPublished: boolean = false,
    changeDescription?: string
  ): Promise<ArticleVersion> {
    try {
      // Get the article to ensure it exists
      const article = await this.articleRepository.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Get the next version number
      const nextVersion = await this.versionRepository.getNextVersionNumber(articleId);

      // Create the new version
      const versionData: Omit<ArticleVersion, 'id'> = {
        articleId,
        title,
        content,
        author,
        createdAt: new Date().toISOString(),
        version: nextVersion,
        isPublished,
        changeDescription,
      };

      const newVersion = await this.versionRepository.create(versionData);

      // Update the article's latest version and current version if published
      const updateData: Partial<Article> = {
        latestVersion: nextVersion,
        updatedAt: new Date().toISOString(),
      };

      if (isPublished) {
        updateData.currentVersionId = newVersion.id;
      }

      await this.articleRepository.update(articleId, updateData);

      return newVersion;
    } catch (error) {
      console.error('Error creating article version:', error);
      throw new Error('Failed to create article version');
    }
  }

  /**
   * Get all versions of an article
   * @param articleId ID of the article
   * @returns Promise containing array of versions sorted by version number (newest first)
   */
  async getArticleVersions(articleId: string): Promise<ArticleVersion[]> {
    try {
      return await this.versionRepository.findByArticleId(articleId);
    } catch (error) {
      console.error('Error getting article versions:', error);
      throw new Error('Failed to retrieve article versions');
    }
  }

  /**
   * Get a specific version of an article
   * @param articleId ID of the article
   * @param version Version number to retrieve
   * @returns Promise containing the version or null if not found
   */
  async getArticleVersion(articleId: string, version: number): Promise<ArticleVersion | null> {
    try {
      return await this.versionRepository.findByArticleIdAndVersion(articleId, version);
    } catch (error) {
      console.error('Error getting article version:', error);
      throw new Error('Failed to retrieve article version');
    }
  }

  /**
   * Get the latest version of an article
   * @param articleId ID of the article
   * @returns Promise containing the latest version or null if not found
   */
  async getLatestVersion(articleId: string): Promise<ArticleVersion | null> {
    try {
      return await this.versionRepository.findLatestByArticleId(articleId);
    } catch (error) {
      console.error('Error getting latest article version:', error);
      throw new Error('Failed to retrieve latest article version');
    }
  }

  /**
   * Get the current published version of an article
   * @param articleId ID of the article
   * @returns Promise containing the current published version or null if not found
   */
  async getCurrentPublishedVersion(articleId: string): Promise<ArticleVersion | null> {
    try {
      const article = await this.articleRepository.findById(articleId);
      if (!article) {
        return null;
      }

      return await this.versionRepository.findById(article.currentVersionId);
    } catch (error) {
      console.error('Error getting current published version:', error);
      throw new Error('Failed to retrieve current published version');
    }
  }

  /**
   * Publish a specific version of an article
   * @param articleId ID of the article
   * @param version Version number to publish
   * @returns Promise containing the published version
   */
  async publishVersion(articleId: string, version: number): Promise<ArticleVersion> {
    try {
      // Get the version to publish
      const versionToPublish = await this.versionRepository.findByArticleIdAndVersion(articleId, version);
      if (!versionToPublish) {
        throw new Error('Version not found');
      }

      // Mark the version as published
      const publishedVersion = await this.versionRepository.update(versionToPublish.id, {
        isPublished: true,
      });

      // Update the article's current version
      await this.articleRepository.update(articleId, {
        currentVersionId: publishedVersion.id,
        updatedAt: new Date().toISOString(),
      });

      return publishedVersion;
    } catch (error) {
      console.error('Error publishing version:', error);
      throw new Error('Failed to publish version');
    }
  }

  /**
   * Unpublish a version (mark as draft)
   * @param articleId ID of the article
   * @param version Version number to unpublish
   * @returns Promise containing the unpublished version
   */
  async unpublishVersion(articleId: string, version: number): Promise<ArticleVersion> {
    try {
      // Get the version to unpublish
      const versionToUnpublish = await this.versionRepository.findByArticleIdAndVersion(articleId, version);
      if (!versionToUnpublish) {
        throw new Error('Version not found');
      }

      // Mark the version as unpublished
      const unpublishedVersion = await this.versionRepository.update(versionToUnpublish.id, {
        isPublished: false,
      });

      // If this was the current published version, find the next most recent published version
      const article = await this.articleRepository.findById(articleId);
      if (article && article.currentVersionId === versionToUnpublish.id) {
        const publishedVersions = await this.versionRepository.findPublishedByArticleId(articleId);
        
        if (publishedVersions.length > 0) {
          // Set the most recent published version as current
          await this.articleRepository.update(articleId, {
            currentVersionId: publishedVersions[0].id,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // No published versions left, set to latest version
          const latestVersion = await this.versionRepository.findLatestByArticleId(articleId);
          if (latestVersion) {
            await this.articleRepository.update(articleId, {
              currentVersionId: latestVersion.id,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      return unpublishedVersion;
    } catch (error) {
      console.error('Error unpublishing version:', error);
      throw new Error('Failed to unpublish version');
    }
  }

  /**
   * Restore a previous version by creating a new version with the same content
   * @param articleId ID of the article
   * @param versionToRestore Version number to restore
   * @param author Author performing the restoration
   * @param isPublished Whether the restored version should be published
   * @returns Promise containing the new version with restored content
   */
  async restoreVersion(
    articleId: string,
    versionToRestore: number,
    author: string,
    isPublished: boolean = false
  ): Promise<ArticleVersion> {
    try {
      // Get the version to restore
      const sourceVersion = await this.versionRepository.findByArticleIdAndVersion(articleId, versionToRestore);
      if (!sourceVersion) {
        throw new Error('Version to restore not found');
      }

      // Create a new version with the restored content
      return await this.createVersion(
        articleId,
        sourceVersion.title,
        sourceVersion.content,
        author,
        isPublished,
        `Restored from version ${versionToRestore}`
      );
    } catch (error) {
      console.error('Error restoring version:', error);
      throw new Error('Failed to restore version');
    }
  }

  /**
   * Compare two versions of an article
   * @param articleId ID of the article
   * @param version1 First version number to compare
   * @param version2 Second version number to compare
   * @returns Promise containing both versions for comparison
   */
  async compareVersions(
    articleId: string,
    version1: number,
    version2: number
  ): Promise<{ version1: ArticleVersion; version2: ArticleVersion } | null> {
    try {
      const [v1, v2] = await Promise.all([
        this.versionRepository.findByArticleIdAndVersion(articleId, version1),
        this.versionRepository.findByArticleIdAndVersion(articleId, version2),
      ]);

      if (!v1 || !v2) {
        return null;
      }

      return { version1: v1, version2: v2 };
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw new Error('Failed to compare versions');
    }
  }

  /**
   * Get version history with metadata for an article
   * @param articleId ID of the article
   * @returns Promise containing version history with additional metadata
   */
  async getVersionHistory(articleId: string): Promise<{
    article: Article;
    versions: ArticleVersion[];
    currentVersion: ArticleVersion | null;
    latestVersion: ArticleVersion | null;
  }> {
    try {
      const [article, versions] = await Promise.all([
        this.articleRepository.findById(articleId),
        this.versionRepository.findByArticleId(articleId),
      ]);

      if (!article) {
        throw new Error('Article not found');
      }

      const currentVersion = await this.versionRepository.findById(article.currentVersionId);
      const latestVersion = versions.length > 0 ? versions[0] : null;

      return {
        article,
        versions,
        currentVersion,
        latestVersion,
      };
    } catch (error) {
      console.error('Error getting version history:', error);
      throw new Error('Failed to retrieve version history');
    }
  }
}