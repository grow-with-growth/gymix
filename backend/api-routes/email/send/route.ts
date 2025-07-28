import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

export async function POST(request: Request) {
  try {
    // Get auth cookie
    const authCookie = cookies().get('pb_auth')?.value;
    
    if (authCookie) {
      // Load the auth store from the cookie
      pb.authStore.loadFromCookie(`pb_auth=${authCookie}`);
    }
    
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }
    
    // Get the current user
    const user = pb.authStore.model;
    
    // Parse the request body
    const { to, subject, text, html, cc, bcc, replyTo, attachments } = await request.json();
    
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and either text or html' 
      }, { status: 400 });
    }
    
    // Send the email
    const result = await emailService.sendEmail({
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      replyTo,
      attachments
    });
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
    
    // Store the email in PocketBase
    const recipients = Array.isArray(to) ? to : [to];
    
    const emailRecord = await pb.collection('emails').create({
      sender: user?.id,
      recipients: recipients.join(','),
      subject,
      body: text || html || '',
      folder: 'Sent',
      unread: false,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      emailId: emailRecord.id
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send email', 
      details: message 
    }, { status: 500 });
  }
}