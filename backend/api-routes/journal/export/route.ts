import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '../../../../backend/services/journalService';

const journalService = new JournalService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const format = searchParams.get('format') as 'json' | 'csv' || 'json';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be json or csv' },
        { status: 400 }
      );
    }

    const exportData = await journalService.exportJournalData(userId, format);
    
    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    const filename = `journal-export-${new Date().toISOString().split('T')[0]}.${format}`;

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting journal data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}