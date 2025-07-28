// PocketBase implementations for Learning Guide repositories

import PocketBase from 'pocketbase';
import {
  LearningObjectiveRepository,
  LearningPathwayRepository,
  LearningStyleAssessmentRepository,
  StudentProgressRepository,
  LearningRecommendationRepository,
  LearningGuideRepository
} from './learning-guide-repositories';
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

// PocketBase Learning Objective Repository
export class PocketBaseLearningObjectiveRepository implements LearningObjectiveRepository {
  constructor(private pb: PocketBase) {}

  async findAll(): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives').getFullList();
    return records.map(this.mapToLearningObjective);
  }

  async findById(id: string): Promise<LearningObjective | null> {
    try {
      const record = await this.pb.collection('learning_objectives').getOne(id);
      return this.mapToLearningObjective(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async create(objective: Omit<LearningObjective, 'id' | 'created' | 'updated'>): Promise<LearningObjective> {
    const record = await this.pb.collection('learning_objectives').create(objective);
    return this.mapToLearningObjective(record);
  }

  async update(id: string, objective: Partial<LearningObjective>): Promise<LearningObjective | null> {
    try {
      const record = await this.pb.collection('learning_objectives').update(id, objective);
      return this.mapToLearningObjective(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_objectives').delete(id);
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }

  async findBySubject(subject: string): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives').getFullList({
      filter: `subject = "${subject}"`
    });
    return records.map(this.mapToLearningObjective);
  }

  async findByDifficultyLevel(level: DifficultyLevel): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives').getFullList({
      filter: `difficulty_level = "${level}"`
    });
    return records.map(this.mapToLearningObjective);
  }

  async findByTags(tags: string[]): Promise<LearningObjective[]> {
    const tagFilters = tags.map(tag => `tags ~ "${tag}"`).join(' || ');
    const records = await this.pb.collection('learning_objectives').getFullList({
      filter: `(${tagFilters})`
    });
    return records.map(this.mapToLearningObjective);
  }

  async findPrerequisites(objectiveId: string): Promise<LearningObjective[]> {
    const objective = await this.findById(objectiveId);
    if (!objective || !objective.prerequisites.length) return [];
    
    const prerequisiteIds = objective.prerequisites.join('","');
    const records = await this.pb.collection('learning_objectives').getFullList({
      filter: `id = "${prerequisiteIds}"`
    });
    return records.map(this.mapToLearningObjective);
  }

  async findDependents(objectiveId: string): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives').getFullList({
      filter: `prerequisites ~ "${objectiveId}"`
    });
    return records.map(this.mapToLearningObjective);
  }

  async search(query: string): Promise<LearningObjective[]> {
    const records = await this.pb.collection('learning_objectives').getFullList({
      filter: `title ~ "${query}" || description ~ "${query}" || subject ~ "${query}"`
    });
    return records.map(this.mapToLearningObjective);
  }

  private mapToLearningObjective(record: any): LearningObjective {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      subject: record.subject,
      difficulty_level: record.difficulty_level,
      prerequisites: record.prerequisites || [],
      estimated_duration_minutes: record.estimated_duration_minutes,
      tags: record.tags || [],
      created: record.created,
      updated: record.updated
    };
  }
}

// PocketBase Learning Pathway Repository
export class PocketBaseLearningPathwayRepository implements LearningPathwayRepository {
  constructor(private pb: PocketBase) {}

