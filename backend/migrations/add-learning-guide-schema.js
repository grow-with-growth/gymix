// Migration to add AI-Powered Learning Guide schema
// This migration adds collections for learning pathways, learning styles, and related data

const migration = {
  id: 'add-learning-guide-schema',
  name: 'Add AI-Powered Learning Guide Schema',
  timestamp: Date.now(),
  
  async up(pb) {
    // Learning objectives collection
    await pb.collections.create({
      name: 'learning_objectives',
      type: 'base',
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: true
        },
        {
          name: 'subject',
          type: 'text',
          required: true
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
          array: true,
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: false
          }
        },
        {
          name: 'estimated_duration_minutes',
          type: 'number',
          required: true
        },
        {
          name: 'tags',
          type: 'text',
          array: true
        }
      ]
    });

    // Learning pathways collection
    await pb.collections.create({
      name: 'learning_pathways',
      type: 'base',
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: true
        },
        {
          name: 'student_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: true
          }
        },
        {
          name: 'objectives',
          type: 'relation',
          required: true,
          array: true,
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: false
          }
        },
        {
          name: 'current_objective_index',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'completion_percentage',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true,
          default: true
        },
        {
          name: 'created_by_ai',
          type: 'bool',
          required: true,
          default: false
        },
        {
          name: 'adaptive_adjustments',
          type: 'json'
        }
      ]
    });

    // Learning style assessments collection
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
            cascadeDelete: true
          }
        },
        {
          name: 'visual_score',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'auditory_score',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'kinesthetic_score',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'reading_writing_score',
          type: 'number',
          required: true,
          default: 0
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
      ]
    });

    // Student progress tracking collection
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
            cascadeDelete: true
          }
        },
        {
          name: 'objective_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: true
          }
        },
        {
          name: 'pathway_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'learning_pathways',
            cascadeDelete: true
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
          default: 0
        },
        {
          name: 'time_spent_minutes',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'attempts',
          type: 'number',
          required: true,
          default: 0
        },
        {
          name: 'last_accessed',
          type: 'date'
        },
        {
          name: 'mastery_score',
          type: 'number'
        }
      ]
    });

    // Learning recommendations collection
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
            cascadeDelete: true
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
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: true
        },
        {
          name: 'objective_id',
          type: 'relation',
          options: {
            collectionId: 'learning_objectives',
            cascadeDelete: true
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
          required: true
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true,
          default: true
        },
        {
          name: 'generated_at',
          type: 'date',
          required: true
        },
        {
          name: 'ai_reasoning',
          type: 'text'
        }
      ]
    });

    console.log('AI-Powered Learning Guide schema created successfully');
  },

  async down(pb) {
    // Remove collections in reverse order
    await pb.collections.delete('learning_recommendations');
    await pb.collections.delete('student_progress');
    await pb.collections.delete('learning_style_assessments');
    await pb.collections.delete('learning_pathways');
    await pb.collections.delete('learning_objectives');
    
    console.log('AI-Powered Learning Guide schema removed successfully');
  }
};

module.exports = migration;