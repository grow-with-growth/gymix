// Repository interfaces for the application
import { 
  SchoolUser, 
  CalendarEvent, 
  Article, 
  ArticleVersion,
  Skill,
  Badge,
  UserBadge,
  PortfolioItem,
  Portfolio,
  PortfolioTemplate,
  SkillVerificationRequest,
  CredentialCertificate
} from '../../types';

/**
 * Base repository interface with common CRUD operations
 */
export interface BaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * User repository interface with user-specific operations
 */
export interface UserRepository extends BaseRepository<SchoolUser> {
  findByEmail(email: string): Promise<SchoolUser | null>;
  findByRole(role: SchoolUser['role']): Promise<SchoolUser[]>;
  findByDepartment(department: string): Promise<SchoolUser[]>;
  authenticate(email: string, password: string): Promise<SchoolUser | null>;
}

/**
 * Calendar repository interface with calendar-specific operations
 */
export interface CalendarRepository extends BaseRepository<CalendarEvent> {
  findByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]>;
  findByMonth(year: number, month: number): Promise<CalendarEvent[]>;
  findByType(type: CalendarEvent['type']): Promise<CalendarEvent[]>;
  findByUser(userId: string): Promise<CalendarEvent[]>;
  // Recurring events methods
  findRecurringEvents(): Promise<CalendarEvent[]>;
  findByRecurrenceId(recurrenceId: string): Promise<CalendarEvent[]>;
  findExceptions(recurrenceId: string): Promise<CalendarEvent[]>;
  createException(recurringEventId: string, date: string, changes: Partial<CalendarEvent>): Promise<CalendarEvent>;
}

/**
 * Article repository interface with article-specific operations
 */
export interface ArticleRepository extends BaseRepository<Article> {
  findByCurrentVersion(versionId: string): Promise<Article | null>;
}

/**
 * Article version repository interface with version-specific operations
 */
export interface ArticleVersionRepository extends BaseRepository<ArticleVersion> {
  findByArticleId(articleId: string): Promise<ArticleVersion[]>;
  findByArticleIdAndVersion(articleId: string, version: number): Promise<ArticleVersion | null>;
  findLatestByArticleId(articleId: string): Promise<ArticleVersion | null>;
  findPublishedByArticleId(articleId: string): Promise<ArticleVersion[]>;
  findByAuthor(author: string): Promise<ArticleVersion[]>;
  getNextVersionNumber(articleId: string): Promise<number>;
}

/**
 * Skill repository interface with skill-specific operations
 */
export interface SkillRepository extends BaseRepository<Skill> {
  findByUserId(userId: string): Promise<Skill[]>;
  findByCategory(category: string): Promise<Skill[]>;
  findByLevel(level: Skill['level']): Promise<Skill[]>;
  findVerified(): Promise<Skill[]>;
  findByUserIdAndCategory(userId: string, category: string): Promise<Skill[]>;
}

/**
 * Badge repository interface with badge-specific operations
 */
export interface BadgeRepository extends BaseRepository<Badge> {
  findByType(type: Badge['type']): Promise<Badge[]>;
  findByCategory(category: string): Promise<Badge[]>;
  findActive(): Promise<Badge[]>;
  findByCreator(createdBy: string): Promise<Badge[]>;
}

/**
 * User badge repository interface with user badge-specific operations
 */
export interface UserBadgeRepository extends BaseRepository<UserBadge> {
  findByUserId(userId: string): Promise<UserBadge[]>;
  findByBadgeId(badgeId: string): Promise<UserBadge[]>;
  findByUserIdAndBadgeId(userId: string, badgeId: string): Promise<UserBadge | null>;
  findVerified(): Promise<UserBadge[]>;
  findPending(): Promise<UserBadge[]>;
  findByVerificationStatus(status: UserBadge['verificationStatus']): Promise<UserBadge[]>;
}

/**
 * Portfolio item repository interface with portfolio item-specific operations
 */
export interface PortfolioItemRepository extends BaseRepository<PortfolioItem> {
  findByUserId(userId: string): Promise<PortfolioItem[]>;
  findByType(type: PortfolioItem['type']): Promise<PortfolioItem[]>;
  findByCategory(category: string): Promise<PortfolioItem[]>;
  findByTags(tags: string[]): Promise<PortfolioItem[]>;
  findPublished(): Promise<PortfolioItem[]>;
  findByUserIdAndType(userId: string, type: PortfolioItem['type']): Promise<PortfolioItem[]>;
  findByUserIdAndCategory(userId: string, category: string): Promise<PortfolioItem[]>;
  findBySkill(skillId: string): Promise<PortfolioItem[]>;
  findBySharingLevel(sharingLevel: PortfolioItem['sharingLevel']): Promise<PortfolioItem[]>;
  search(query: string, filters?: { type?: string; category?: string; tags?: string[] }): Promise<PortfolioItem[]>;
}

/**
 * Portfolio repository interface with portfolio-specific operations
 */
export interface PortfolioRepository extends BaseRepository<Portfolio> {
  findByUserId(userId: string): Promise<Portfolio | null>;
  findPublished(): Promise<Portfolio[]>;
  findByCustomDomain(domain: string): Promise<Portfolio | null>;
  findBySharingLevel(sharingLevel: Portfolio['sharingLevel']): Promise<Portfolio[]>;
  incrementViews(id: string): Promise<void>;
  updateAnalytics(id: string, analytics: Partial<Portfolio['analytics']>): Promise<void>;
}

/**
 * Portfolio template repository interface with template-specific operations
 */
export interface PortfolioTemplateRepository extends BaseRepository<PortfolioTemplate> {
  findByCategory(category: string): Promise<PortfolioTemplate[]>;
  findPublic(): Promise<PortfolioTemplate[]>;
  findPremium(): Promise<PortfolioTemplate[]>;
  findByCreator(createdBy: string): Promise<PortfolioTemplate[]>;
  incrementUsage(id: string): Promise<void>;
  updateRating(id: string, rating: number): Promise<void>;
}

/**
 * Skill verification request repository interface with verification-specific operations
 */
export interface SkillVerificationRequestRepository extends BaseRepository<SkillVerificationRequest> {
  findByUserId(userId: string): Promise<SkillVerificationRequest[]>;
  findBySkillId(skillId: string): Promise<SkillVerificationRequest[]>;
  findByStatus(status: SkillVerificationRequest['status']): Promise<SkillVerificationRequest[]>;
  findPending(): Promise<SkillVerificationRequest[]>;
  findByReviewer(reviewedBy: string): Promise<SkillVerificationRequest[]>;
}

/**
 * Credential certificate repository interface with certificate-specific operations
 */
export interface CredentialCertificateRepository extends BaseRepository<CredentialCertificate> {
  findByUserId(userId: string): Promise<CredentialCertificate[]>;
  findByType(type: CredentialCertificate['type']): Promise<CredentialCertificate[]>;
  findByIssuer(issuer: string): Promise<CredentialCertificate[]>;
  findByVerificationCode(code: string): Promise<CredentialCertificate | null>;
  findExpiring(days: number): Promise<CredentialCertificate[]>;
  findBySkill(skillId: string): Promise<CredentialCertificate[]>;
  findByBadge(badgeId: string): Promise<CredentialCertificate[]>;
}