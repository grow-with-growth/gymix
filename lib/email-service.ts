import nodemailer from 'nodemailer';
import { Email } from '@/types';

// Create a transporter with SMTP settings from environment variables
if (!process.env.EMAIL_SMTP_HOST || !process.env.EMAIL_SMTP_USER || !process.env.EMAIL_SMTP_PASS) {
  console.warn('Email service not properly configured: Missing required environment variables');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT || '465'),
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS
  },
  tls: {
    // Ensure proper certificate validation
    rejectUnauthorized: true
  }
});

// Verify connection configuration
// Only verify in development to avoid build-time errors
if (process.env.NODE_ENV === 'development') {
  transporter.verify()
    .then(() => console.log('SMTP connection verified and ready to send emails'))
    .catch((error: Error) => console.error('SMTP connection error:', error));
} else {
  console.log('Email service initialized (verification skipped in production)');
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export const emailService = {
  /**
   * Send an email using the configured SMTP server
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.EMAIL_SMTP_USER || !process.env.EMAIL_FROM_NAME) {
        throw new Error('Email service not properly configured: Missing required environment variables');
      }
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  },

  /**
   * Format an email for the communications module
   */
  formatEmailForStorage(sentEmail: EmailOptions, recipients: string[]): Omit<Email, 'id'> {
    if (!process.env.EMAIL_SMTP_USER) {
      console.warn('Email service not properly configured: Missing EMAIL_SMTP_USER environment variable');
    }
    
    const emailData: Omit<Email, 'id'> = {
      sender: process.env.EMAIL_SMTP_USER || '',
      subject: sentEmail.subject,
      snippet: (sentEmail.text || sentEmail.html || '').substring(0, 100) + '...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false,
      body: sentEmail.text || sentEmail.html || '',
      folder: 'Sent' as const
    };
    return emailData;
  }
};

export default emailService;