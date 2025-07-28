// Hook for AI-Powered Learning Guide functionality

import { useState, useEffect, useCallback } from 'react';
import {
  LearningPathway,
  LearningPathwayWithDetails,
  StudentProgress,
  LearningRecommendation,
  LearningAnalytics,
  PathwayGenerationRequest,
  PathwayGenerationResponse,
  LearningObjective,
  LearningStyleAssessment,
  AssessmentResponse,
  ContentSuggestion
} from '../types/learning-guide';

interface UseLearningGuideReturn {
  // Pathways
  pathways: LearningPathway[];
  activePathways: LearningPathwayWithDetails[];
  loadingPathways: boolean;
  
  // Progress
  progress: StudentProgress[];
  loadingProgress: boolean;
  
  // Recommendations
  recommendations: LearningRecommendation[];
  loadingRecommendations: boolean;
  
  // Analytics
  analytics: LearningAnalytics | null;
  loadingAnalytics: boolean;
  
  // Objectives
  objectives: LearningObjective[];
  loadingObjectives: boolean;
  
  // Content Suggestions
  contentSuggestions: ContentSuggestion[];
  loadingContentSuggestions: boolean;
  
  // Actions
  generatePathway: (request: PathwayGenerationRequest) => Promise<PathwayGenerationResponse | null>;
  updateProgress: (progressId: string, updates: Partial<StudentProgress>) => Promise<boolean>;
  submitAssessment: (studentId: string, responses: AssessmentResponse[]) => Promise<LearningStyleAssessment | null>;
  refreshData: () => Promise<void>;
  searchObjectives: (query: string) => Promise<void>;
  filterObjectivesBySubject: (subject: string) => Promise<void>;
  getContentSuggestions: (objectiveId: string) => Promise<void>;
  
  // Loading states
  generatingPathway: boolean;
  updatingProgress: boolean;
  submittingAssessment: boolean;
}

export function useLearningGuide(studentId: string): UseLearningGuideReturn {
  // State
  const [pathways, setPathways] = useState<LearningPathway[]>([]);
  const [activePathways, setActivePathways] = useState<LearningPathwayWithDetails[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  
  // Loading states
  const [loadingPathways, setLoadingPathways] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [loadingContentSuggestions, setLoadingContentSuggestions] = useState(false);
  const [generatingPathway, setGeneratingPathway] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Fetch pathways
  const fetchPathways = useCallback(async () => {
    if (!studentId) return;
    
    setLoadingPathways(true);
    try {
      const response = await fetch(`/api/learning-guide/pathways?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        setPathways(result.data);
      }
    } catch (error) {
      console.error('Error fetching pathways:', error);
    } finally {
      setLoadingPathways(false);
    }
  }, [studentId]);

  // Fetch active pathways with details
  const fetchActivePathways = useCallback(async () => {
    if (!studentId) return;
    
    try {
      const response = await fetch(`/api/learning-guide/pathways/active?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        setActivePathways(result.data);
      }
    } catch (error) {
      console.error('Error fetching active pathways:', error);
    }
  }, [studentId]);

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    if (!studentId) return;
    
    setLoadingProgress(true);
    try {
      const response = await fetch(`/api/learning-guide/progress?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        setProgress(result.data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  }, [studentId]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!studentId) return;
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`/api/learning-guide/recommendations?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        setRecommendations(result.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [studentId]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!studentId) return;
    
    setLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/learning-guide/analytics?studentId=${studentId}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [studentId]);

  // Fetch objectives
  const fetchObjectives = useCallback(async (params?: { subject?: string; search?: string }) => {
    setLoadingObjectives(true);
    try {
      const searchParams = new URLSearchParams();
      if (params?.subject) searchParams.append('subject', params.subject);
      if (params?.search) searchParams.append('search', params.search);
      
      const response = await fetch(`/api/learning-guide/objectives?${searchParams.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setObjectives(result.data);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
    } finally {
      setLoadingObjectives(false);
    }
  }, []);

  // Generate pathway
  const generatePathway = useCallback(async (request: PathwayGenerationRequest): Promise<PathwayGenerationResponse | null> => {
    setGeneratingPathway(true);
    try {
      const response = await fetch('/api/learning-guide/pathways/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh pathways after generation
        await fetchPathways();
        await fetchActivePathways();
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating pathway:', error);
      return null;
    } finally {
      setGeneratingPathway(false);
    }
  }, [fetchPathways, fetchActivePathways]);

  // Update progress
  const updateProgress = useCallback(async (progressId: string, updates: Partial<StudentProgress>): Promise<boolean> => {
    setUpdatingProgress(true);
    try {
      const response = await fetch('/api/learning-guide/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressId, updates }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh progress after update
        await fetchProgress();
        await fetchActivePathways();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    } finally {
      setUpdatingProgress(false);
    }
  }, [fetchProgress, fetchActivePathways]);

  // Submit assessment
  const submitAssessment = useCallback(async (studentId: string, responses: AssessmentResponse[]): Promise<LearningStyleAssessment | null> => {
    setSubmittingAssessment(true);
    try {
      const response = await fetch('/api/learning-guide/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, responses }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      return null;
    } finally {
      setSubmittingAssessment(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchPathways(),
      fetchActivePathways(),
      fetchProgress(),
      fetchRecommendations(),
      fetchAnalytics(),
    ]);
  }, [fetchPathways, fetchActivePathways, fetchProgress, fetchRecommendations, fetchAnalytics]);

  // Search objectives
  const searchObjectives = useCallback(async (query: string) => {
    await fetchObjectives({ search: query });
  }, [fetchObjectives]);

  // Filter objectives by subject
  const filterObjectivesBySubject = useCallback(async (subject: string) => {
    await fetchObjectives({ subject });
  }, [fetchObjectives]);

  // Get content suggestions for an objective
  const getContentSuggestions = useCallback(async (objectiveId: string) => {
    if (!studentId) return;
    
    setLoadingContentSuggestions(true);
    try {
      const response = await fetch(`/api/learning-guide/content-suggestions?studentId=${studentId}&objectiveId=${objectiveId}`);
      const result = await response.json();
      
      if (result.success) {
        setContentSuggestions(result.data);
      }
    } catch (error) {
      console.error('Error fetching content suggestions:', error);
    } finally {
      setLoadingContentSuggestions(false);
    }
  }, [studentId]);

  // Initial data load
  useEffect(() => {
    if (studentId) {
      refreshData();
      fetchObjectives();
    }
  }, [studentId, refreshData, fetchObjectives]);

  return {
    // Data
    pathways,
    activePathways,
    progress,
    recommendations,
    analytics,
    objectives,
    contentSuggestions,
    
    // Loading states
    loadingPathways,
    loadingProgress,
    loadingRecommendations,
    loadingAnalytics,
    loadingObjectives,
    loadingContentSuggestions,
    generatingPathway,
    updatingProgress,
    submittingAssessment,
    
    // Actions
    generatePathway,
    updateProgress,
    submitAssessment,
    refreshData,
    searchObjectives,
    filterObjectivesBySubject,
    getContentSuggestions,
  };
}