import { Migration } from '../types';
import PocketBase from 'pocketbase';

/**
 * Learning Guide Schema Migration
 * Creates tables for AI-Powered Learning Guide system
 */
const migration: Migration = {
  id: 'learning_guide_schema_001',
  name: 'Learning Guide Schema',
  timestamp: 1737826500000,
  
  async up(pb: PocketBase): Promise<void> {
    console.log('Creating Learning Guide schema...');

    // Create learning_objectives collection
    await pb.collections.create({
      name: 'learning_objectives',
      type: 'base',
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: {
            max: 200
          }
        },
        {
          name: 'description',
          type: 'editor',
          required: true
        },
        {
          name: 'subject',
          type: 'text',
          required: true,
          options: {
            max: 100
          }
        },
        {
          name: 'difficulty_level',
          type: 'select',
          required: true,
          options: {
            values: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
          }
        },
        {
          name: 'prerequisites',
          type: 'relation',
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: false,
            minSelect: 0,
            maxSelect: null,
            displayFields: ['title']
          }
        },
        {
          name: 'estimated_duration_minutes',
          type: 'number',
          required: true,
          options: {
            min: 1
          }
        },
        {
          name: 'tags',
          type: 'text',
          options: {
            max: 500
          }
        }
      ],
      indexes: [
        'CREATE INDEX idx_learning_objectives_subject ON learning_objectives (subject)',
        'CREATE INDEX idx_learning_objectives_difficulty ON learning_objectives (difficulty_level)',
        'CREATE INDEX idx_learning_objectives_duration ON learning_objectives (estimated_duration_minutes)'
      ]
    });

    // Create learning_pathways collection
    await pb.collections.create({
      name: 'learning_pathways',
      type: 'base',
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: {
            max: 200
          }
        },
        {
          name: 'description',
          type: 'editor',
          required: true
        },
        {
          name: 'student_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['name', 'email']
          }
        },
        {
          name: 'objectives',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: false,
            minSelect: 1,
            maxSelect: null,
            displayFields: ['title']
          }
        },
        {
          name: 'current_objective_index',
          type: 'number',
          required: true,
          options: {
            min: 0
          }
        },
        {
          name: 'completion_percentage',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 100
          }
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true
        },
        {
          name: 'created_by_ai',
          type: 'bool',
          required: true
        },
        {
          name: 'adaptive_adjustments',
          type: 'json'
        }
      ],
      indexes: [
        'CREATE INDEX idx_learning_pathways_student ON learning_pathways (student_id)',
        'CREATE INDEX idx_learning_pathways_active ON learning_pathways (is_active)',
        'CREATE INDEX idx_learning_pathways_ai ON learning_pathways (created_by_ai)'
      ]
    });

    // Create learning_style_assessments collection
    await pb.collections.create({
      name: 'learning_style_assessments',
      type: 'base',
      schema: [
        {
          name: 'student_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['name', 'email']
          }
        },
        {
          name: 'visual_score',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 100
          }
        },
        {
          name: 'auditory_score',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 100
          }
        },
        {
          name: 'kinesthetic_score',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 100
          }
        },
        {
          name: 'reading_writing_score',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 100
          }
        },
        {
          name: 'primary_style',
          type: 'select',
          required: true,
          options: {
            values: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Multimodal']
          }
        },
        {
          name: 'assessment_responses',
          type: 'json',
          required: true
        },
        {
          name: 'completed_at',
          type: 'date',
          required: true
        }
      ],
      indexes: [
        'CREATE INDEX idx_learning_style_assessments_student ON learning_style_assessments (student_id)',
        'CREATE INDEX idx_learning_style_assessments_style ON learning_style_assessments (primary_style)',
        'CREATE INDEX idx_learning_style_assessments_completed ON learning_style_assessments (completed_at)'
      ]
    });

    // Create student_progress collection
    await pb.collections.create({
      name: 'student_progress',
      type: 'base',
      schema: [
        {
          name: 'student_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['name', 'email']
          }
        },
        {
          name: 'objective_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['title']
          }
        },
        {
          name: 'pathway_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'learning_pathways',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['title']
          }
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: {
            values: ['Not Started', 'In Progress', 'Completed', 'Mastered', 'Needs Review']
          }
        },
        {
          name: 'completion_percentage',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 100
          }
        },
        {
          name: 'time_spent_minutes',
          type: 'number',
          required: true,
          options: {
            min: 0
          }
        },
        {
          name: 'attempts',
          type: 'number',
          required: true,
          options: {
            min: 0
          }
        },
        {
          name: 'last_accessed',
          type: 'date'
        },
        {
          name: 'mastery_score',
          type: 'number',
          options: {
            min: 0,
            max: 1
          }
        }
      ],
      indexes: [
        'CREATE INDEX idx_student_progress_student ON student_progress (student_id)',
        'CREATE INDEX idx_student_progress_objective ON student_progress (objective_id)',
        'CREATE INDEX idx_student_progress_pathway ON student_progress (pathway_id)',
        'CREATE INDEX idx_student_progress_status ON student_progress (status)',
        'CREATE INDEX idx_student_progress_accessed ON student_progress (last_accessed)'
      ]
    });

    // Create learning_recommendations collection
    await pb.collections.create({
      name: 'learning_recommendations',
      type: 'base',
      schema: [
        {
          name: 'student_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['name', 'email']
          }
        },
        {
          name: 'recommendation_type',
          type: 'select',
          required: true,
          options: {
            values: ['Next Objective', 'Review Content', 'Skill Gap', 'Learning Style Match', 'Difficulty Adjustment']
          }
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          options: {
            max: 200
          }
        },
        {
          name: 'description',
          type: 'editor',
          required: true
        },
        {
          name: 'objective_id',
          type: 'relation',
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['title']
          }
        },
        {
          name: 'priority',
          type: 'select',
          required: true,
          options: {
            values: ['Low', 'Medium', 'High', 'Critical']
          }
        },
        {
          name: 'confidence_score',
          type: 'number',
          required: true,
          options: {
            min: 0,
            max: 1
          }
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true
        },
        {
          name: 'generated_at',
          type: 'date',
          required: true
        },
        {
          name: 'ai_reasoning',
          type: 'editor'
        }
      ],
      indexes: [
        'CREATE INDEX idx_learning_recommendations_student ON learning_recommendations (student_id)',
        'CREATE INDEX idx_learning_recommendations_type ON learning_recommendations (recommendation_type)',
        'CREATE INDEX idx_learning_recommendations_priority ON learning_recommendations (priority)',
        'CREATE INDEX idx_learning_recommendations_active ON learning_recommendations (is_active)',
        'CREATE INDEX idx_learning_recommendations_generated ON learning_recommendations (generated_at)'
      ]
    });

    console.log('Learning Guide schema created successfully');
  },

  async down(pb: PocketBase): Promise<void> {
    console.log('Dropping Learning Guide schema...');

    // Drop collections in reverse order to handle dependencies
    const collections = [
      'learning_recommendations',
      'student_progress',
      'learning_style_assessments',
      'learning_pathways',
      'learning_objectives'
    ];

    for (const collectionName of collections) {
      try {
        await pb.collections.delete(collectionName);
        console.log(`Dropped collection: ${collectionName}`);
      } catch (error) {
        console.warn(`Failed to drop collection ${collectionName}:`, error);
      }
    }

    console.log('Learning Guide schema dropped successfully');
  }
};

export default migration;