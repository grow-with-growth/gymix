// AI Learning Engine Service - Core logic for personalized learning

import {
  LearningObjective,
  LearningPathway,
  LearningStyleAssessment,
  StudentProgress,
  LearningRecommendation,
  LearningAnalytics,
  ContentSuggestion,
  SkillGap,
  PathwayGenerationRequest,
  PathwayGenerationResponse,
  DifficultyLevel,
  LearningStyle,
  ProgressStatus,
  RecommendationType,
  Priority,
  AdaptiveAdjustment,
  LearningEngineConfig
} from '../../types/learning-guide';
import { LearningGuideRepository } from '../repositories/learning-guide-repositories';

export class AILearningEngine {
  private config: LearningEngineConfig = {
    difficulty_adjustment_threshold: 0.7,
    mastery_score_threshold: 0.8,
    recommendation_refresh_interval_hours: 24,
    max_active_recommendations: 5,
    learning_style_weight: 0.3,
    progress_weight: 0.4,
    time_weight: 0.3
  };

  constructor(private repository: LearningGuideRepository) {}

  // Generate personalized learning pathway
  async generateLearningPathway(request: PathwayGenerationRequest): Promise<PathwayGenerationResponse> {
    const { student_id, target_objectives, preferred_learning_style, available_time_per_week_minutes, difficulty_preference, deadline } = request;

    // Get student's learning style assessment
    const learningStyleAssessment = await this.repository.assessments.findLatestByStudent(student_id);
    const effectiveLearningStyle = preferred_learning_style || learningStyleAssessment?.primary_style || 'Multimodal';

    // Get student's current progress
    const studentProgress = await this.repository.progress.findByStudent(student_id);
    const completedObjectives = studentProgress
      .filter(p => p.status === 'Completed' || p.status === 'Mastered')
      .map(p => p.objective_id);

    // Get all target objectives with their prerequisites
    const allObjectives = await Promise.all(
      target_objectives.map(id => this.repository.objectives.findById(id))
    );
    const validObjectives = allObjectives.filter(obj => obj !== null) as LearningObjective[];

    // Build dependency graph and determine optimal order
    const orderedObjectives = await this.buildOptimalLearningSequence(
      validObjectives,
      completedObjectives,
      effectiveLearningStyle,
      difficulty_preference
    );

    // Calculate estimated completion time
    const totalEstimatedMinutes = orderedObjectives.reduce(
      (sum, obj) => sum + obj.estimated_duration_minutes, 0
    );
    const estimatedWeeks = Math.ceil(totalEstimatedMinutes / available_time_per_week_minutes);

    // Create the pathway
    const pathway: Omit<LearningPathway, 'id' | 'created' | 'updated'> = {
      title: `Personalized Learning Path - ${new Date().toLocaleDateString()}`,
      description: `AI-generated learning pathway targeting ${target_objectives.length} objectives`,
      student_id,
      objectives: orderedObjectives.map(obj => obj.id),
      current_objective_index: 0,
      completion_percentage: 0,
      is_active: true,
      created_by_ai: true,
      adaptive_adjustments: []
    };

    const createdPathway = await this.repository.pathways.create(pathway);

    // Initialize progress tracking for each objective
    await this.initializeProgressTracking(createdPathway.id, student_id, orderedObjectives);

    // Generate initial recommendations
    await this.generateRecommendations(student_id);

    return {
      pathway: createdPathway,
      estimated_completion_weeks: estimatedWeeks,
      confidence_score: this.calculatePathwayConfidence(orderedObjectives, studentProgress),
      reasoning: `Generated pathway based on ${effectiveLearningStyle} learning style preference, current progress, and ${difficulty_preference} difficulty level.`
    };
  }

