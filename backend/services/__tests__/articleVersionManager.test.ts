// Tests for ArticleVersionManager
import PocketBase from 'pocketbase';
import { ArticleVersionManager } from '../articleVersionManager';
import { Article, ArticleVersion } from '../../../types';

// Mock PocketBase
jest.mock('pocketbase');

// Mock the repository classes
jest.mock('../../repositories/pocketbase/articleRepository');
jest.mock('../../repositories/pocketbase/articleVersionRepository');

describe('ArticleVersionManager', () => {
  let pb: PocketBase;
  let versionManager: ArticleVersionManager;
  let mockArticleRepo: any;
  let mockVersionRepo: any;

  beforeEach(() => {
    pb = new PocketBase();
    versionManager = new ArticleVersionManager(pb);
    
    // Get the mocked repositories
    mockArticleRepo = (versionManager as any).articleRepository;
    mockVersionRepo = (versionManager as any).versionRepository;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createArticle', () => {
    it('should create a new article with initial version', async () => {
      const mockVersion: ArticleVersion = {
        id: 'version1',
        articleId: 'article1',
        title: 'Test Article',
        content: 'Test content',
        author: 'author1',
        createdAt: '2024-01-01T00:00:00Z',
        version: 1,
        isPublished: true,
        changeDescription: 'Initial version',
      };

      const mockArticle: Article = {
        id: 'article1',
        currentVersionId: 'version1',
        latestVersion: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockVersionRepo.create = jest.fn()
        .mockResolvedValueOnce({ ...mockVersion, articleId: '' })
        .mockResolvedValueOnce(mockVersion);
      mockArticleRepo.create = jest.fn().mockResolvedValue(mockArticle);
      mockVersionRepo.update = jest.fn().mockResolvedValue(mockVersion);

      const result = await versionManager.createArticle(
        'Test Article',
        'Test content',
        'author1',
        true,
        'Initial version'
      );

      expect(result.article).toEqual(mockArticle);
      expect(result.version).toEqual(mockVersion);
      expect(mockVersionRepo.create).toHaveBeenCalledTimes(1);
      expect(mockArticleRepo.create).toHaveBeenCalledTimes(1);
      expect(mockVersionRepo.update).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during article creation', async () => {
      mockVersionRepo.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(
        versionManager.createArticle('Test Article', 'Test content', 'author1')
      ).rejects.toThrow('Failed to create article');
    });
  });

  describe('createVersion', () => {
    it('should create a new version of an existing article', async () => {
      const mockArticle: Article = {
        id: 'article1',
        currentVersionId: 'version1',
        latestVersion: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockNewVersion: ArticleVersion = {
        id: 'version2',
        articleId: 'article1',
        title: 'Updated Article',
        content: 'Updated content',
        author: 'author1',
        createdAt: '2024-01-02T00:00:00Z',
        version: 2,
        isPublished: true,
        changeDescription: 'Updated content',
      };

      mockArticleRepo.findById = jest.fn().mockResolvedValue(mockArticle);
      mockVersionRepo.getNextVersionNumber = jest.fn().mockResolvedValue(2);
      mockVersionRepo.create = jest.fn().mockResolvedValue(mockNewVersion);
      mockArticleRepo.update = jest.fn().mockResolvedValue(mockArticle);

      const result = await versionManager.createVersion(
        'article1',
        'Updated Article',
        'Updated content',
        'author1',
        true,
        'Updated content'
      );

      expect(result).toEqual(mockNewVersion);
      expect(mockArticleRepo.findById).toHaveBeenCalledWith('article1');
      expect(mockVersionRepo.getNextVersionNumber).toHaveBeenCalledWith('article1');
      expect(mockVersionRepo.create).toHaveBeenCalledTimes(1);
      expect(mockArticleRepo.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error if article not found', async () => {
      mockArticleRepo.findById = jest.fn().mockResolvedValue(null);

      await expect(
        versionManager.createVersion('nonexistent', 'Title', 'Content', 'author1')
      ).rejects.toThrow('Failed to create article version');
    });
  });

  describe('getArticleVersions', () => {
    it('should return all versions of an article', async () => {
      const mockVersions: ArticleVersion[] = [
        {
          id: 'version2',
          articleId: 'article1',
          title: 'Updated Article',
          content: 'Updated content',
          author: 'author1',
          createdAt: '2024-01-02T00:00:00Z',
          version: 2,
          isPublished: true,
        },
        {
          id: 'version1',
          articleId: 'article1',
          title: 'Test Article',
          content: 'Test content',
          author: 'author1',
          createdAt: '2024-01-01T00:00:00Z',
          version: 1,
          isPublished: false,
        },
      ];

      mockVersionRepo.findByArticleId = jest.fn().mockResolvedValue(mockVersions);

      const result = await versionManager.getArticleVersions('article1');

      expect(result).toEqual(mockVersions);
      expect(mockVersionRepo.findByArticleId).toHaveBeenCalledWith('article1');
    });
  });

  describe('publishVersion', () => {
    it('should publish a specific version', async () => {
      const mockVersion: ArticleVersion = {
        id: 'version1',
        articleId: 'article1',
        title: 'Test Article',
        content: 'Test content',
        author: 'author1',
        createdAt: '2024-01-01T00:00:00Z',
        version: 1,
        isPublished: false,
      };

      const mockPublishedVersion: ArticleVersion = {
        ...mockVersion,
        isPublished: true,
      };

      mockVersionRepo.findByArticleIdAndVersion = jest.fn().mockResolvedValue(mockVersion);
      mockVersionRepo.update = jest.fn().mockResolvedValue(mockPublishedVersion);
      mockArticleRepo.update = jest.fn().mockResolvedValue({});

      const result = await versionManager.publishVersion('article1', 1);

      expect(result).toEqual(mockPublishedVersion);
      expect(mockVersionRepo.findByArticleIdAndVersion).toHaveBeenCalledWith('article1', 1);
      expect(mockVersionRepo.update).toHaveBeenCalledWith('version1', { isPublished: true });
      expect(mockArticleRepo.update).toHaveBeenCalledWith('article1', {
        currentVersionId: 'version1',
        updatedAt: expect.any(String),
      });
    });

    it('should throw error if version not found', async () => {
      mockVersionRepo.findByArticleIdAndVersion = jest.fn().mockResolvedValue(null);

      await expect(
        versionManager.publishVersion('article1', 999)
      ).rejects.toThrow('Failed to publish version');
    });
  });

  describe('restoreVersion', () => {
    it('should restore a previous version by creating a new version', async () => {
      const mockSourceVersion: ArticleVersion = {
        id: 'version1',
        articleId: 'article1',
        title: 'Original Title',
        content: 'Original content',
        author: 'author1',
        createdAt: '2024-01-01T00:00:00Z',
        version: 1,
        isPublished: false,
      };

      const mockRestoredVersion: ArticleVersion = {
        id: 'version3',
        articleId: 'article1',
        title: 'Original Title',
        content: 'Original content',
        author: 'author2',
        createdAt: '2024-01-03T00:00:00Z',
        version: 3,
        isPublished: true,
        changeDescription: 'Restored from version 1',
      };

      mockVersionRepo.findByArticleIdAndVersion = jest.fn().mockResolvedValue(mockSourceVersion);
      
      // Mock the createVersion method by spying on it
      const createVersionSpy = jest.spyOn(versionManager, 'createVersion')
        .mockResolvedValue(mockRestoredVersion);

      const result = await versionManager.restoreVersion('article1', 1, 'author2', true);

      expect(result).toEqual(mockRestoredVersion);
      expect(mockVersionRepo.findByArticleIdAndVersion).toHaveBeenCalledWith('article1', 1);
      expect(createVersionSpy).toHaveBeenCalledWith(
        'article1',
        'Original Title',
        'Original content',
        'author2',
        true,
        'Restored from version 1'
      );
    });
  });

  describe('compareVersions', () => {
    it('should return both versions for comparison', async () => {
      const mockVersion1: ArticleVersion = {
        id: 'version1',
        articleId: 'article1',
        title: 'Version 1',
        content: 'Content 1',
        author: 'author1',
        createdAt: '2024-01-01T00:00:00Z',
        version: 1,
        isPublished: false,
      };

      const mockVersion2: ArticleVersion = {
        id: 'version2',
        articleId: 'article1',
        title: 'Version 2',
        content: 'Content 2',
        author: 'author1',
        createdAt: '2024-01-02T00:00:00Z',
        version: 2,
        isPublished: true,
      };

      mockVersionRepo.findByArticleIdAndVersion = jest.fn()
        .mockResolvedValueOnce(mockVersion1)
        .mockResolvedValueOnce(mockVersion2);

      const result = await versionManager.compareVersions('article1', 1, 2);

      expect(result).toEqual({
        version1: mockVersion1,
        version2: mockVersion2,
      });
    });

    it('should return null if either version is not found', async () => {
      mockVersionRepo.findByArticleIdAndVersion = jest.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({});

      const result = await versionManager.compareVersions('article1', 1, 2);

      expect(result).toBeNull();
    });
  });
});