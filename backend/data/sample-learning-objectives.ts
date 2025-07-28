// Sample learning objectives data for AI-Powered Learning Guide

import { LearningObjective, DifficultyLevel } from '../../types/learning-guide';

export const sampleLearningObjectives: Omit<LearningObjective, 'id' | 'created' | 'updated'>[] = [
  // Mathematics
  {
    title: 'Basic Algebra Fundamentals',
    description: 'Learn the fundamentals of algebraic expressions, equations, and basic problem-solving techniques.',
    subject: 'Mathematics',
    difficulty_level: 'Beginner' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 120,
    tags: ['algebra', 'equations', 'variables', 'fundamentals']
  },
  {
    title: 'Linear Equations and Inequalities',
    description: 'Master solving linear equations and inequalities in one and two variables.',
    subject: 'Mathematics',
    difficulty_level: 'Intermediate' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 90,
    tags: ['linear equations', 'inequalities', 'graphing', 'problem solving']
  },
  {
    title: 'Quadratic Functions and Equations',
    description: 'Understand quadratic functions, their graphs, and methods for solving quadratic equations.',
    subject: 'Mathematics',
    difficulty_level: 'Advanced' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 150,
    tags: ['quadratic', 'functions', 'parabola', 'factoring']
  },
  {
    title: 'Calculus: Limits and Continuity',
    description: 'Introduction to limits, continuity, and the foundational concepts of calculus.',
    subject: 'Mathematics',
    difficulty_level: 'Expert' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 180,
    tags: ['calculus', 'limits', 'continuity', 'derivatives']
  },

  // Science
  {
    title: 'Introduction to Scientific Method',
    description: 'Learn the basic principles of scientific inquiry, hypothesis formation, and experimental design.',
    subject: 'Science',
    difficulty_level: 'Beginner' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 60,
    tags: ['scientific method', 'hypothesis', 'experiment', 'observation']
  },
  {
    title: 'Basic Chemistry: Atoms and Molecules',
    description: 'Understand atomic structure, chemical bonding, and molecular interactions.',
    subject: 'Science',
    difficulty_level: 'Intermediate' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 120,
    tags: ['chemistry', 'atoms', 'molecules', 'bonding', 'periodic table']
  },
  {
    title: 'Physics: Motion and Forces',
    description: 'Study the principles of motion, Newton\'s laws, and force interactions.',
    subject: 'Science',
    difficulty_level: 'Advanced' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 135,
    tags: ['physics', 'motion', 'forces', 'newton', 'mechanics']
  },
  {
    title: 'Advanced Biology: Genetics and Evolution',
    description: 'Explore genetic principles, inheritance patterns, and evolutionary theory.',
    subject: 'Science',
    difficulty_level: 'Expert' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 200,
    tags: ['biology', 'genetics', 'evolution', 'DNA', 'inheritance']
  },

  // English Language Arts
  {
    title: 'Reading Comprehension Strategies',
    description: 'Develop effective strategies for understanding and analyzing written texts.',
    subject: 'English Language Arts',
    difficulty_level: 'Beginner' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 75,
    tags: ['reading', 'comprehension', 'analysis', 'strategies', 'text']
  },
  {
    title: 'Essay Writing and Structure',
    description: 'Learn to write well-structured essays with clear thesis statements and supporting arguments.',
    subject: 'English Language Arts',
    difficulty_level: 'Intermediate' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 100,
    tags: ['writing', 'essay', 'structure', 'thesis', 'arguments']
  },
  {
    title: 'Literary Analysis and Criticism',
    description: 'Analyze literary works using various critical approaches and theoretical frameworks.',
    subject: 'English Language Arts',
    difficulty_level: 'Advanced' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 160,
    tags: ['literature', 'analysis', 'criticism', 'theory', 'interpretation']
  },
  {
    title: 'Advanced Rhetoric and Persuasion',
    description: 'Master advanced rhetorical techniques and persuasive writing strategies.',
    subject: 'English Language Arts',
    difficulty_level: 'Expert' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 140,
    tags: ['rhetoric', 'persuasion', 'argumentation', 'discourse', 'communication']
  },

  // History
  {
    title: 'Introduction to Historical Thinking',
    description: 'Learn to think like a historian: analyzing sources, understanding context, and constructing narratives.',
    subject: 'History',
    difficulty_level: 'Beginner' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 80,
    tags: ['historical thinking', 'sources', 'context', 'analysis', 'narrative']
  },
  {
    title: 'World War II: Causes and Consequences',
    description: 'Examine the complex causes of World War II and its lasting global impact.',
    subject: 'History',
    difficulty_level: 'Intermediate' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 120,
    tags: ['world war ii', 'causes', 'consequences', 'global impact', 'conflict']
  },
  {
    title: 'The Industrial Revolution',
    description: 'Analyze the technological, social, and economic changes of the Industrial Revolution.',
    subject: 'History',
    difficulty_level: 'Advanced' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 110,
    tags: ['industrial revolution', 'technology', 'social change', 'economics', 'modernization']
  },

  // Computer Science
  {
    title: 'Programming Fundamentals',
    description: 'Learn basic programming concepts including variables, loops, and functions.',
    subject: 'Computer Science',
    difficulty_level: 'Beginner' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 150,
    tags: ['programming', 'variables', 'loops', 'functions', 'logic']
  },
  {
    title: 'Data Structures and Algorithms',
    description: 'Understand common data structures and algorithmic problem-solving techniques.',
    subject: 'Computer Science',
    difficulty_level: 'Intermediate' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 180,
    tags: ['data structures', 'algorithms', 'arrays', 'linked lists', 'sorting']
  },
  {
    title: 'Object-Oriented Programming',
    description: 'Master object-oriented programming principles including classes, inheritance, and polymorphism.',
    subject: 'Computer Science',
    difficulty_level: 'Advanced' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 200,
    tags: ['oop', 'classes', 'inheritance', 'polymorphism', 'encapsulation']
  },
  {
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
    subject: 'Computer Science',
    difficulty_level: 'Expert' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 240,
    tags: ['machine learning', 'ai', 'algorithms', 'neural networks', 'data science']
  },

  // Art
  {
    title: 'Basic Drawing Techniques',
    description: 'Learn fundamental drawing skills including line, shape, form, and shading.',
    subject: 'Art',
    difficulty_level: 'Beginner' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 90,
    tags: ['drawing', 'line', 'shape', 'form', 'shading', 'visual']
  },
  {
    title: 'Color Theory and Application',
    description: 'Understand color relationships, harmony, and how to use color effectively in art.',
    subject: 'Art',
    difficulty_level: 'Intermediate' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 100,
    tags: ['color theory', 'harmony', 'painting', 'visual', 'composition']
  },
  {
    title: 'Digital Art and Design',
    description: 'Explore digital art tools and techniques for creating modern visual artwork.',
    subject: 'Art',
    difficulty_level: 'Advanced' as DifficultyLevel,
    prerequisites: [],
    estimated_duration_minutes: 130,
    tags: ['digital art', 'design', 'software', 'graphics', 'technology']
  }
];