  async findAll(): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways').getFullList();
    return records.map(this.mapToLearningPathway);
  }

  async findById(id: string): Promise<LearningPathway | null> {
    try {
      const record = await this.pb.collection('learning_pathways').getOne(id);
      return this.mapToLearningPathway(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async create(pathway: Omit<LearningPathway, 'id' | 'created' | 'updated'>): Promise<LearningPathway> {
    const record = await this.pb.collection('learning_pathways').create(pathway);
    return this.mapToLearningPathway(record);
  }

  async update(id: string, pathway: Partial<LearningPathway>): Promise<LearningPathway | null> {
    try {
      const record = await this.pb.collection('learning_pathways').update(id, pathway);
      return this.mapToLearningPathway(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_pathways').delete(id);
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways').getFullList({
      filter: `student_id = "${studentId}"`
    });
    return records.map(this.mapToLearningPathway);
  }

  async findActiveByStudent(studentId: string): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways').getFullList({
      filter: `student_id = "${studentId}" && is_active = true`
    });
    return records.map(this.mapToLearningPathway);
  }

  async findByObjective(objectiveId: string): Promise<LearningPathway[]> {
    const records = await this.pb.collection('learning_pathways').getFullList({
      filter: `objectives ~ "${objectiveId}"`
    });
    return records.map(this.mapToLearningPathway);
  }

  async findWithDetails(pathwayId: string): Promise<LearningPathwayWithDetails | null> {
    try {
      const record = await this.pb.collection('learning_pathways').getOne(pathwayId, {
        expand: 'objectives'
      });
      
      const pathway = this.mapToLearningPathway(record);
      const objectivesDetails = record.expand?.objectives || [];
      const currentObjective = objectivesDetails[pathway.current_objective_index] || null;
      
      return {
        ...pathway,
        objectives_details: objectivesDetails,
        current_objective: currentObjective
      };
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async updateProgress(pathwayId: string, completionPercentage: number, currentIndex: number): Promise<LearningPathway | null> {
    return this.update(pathwayId, {
      completion_percentage: completionPercentage,
      current_objective_index: currentIndex
    });
  }

  async addAdaptiveAdjustment(pathwayId: string, adjustment: any): Promise<LearningPathway | null> {
    const pathway = await this.findById(pathwayId);
    if (!pathway) return null;

    const adjustments = pathway.adaptive_adjustments || [];
    adjustments.push(adjustment);

    return this.update(pathwayId, {
      adaptive_adjustments: adjustments
    });
  }

  private mapToLearningPathway(record: any): LearningPathway {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      student_id: record.student_id,
      objectives: record.objectives || [],
      current_objective_index: record.current_objective_index,
      completion_percentage: record.completion_percentage,
      is_active: record.is_active,
      created_by_ai: record.created_by_ai,
      adaptive_adjustments: record.adaptive_adjustments || [],
      created: record.created,
      updated: record.updated
    };
  }
}

// PocketBase Learning Style Assessment Repository
export class PocketBaseLearningStyleAssessmentRepository implements LearningStyleAssessmentRepository {
  constructor(private pb: PocketBase) {}

  async findAll(): Promise<LearningStyleAssessment[]> {
    const records = await this.pb.collection('learning_style_assessments').getFullList();
    return records.map(this.mapToLearningStyleAssessment);
  }

