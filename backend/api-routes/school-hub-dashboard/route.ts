import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { SchoolHubDashboardData } from '@/types';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    if (!department) {
        return NextResponse.json({ error: 'Department parameter is required' }, { status: 400 });
    }

    try {
        // Fetch dashboard data for the specified department
        const record = await pb.collection('school_hub_dashboard').getFirstListItem(`department = "${department}"`);
        
        if (!record) {
            return NextResponse.json({ error: 'Dashboard data not found for the specified department' }, { status: 404 });
        }
        
        // Parse the JSON fields
        const dashboardData: SchoolHubDashboardData = {
            metrics: JSON.parse(record.metrics),
            events: JSON.parse(record.events),
            announcement: JSON.parse(record.announcement)
        };
        
        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error(`Failed to fetch dashboard data for department: ${department}`, error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}