/**
 * Migration: Add Class Roster Test Data
 * Creates sample classes, enrollment statuses, and enrollments for testing the class roster view
 */

async function up(pb) {
  console.log('Running migration: Add Class Roster Test Data');

  try {
    // Create enrollment statuses
    const enrollmentStatuses = [
      {
        name: 'Pending',
        description: 'Enrollment application submitted, awaiting review',
        color: '#f59e0b'
      },
      {
        name: 'In Progress',
        description: 'Enrollment steps are being completed',
        color: '#3b82f6'
      },
      {
        name: 'Approved',
        description: 'All steps completed, awaiting final confirmation',
        color: '#10b981'
      },
      {
        name: 'Completed',
        description: 'Enrollment finalized and student is active',
        color: '#059669'
      },
      {
        name: 'Rejected',
        description: 'Enrollment application was rejected',
        color: '#ef4444'
      },
      {
        name: 'Withdrawn',
        description: 'Student withdrew from enrollment process',
        color: '#6b7280'
      }
    ];

    console.log('Creating enrollment statuses...');
    const createdStatuses = {};
    for (const status of enrollmentStatuses) {
      try {
        // Check if status already exists
        const existing = await pb.collection('enrollment_statuses').getFirstListItem(
          `name="${status.name}"`
        ).catch(() => null);

        if (!existing) {
          const created = await pb.collection('enrollment_statuses').create(status);
          createdStatuses[status.name] = created.id;
          console.log(`Created enrollment status: ${status.name}`);
        } else {
          createdStatuses[status.name] = existing.id;
          console.log(`Enrollment status already exists: ${status.name}`);
        }
      } catch (error) {
        console.error(`Error creating enrollment status ${status.name}:`, error);
      }
    }

    // Get existing users to use as teachers and students
    const users = await pb.collection('users').getFullList();
    const teachers = users.filter(user => user.role === 'Teacher');
    const students = users.filter(user => user.role === 'Student');

    if (teachers.length === 0) {
      console.log('No teachers found, creating sample teacher...');
      const teacher = await pb.collection('users').create({
        email: 'teacher@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        name: 'Dr. Sarah Johnson',
        role: 'Teacher',
        department: 'Computer Science'
      });
      teachers.push(teacher);
    }

    if (students.length === 0) {
      console.log('No students found, creating sample students...');
      const sampleStudents = [
        {
          email: 'alice@example.com',
          password: 'password123',
          passwordConfirm: 'password123',
          name: 'Alice Smith',
          role: 'Student',
          department: 'Computer Science'
        },
        {
          email: 'bob@example.com',
          password: 'password123',
          passwordConfirm: 'password123',
          name: 'Bob Johnson',
          role: 'Student',
          department: 'Computer Science'
        },
        {
          email: 'carol@example.com',
          password: 'password123',
          passwordConfirm: 'password123',
          name: 'Carol Davis',
          role: 'Student',
          department: 'Mathematics'
        }
      ];

      for (const studentData of sampleStudents) {
        try {
          const student = await pb.collection('users').create(studentData);
          students.push(student);
          console.log(`Created sample student: ${studentData.name}`);
        } catch (error) {
          console.error(`Error creating student ${studentData.name}:`, error);
        }
      }
    }

    // Create sample classes
    const sampleClasses = [
      {
        name: 'Introduction to Programming',
        description: 'Learn the fundamentals of programming using Python',
        capacity: 25,
        currentEnrollment: 0,
        teacherId: teachers[0].id,
        department: 'Computer Science'
      },
      {
        name: 'Data Structures and Algorithms',
        description: 'Advanced programming concepts and algorithmic thinking',
        capacity: 20,
        currentEnrollment: 0,
        teacherId: teachers[0].id,
        department: 'Computer Science'
      },
      {
        name: 'Calculus I',
        description: 'Introduction to differential and integral calculus',
        capacity: 30,
        currentEnrollment: 0,
        teacherId: teachers[Math.min(1, teachers.length - 1)].id,
        department: 'Mathematics'
      }
    ];

    console.log('Creating sample classes...');
    const createdClasses = [];
    for (const classData of sampleClasses) {
      try {
        // Check if class already exists
        const existing = await pb.collection('classes').getFirstListItem(
          `name="${classData.name}"`
        ).catch(() => null);

        if (!existing) {
          const created = await pb.collection('classes').create(classData);
          createdClasses.push(created);
          console.log(`Created class: ${classData.name}`);
        } else {
          createdClasses.push(existing);
          console.log(`Class already exists: ${classData.name}`);
        }
      } catch (error) {
        console.error(`Error creating class ${classData.name}:`, error);
      }
    }

    // Create sample enrollments
    if (students.length > 0 && createdClasses.length > 0) {
      console.log('Creating sample enrollments...');
      
      const sampleEnrollments = [
        {
          studentId: students[0].id,
          classId: createdClasses[0].id,
          status: createdStatuses['Completed'],
          enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          steps: [
            { id: 'student_info', name: 'Student Information', description: 'Complete student personal and contact information', order: 1, isRequired: true, isCompleted: true, formData: { completed: true } },
            { id: 'class_selection', name: 'Class Selection Confirmation', description: 'Confirm class selection and schedule', order: 2, isRequired: true, isCompleted: true, formData: { completed: true } },
            { id: 'document_upload', name: 'Document Upload', description: 'Upload required documents', order: 3, isRequired: true, isCompleted: true, formData: { completed: true } },
            { id: 'payment', name: 'Payment Processing', description: 'Complete tuition and fee payment', order: 4, isRequired: true, isCompleted: true, formData: { completed: true } },
            { id: 'final_review', name: 'Final Review', description: 'Administrative review and approval', order: 5, isRequired: true, isCompleted: true, formData: { completed: true } }
          ]
        },
        {
          studentId: students[Math.min(1, students.length - 1)].id,
          classId: createdClasses[0].id,
          status: createdStatuses['In Progress'],
          enrollmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          steps: [
            { id: 'student_info', name: 'Student Information', description: 'Complete student personal and contact information', order: 1, isRequired: true, isCompleted: true, formData: { completed: true } },
            { id: 'class_selection', name: 'Class Selection Confirmation', description: 'Confirm class selection and schedule', order: 2, isRequired: true, isCompleted: true, formData: { completed: true } },
            { id: 'document_upload', name: 'Document Upload', description: 'Upload required documents', order: 3, isRequired: true, isCompleted: false },
            { id: 'payment', name: 'Payment Processing', description: 'Complete tuition and fee payment', order: 4, isRequired: true, isCompleted: false },
            { id: 'final_review', name: 'Final Review', description: 'Administrative review and approval', order: 5, isRequired: true, isCompleted: false }
          ]
        }
      ];

      if (students.length > 2) {
        sampleEnrollments.push({
          studentId: students[2].id,
          classId: createdClasses[Math.min(2, createdClasses.length - 1)].id,
          status: createdStatuses['Pending'],
          enrollmentDate: new Date().toISOString(),
          steps: [
            { id: 'student_info', name: 'Student Information', description: 'Complete student personal and contact information', order: 1, isRequired: true, isCompleted: false },
            { id: 'class_selection', name: 'Class Selection Confirmation', description: 'Confirm class selection and schedule', order: 2, isRequired: true, isCompleted: false },
            { id: 'document_upload', name: 'Document Upload', description: 'Upload required documents', order: 3, isRequired: true, isCompleted: false },
            { id: 'payment', name: 'Payment Processing', description: 'Complete tuition and fee payment', order: 4, isRequired: true, isCompleted: false },
            { id: 'final_review', name: 'Final Review', description: 'Administrative review and approval', order: 5, isRequired: true, isCompleted: false }
          ]
        });
      }

      for (const enrollmentData of sampleEnrollments) {
        try {
          // Check if enrollment already exists
          const existing = await pb.collection('enrollments').getFirstListItem(
            `studentId="${enrollmentData.studentId}" && classId="${enrollmentData.classId}"`
          ).catch(() => null);

          if (!existing) {
            await pb.collection('enrollments').create(enrollmentData);
            console.log(`Created enrollment for student ${enrollmentData.studentId} in class ${enrollmentData.classId}`);
            
            // Update class enrollment count for completed enrollments
            if (enrollmentData.status === createdStatuses['Completed']) {
              const classRecord = await pb.collection('classes').getOne(enrollmentData.classId);
              await pb.collection('classes').update(enrollmentData.classId, {
                currentEnrollment: classRecord.currentEnrollment + 1
              });
            }
          } else {
            console.log(`Enrollment already exists for student ${enrollmentData.studentId} in class ${enrollmentData.classId}`);
          }
        } catch (error) {
          console.error(`Error creating enrollment:`, error);
        }
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down(pb) {
  console.log('Rolling back migration: Add Class Roster Test Data');
  
  try {
    // Remove sample enrollments
    const enrollments = await pb.collection('enrollments').getFullList();
    for (const enrollment of enrollments) {
      await pb.collection('enrollments').delete(enrollment.id);
    }

    // Remove sample classes
    const classes = await pb.collection('classes').getFullList();
    for (const cls of classes) {
      await pb.collection('classes').delete(cls.id);
    }

    // Remove enrollment statuses
    const statuses = await pb.collection('enrollment_statuses').getFullList();
    for (const status of statuses) {
      await pb.collection('enrollment_statuses').delete(status.id);
    }

    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };