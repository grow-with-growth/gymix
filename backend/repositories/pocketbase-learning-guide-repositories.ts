// PocketBase implementations for Learning Guide repositories

import PocketBase, { RecordModel } from 'pocketbase';
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
  Priority,
  AdaptiveAdjustment
} from '../../types/learning-guide';
import {
  LearningObjectiveRepository,
  LearningPathwayRepository,
  LearningStyleAssessmentRepository,
  StudentProgressRepository,
  LearningRecommendationRepository,
  LearningGuideRepository
} from './learning-guide-repositories';

// Helper function to convert PocketBase record to typed object
function mapRecord<T>(record: RecordModel): T {
  const { collectionId, collectionName, expand, ...data } = record;
  return {
    ...data,
    id: record.id,
    created: record.created,
    updated: record.updated
  } as T;
}

// Learning Objectives Repository Implementation
export class PocketBaseLearningObjectiveRepository implements LearningObjectiveRepository {
  constructor(private pb: PocketBase) {}

  async findById(id: string): Promise<LearningObjective | null> {
    try {
      const record = await this.pb.collection('learning_objectives').getOne(id);
      const objective = mapRecord<LearningObjective>(record);
      
      // Parse tags from string to array
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      
      return objective;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives').getFullList();
    return records.map(record => {
      const objective = mapRecord<LearningObjective>(record);
      // Parse tags from string to array
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      return objective;
    });
  }

  async create(data: Omit<LearningObjective, 'id' | 'created' | 'updated'>): Promise<LearningObjective> {
    // Convert tags array to string for storage
    const createData = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags
    };
    
    const record = await this.pb.collection('learning_objectives').create(createData);
    const objective = mapRecord<LearningObjective>(record);
    
    // Parse tags back to array
    if (typeof objective.tags === 'string') {
      objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
    }
    
    return objective;
  }

  async update(id: string, data: Partial<LearningObjective>): Promise<LearningObjective | null> {
    try {
      // Convert tags array to string for storage if present
      const updateData = { ...data };
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags.join(', ') as any;
      }
      
      const record = await this.pb.collection('learning_objectives').update(id, updateData);
      const objective = mapRecord<LearningObjective>(record);
      
      // Parse tags back to array
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      
      return objective;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_objectives').delete(id);
      return true;
    } catch (error) {
      if ((error as any).status === 404) return false;
      throw error;
    }
  }

  async findBySubject(subject: string): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives')
      .getFullList({ filter: `subject = "${subject}"` });
    
    return records.map(record => {
      const objective = mapRecord<LearningObjective>(record);
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      return objective;
    });
  }

  async findByDifficultyLevel(level: DifficultyLevel): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives')
      .getFullList({ filter: `difficulty_level = "${level}"` });
    
    return records.map(record => {
      const objective = mapRecord<LearningObjective>(record);
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      return objective;
    });
  }

  async findByTags(tags: string[]): Promise<LearningObjective[]> {
    const tagFilters = tags.map(tag => `tags ~ "${tag}"`).join(' || ');
    const records = await this.pb.collection('learning_objectives')
      .getFullList({ filter: `(${tagFilters})` });
    
    return records.map(record => {
      const objective = mapRecord<LearningObjective>(record);
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      return objective;
    });
  }

  async findPrerequisites(objectiveId: string): Promise<LearningObjective[]> {
    const objective = await this.findById(objectiveId);
    if (!objective || !objective.prerequisites.length) return [];
    
    const prerequisiteIds = objective.prerequisites;
    const records = await this.pb.collection('learning_objectives')
      .getFullList({ filter: prerequisiteIds.map(id => `id = "${id}"`).join(' || ') });
    
    return records.map(record => {
      const obj = mapRecord<LearningObjective>(record);
      if (typeof obj.tags === 'string') {
        obj.tags = obj.tags ? obj.tags.split(',').map(tag => tag.trim()) : [];
      }
      return obj;
    });
  }

  async findDependents(objectiveId: string): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives')
      .getFullList({ filter: `prerequisites ~ "${objectiveId}"` });
    
    return records.map(record => {
      const objective = mapRecord<LearningObjective>(record);
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      return objective;
    });
  }

  async search(query: string): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives')
      .getFullList({ 
        filter: `title ~ "${query}" || description ~ "${query}" || subject ~ "${query}" || tags ~ "${query}"` 
      });
    
    return records.map(record => {
      const objective = mapRecord<LearningObjective>(record);
      if (typeof objective.tags === 'string') {
        objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
      }
      return objective;
    });
  }
}

