import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import { Enrollment, SchoolUser, EnrollmentStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const pb = await getDb();
    const { classId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build filter
    let filter = `classId="${classId}"`;
    if (status) {
      filter += ` && status="${status}"`;
    }

    // Get enrollments with student and status information
    const enrollmentRecords = await pb.collection('enrollments').getFullList({
      filter,
      expand: 'studentId,status',
      sort: '-created',
    });

    // Map to enriched enrollment data
    const enrollments = enrollmentRecords.map(record => {
      const student = record.expand?.studentId;
      const enrollmentStatus = record.expand?.status;

      return {
        id: record.id,
        studentId: record.studentId,
        classId: record.classId,
        status: record.status,
        enrollmentDate: record.enrollmentDate,
        steps: record.steps || [],
        // Additional data for roster view
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role,
          department: student.department,
          avatarUrl: student.avatarUrl || '',
        } : null,
        statusInfo: enrollmentStatus ? {
          id: enrollmentStatus.id,
          name: enrollmentStatus.name,
          description: enrollmentStatus.description,
          color: enrollmentStatus.color,
        } : null,
      };
    });

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error('Error fetching class enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class enrollments' },
      { status: 500 }
    );
  }
}