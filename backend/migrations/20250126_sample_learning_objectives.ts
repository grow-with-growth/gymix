// Migration: Sample Learning Objectives
// Creates sample learning objectives for testing the AI Learning Guide

import { Migration } from '../types';
import PocketBase from 'pocketbase';

export const migration_20250126_sample_learning_objectives: Migration = {
  id: '20250126_sample_learning_objectives',
  name: 'Create Sample Learning Objectives',
  timestamp: 20250126000001,
  
  async up(pb: PocketBase): Promise<void> {
    console.log('Creating sample learning objectives...');

    const objectives = [
      // Mathematics
      {
        title: 'Basic Algebra Fundamentals',
        description: 'Learn the fundamental concepts of algebra including variables, expressions, and basic equation solving.',
        subject: 'Mathematics',
        difficulty_level: 'Beginner',
        prerequisites: [],
        estimated_duration_minutes: 120,
        tags: 'algebra, variables, equations, fundamentals'
      },
      {
        title: 'Linear Equations and Inequalities',
        description: 'Master solving linear equations and inequalities in one and two variables.',
        subject: 'Mathematics',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 180,
        tags: 'linear equations, inequalities, graphing, slope'
      },
      {
        title: 'Quadratic Functions and Equations',
        description: 'Understand quadratic functions, their graphs, and methods for solving quadratic equations.',
        subject: 'Mathematics',
        difficulty_level: 'Advanced',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 240,
        tags: 'quadratic, parabola, factoring, quadratic formula'
      },

      // Science
      {
        title: 'Introduction to Scientific Method',
        description: 'Learn the basic principles of scientific inquiry, hypothesis formation, and experimental design.',
        subject: 'Science',
        difficulty_level: 'Beginner',
        prerequisites: [],
        estimated_duration_minutes: 90,
        tags: 'scientific method, hypothesis, experiment, observation'
      },
      {
        title: 'Basic Chemistry Concepts',
        description: 'Understand atoms, molecules, chemical bonds, and basic chemical reactions.',
        subject: 'Science',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 200,
        tags: 'chemistry, atoms, molecules, chemical bonds, reactions'
      },
      {
        title: 'Physics: Motion and Forces',
        description: 'Study the principles of motion, velocity, acceleration, and Newton\'s laws of motion.',
        subject: 'Science',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 220,
        tags: 'physics, motion, velocity, acceleration, forces, newton'
      },

      // English Language Arts
      {
        title: 'Reading Comprehension Strategies',
        description: 'Develop effective strategies for understanding and analyzing written texts.',
        subject: 'English Language Arts',
        difficulty_level: 'Beginner',
        prerequisites: [],
        estimated_duration_minutes: 100,
        tags: 'reading, comprehension, analysis, strategies, text'
      },
      {
        title: 'Essay Writing Fundamentals',
        description: 'Learn the structure and components of effective essay writing including thesis statements and supporting arguments.',
        subject: 'English Language Arts',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 150,
        tags: 'writing, essay, thesis, arguments, structure'
      },
      {
        title: 'Literary Analysis and Criticism',
        description: 'Analyze literary works using various critical approaches and theoretical frameworks.',
        subject: 'English Language Arts',
        difficulty_level: 'Advanced',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 180,
        tags: 'literature, analysis, criticism, theory, interpretation'
      },

      // History
      {
        title: 'Introduction to Historical Thinking',
        description: 'Develop skills in historical analysis, source evaluation, and chronological reasoning.',
        subject: 'History',
        difficulty_level: 'Beginner',
        prerequisites: [],
        estimated_duration_minutes: 80,
        tags: 'history, analysis, sources, chronology, thinking'
      },
      {
        title: 'World War II: Causes and Consequences',
        description: 'Examine the causes, major events, and long-term consequences of World War II.',
        subject: 'History',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 160,
        tags: 'world war ii, causes, consequences, global conflict'
      },

      // Computer Science
      {
        title: 'Programming Fundamentals',
        description: 'Learn basic programming concepts including variables, loops, conditionals, and functions.',
        subject: 'Computer Science',
        difficulty_level: 'Beginner',
        prerequisites: [],
        estimated_duration_minutes: 200,
        tags: 'programming, variables, loops, functions, coding'
      },
      {
        title: 'Data Structures and Algorithms',
        description: 'Understand fundamental data structures (arrays, lists, trees) and basic algorithms.',
        subject: 'Computer Science',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 300,
        tags: 'data structures, algorithms, arrays, lists, trees'
      },
      {
        title: 'Object-Oriented Programming',
        description: 'Master the principles of object-oriented programming including classes, inheritance, and polymorphism.',
        subject: 'Computer Science',
        difficulty_level: 'Advanced',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 250,
        tags: 'oop, classes, inheritance, polymorphism, objects'
      },

      // Art
      {
        title: 'Basic Drawing Techniques',
        description: 'Learn fundamental drawing skills including line, shape, shading, and perspective.',
        subject: 'Art',
        difficulty_level: 'Beginner',
        prerequisites: [],
        estimated_duration_minutes: 120,
        tags: 'drawing, line, shape, shading, perspective, visual'
      },
      {
        title: 'Color Theory and Application',
        description: 'Understand color relationships, mixing, and how to use color effectively in artwork.',
        subject: 'Art',
        difficulty_level: 'Intermediate',
        prerequisites: [], // Will be updated after creation
        estimated_duration_minutes: 140,
        tags: 'color theory, mixing, visual, painting, design'
      }
    ];

    // Create objectives and store their IDs
    const createdObjectives = [];
    for (const objective of objectives) {
      try {
        const record = await pb.collection('learning_objectives').create(objective);
        createdObjectives.push({ ...objective, id: record.id });
        console.log(`Created objective: ${objective.title}`);
      } catch (error) {
        console.error(`Failed to create objective ${objective.title}:`, error);
      }
    }

    // Update prerequisites after all objectives are created
    const prerequisiteUpdates = [
      {
        title: 'Linear Equations and Inequalities',
        prerequisites: ['Basic Algebra Fundamentals']
      },
      {
        title: 'Quadratic Functions and Equations',
        prerequisites: ['Basic Algebra Fundamentals', 'Linear Equations and Inequalities']
      },
      {
        title: 'Basic Chemistry Concepts',
        prerequisites: ['Introduction to Scientific Method']
      },
      {
        title: 'Physics: Motion and Forces',
        prerequisites: ['Introduction to Scientific Method', 'Basic Algebra Fundamentals']
      },
      {
        title: 'Essay Writing Fundamentals',
        prerequisites: ['Reading Comprehension Strategies']
      },
      {
        title: 'Literary Analysis and Criticism',
        prerequisites: ['Reading Comprehension Strategies', 'Essay Writing Fundamentals']
      },
      {
        title: 'World War II: Causes and Consequences',
        prerequisites: ['Introduction to Historical Thinking']
      },
      {
        title: 'Data Structures and Algorithms',
        prerequisites: ['Programming Fundamentals']
      },
      {
        title: 'Object-Oriented Programming',
        prerequisites: ['Programming Fundamentals', 'Data Structures and Algorithms']
      },
      {
        title: 'Color Theory and Application',
        prerequisites: ['Basic Drawing Techniques']
      }
    ];

    // Update prerequisites
    for (const update of prerequisiteUpdates) {
      const objective = createdObjectives.find(obj => obj.title === update.title);
      if (objective) {
        const prerequisiteIds = update.prerequisites
          .map(prereqTitle => createdObjectives.find(obj => obj.title === prereqTitle)?.id)
          .filter(id => id !== undefined);

        if (prerequisiteIds.length > 0) {
          try {
            await pb.collection('learning_objectives').update(objective.id, {
              prerequisites: prerequisiteIds
            });
            console.log(`Updated prerequisites for: ${objective.title}`);
          } catch (error) {
            console.error(`Failed to update prerequisites for ${objective.title}:`, error);
          }
        }
      }
    }

    console.log(`Created ${createdObjectives.length} sample learning objectives`);
  },

  async down(pb: PocketBase): Promise<void> {
    console.log('Removing sample learning objectives...');

    try {
      // Get all learning objectives
      const objectives = await pb.collection('learning_objectives').getFullList();
      
      // Delete all objectives
      for (const objective of objectives) {
        await pb.collection('learning_objectives').delete(objective.id);
      }
      
      console.log(`Removed ${objectives.length} learning objectives`);
    } catch (error) {
      console.error('Error removing sample learning objectives:', error);
    }
  }
};