// Learning Pathways Repository Implementation
export class PocketBaseLearningPathwayRepository implements LearningPathwayRepository {
  constructor(private pb: PocketBase) {}

  async findById(id: string): Promise<LearningPathway | null> {
    try {
      const record = await this.pb.collection('learning_pathways').getOne(id);
      return mapRecord<LearningPathway>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways').getFullList();
    return records.map(record => mapRecord<LearningPathway>(record));
  }

  async create(data: Omit<LearningPathway, 'id' | 'created' | 'updated'>): Promise<LearningPathway> {
    const record = await this.pb.collection('learning_pathways').create(data);
    return mapRecord<LearningPathway>(record);
  }

  async update(id: string, data: Partial<LearningPathway>): Promise<LearningPathway | null> {
    try {
      const record = await this.pb.collection('learning_pathways').update(id, data);
      return mapRecord<LearningPathway>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_pathways').delete(id);
      return true;
    } catch (error) {
      if ((error as any).status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways')
      .getFullList({ filter: `student_id = "${studentId}"` });
    return records.map(record => mapRecord<LearningPathway>(record));
  }

  async findActiveByStudent(studentId: string): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways')
      .getFullList({ filter: `student_id = "${studentId}" && is_active = true` });
    return records.map(record => mapRecord<LearningPathway>(record));
  }

  async findByObjective(objectiveId: string): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways')
      .getFullList({ filter: `objectives ~ "${objectiveId}"` });
    return records.map(record => mapRecord<LearningPathway>(record));
  }

  async findWithDetails(pathwayId: string): Promise<LearningPathwayWithDetails | null> {
    try {
      const record = await this.pb.collection('learning_pathways')
        .getOne(pathwayId, { expand: 'objectives,student_id' });
      
      const pathway = mapRecord<LearningPathwayWithDetails>(record);
      
      // Add expanded objectives details
      if (record.expand?.objectives) {
        pathway.objectives_details = Array.isArray(record.expand.objectives) 
          ? record.expand.objectives.map((obj: RecordModel) => {
              const objective = mapRecord<LearningObjective>(obj);
              if (typeof objective.tags === 'string') {
                objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
              }
              return objective;
            })
          : [record.expand.objectives].map((obj: RecordModel) => {
              const objective = mapRecord<LearningObjective>(obj);
              if (typeof objective.tags === 'string') {
                objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
              }
              return objective;
            });
      }
      
      return pathway;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async updateProgress(pathwayId: string, completionPercentage: number, currentIndex: number): Promise<LearningPathway | null> {
    return this.update(pathwayId, {
      completion_percentage: completionPercentage,
      current_objective_index: currentIndex
    });
  }

  async addAdaptiveAdjustment(pathwayId: string, adjustment: AdaptiveAdjustment): Promise<LearningPathway | null> {
    const pathway = await this.findById(pathwayId);
    if (!pathway) return null;
    
    const currentAdjustments = pathway.adaptive_adjustments || [];
    return this.update(pathwayId, {
      adaptive_adjustments: [...currentAdjustments, adjustment]
    });
  }
}

// Student Progress Repository Implementation
export class PocketBaseStudentProgressRepository implements StudentProgressRepository {
  constructor(private pb: PocketBase) {}

  async findById(id: string): Promise<StudentProgress | null> {
    try {
      const record = await this.pb.collection('student_progress').getOne(id);
      return mapRecord<StudentProgress>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress').getFullList();
    return records.map(record => mapRecord<StudentProgress>(record));
  }

  async create(data: Omit<StudentProgress, 'id' | 'created' | 'updated'>): Promise<StudentProgress> {
    const record = await this.pb.collection('student_progress').create(data);
    return mapRecord<StudentProgress>(record);
  }

  async update(id: string, data: Partial<StudentProgress>): Promise<StudentProgress | null> {
    try {
      const record = await this.pb.collection('student_progress').update(id, data);
      return mapRecord<StudentProgress>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('student_progress').delete(id);
      return true;
    } catch (error) {
      if ((error as any).status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress')
      .getFullList({ filter: `student_id = "${studentId}"` });
    return records.map(record => mapRecord<StudentProgress>(record));
  }

  async findByObjective(objectiveId: string): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress')
      .getFullList({ filter: `objective_id = "${objectiveId}"` });
    return records.map(record => mapRecord<StudentProgress>(record));
  }

  async findByPathway(pathwayId: string): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress')
      .getFullList({ filter: `pathway_id = "${pathwayId}"` });
    return records.map(record => mapRecord<StudentProgress>(record));
  }

  async findByStatus(status: ProgressStatus): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress')
      .getFullList({ filter: `status = "${status}"` });
    return records.map(record => mapRecord<StudentProgress>(record));
  }

  async findWithDetails(progressId: string): Promise<StudentProgressWithDetails | null> {
    try {
      const record = await this.pb.collection('student_progress')
        .getOne(progressId, { expand: 'objective_id,pathway_id,student_id' });
      
      const progress = mapRecord<StudentProgressWithDetails>(record);
      
      // Add expanded details
      if (record.expand?.objective_id) {
        const objective = mapRecord<LearningObjective>(record.expand.objective_id);
        if (typeof objective.tags === 'string') {
          objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
        }
        progress.objective = objective;
      }
      
      if (record.expand?.pathway_id) {
        progress.pathway = mapRecord<LearningPathway>(record.expand.pathway_id);
      }
      
      return progress;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findStudentObjectiveProgress(studentId: string, objectiveId: string): Promise<StudentProgress | null> {
    try {
      const records = await this.pb.collection('student_progress')
        .getFullList({ filter: `student_id = "${studentId}" && objective_id = "${objectiveId}"` });
      
      return records.length > 0 ? mapRecord<StudentProgress>(records[0]) : null;
    } catch (error) {
      return null;
    }
  }

  async updateProgress(progressId: string, updates: Partial<StudentProgress>): Promise<StudentProgress | null> {
    return this.update(progressId, updates);
  }

  async getStudentAnalytics(studentId: string): Promise<any> {
    const progress = await this.findByStudent(studentId);
    
    const completed = progress.filter(p => p.status === 'Completed' || p.status === 'Mastered');
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.time_spent_minutes, 0);
    const masteryScores = progress.filter(p => p.mastery_score !== undefined).map(p => p.mastery_score!);
    const averageMasteryScore = masteryScores.length > 0 ? 
      masteryScores.reduce((sum, score) => sum + score, 0) / masteryScores.length : 0;
    
    return {
      total_objectives: progress.length,
      completed_objectives: completed.length,
      completion_rate: progress.length > 0 ? (completed.length / progress.length) * 100 : 0,
      total_time_spent_minutes: totalTimeSpent,
      average_mastery_score: averageMasteryScore,
      total_attempts: progress.reduce((sum, p) => sum + p.attempts, 0)
    };
  }
}

// Learning Style Assessment Repository Implementation
export class PocketBaseLearningStyleAssessmentRepository implements LearningStyleAssessmentRepository {
  constructor(private pb: PocketBase) {}

  async findById(id: string): Promise<LearningStyleAssessment | null> {
    try {
      const record = await this.pb.collection('learning_style_assessments').getOne(id);
      return mapRecord<LearningStyleAssessment>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<LearningStyleAssessment[]> {
    const records = await this.pb.collection('learning_style_assessments').getFullList();
    return records.map(record => mapRecord<LearningStyleAssessment>(record));
  }

  async create(data: Omit<LearningStyleAssessment, 'id' | 'created' | 'updated'>): Promise<LearningStyleAssessment> {
    const record = await this.pb.collection('learning_style_assessments').create(data);
    return mapRecord<LearningStyleAssessment>(record);
  }

  async update(id: string, data: Partial<LearningStyleAssessment>): Promise<LearningStyleAssessment | null> {
    try {
      const record = await this.pb.collection('learning_style_assessments').update(id, data);
      return mapRecord<LearningStyleAssessment>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_style_assessments').delete(id);
      return true;
    } catch (error) {
      if ((error as any).status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<LearningStyleAssessment[]> {
    const records = await this.pb.collection('learning_style_assessments')
      .getFullList({ 
        filter: `student_id = "${studentId}"`,
        sort: '-completed_at'
      });
    return records.map(record => mapRecord<LearningStyleAssessment>(record));
  }

  async findLatestByStudent(studentId: string): Promise<LearningStyleAssessment | null> {
    try {
      const records = await this.pb.collection('learning_style_assessments')
        .getList(1, 1, { 
          filter: `student_id = "${studentId}"`,
          sort: '-completed_at'
        });
      
      return records.items.length > 0 ? mapRecord<LearningStyleAssessment>(records.items[0]) : null;
    } catch (error) {
      return null;
    }
  }

  async findByLearningStyle(style: LearningStyle): Promise<LearningStyleAssessment[]> {
    const records = await this.pb.collection('learning_style_assessments')
      .getFullList({ filter: `primary_style = "${style}"` });
    return records.map(record => mapRecord<LearningStyleAssessment>(record));
  }
}

// Learning Recommendations Repository Implementation
export class PocketBaseLearningRecommendationRepository implements LearningRecommendationRepository {
  constructor(private pb: PocketBase) {}

  async findById(id: string): Promise<LearningRecommendation | null> {
    try {
      const record = await this.pb.collection('learning_recommendations').getOne(id);
      return mapRecord<LearningRecommendation>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations').getFullList();
    return records.map(record => mapRecord<LearningRecommendation>(record));
  }

  async create(data: Omit<LearningRecommendation, 'id' | 'created' | 'updated'>): Promise<LearningRecommendation> {
    const record = await this.pb.collection('learning_recommendations').create(data);
    return mapRecord<LearningRecommendation>(record);
  }

  async update(id: string, data: Partial<LearningRecommendation>): Promise<LearningRecommendation | null> {
    try {
      const record = await this.pb.collection('learning_recommendations').update(id, data);
      return mapRecord<LearningRecommendation>(record);
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_recommendations').delete(id);
      return true;
    } catch (error) {
      if ((error as any).status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations')
      .getFullList({ 
        filter: `student_id = "${studentId}"`,
        sort: '-generated_at'
      });
    return records.map(record => mapRecord<LearningRecommendation>(record));
  }

  async findActiveByStudent(studentId: string): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations')
      .getFullList({ 
        filter: `student_id = "${studentId}" && is_active = true`,
        sort: '-generated_at'
      });
    return records.map(record => mapRecord<LearningRecommendation>(record));
  }

  async findByType(type: RecommendationType): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations')
      .getFullList({ filter: `recommendation_type = "${type}"` });
    return records.map(record => mapRecord<LearningRecommendation>(record));
  }

  async findByPriority(priority: Priority): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations')
      .getFullList({ filter: `priority = "${priority}"` });
    return records.map(record => mapRecord<LearningRecommendation>(record));
  }

  async findWithDetails(recommendationId: string): Promise<LearningRecommendationWithDetails | null> {
    try {
      const record = await this.pb.collection('learning_recommendations')
        .getOne(recommendationId, { expand: 'objective_id,student_id' });
      
      const recommendation = mapRecord<LearningRecommendationWithDetails>(record);
      
      // Add expanded objective details
      if (record.expand?.objective_id) {
        const objective = mapRecord<LearningObjective>(record.expand.objective_id);
        if (typeof objective.tags === 'string') {
          objective.tags = objective.tags ? objective.tags.split(',').map(tag => tag.trim()) : [];
        }
        recommendation.objective = objective;
      }
      
      return recommendation;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }

  async deactivateRecommendation(recommendationId: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_recommendations').update(recommendationId, { is_active: false });
      return true;
    } catch (error) {
      return false;
    }
  }

  async deactivateByStudent(studentId: string): Promise<boolean> {
    try {
      const activeRecommendations = await this.findActiveByStudent(studentId);
      
      const updatePromises = activeRecommendations.map(rec => 
        this.pb.collection('learning_recommendations').update(rec.id, { is_active: false })
      );
      
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Combined Learning Guide Repository
export class PocketBaseLearningGuideRepository implements LearningGuideRepository {
  public objectives: LearningObjectiveRepository;
  public pathways: LearningPathwayRepository;
  public assessments: LearningStyleAssessmentRepository;
  public progress: StudentProgressRepository;
  public recommendations: LearningRecommendationRepository;

  constructor(pb: PocketBase) {
    this.objectives = new PocketBaseLearningObjectiveRepository(pb);
    this.pathways = new PocketBaseLearningPathwayRepository(pb);
    this.assessments = new PocketBaseLearningStyleAssessmentRepository(pb);
    this.progress = new PocketBaseStudentProgressRepository(pb);
    this.recommendations = new PocketBaseLearningRecommendationRepository(pb);
  }
}