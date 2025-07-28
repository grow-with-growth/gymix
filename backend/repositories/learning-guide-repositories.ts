// Repository interfaces for AI-Powered Learning Guide

import { Repository } from '../types';
import {
  LearningObjective,
  LearningPathway,
  LearningStyleAssessment,
  StudentProgress,
  LearningRecommendation,
  LearningPathwayWithDetails,
  StudentProgressWithDetails,
  LearningRecommendationWithDetails,
  DifficultyLevel,
  LearningStyle,
  ProgressStatus,
  RecommendationType,
  Priority
} from '../../types/learning-guide';

// Learning Objectives Repository
export interface LearningObjectiveRepository extends Repository<LearningObjective> {
  findBySubject(subject: string): Promise<LearningObjective[]>;
  findByDifficultyLevel(level: DifficultyLevel): Promise<LearningObjective[]>;
  findByTags(tags: string[]): Promise<LearningObjective[]>;
  findPrerequisites(objectiveId: string): Promise<LearningObjective[]>;
  findDependents(objectiveId: string): Promise<LearningObjective[]>;
  search(query: string): Promise<LearningObjective[]>;
}

// Learning Pathways Repository
export interface LearningPathwayRepository extends Repository<LearningPathway> {
  findByStudent(studentId: string): Promise<LearningPathway[]>;
  findActiveByStudent(studentId: string): Promise<LearningPathway[]>;
  findByObjective(objectiveId: string): Promise<LearningPathway[]>;
  findWithDetails(pathwayId: string): Promise<LearningPathwayWithDetails | null>;
  updateProgress(pathwayId: string, completionPercentage: number, currentIndex: number): Promise<LearningPathway | null>;
  addAdaptiveAdjustment(pathwayId: string, adjustment: any): Promise<LearningPathway | null>;
}

// Learning Style Assessment Repository
export interface LearningStyleAssessmentRepository extends Repository<LearningStyleAssessment> {
  findByStudent(studentId: string): Promise<LearningStyleAssessment[]>;
  findLatestByStudent(studentId: string): Promise<LearningStyleAssessment | null>;
  findByLearningStyle(style: LearningStyle): Promise<LearningStyleAssessment[]>;
}

// Student Progress Repository
export interface StudentProgressRepository extends Repository<StudentProgress> {
  findByStudent(studentId: string): Promise<StudentProgress[]>;
  findByObjective(objectiveId: string): Promise<StudentProgress[]>;
  findByPathway(pathwayId: string): Promise<StudentProgress[]>;
  findByStatus(status: ProgressStatus): Promise<StudentProgress[]>;
  findWithDetails(progressId: string): Promise<StudentProgressWithDetails | null>;
  findStudentObjectiveProgress(studentId: string, objectiveId: string): Promise<StudentProgress | null>;
  updateProgress(progressId: string, updates: Partial<StudentProgress>): Promise<StudentProgress | null>;
  getStudentAnalytics(studentId: string): Promise<any>;
}

// Learning Recommendations Repository
export interface LearningRecommendationRepository extends Repository<LearningRecommendation> {
  findByStudent(studentId: string): Promise<LearningRecommendation[]>;
  findActiveByStudent(studentId: string): Promise<LearningRecommendation[]>;
  findByType(type: RecommendationType): Promise<LearningRecommendation[]>;
  findByPriority(priority: Priority): Promise<LearningRecommendation[]>;
  findWithDetails(recommendationId: string): Promise<LearningRecommendationWithDetails | null>;
  deactivateRecommendation(recommendationId: string): Promise<boolean>;
  deactivateByStudent(studentId: string): Promise<boolean>;
}

// Combined Learning Guide Repository Interface
export interface LearningGuideRepository {
  objectives: LearningObjectiveRepository;
  pathways: LearningPathwayRepository;
  assessments: LearningStyleAssessmentRepository;
  progress: StudentProgressRepository;
  recommendations: LearningRecommendationRepository;
}