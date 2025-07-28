// Backend types for API and database interactions
import { 
  CalendarEvent, 
  Email, 
  KnowledgeArticle, 
  MarketplaceProduct, 
  SchoolUser,
  Game,
  MediaContent,
  SchoolHubDashboardData
} from '../types';

// Database connection types
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// Repository interfaces
export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string | number): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string | number, item: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}

// Specific repositories
export interface CalendarRepository extends Repository<CalendarEvent> {
  findByMonth(year: number, month: number): Promise<CalendarEvent[]>;
}

export interface EmailRepository extends Repository<Email> {
  findByFolder(folder: string): Promise<Email[]>;
  markAsRead(id: number): Promise<boolean>;
}

export interface KnowledgeRepository extends Repository<KnowledgeArticle> {
  search(query: string): Promise<KnowledgeArticle[]>;
}

export interface UserRepository extends Repository<SchoolUser> {
  findByRole(role: SchoolUser['role']): Promise<SchoolUser[]>;
  findByDepartment(department: string): Promise<SchoolUser[]>;
}

export interface ProductRepository extends Repository<MarketplaceProduct> {
  findByCategory(category: string): Promise<MarketplaceProduct[]>;
}

export interface GameRepository extends Repository<Game> {
  findByCategory(category: string): Promise<Game[]>;
}

export interface MediaRepository extends Repository<MediaContent> {
  findByType(type: MediaContent['type']): Promise<MediaContent[]>;
}

export interface SchoolHubRepository {
  getDashboardData(): Promise<SchoolHubDashboardData>;
}

// Import enrollment types
import { Enrollment, EnrollmentStatus, Class, Article, ArticleVersion } from '../types';

export interface EnrollmentRepository extends Repository<Enrollment> {
  findByStudent(studentId: string): Promise<Enrollment[]>;
  findByClass(classId: string): Promise<Enrollment[]>;
  findByStatus(statusId: string): Promise<Enrollment[]>;
}

export interface EnrollmentStatusRepository extends Repository<EnrollmentStatus> {
  findByName(name: string): Promise<EnrollmentStatus | null>;
}

export interface ClassRepository extends Repository<Class> {
  findByTeacher(teacherId: string): Promise<Class[]>;
  findByDepartment(department: string): Promise<Class[]>;
  findAvailable(): Promise<Class[]>; // Classes with available capacity
}

export interface ArticleRepository extends Repository<Article> {
  findByCurrentVersion(versionId: string): Promise<Article | null>;
}

export interface ArticleVersionRepository extends Repository<ArticleVersion> {
  findByArticleId(articleId: string): Promise<ArticleVersion[]>;
  findByArticleIdAndVersion(articleId: string, version: number): Promise<ArticleVersion | null>;
  findLatestByArticleId(articleId: string): Promise<ArticleVersion | null>;
  findPublishedByArticleId(articleId: string): Promise<ArticleVersion[]>;
  findByAuthor(author: string): Promise<ArticleVersion[]>;
  getNextVersionNumber(articleId: string): Promise<number>;
}

// Import Personal Growth Journal types
import { 
  JournalEntry, 
  JournalTemplate, 
  JournalGoal, 
  ReflectionPrompt, 
  JournalAnalytics 
} from '../types';

export interface JournalEntryRepository extends Repository<JournalEntry> {
  findByUserId(userId: string): Promise<JournalEntry[]>;
  findByUserIdAndDateRange(userId: string, startDate: string, endDate: string): Promise<JournalEntry[]>;
  findByUserIdAndDate(userId: string, date: string): Promise<JournalEntry | null>;
  findByTags(userId: string, tags: string[]): Promise<JournalEntry[]>;
  findRecentByUserId(userId: string, limit: number): Promise<JournalEntry[]>;
  getEntriesCount(userId: string): Promise<number>;
  getEntriesCountByDateRange(userId: string, startDate: string, endDate: string): Promise<number>;
}

export interface JournalTemplateRepository extends Repository<JournalTemplate> {
  findPublicTemplates(): Promise<JournalTemplate[]>;
  findByCreator(creatorId: string): Promise<JournalTemplate[]>;
  findByName(name: string): Promise<JournalTemplate[]>;
}

export interface JournalGoalRepository extends Repository<JournalGoal> {
  findByUserId(userId: string): Promise<JournalGoal[]>;
  findActiveByUserId(userId: string): Promise<JournalGoal[]>;
  findCompletedByUserId(userId: string): Promise<JournalGoal[]>;
  findByMetric(userId: string, metric: string): Promise<JournalGoal[]>;
}

export interface ReflectionPromptRepository extends Repository<ReflectionPrompt> {
  findActivePrompts(): Promise<ReflectionPrompt[]>;
  findByCategory(category: string): Promise<ReflectionPrompt[]>;
  findDailyPrompts(): Promise<ReflectionPrompt[]>;
  findWeeklyPrompts(): Promise<ReflectionPrompt[]>;
  findMonthlyPrompts(): Promise<ReflectionPrompt[]>;
}