  // Build optimal learning sequence considering prerequisites and learning style
  private async buildOptimalLearningSequence(
    objectives: LearningObjective[],
    completedObjectives: string[],
    learningStyle: LearningStyle,
    difficultyPreference: DifficultyLevel
  ): Promise<LearningObjective[]> {
    // Filter out already completed objectives
    const remainingObjectives = objectives.filter(obj => !completedObjectives.includes(obj.id));

    // Build dependency graph
    const dependencyGraph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const obj of remainingObjectives) {
      dependencyGraph.set(obj.id, obj.prerequisites);
      inDegree.set(obj.id, obj.prerequisites.length);
    }

    // Topological sort with learning style and difficulty preferences
    const result: LearningObjective[] = [];
    const queue: LearningObjective[] = [];

    // Find objectives with no prerequisites
    for (const obj of remainingObjectives) {
      if (inDegree.get(obj.id) === 0) {
        queue.push(obj);
      }
    }

    // Sort queue by learning style match and difficulty preference
    queue.sort((a, b) => {
      const aScore = this.calculateObjectiveScore(a, learningStyle, difficultyPreference);
      const bScore = this.calculateObjectiveScore(b, learningStyle, difficultyPreference);
      return bScore - aScore;
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      // Update in-degrees for dependent objectives
      for (const obj of remainingObjectives) {
        if (obj.prerequisites.includes(current.id)) {
          const newInDegree = inDegree.get(obj.id)! - 1;
          inDegree.set(obj.id, newInDegree);
          
          if (newInDegree === 0) {
            queue.push(obj);
            // Re-sort queue
            queue.sort((a, b) => {
              const aScore = this.calculateObjectiveScore(a, learningStyle, difficultyPreference);
              const bScore = this.calculateObjectiveScore(b, learningStyle, difficultyPreference);
              return bScore - aScore;
            });
          }
        }
      }
    }

    return result;
  }

  // Calculate objective score based on learning style and difficulty preference
  private calculateObjectiveScore(
    objective: LearningObjective,
    learningStyle: LearningStyle,
    difficultyPreference: DifficultyLevel
  ): number {
    let score = 0;

    // Learning style match (check tags for style indicators)
    const styleKeywords = {
      'Visual': ['visual', 'diagram', 'chart', 'image', 'graphic'],
      'Auditory': ['audio', 'listening', 'discussion', 'verbal', 'sound'],
      'Kinesthetic': ['hands-on', 'practice', 'activity', 'movement', 'interactive'],
      'Reading/Writing': ['reading', 'writing', 'text', 'notes', 'documentation']
    };

    const keywords = styleKeywords[learningStyle as keyof typeof styleKeywords] || [];
    const matchingTags = objective.tags.filter(tag => 
      keywords.some(keyword => tag.toLowerCase().includes(keyword))
    );
    score += matchingTags.length * 10;

    // Difficulty preference match
    const difficultyOrder = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const preferredIndex = difficultyOrder.indexOf(difficultyPreference);
    const objectiveIndex = difficultyOrder.indexOf(objective.difficulty_level);
    const difficultyDistance = Math.abs(preferredIndex - objectiveIndex);
    score += (4 - difficultyDistance) * 5;

    return score;
  }

  // Initialize progress tracking for pathway objectives
  private async initializeProgressTracking(
    pathwayId: string,
    studentId: string,
    objectives: LearningObjective[]
  ): Promise<void> {
    const progressPromises = objectives.map(objective => {
      const progress: Omit<StudentProgress, 'id' | 'created' | 'updated'> = {
        student_id: studentId,
        objective_id: objective.id,
        pathway_id: pathwayId,
        status: 'Not Started',
        completion_percentage: 0,
        time_spent_minutes: 0,
        attempts: 0
      };
      return this.repository.progress.create(progress);
    });

    await Promise.all(progressPromises);
  }

