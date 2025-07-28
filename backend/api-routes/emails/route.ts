
import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');

    if (!folder) {
        return NextResponse.json({ error: 'Folder parameter is required' }, { status: 400 });
    }

    try {
        // Use PocketBase directly to fetch emails
        const emailRecords = await pb.collection('emails').getList(1, 50, {
            filter: `folder = "${folder}"`,
            sort: '-timestamp',
            expand: 'sender,recipients'
        });
        
        // Transform the records to match the expected format
        const emails = emailRecords.items.map(record => ({
            id: record.id,
            sender: record.expand?.sender?.name || record.sender,
            subject: record.subject,
            snippet: record.body.substring(0, 100) + '...',
            time: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: record.unread,
            body: record.body,
            folder: record.folder
        }));
        
        return NextResponse.json(emails);
    } catch (error) {
        console.error(`Failed to fetch emails for folder: ${folder}`, error);
        return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.subject || !body.body || !body.recipients) {
            return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
        }
        
        // Create a new email record
        const newEmail = await pb.collection('emails').create({
            sender: body.sender || pb.authStore.model?.id,
            recipients: body.recipients,
            subject: body.subject,
            body: body.body,
            folder: 'Sent',
            unread: false,
            timestamp: new Date().toISOString()
        });
        
        return NextResponse.json(newEmail, { status: 201 });
    } catch (error) {
        console.error('Failed to send email', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ error: 'Failed to send email', details: message }, { status: 500 });
    }
}