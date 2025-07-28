import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import { Class, Enrollment, SchoolUser, EnrollmentStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const pb = await getDb();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const teacherId = searchParams.get('teacherId');

    // Build filter
    let filter = '';
    const filters = [];
    
    if (department) {
      filters.push(`department="${department}"`);
    }
    
    if (teacherId) {
      filters.push(`teacherId="${teacherId}"`);
    }
    
    if (filters.length > 0) {
      filter = filters.join(' && ');
    }

    // Get classes with teacher information
    const classRecords = await pb.collection('classes').getFullList({
      filter,
      expand: 'teacherId',
      sort: 'name',
    });

    // Map to Class type
    const classes: Class[] = classRecords.map(record => ({
      id: record.id,
      name: record.name,
      description: record.description || '',
      capacity: record.capacity,
      currentEnrollment: record.currentEnrollment,
      teacherId: record.teacherId,
      department: record.department,
    }));

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const pb = await getDb();
    const body = await request.json();

    const classData = {
      name: body.name,
      description: body.description || '',
      capacity: body.capacity,
      currentEnrollment: 0,
      teacherId: body.teacherId,
      department: body.department,
    };

    const classRecord = await pb.collection('classes').create(classData);

    const newClass: Class = {
      id: classRecord.id,
      name: classRecord.name,
      description: classRecord.description || '',
      capacity: classRecord.capacity,
      currentEnrollment: classRecord.currentEnrollment,
      teacherId: classRecord.teacherId,
      department: classRecord.department,
    };

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}