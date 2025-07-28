import { NextResponse } from 'next/server';
import { fetchSchoolUsers } from '@/lib/backend-integration';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    if (!department) {
        return NextResponse.json({ error: 'Department parameter is required' }, { status: 400 });
    }

    try {
        // Use the real backend integration
        const users = await fetchSchoolUsers(department);
        return NextResponse.json(users);
    } catch (error) {
        console.error(`Failed to fetch users for department: ${department}`, error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}