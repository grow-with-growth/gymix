import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { 
  auth, 
  calendar, 
  users, 
  knowledge, 
  emails, 
  marketplace, 
  games, 
  media, 
  schoolHub, 
  storage, 
  ai, 
  search 
} from '@/lib/backend-integration';
import { emailService } from '@/lib/email-service';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

// Handle GET requests for basic health checks
export async function GET(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: 'Unified API is running',
    timestamp: new Date().toISOString()
  });
}

// Unified API handler
export async function POST(request: Request) {
  try {
    const { service, action, params } = await request.json();
    
    // Handle authentication
    if (service === 'auth') {
      if (action === 'login') {
        const { email, password } = params;
        const user = await auth.login(email, password);
        return NextResponse.json({ success: true, data: user });
      } 
      else if (action === 'register') {
        const { email, password, name, role } = params;
        const user = await auth.register(email, password, name, role);
        return NextResponse.json({ success: true, data: user });
      } 
      else if (action === 'logout') {
        auth.logout();
        return NextResponse.json({ success: true });
      }
      else if (action === 'check') {
        return NextResponse.json({ 
          success: true, 
          isAuthenticated: auth.isAuthenticated,
          user: auth.user
        });
      }
    }
    
    // Handle calendar
    else if (service === 'calendar') {
      if (action === 'getEvents') {
        const { year, month } = params;
        const events = await calendar.getEvents(year, month);
        return NextResponse.json({ success: true, data: events });
      }
      else if (action === 'createEvent') {
        const event = await calendar.createEvent(params);
        return NextResponse.json({ success: true, data: event });
      }
    }
    
    // Handle users
    else if (service === 'users') {
      if (action === 'getByDepartment') {
        const { department } = params;
        const userList = await users.getByDepartment(department);
        return NextResponse.json({ success: true, data: userList });
      }
      else if (action === 'search') {
        const { query } = params;
        const userList = await users.search(query);
        return NextResponse.json({ success: true, data: userList });
      }
    }
    
    // Handle knowledge base
    else if (service === 'knowledge') {
      if (action === 'getArticles') {
        const articles = await knowledge.getArticles();
        return NextResponse.json({ success: true, data: articles });
      }
      else if (action === 'search') {
        const { query } = params;
        const articles = await knowledge.search(query);
        return NextResponse.json({ success: true, data: articles });
      }
    }
    
    // Handle emails
    else if (service === 'emails') {
      if (action === 'getByFolder') {
        const { folder } = params;
        const emailList = await emails.getByFolder(folder);
        return NextResponse.json({ success: true, data: emailList });
      }
      else if (action === 'send') {
        // First send the email via SMTP
        const { to, subject, text, html, cc, bcc, replyTo, attachments } = params;
        
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
        
        // Then store it in the database
        const email = await emails.send(params);
        
        return NextResponse.json({ 
          success: true, 
          data: email,
          messageId: result.messageId
        });
      }
    }
    
    // Handle marketplace
    else if (service === 'marketplace') {
      if (action === 'getProducts') {
        const products = await marketplace.getProducts();
        return NextResponse.json({ success: true, data: products });
      }
      else if (action === 'getProductsByCategory') {
        const { category } = params;
        const products = await marketplace.getProductsByCategory(category);
        return NextResponse.json({ success: true, data: products });
      }
    }
    
    // Handle games
    else if (service === 'games') {
      if (action === 'getGames') {
        const gamesList = await games.getGames();
        return NextResponse.json({ success: true, data: gamesList });
      }
      else if (action === 'getGamesByCategory') {
        const { category } = params;
        const gamesList = await games.getGamesByCategory(category);
        return NextResponse.json({ success: true, data: gamesList });
      }
    }
    
    // Handle media
    else if (service === 'media') {
      if (action === 'getMediaByType') {
        const { type } = params;
        const mediaList = await media.getMediaByType(type);
        return NextResponse.json({ success: true, data: mediaList });
      }
    }
    
    // Handle school hub
    else if (service === 'schoolHub') {
      if (action === 'getDashboardData') {
        const { department } = params;
        const dashboardData = await schoolHub.getDashboardData(department);
        return NextResponse.json({ success: true, data: dashboardData });
      }
    }
    
    // Handle AI
    else if (service === 'ai') {
      if (action === 'generateInsights') {
        const insights = await ai.generateInsights();
        return NextResponse.json({ success: true, data: insights });
      }
      else if (action === 'generateText') {
        const { prompt } = params;
        const text = await ai.generateText(prompt);
        return NextResponse.json({ success: true, data: text });
      }
    }
    
    // Handle search
    else if (service === 'search') {
      if (action === 'searchAll') {
        const { query } = params;
        const results = await search.searchAll(query);
        return NextResponse.json({ success: true, data: results });
      }
    }
    
    // Handle file storage
    else if (service === 'storage') {
      if (action === 'getFileUrl') {
        const { record, filename } = params;
        const url = storage.getFileUrl(record, filename);
        return NextResponse.json({ success: true, data: url });
      }
    }
    
    // If we get here, the service or action wasn't recognized
    return NextResponse.json({ 
      success: false, 
      error: `Unknown service or action: ${service}/${action}` 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Unified API error:', error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred processing the request', 
      details: message 
    }, { status: 500 });
  }
}

// For file uploads
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    const result = await storage.uploadFile(file, folder);
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    console.error('File upload error:', error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred uploading the file', 
      details: message 
    }, { status: 500 });
  }
}