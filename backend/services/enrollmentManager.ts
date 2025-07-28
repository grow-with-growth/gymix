import PocketBase from 'pocketbase';
import { Enrollment, EnrollmentStep, EnrollmentStatus, Class } from '../../types';
import { 
  enrollmentCreateSchema, 
  enrollmentUpdateSchema,
  EnrollmentCreateValidation,
  EnrollmentUpdateValidation 
} from '../validation/schemas';

/**
 * Enrollment Manager
 * Handles enrollment workflow operations including creation, step completion, and finalization
 */
export class EnrollmentManager {
  private pb: PocketBase;

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Start a new enrollment process
   * @param studentId - ID of the student enrolling
   * @param classId - ID of the class to enroll in
   * @returns Promise<Enrollment> - The created enrollment
   */
  async startEnrollment(studentId: string, classId: string): Promise<Enrollment> {
    // Validate that the class exists and has capacity
    const classRecord = await this.pb.collection('classes').getOne(classId);
    if (!classRecord) {
      throw new Error('Class not found');
    }

    if (classRecord.currentEnrollment >= classRecord.capacity) {
      throw new Error('Class is at full capacity');
    }

    // Check if student is already enrolled in this class
    const existingEnrollment = await this.pb.collection('enrollments').getFirstListItem(
      `studentId="${studentId}" && classId="${classId}"`
    ).catch(() => null);

    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this class');
    }

    // Get the default "Pending" status
    const pendingStatus = await this.pb.collection('enrollment_statuses').getFirstListItem(
      'name="Pending"'
    );

    // Define default enrollment steps
    const defaultSteps: EnrollmentStep[] = [
      {
        id: 'student_info',
        name: 'Student Information',
        description: 'Complete student personal and contact information',
        order: 1,
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'class_selection',
        name: 'Class Selection Confirmation',
        description: 'Confirm class selection and schedule',
        order: 2,
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'document_upload',
        name: 'Document Upload',
        description: 'Upload required documents (transcripts, ID, etc.)',
        order: 3,
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'payment',
        name: 'Payment Processing',
        description: 'Complete tuition and fee payment',
        order: 4,
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'final_review',
        name: 'Final Review',
        description: 'Administrative review and approval',
        order: 5,
        isRequired: true,
        isCompleted: false,
      },
    ];

    const enrollmentData: EnrollmentCreateValidation = {
      studentId,
      classId,
      status: pendingStatus.id,
      enrollmentDate: new Date().toISOString(),
      steps: defaultSteps,
    };

    // Validate the enrollment data
    const validatedData = enrollmentCreateSchema.parse(enrollmentData);

    // Create the enrollment record
    const enrollmentRecord = await this.pb.collection('enrollments').create(validatedData);

