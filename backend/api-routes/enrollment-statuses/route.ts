import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import { EnrollmentStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const pb = await getDb();

    const statusRecords = await pb.collection('enrollment_statuses').getFullList({
      sort: 'name',
    });

    const statuses: EnrollmentStatus[] = statusRecords.map(record => ({
      id: record.id,
      name: record.name,
      description: record.description,
      color: record.color,
    }));

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error('Error fetching enrollment statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment statuses' },
      { status: 500 }
    );
  }
}