// Types for AI-Powered Learning Guide system

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type LearningStyle = 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing' | 'Multimodal';
export type ProgressStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Mastered' | 'Needs Review';
export type RecommendationType = 'Next Objective' | 'Review Content' | 'Skill Gap' | 'Learning Style Match' | 'Difficulty Adjustment';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

// Learning Objective
export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty_level: DifficultyLevel;
  prerequisites: string[]; // IDs of prerequisite objectives
  estimated_duration_minutes: number;
  tags: string[];
  created: string;
  updated: string;
}

// Learning Pathway
export interface LearningPathway {
  id: string;
  title: string;
  description: string;
  student_id: string;
  objectives: string[]; // IDs of learning objectives in order
  current_objective_index: number;
  completion_percentage: number;
  is_active: boolean;
  created_by_ai: boolean;
  adaptive_adjustments?: AdaptiveAdjustment[];
  created: string;
  updated: string;
}

// Adaptive adjustments made by AI
export interface AdaptiveAdjustment {
  timestamp: string;
  adjustment_type: 'difficulty_increase' | 'difficulty_decrease' | 'objective_reorder' | 'objective_add' | 'objective_remove';
  reason: string;
  previous_value?: any;
  new_value?: any;
}

// Learning Style Assessment
export interface LearningStyleAssessment {
  id: string;
  student_id: string;
  visual_score: number;
  auditory_score: number;
  kinesthetic_score: number;
  reading_writing_score: number;
  primary_style: LearningStyle;
  assessment_responses: AssessmentResponse[];
  completed_at: string;
  created: string;
  updated: string;
}

// Individual assessment question response
export interface AssessmentResponse {
  question_id: string;
  question_text: string;
  selected_answer: string;
  style_weights: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading_writing: number;
  };
}

// Student Progress Tracking
export interface StudentProgress {
  id: string;
  student_id: string;
  objective_id: string;
  pathway_id: string;
  status: ProgressStatus;
  completion_percentage: number;
  time_spent_minutes: number;
  attempts: number;
  last_accessed?: string;
  mastery_score?: number;
  created: string;
  updated: string;
}

// AI Learning Recommendations
export interface LearningRecommendation {
  id: string;
  student_id: string;
  recommendation_type: RecommendationType;
  title: string;
  description: string;
  objective_id?: string;
  priority: Priority;
  confidence_score: number; // 0-1 scale
  is_active: boolean;
  generated_at: string;
  ai_reasoning?: string;
  created: string;
  updated: string;
}

// Extended types with populated relations
export interface LearningPathwayWithDetails extends LearningPathway {
  objectives_details?: LearningObjective[];
  current_objective?: LearningObjective;
  progress?: StudentProgress[];
}

export interface StudentProgressWithDetails extends StudentProgress {
  objective?: LearningObjective;
  pathway?: LearningPathway;
}

export interface LearningRecommendationWithDetails extends LearningRecommendation {
  objective?: LearningObjective;
}

// Learning analytics and insights
export interface LearningAnalytics {
  student_id: string;
  total_objectives_completed: number;
  total_time_spent_minutes: number;
  average_mastery_score: number;
  learning_velocity: number; // objectives per week
  strength_areas: string[];
  improvement_areas: string[];
  learning_style_effectiveness: {
    [key in LearningStyle]: number;
  };
  pathway_completion_rate: number;
}

// AI Learning Engine Configuration
export interface LearningEngineConfig {
  difficulty_adjustment_threshold: number;
  mastery_score_threshold: number;
  recommendation_refresh_interval_hours: number;
  max_active_recommendations: number;
  learning_style_weight: number;
  progress_weight: number;
  time_weight: number;
}

// Learning content suggestions
export interface ContentSuggestion {
  id: string;
  objective_id: string;
  content_type: 'article' | 'video' | 'exercise' | 'quiz' | 'game';
  title: string;
  description: string;
  url?: string;
  difficulty_level: DifficultyLevel;
  estimated_duration_minutes: number;
  learning_style_match: LearningStyle[];
  relevance_score: number;
}

// Skill gap analysis
export interface SkillGap {
  objective_id: string;
  objective_title: string;
  current_level: number; // 0-100
  target_level: number; // 0-100
  gap_size: number; // target - current
  recommended_actions: string[];
  estimated_time_to_close_hours: number;
}

// Learning pathway generation request
export interface PathwayGenerationRequest {
  student_id: string;
  target_objectives: string[];
  preferred_learning_style?: LearningStyle;
  available_time_per_week_minutes: number;
  difficulty_preference: DifficultyLevel;
  deadline?: string;
}

// Learning pathway generation response
export interface PathwayGenerationResponse {
  pathway: LearningPathway;
  estimated_completion_weeks: number;
  confidence_score: number;
  alternative_pathways?: LearningPathway[];
  reasoning: string;
}