    return this.mapToEnrollment(enrollmentRecord);
  }

  /**
   * Complete an enrollment step
   * @param enrollmentId - ID of the enrollment
   * @param stepId - ID of the step to complete
   * @param formData - Form data for the step
   * @returns Promise<EnrollmentStep> - The completed step
   */
  async completeStep(
    enrollmentId: string, 
    stepId: string, 
    formData: any
  ): Promise<EnrollmentStep> {
    // Get the enrollment record
    const enrollmentRecord = await this.pb.collection('enrollments').getOne(enrollmentId);
    if (!enrollmentRecord) {
      throw new Error('Enrollment not found');
    }

    const steps: EnrollmentStep[] = enrollmentRecord.steps;
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex === -1) {
      throw new Error('Step not found');
    }

    const step = steps[stepIndex];
    
    if (step.isCompleted) {
      throw new Error('Step is already completed');
    }

    // Update the step
    steps[stepIndex] = {
      ...step,
      isCompleted: true,
      formData,
    };

    // Update the enrollment record
    await this.pb.collection('enrollments').update(enrollmentId, {
      steps,
    });

    // Check if we should update the enrollment status
    await this.updateEnrollmentStatus(enrollmentId, steps);

    return steps[stepIndex];
  }

  /**
   * Finalize the enrollment process
   * @param enrollmentId - ID of the enrollment to finalize
   * @returns Promise<Enrollment> - The finalized enrollment
   */
  async finalizeEnrollment(enrollmentId: string): Promise<Enrollment> {
    // Get the enrollment record
    const enrollmentRecord = await this.pb.collection('enrollments').getOne(enrollmentId);
    if (!enrollmentRecord) {
      throw new Error('Enrollment not found');
    }

    const steps: EnrollmentStep[] = enrollmentRecord.steps;
    
    // Check if all required steps are completed
    const incompleteRequiredSteps = steps.filter(step => step.isRequired && !step.isCompleted);
    if (incompleteRequiredSteps.length > 0) {
      throw new Error(`Cannot finalize enrollment. Incomplete required steps: ${incompleteRequiredSteps.map(s => s.name).join(', ')}`);
    }

    // Get the "Completed" status
    const completedStatus = await this.pb.collection('enrollment_statuses').getFirstListItem(
      'name="Completed"'
    );

    // Update enrollment status to completed
    const updatedRecord = await this.pb.collection('enrollments').update(enrollmentId, {
      status: completedStatus.id,
    });

    // Update class enrollment count
    const classRecord = await this.pb.collection('classes').getOne(enrollmentRecord.classId);
    await this.pb.collection('classes').update(enrollmentRecord.classId, {
      currentEnrollment: classRecord.currentEnrollment + 1,
    });

    return this.mapToEnrollment(updatedRecord);
  }

  /**
   * Get enrollment by ID
   * @param enrollmentId - ID of the enrollment
   * @returns Promise<Enrollment | null> - The enrollment or null if not found
   */
  async getEnrollment(enrollmentId: string): Promise<Enrollment | null> {
    try {
      const enrollmentRecord = await this.pb.collection('enrollments').getOne(enrollmentId);
      return this.mapToEnrollment(enrollmentRecord);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get enrollments for a student
   * @param studentId - ID of the student
   * @returns Promise<Enrollment[]> - Array of enrollments
   */
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const enrollmentRecords = await this.pb.collection('enrollments').getFullList({
      filter: `studentId="${studentId}"`,
      sort: '-created',
    });

    return enrollmentRecords.map(record => this.mapToEnrollment(record));
  }

  /**
   * Get enrollments for a class
   * @param classId - ID of the class
   * @returns Promise<Enrollment[]> - Array of enrollments
   */
  async getClassEnrollments(classId: string): Promise<Enrollment[]> {
    const enrollmentRecords = await this.pb.collection('enrollments').getFullList({
      filter: `classId="${classId}"`,
      sort: '-created',
    });

    return enrollmentRecords.map(record => this.mapToEnrollment(record));
  }

  /**
   * Update enrollment status based on step completion
   * @param enrollmentId - ID of the enrollment
   * @param steps - Current steps array
   */
  private async updateEnrollmentStatus(enrollmentId: string, steps: EnrollmentStep[]): Promise<void> {
    const completedSteps = steps.filter(step => step.isCompleted).length;
    const totalSteps = steps.length;
    const completionPercentage = (completedSteps / totalSteps) * 100;

    let statusName = 'Pending';
    
    if (completionPercentage > 0 && completionPercentage < 100) {
      statusName = 'In Progress';
    } else if (completionPercentage === 100) {
      // Don't automatically set to completed - this should be done via finalizeEnrollment
      statusName = 'Approved';
    }

    const status = await this.pb.collection('enrollment_statuses').getFirstListItem(
      `name="${statusName}"`
    );

    await this.pb.collection('enrollments').update(enrollmentId, {
      status: status.id,
    });
  }

  /**
   * Map PocketBase record to Enrollment type
   * @param record - PocketBase record
   * @returns Enrollment - Mapped enrollment object
   */
  private mapToEnrollment(record: any): Enrollment {
    return {
      id: record.id,
      studentId: record.studentId,
      classId: record.classId,
      status: record.status,
      enrollmentDate: record.enrollmentDate,
      steps: record.steps || [],
    };
  }
}

export default EnrollmentManager;