// Function to create prerequisites relationships
export function createPrerequisiteRelationships(objectives: LearningObjective[]): LearningObjective[] {
  const objectiveMap = new Map(objectives.map(obj => [obj.title, obj]));
  
  // Define prerequisite relationships
  const prerequisites = {
    'Linear Equations and Inequalities': ['Basic Algebra Fundamentals'],
    'Quadratic Functions and Equations': ['Linear Equations and Inequalities'],
    'Calculus: Limits and Continuity': ['Quadratic Functions and Equations'],
    'Basic Chemistry: Atoms and Molecules': ['Introduction to Scientific Method'],
    'Physics: Motion and Forces': ['Basic Chemistry: Atoms and Molecules'],
    'Advanced Biology: Genetics and Evolution': ['Physics: Motion and Forces'],
    'Essay Writing and Structure': ['Reading Comprehension Strategies'],
    'Literary Analysis and Criticism': ['Essay Writing and Structure'],
    'Advanced Rhetoric and Persuasion': ['Literary Analysis and Criticism'],
    'World War II: Causes and Consequences': ['Introduction to Historical Thinking'],
    'The Industrial Revolution': ['World War II: Causes and Consequences'],
    'Data Structures and Algorithms': ['Programming Fundamentals'],
    'Object-Oriented Programming': ['Data Structures and Algorithms'],
    'Machine Learning Fundamentals': ['Object-Oriented Programming'],
    'Color Theory and Application': ['Basic Drawing Techniques'],
    'Digital Art and Design': ['Color Theory and Application']
  };

  // Apply prerequisites
  return objectives.map(obj => {
    const prereqTitles = prerequisites[obj.title as keyof typeof prerequisites] || [];
    const prereqIds = prereqTitles
      .map(title => objectiveMap.get(title)?.id)
      .filter(id => id !== undefined) as string[];
    
    return {
      ...obj,
      prerequisites: prereqIds
    };
  });
}