  // Calculate pathway confidence score
  private calculatePathwayConfidence(
    objectives: LearningObjective[],
    studentProgress: StudentProgress[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on completed prerequisites
    const completedObjectiveIds = studentProgress
      .filter(p => p.status === 'Completed' || p.status === 'Mastered')
      .map(p => p.objective_id);

    let prerequisitesMet = 0;
    let totalPrerequisites = 0;

    for (const objective of objectives) {
      totalPrerequisites += objective.prerequisites.length;
      prerequisitesMet += objective.prerequisites.filter(prereq => 
        completedObjectiveIds.includes(prereq)
      ).length;
    }

    if (totalPrerequisites > 0) {
      confidence += (prerequisitesMet / totalPrerequisites) * 0.3;
    }

    // Adjust based on difficulty progression
    const difficulties = objectives.map(obj => obj.difficulty_level);
    const hasGoodProgression = this.hasGoodDifficultyProgression(difficulties);
    if (hasGoodProgression) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  // Check if difficulty progression is reasonable
  private hasGoodDifficultyProgression(difficulties: DifficultyLevel[]): boolean {
    const difficultyOrder = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const indices = difficulties.map(d => difficultyOrder.indexOf(d));
    
    // Check if there are no major jumps in difficulty
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] - indices[i-1] > 2) {
        return false;
      }
    }
    return true;
  }

  // Generate AI recommendations for a student
  async generateRecommendations(studentId: string): Promise<LearningRecommendation[]> {
    // Deactivate old recommendations
    await this.repository.recommendations.deactivateByStudent(studentId);

    const recommendations: LearningRecommendation[] = [];

    // Get student data
    const [pathways, progress, learningStyle] = await Promise.all([
      this.repository.pathways.findActiveByStudent(studentId),
      this.repository.progress.findByStudent(studentId),
      this.repository.assessments.findLatestByStudent(studentId)
    ]);

    // Generate different types of recommendations
    const nextObjectiveRecs = await this.generateNextObjectiveRecommendations(studentId, pathways, progress);
    const reviewRecs = await this.generateReviewRecommendations(studentId, progress);
    const skillGapRecs = await this.generateSkillGapRecommendations(studentId, progress);
    const styleMatchRecs = await this.generateLearningStyleRecommendations(studentId, learningStyle, progress);

    recommendations.push(...nextObjectiveRecs, ...reviewRecs, ...skillGapRecs, ...styleMatchRecs);

    // Sort by priority and confidence, limit to max active recommendations
    recommendations.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return b.confidence_score - a.confidence_score;
    });

    const topRecommendations = recommendations.slice(0, this.config.max_active_recommendations);

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      topRecommendations.map(rec => this.repository.recommendations.create(rec))
    );

    return savedRecommendations;
  }

  // Generate next objective recommendations
  private async generateNextObjectiveRecommendations(
    studentId: string,
    pathways: LearningPathway[],
    progress: StudentProgress[]
  ): Promise<Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[]> {
    const recommendations: Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[] = [];

    for (const pathway of pathways) {
      if (pathway.current_objective_index < pathway.objectives.length) {
        const nextObjectiveId = pathway.objectives[pathway.current_objective_index];
        const objective = await this.repository.objectives.findById(nextObjectiveId);
        
        if (objective) {
          recommendations.push({
            student_id: studentId,
            recommendation_type: 'Next Objective',
            title: `Continue with: ${objective.title}`,
            description: `Next step in your learning pathway. ${objective.description}`,
            objective_id: objective.id,
            priority: 'High',
            confidence_score: 0.9,
            is_active: true,
            generated_at: new Date().toISOString(),
            ai_reasoning: `Next objective in active learning pathway "${pathway.title}"`
          });
        }
      }
    }

    return recommendations;
  }

  // Generate review recommendations
  private async generateReviewRecommendations(
    studentId: string,
    progress: StudentProgress[]
  ): Promise<Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[]> {
    const recommendations: Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[] = [];

    // Find objectives that need review (low mastery score or not accessed recently)
    const needsReview = progress.filter(p => {
      const daysSinceAccess = p.last_accessed ? 
        (Date.now() - new Date(p.last_accessed).getTime()) / (1000 * 60 * 60 * 24) : 
        Infinity;
      
      return (p.mastery_score && p.mastery_score < this.config.mastery_score_threshold) ||
             daysSinceAccess > 14; // Not accessed in 2 weeks
    });

    for (const progressItem of needsReview.slice(0, 2)) { // Limit to 2 review recommendations
      const objective = await this.repository.objectives.findById(progressItem.objective_id);
      if (objective) {
        recommendations.push({
          student_id: studentId,
          recommendation_type: 'Review Content',
          title: `Review: ${objective.title}`,
          description: `Strengthen your understanding of this topic to improve mastery.`,
          objective_id: objective.id,
          priority: 'Medium',
          confidence_score: 0.7,
          is_active: true,
          generated_at: new Date().toISOString(),
          ai_reasoning: `Low mastery score (${progressItem.mastery_score}) or not accessed recently`
        });
      }
    }

    return recommendations;
  }

  // Generate skill gap recommendations
  private async generateSkillGapRecommendations(
    studentId: string,
    progress: StudentProgress[]
  ): Promise<Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[]> {
    const recommendations: Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[] = [];

    // Identify skill gaps (objectives with multiple failed attempts)
    const skillGaps = progress.filter(p => p.attempts > 3 && p.status !== 'Completed' && p.status !== 'Mastered');

    for (const gap of skillGaps.slice(0, 1)) { // Limit to 1 skill gap recommendation
      const objective = await this.repository.objectives.findById(gap.objective_id);
      if (objective) {
        recommendations.push({
          student_id: studentId,
          recommendation_type: 'Skill Gap',
          title: `Focus on: ${objective.title}`,
          description: `This topic needs extra attention. Consider additional practice or seeking help.`,
          objective_id: objective.id,
          priority: 'High',
          confidence_score: 0.8,
          is_active: true,
          generated_at: new Date().toISOString(),
          ai_reasoning: `Multiple attempts (${gap.attempts}) without completion indicates skill gap`
        });
      }
    }

    return recommendations;
  }

  // Generate learning style match recommendations
  private async generateLearningStyleRecommendations(
    studentId: string,
    learningStyle: LearningStyleAssessment | null,
    progress: StudentProgress[]
  ): Promise<Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[]> {
    const recommendations: Omit<LearningRecommendation, 'id' | 'created' | 'updated'>[] = [];

    if (!learningStyle) {
      // Recommend taking learning style assessment
      recommendations.push({
        student_id: studentId,
        recommendation_type: 'Learning Style Match',
        title: 'Take Learning Style Assessment',
        description: 'Discover your learning style to get personalized content recommendations.',
        priority: 'Medium',
        confidence_score: 0.6,
        is_active: true,
        generated_at: new Date().toISOString(),
        ai_reasoning: 'No learning style assessment found for student'
      });
    }

    return recommendations;
  }

  // Analyze student learning patterns and adapt pathway
  async adaptLearningPathway(pathwayId: string): Promise<LearningPathway | null> {
    const pathway = await this.repository.pathways.findById(pathwayId);
    if (!pathway) return null;

    const progress = await this.repository.progress.findByPathway(pathwayId);
    const adjustments: AdaptiveAdjustment[] = [];

    // Analyze performance patterns
    const recentProgress = progress.filter(p => {
      const daysSinceUpdate = p.updated ? 
        (Date.now() - new Date(p.updated).getTime()) / (1000 * 60 * 60 * 24) : 
        Infinity;
      return daysSinceUpdate <= 7; // Last week
    });

    // Check if difficulty adjustment is needed
    const strugglingObjectives = recentProgress.filter(p => 
      p.attempts > 2 && p.completion_percentage < 50
    );

    if (strugglingObjectives.length > recentProgress.length * 0.5) {
      // Student is struggling with more than 50% of recent objectives
      adjustments.push({
        timestamp: new Date().toISOString(),
        adjustment_type: 'difficulty_decrease',
        reason: 'Student struggling with current difficulty level',
        previous_value: 'current_difficulty',
        new_value: 'reduced_difficulty'
      });
    }

    // Check if student is progressing too quickly
    const masteredQuickly = recentProgress.filter(p => 
      p.status === 'Mastered' && p.time_spent_minutes < (p.attempts * 30) // Less than 30 min per attempt
    );

    if (masteredQuickly.length > recentProgress.length * 0.7) {
      // Student is mastering more than 70% of objectives quickly
      adjustments.push({
        timestamp: new Date().toISOString(),
        adjustment_type: 'difficulty_increase',
        reason: 'Student progressing faster than expected',
        previous_value: 'current_difficulty',
        new_value: 'increased_difficulty'
      });
    }

    // Apply adjustments
    if (adjustments.length > 0) {
      const currentAdjustments = pathway.adaptive_adjustments || [];
      const updatedPathway = await this.repository.pathways.update(pathwayId, {
        adaptive_adjustments: [...currentAdjustments, ...adjustments]
      });
      return updatedPathway;
    }

    return pathway;
  }

  // Generate personalized content suggestions for an objective
  async generateContentSuggestions(
    studentId: string,
    objectiveId: string
  ): Promise<ContentSuggestion[]> {
    const [objective, learningStyle, progress] = await Promise.all([
      this.repository.objectives.findById(objectiveId),
      this.repository.assessments.findLatestByStudent(studentId),
      this.repository.progress.findByStudent(studentId)
    ]);

    if (!objective) return [];

    const studentProgress = progress.find(p => p.objective_id === objectiveId);
    const primaryLearningStyle = learningStyle?.primary_style || 'Multimodal';

    // Generate content suggestions based on learning style and difficulty
    const suggestions: Omit<ContentSuggestion, 'id'>[] = [];

    // Visual learner suggestions
    if (primaryLearningStyle === 'Visual' || primaryLearningStyle === 'Multimodal') {
      suggestions.push({
        objective_id: objectiveId,
        content_type: 'video',
        title: `Visual Guide: ${objective.title}`,
        description: `Interactive video tutorial covering ${objective.title} with diagrams and visual examples`,
        difficulty_level: objective.difficulty_level,
        estimated_duration_minutes: Math.round(objective.estimated_duration_minutes * 0.8),
        learning_style_match: ['Visual'],
        relevance_score: this.calculateContentRelevance(objective, 'video', primaryLearningStyle, studentProgress)
      });

      suggestions.push({
        objective_id: objectiveId,
        content_type: 'article',
        title: `Infographic: ${objective.title} Concepts`,
        description: `Visual breakdown of key concepts with charts, diagrams, and illustrations`,
        difficulty_level: objective.difficulty_level,
        estimated_duration_minutes: Math.round(objective.estimated_duration_minutes * 0.4),
        learning_style_match: ['Visual'],
        relevance_score: this.calculateContentRelevance(objective, 'article', primaryLearningStyle, studentProgress)
      });
    }

    // Auditory learner suggestions
    if (primaryLearningStyle === 'Auditory' || primaryLearningStyle === 'Multimodal') {
      suggestions.push({
        objective_id: objectiveId,
        content_type: 'video',
        title: `Audio Lecture: ${objective.title}`,
        description: `Comprehensive audio explanation with discussion and verbal examples`,
        difficulty_level: objective.difficulty_level,
        estimated_duration_minutes: objective.estimated_duration_minutes,
        learning_style_match: ['Auditory'],
        relevance_score: this.calculateContentRelevance(objective, 'video', primaryLearningStyle, studentProgress)
      });
    }

    // Kinesthetic learner suggestions
    if (primaryLearningStyle === 'Kinesthetic' || primaryLearningStyle === 'Multimodal') {
      suggestions.push({
        objective_id: objectiveId,
        content_type: 'exercise',
        title: `Hands-on Practice: ${objective.title}`,
        description: `Interactive exercises and practical activities to reinforce learning`,
        difficulty_level: objective.difficulty_level,
        estimated_duration_minutes: Math.round(objective.estimated_duration_minutes * 1.2),
        learning_style_match: ['Kinesthetic'],
        relevance_score: this.calculateContentRelevance(objective, 'exercise', primaryLearningStyle, studentProgress)
      });

      suggestions.push({
        objective_id: objectiveId,
        content_type: 'game',
        title: `Interactive Game: ${objective.title}`,
        description: `Gamified learning experience with challenges and immediate feedback`,
        difficulty_level: objective.difficulty_level,
        estimated_duration_minutes: Math.round(objective.estimated_duration_minutes * 0.6),
        learning_style_match: ['Kinesthetic'],
        relevance_score: this.calculateContentRelevance(objective, 'game', primaryLearningStyle, studentProgress)
      });
    }

    // Reading/Writing learner suggestions
    if (primaryLearningStyle === 'Reading/Writing' || primaryLearningStyle === 'Multimodal') {
      suggestions.push({
        objective_id: objectiveId,
        content_type: 'article',
        title: `Comprehensive Guide: ${objective.title}`,
        description: `Detailed written explanation with examples, notes, and references`,
        difficulty_level: objective.difficulty_level,
        estimated_duration_minutes: objective.estimated_duration_minutes,
        learning_style_match: ['Reading/Writing'],
        relevance_score: this.calculateContentRelevance(objective, 'article', primaryLearningStyle, studentProgress)
      });
    }

    // Add quiz for assessment regardless of learning style
    suggestions.push({
      objective_id: objectiveId,
      content_type: 'quiz',
      title: `Knowledge Check: ${objective.title}`,
      description: `Test your understanding with targeted questions and immediate feedback`,
      difficulty_level: objective.difficulty_level,
      estimated_duration_minutes: Math.round(objective.estimated_duration_minutes * 0.3),
      learning_style_match: [primaryLearningStyle],
      relevance_score: this.calculateContentRelevance(objective, 'quiz', primaryLearningStyle, studentProgress)
    });

    // Sort by relevance score and return top suggestions
    return suggestions
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 5)
      .map((suggestion, index) => ({
        id: `suggestion-${objectiveId}-${index}`,
        ...suggestion
      }));
  }

  // Calculate content relevance score
  private calculateContentRelevance(
    objective: LearningObjective,
    contentType: ContentSuggestion['content_type'],
    learningStyle: LearningStyle,
    studentProgress?: StudentProgress
  ): number {
    let score = 0.5; // Base score

    // Learning style match bonus
    const styleContentMatch = {
      'Visual': { 'video': 0.3, 'article': 0.2, 'exercise': 0.1, 'quiz': 0.1, 'game': 0.2 },
      'Auditory': { 'video': 0.3, 'article': 0.1, 'exercise': 0.2, 'quiz': 0.1, 'game': 0.1 },
      'Kinesthetic': { 'video': 0.1, 'article': 0.1, 'exercise': 0.4, 'quiz': 0.2, 'game': 0.4 },
      'Reading/Writing': { 'video': 0.1, 'article': 0.4, 'exercise': 0.2, 'quiz': 0.3, 'game': 0.1 },
      'Multimodal': { 'video': 0.25, 'article': 0.25, 'exercise': 0.25, 'quiz': 0.25, 'game': 0.25 }
    };

    score += styleContentMatch[learningStyle]?.[contentType] || 0;

    // Difficulty progression bonus
    if (studentProgress) {
      if (studentProgress.status === 'Not Started') {
        // Prefer easier content for new topics
        if (contentType === 'article' || contentType === 'video') score += 0.2;
      } else if (studentProgress.status === 'In Progress') {
        // Prefer practice content for ongoing learning
        if (contentType === 'exercise' || contentType === 'quiz') score += 0.2;
      } else if (studentProgress.status === 'Needs Review') {
        // Prefer review-friendly content
        if (contentType === 'quiz' || contentType === 'game') score += 0.2;
      }

      // Adjust based on attempts
      if (studentProgress.attempts > 2) {
        // Student struggling, prefer different content types
        if (contentType === 'game' || contentType === 'video') score += 0.1;
      }
    }

    // Subject-specific content type preferences
    const subjectPreferences = {
      'Mathematics': { 'exercise': 0.1, 'video': 0.1 },
      'Science': { 'video': 0.1, 'exercise': 0.1 },
      'Language Arts': { 'article': 0.1, 'quiz': 0.1 },
      'History': { 'article': 0.1, 'video': 0.1 },
      'Art': { 'video': 0.1, 'game': 0.1 }
    };

    const subjectBonus = subjectPreferences[objective.subject as keyof typeof subjectPreferences];
    if (subjectBonus) {
      score += subjectBonus[contentType] || 0;
    }

    return Math.min(score, 1.0);
  }

  // Get learning analytics for a student
  async getLearningAnalytics(studentId: string): Promise<LearningAnalytics> {
    const progress = await this.repository.progress.findByStudent(studentId);
    const pathways = await this.repository.pathways.findByStudent(studentId);
    const learningStyle = await this.repository.assessments.findLatestByStudent(studentId);

    const completedObjectives = progress.filter(p => 
      p.status === 'Completed' || p.status === 'Mastered'
    );

    const totalTimeSpent = progress.reduce((sum, p) => sum + p.time_spent_minutes, 0);
    
    const masteryScores = progress
      .filter(p => p.mastery_score !== undefined)
      .map(p => p.mastery_score!);
    
    const averageMasteryScore = masteryScores.length > 0 ? 
      masteryScores.reduce((sum, score) => sum + score, 0) / masteryScores.length : 0;

    // Calculate learning velocity (objectives per week)
    const oldestProgress = progress.reduce((oldest, p) => 
      new Date(p.created) < new Date(oldest.created) ? p : oldest, progress[0]
    );
    
    const weeksSinceStart = oldestProgress ? 
      (Date.now() - new Date(oldestProgress.created).getTime()) / (1000 * 60 * 60 * 24 * 7) : 1;
    
    const learningVelocity = completedObjectives.length / Math.max(weeksSinceStart, 1);

    // Analyze strength and improvement areas
    const subjectPerformance = new Map<string, { completed: number, total: number }>();
    
    for (const progressItem of progress) {
      const objective = await this.repository.objectives.findById(progressItem.objective_id);
      if (objective) {
        const current = subjectPerformance.get(objective.subject) || { completed: 0, total: 0 };
        current.total++;
        if (progressItem.status === 'Completed' || progressItem.status === 'Mastered') {
          current.completed++;
        }
        subjectPerformance.set(objective.subject, current);
      }
    }

    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];

    for (const [subject, performance] of subjectPerformance) {
      const completionRate = performance.completed / performance.total;
      if (completionRate >= 0.8) {
        strengthAreas.push(subject);
      } else if (completionRate < 0.5) {
        improvementAreas.push(subject);
      }
    }

    // Calculate pathway completion rate
    const activePathways = pathways.filter(p => p.is_active);
    const pathwayCompletionRate = activePathways.length > 0 ?
      activePathways.reduce((sum, p) => sum + p.completion_percentage, 0) / activePathways.length / 100 : 0;

    return {
      student_id: studentId,
      total_objectives_completed: completedObjectives.length,
      total_time_spent_minutes: totalTimeSpent,
      average_mastery_score: averageMasteryScore,
      learning_velocity: learningVelocity,
      strength_areas: strengthAreas,
      improvement_areas: improvementAreas,
      learning_style_effectiveness: {
        'Visual': 0.8, // These would be calculated based on actual performance data
        'Auditory': 0.6,
        'Kinesthetic': 0.7,
        'Reading/Writing': 0.9,
        'Multimodal': 0.8
      },
      pathway_completion_rate: pathwayCompletionRate
    };
  }
}