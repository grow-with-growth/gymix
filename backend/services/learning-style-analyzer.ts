// Learning Style Analyzer Service - Analyzes learning preferences and behavioral patterns

import {
  LearningStyleAssessment,
  LearningStyle,
  LearningPreference,
  BehavioralPattern,
  AssessmentResult
} from '../types/learning.js';
import { UserProgress } from '../types/progress.js';

export interface LearningStyleAnalyzer {
  analyzeLearningStyle(userId: string, assessmentData: LearningStyleAssessment): Promise<LearningStyle>;
  updateLearningPreferences(userId: string, interactions: UserProgress[]): Promise<LearningPreference>;
  identifyBehavioralPatterns(userId: string, timeframe?: number): Promise<BehavioralPattern[]>;
  generateRecommendations(learningStyle: LearningStyle): Promise<string[]>;
}

export class LearningStyleAnalyzerService implements LearningStyleAnalyzer {

  async analyzeLearningStyle(userId: string, assessmentData: LearningStyleAssessment): Promise<LearningStyle> {
    // Analyze assessment responses to determine primary learning style
    const scores = this.calculateStyleScores(assessmentData);

    return {
      userId,
      primaryStyle: this.determinePrimaryStyle(scores),
      secondaryStyle: this.determineSecondaryStyle(scores),
      visualScore: scores.visual,
      auditoryScore: scores.auditory,
      kinestheticScore: scores.kinesthetic,
      readingWritingScore: scores.readingWriting,
      confidence: this.calculateConfidence(scores),
      lastUpdated: new Date()
    };
  }

  async updateLearningPreferences(userId: string, interactions: UserProgress[]): Promise<LearningPreference> {
    // Analyze user interactions to refine learning preferences
    const patterns = this.analyzeInteractionPatterns(interactions);

    return {
      userId,
      preferredContentTypes: patterns.contentTypes,
      preferredDifficulty: patterns.difficulty,
      preferredPacing: patterns.pacing,
      preferredFeedbackStyle: patterns.feedbackStyle,
      adaptiveSettings: patterns.adaptiveSettings,
      lastUpdated: new Date()
    };
  }

  async identifyBehavioralPatterns(userId: string, timeframe: number = 30): Promise<BehavioralPattern[]> {
    // Identify learning behavioral patterns over specified timeframe (days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (timeframe * 24 * 60 * 60 * 1000));

    // This would typically query a database for user activity
    // For now, returning mock patterns
    return [
      {
        patternType: 'study_time',
        description: 'Peak learning hours: 9-11 AM',
        frequency: 0.8,
        confidence: 0.75,
        timeframe: { start: startDate, end: endDate }
      },
      {
        patternType: 'content_preference',
        description: 'Prefers visual content over text',
        frequency: 0.65,
        confidence: 0.82,
        timeframe: { start: startDate, end: endDate }
      }
    ];
  }

  async generateRecommendations(learningStyle: LearningStyle): Promise<string[]> {
    const recommendations: string[] = [];

    // Generate recommendations based on primary learning style
    switch (learningStyle.primaryStyle) {
      case 'visual':
        recommendations.push(
          'Use diagrams, charts, and visual aids',
          'Color-code information for better retention',
          'Create mind maps for complex topics'
        );
        break;
      case 'auditory':
        recommendations.push(
          'Listen to audio content and podcasts',
          'Participate in discussions and verbal explanations',
          'Use text-to-speech for reading materials'
        );
        break;
      case 'kinesthetic':
        recommendations.push(
          'Engage in hands-on activities and experiments',
          'Take frequent breaks and move around',
          'Use physical objects and manipulatives'
        );
        break;
      case 'reading_writing':
        recommendations.push(
          'Take detailed notes while learning',
          'Create written summaries and outlines',
          'Use text-based learning materials'
        );
        break;
    }

    return recommendations;
  }

  private calculateStyleScores(assessment: LearningStyleAssessment): {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
  } {
    // Calculate scores based on assessment responses
    const scores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      readingWriting: 0
    };

    assessment.responses.forEach(response => {
      switch (response.styleIndicator) {
        case 'visual':
          scores.visual += response.weight || 1;
          break;
        case 'auditory':
          scores.auditory += response.weight || 1;
          break;
        case 'kinesthetic':
          scores.kinesthetic += response.weight || 1;
          break;
        case 'reading_writing':
          scores.readingWriting += response.weight || 1;
          break;
      }
    });

    // Normalize scores to percentages
    const total = scores.visual + scores.auditory + scores.kinesthetic + scores.readingWriting;
    if (total > 0) {
      scores.visual = (scores.visual / total) * 100;
      scores.auditory = (scores.auditory / total) * 100;
      scores.kinesthetic = (scores.kinesthetic / total) * 100;
      scores.readingWriting = (scores.readingWriting / total) * 100;
    }

    return scores;
  }

  private determinePrimaryStyle(scores: any): 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' {
    const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic, scores.readingWriting);

    if (scores.visual === maxScore) return 'visual';
    if (scores.auditory === maxScore) return 'auditory';
    if (scores.kinesthetic === maxScore) return 'kinesthetic';
    return 'reading_writing';
  }

  private determineSecondaryStyle(scores: any): 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | null {
    const sortedStyles = Object.entries(scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([style]) => style);

    const secondaryStyle = sortedStyles[1];
    const secondaryScore = scores[secondaryStyle];

    // Only return secondary style if it's significantly present (>20%)
    return secondaryScore > 20 ? secondaryStyle as any : null;
  }

  private calculateConfidence(scores: any): number {
    // Calculate confidence based on score distribution
    const values = Object.values(scores) as number[];
    const maxScore = Math.max(...values);
    const avgScore = values.reduce((sum, score) => sum + score, 0) / values.length;

    // Higher confidence when there's a clear dominant style
    return Math.min((maxScore - avgScore) / 100, 1);
  }

  private analyzeInteractionPatterns(interactions: UserProgress[]): {
    contentTypes: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    pacing: 'slow' | 'medium' | 'fast';
    feedbackStyle: 'immediate' | 'delayed' | 'summary';
    adaptiveSettings: Record<string, any>;
  } {
    // Analyze user interactions to determine preferences
    // This is a simplified implementation
    return {
      contentTypes: ['visual', 'interactive'],
      difficulty: 'medium',
      pacing: 'medium',
      feedbackStyle: 'immediate',
      adaptiveSettings: {
        autoAdjustDifficulty: true,
        personalizedRecommendations: true
      }
    };
  }
}
