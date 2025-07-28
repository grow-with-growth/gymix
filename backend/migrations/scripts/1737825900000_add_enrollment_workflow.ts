import { Migration } from '../types';
import PocketBase from 'pocketbase';

/**
 * Enrollment workflow migration
 * This migration creates the collections needed for the enrollment workflow system
 */
const migration: Migration = {
  id: 'add_enrollment_workflow_001',
  name: 'Add Enrollment Workflow',
  timestamp: 1737825900000,
  
  /**
   * Apply the migration
   * @param pb PocketBase instance
   */
  async up(pb: PocketBase): Promise<void> {
    // Create enrollment_statuses collection
    await pb.collections.create({
      name: 'enrollment_statuses',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          type: 'text',
          required: true,
        },
      ],
    });
    
    // Create classes collection
    await pb.collections.create({
      name: 'classes',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: false,
        },
        {
          name: 'capacity',
          type: 'number',
          required: true,
        },
        {
          name: 'currentEnrollment',
          type: 'number',
          required: true,
        },
        {
          name: 'teacherId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: false,
          },
        },
        {
          name: 'department',
          type: 'text',
          required: true,
        },
      ],
    });
    
    // Create enrollments collection
    await pb.collections.create({
      name: 'enrollments',
      schema: [
        {
          name: 'studentId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: false,
          },
        },
        {
          name: 'classId',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'classes',
            cascadeDelete: false,
          },
        },
        {
          name: 'status',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'enrollment_statuses',
            cascadeDelete: false,
          },
        },
        {
          name: 'enrollmentDate',
          type: 'date',
          required: true,
        },
        {
          name: 'steps',
          type: 'json',
          required: true,
        },
      ],
    });
    
    // Insert default enrollment statuses
    const defaultStatuses = [
      {
        name: 'Pending',
        description: 'Enrollment application submitted and pending review',
        color: '#FFA500',
      },
      {
        name: 'In Progress',
        description: 'Enrollment is being processed',
        color: '#007BFF',
      },
      {
        name: 'Approved',
        description: 'Enrollment has been approved',
        color: '#28A745',
      },
      {
        name: 'Rejected',
        description: 'Enrollment has been rejected',
        color: '#DC3545',
      },
      {
        name: 'Completed',
        description: 'Enrollment process is complete',
        color: '#6F42C1',
      },
    ];
    
    for (const status of defaultStatuses) {
      await pb.collection('enrollment_statuses').create(status);
    }
  },
  
  /**
   * Rollback the migration
   * @param pb PocketBase instance
   */
  async down(pb: PocketBase): Promise<void> {
    // Delete enrollments collection
    try {
      await pb.collections.delete('enrollments');
    } catch (error) {
      console.warn('Failed to delete enrollments collection:', error);
    }
    
    // Delete classes collection
    try {
      await pb.collections.delete('classes');
    } catch (error) {
      console.warn('Failed to delete classes collection:', error);
    }
    
    // Delete enrollment_statuses collection
    try {
      await pb.collections.delete('enrollment_statuses');
    } catch (error) {
      console.warn('Failed to delete enrollment_statuses collection:', error);
    }
  },
};

export default migration;