  async findById(id: string): Promise<LearningStyleAssessment | null> {
    try {
      const record = await this.pb.collection('learning_style_assessments').getOne(id);
      return this.mapToLearningStyleAssessment(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async create(assessment: Omit<LearningStyleAssessment, 'id' | 'created' | 'updated'>): Promise<LearningStyleAssessment> {
    const record = await this.pb.collection('learning_style_assessments').create(assessment);
    return this.mapToLearningStyleAssessment(record);
  }

  async update(id: string, assessment: Partial<LearningStyleAssessment>): Promise<LearningStyleAssessment | null> {
    try {
      const record = await this.pb.collection('learning_style_assessments').update(id, assessment);
      return this.mapToLearningStyleAssessment(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_style_assessments').delete(id);
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<LearningStyleAssessment[]> {
    const records = await this.pb.collection('learning_style_assessments').getFullList({
      filter: `student_id = "${studentId}"`,
      sort: '-completed_at'
    });
    return records.map(this.mapToLearningStyleAssessment);
  }

  async findLatestByStudent(studentId: string): Promise<LearningStyleAssessment | null> {
    try {
      const record = await this.pb.collection('learning_style_assessments').getFirstListItem(`student_id = "${studentId}"`, {
        sort: '-completed_at'
      });
      return this.mapToLearningStyleAssessment(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findByLearningStyle(style: LearningStyle): Promise<LearningStyleAssessment[]> {
    const records = await this.pb.collection('learning_style_assessments').getFullList({
      filter: `primary_style = "${style}"`
    });
    return records.map(this.mapToLearningStyleAssessment);
  }

  private mapToLearningStyleAssessment(record: any): LearningStyleAssessment {
    return {
      id: record.id,
      student_id: record.student_id,
      visual_score: record.visual_score,
      auditory_score: record.auditory_score,
      kinesthetic_score: record.kinesthetic_score,
      reading_writing_score: record.reading_writing_score,
      primary_style: record.primary_style,
      assessment_responses: record.assessment_responses || [],
      completed_at: record.completed_at,
      created: record.created,
      updated: record.updated
    };
  }
}

// PocketBase Student Progress Repository
export class PocketBaseStudentProgressRepository implements StudentProgressRepository {
  constructor(private pb: PocketBase) {}

  async findAll(): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress').getFullList();
    return records.map(this.mapToStudentProgress);
  }

  async findById(id: string): Promise<StudentProgress | null> {
    try {
      const record = await this.pb.collection('student_progress').getOne(id);
      return this.mapToStudentProgress(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async create(progress: Omit<StudentProgress, 'id' | 'created' | 'updated'>): Promise<StudentProgress> {
    const record = await this.pb.collection('student_progress').create(progress);
    return this.mapToStudentProgress(record);
  }

  async update(id: string, progress: Partial<StudentProgress>): Promise<StudentProgress | null> {
    try {
      const record = await this.pb.collection('student_progress').update(id, progress);
      return this.mapToStudentProgress(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('student_progress').delete(id);
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress').getFullList({
      filter: `student_id = "${studentId}"`
    });
    return records.map(this.mapToStudentProgress);
  }

  async findByObjective(objectiveId: string): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress').getFullList({
      filter: `objective_id = "${objectiveId}"`
    });
    return records.map(this.mapToStudentProgress);
  }

  async findByPathway(pathwayId: string): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress').getFullList({
      filter: `pathway_id = "${pathwayId}"`
    });
    return records.map(this.mapToStudentProgress);
  }

  async findByStatus(status: ProgressStatus): Promise<StudentProgress[]> {
    const records = await this.pb.collection('student_progress').getFullList({
      filter: `status = "${status}"`
    });
    return records.map(this.mapToStudentProgress);
  }

  async findWithDetails(progressId: string): Promise<StudentProgressWithDetails | null> {
    try {
      const record = await this.pb.collection('student_progress').getOne(progressId, {
        expand: 'objective_id,pathway_id'
      });
      
      const progress = this.mapToStudentProgress(record);
      return {
        ...progress,
        objective: record.expand?.objective_id || null,
        pathway: record.expand?.pathway_id || null
      };
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findStudentObjectiveProgress(studentId: string, objectiveId: string): Promise<StudentProgress | null> {
    try {
      const record = await this.pb.collection('student_progress').getFirstListItem(
        `student_id = "${studentId}" && objective_id = "${objectiveId}"`
      );
      return this.mapToStudentProgress(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async updateProgress(progressId: string, updates: Partial<StudentProgress>): Promise<StudentProgress | null> {
    return this.update(progressId, updates);
  }

  async getStudentAnalytics(studentId: string): Promise<any> {
    // This would typically involve complex aggregation queries
    // For now, we'll implement basic analytics
    const progressRecords = await this.findByStudent(studentId);
    
    const totalObjectives = progressRecords.length;
    const completedObjectives = progressRecords.filter(p => p.status === 'Completed' || p.status === 'Mastered').length;
    const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.time_spent_minutes, 0);
    const averageMasteryScore = progressRecords
      .filter(p => p.mastery_score !== undefined)
      .reduce((sum, p, _, arr) => sum + (p.mastery_score! / arr.length), 0);

    return {
      student_id: studentId,
      total_objectives_completed: completedObjectives,
      total_time_spent_minutes: totalTimeSpent,
      average_mastery_score: averageMasteryScore,
      completion_rate: totalObjectives > 0 ? completedObjectives / totalObjectives : 0
    };
  }

  private mapToStudentProgress(record: any): StudentProgress {
    return {
      id: record.id,
      student_id: record.student_id,
      objective_id: record.objective_id,
      pathway_id: record.pathway_id,
      status: record.status,
      completion_percentage: record.completion_percentage,
      time_spent_minutes: record.time_spent_minutes,
      attempts: record.attempts,
      last_accessed: record.last_accessed,
      mastery_score: record.mastery_score,
      created: record.created,
      updated: record.updated
    };
  }
}

// PocketBase Learning Recommendation Repository
export class PocketBaseLearningRecommendationRepository implements LearningRecommendationRepository {
  constructor(private pb: PocketBase) {}

  async findAll(): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations').getFullList();
    return records.map(this.mapToLearningRecommendation);
  }

  async findById(id: string): Promise<LearningRecommendation | null> {
    try {
      const record = await this.pb.collection('learning_recommendations').getOne(id);
      return this.mapToLearningRecommendation(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async create(recommendation: Omit<LearningRecommendation, 'id' | 'created' | 'updated'>): Promise<LearningRecommendation> {
    const record = await this.pb.collection('learning_recommendations').create(recommendation);
    return this.mapToLearningRecommendation(record);
  }

  async update(id: string, recommendation: Partial<LearningRecommendation>): Promise<LearningRecommendation | null> {
    try {
      const record = await this.pb.collection('learning_recommendations').update(id, recommendation);
      return this.mapToLearningRecommendation(record);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_recommendations').delete(id);
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }

  async findByStudent(studentId: string): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations').getFullList({
      filter: `student_id = "${studentId}"`,
      sort: '-generated_at'
    });
    return records.map(this.mapToLearningRecommendation);
  }

  async findActiveByStudent(studentId: string): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations').getFullList({
      filter: `student_id = "${studentId}" && is_active = true`,
      sort: 'priority,confidence_score'
    });
    return records.map(this.mapToLearningRecommendation);
  }

  async findByType(type: RecommendationType): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations').getFullList({
      filter: `recommendation_type = "${type}"`
    });
    return records.map(this.mapToLearningRecommendation);
  }

  async findByPriority(priority: Priority): Promise<LearningRecommendation[]> {
    const records = await this.pb.collection('learning_recommendations').getFullList({
      filter: `priority = "${priority}"`
    });
    return records.map(this.mapToLearningRecommendation);
  }

  async findWithDetails(recommendationId: string): Promise<LearningRecommendationWithDetails | null> {
    try {
      const record = await this.pb.collection('learning_recommendations').getOne(recommendationId, {
        expand: 'objective_id'
      });
      
      const recommendation = this.mapToLearningRecommendation(record);
      return {
        ...recommendation,
        objective: record.expand?.objective_id || null
      };
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async deactivateRecommendation(recommendationId: string): Promise<boolean> {
    try {
      await this.pb.collection('learning_recommendations').update(recommendationId, {
        is_active: false
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async deactivateByStudent(studentId: string): Promise<boolean> {
    try {
      const recommendations = await this.findActiveByStudent(studentId);
      await Promise.all(
        recommendations.map(rec => 
          this.pb.collection('learning_recommendations').update(rec.id, { is_active: false })
        )
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToLearningRecommendation(record: any): LearningRecommendation {
    return {
      id: record.id,
      student_id: record.student_id,
      recommendation_type: record.recommendation_type,
      title: record.title,
      description: record.description,
      objective_id: record.objective_id,
      priority: record.priority,
      confidence_score: record.confidence_score,
      is_active: record.is_active,
      generated_at: record.generated_at,
      ai_reasoning: record.ai_reasoning,
      created: record.created,
      updated: record.updated
    };
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