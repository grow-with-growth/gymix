const PocketBase = require('pocketbase/cjs');
const fs = require('fs');
const path = require('path');

// Initialize PocketBase client
const pb = new PocketBase('http://127.0.0.1:8090');

// Sample data
const sampleData = {
  users: [
    {
      email: 'admin@school.com',
      password: 'admin123',
      passwordConfirm: 'admin123',
      name: 'Admin User',
      role: 'Admin',
      department: 'Administration',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin'
    },
    {
      email: 'teacher@school.com',
      password: 'teacher123',
      passwordConfirm: 'teacher123',
      name: 'Teacher User',
      role: 'Teacher',
      department: 'Teacher',
      avatarUrl: 'https://i.pravatar.cc/150?u=teacher'
    },
    {
      email: 'student@school.com',
      password: 'student123',
      passwordConfirm: 'student123',
      name: 'Student User',
      role: 'Student',
      department: 'Student',
      avatarUrl: 'https://i.pravatar.cc/150?u=student'
    }
  ],
  calendar_events: [
    {
      date: '2025-07-25',
      title: 'Staff Meeting',
      description: 'Monthly staff meeting to discuss progress and plans',
      time: '10:00 AM - 11:30 AM',
      type: 'meeting'
    },
    {
      date: '2025-07-26',
      title: 'Math Exam',
      description: 'Final exam for Advanced Mathematics course',
      time: '9:00 AM - 11:00 AM',
      type: 'exam'
    },
    {
      date: '2025-07-30',
      title: 'Summer Break Begins',
      description: 'First day of summer break',
      type: 'holiday'
    }
  ],
  knowledge_articles: [
    {
      title: 'Student Attendance Policy',
      content: 'All students are expected to attend classes regularly. An absence is considered excused for medical reasons (with a doctor\'s note), family emergencies, or pre-approved educational activities. Unexcused absences may affect grades. For remote learning days, attendance is marked by logging into the school portal and completing the daily check-in assignment by 10 AM.'
    },
    {
      title: 'Grading System and GPA',
      content: 'Our grading system uses a standard A-F letter scale. \'A\' corresponds to 90-100%, \'B\' to 80-89%, \'C\' to 70-79%, \'D\' to 60-69%, and \'F\' below 60%. GPA is calculated on a 4.0 scale. Advanced Placement (AP) courses are weighted, with an \'A\' earning 5.0 points.'
    },
    {
      title: 'IT Support and Device Policy',
      content: 'For technical issues, please contact the IT helpdesk at support@saasschool.com. Students are responsible for their own devices. The school provides secure Wi-Fi access. Any attempt to bypass school network filters is a violation of the acceptable use policy.'
    }
  ],
  marketplace_products: [
    {
      name: 'Advanced Math Textbook',
      category: 'Books',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1576072446584-4a8eec0b2513',
      stock: 25,
      description: 'Comprehensive textbook covering advanced mathematics topics for high school students.'
    },
    {
      name: 'Science Lab Kit',
      category: 'Equipment',
      price: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
      stock: 10,
      description: 'Complete lab kit for conducting various science experiments at home.'
    },
    {
      name: 'School Uniform Set',
      category: 'Clothing',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24',
      stock: 50,
      description: 'Complete school uniform set including shirt, pants/skirt, and tie.'
    }
  ],
  games: [
    {
      title: 'Math Challenge',
      category: 'Educational',
      description: 'Test your math skills with this fun and challenging game.',
      imageUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3',
      config: {
        difficulty: 'medium',
        topics: ['algebra', 'geometry', 'arithmetic']
      }
    },
    {
      title: 'Vocabulary Quest',
      category: 'Language',
      description: 'Expand your vocabulary through an exciting adventure game.',
      imageUrl: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e',
      config: {
        difficulty: 'easy',
        topics: ['synonyms', 'antonyms', 'definitions']
      }
    }
  ],
  media_content: [
    {
      title: 'Introduction to Physics',
      type: 'Series',
      imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa',
      contentUrl: 'https://example.com/videos/intro-physics',
      description: 'A comprehensive series covering the basics of physics.'
    },
    {
      title: 'The History of Art',
      type: 'Movies',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
      contentUrl: 'https://example.com/videos/history-art',
      description: 'A documentary exploring the history and evolution of art.'
    }
  ],
  school_hub_dashboard: [
    {
      department: 'Student',
      metrics: JSON.stringify([
        { label: 'Enrolled Students', value: '8,720', icon: 'Users' },
        { label: 'Avg. Attendance', value: '96.2%', icon: 'UserCheck' },
        { label: 'Avg. GPA', value: '3.41', icon: 'GraduationCap' }
      ]),
      events: JSON.stringify([
        { date: 'Jul 31', title: 'Mid-term Exams Begin', time: 'All Day' },
        { date: 'Aug 15', title: 'Guest Speaker: Dr. Eva Rostova', time: '1:00 PM' },
        { date: 'Aug 22', title: 'Fall Break Begins', time: '3:00 PM' }
      ]),
      announcement: JSON.stringify({
        title: 'Library Hours Extended',
        content: 'For the upcoming mid-term exams, the main library will be open until midnight starting next week.'
      })
    },
    {
      department: 'Teacher',
      metrics: JSON.stringify([
        { label: 'Active Teachers', value: '412', icon: 'Users' },
        { label: 'Avg. Class Size', value: '21', icon: 'Users' },
        { label: 'Curriculums Published', value: '89', icon: 'BookOpen' }
      ]),
      events: JSON.stringify([
        { date: 'Jul 26', title: 'Parent-Teacher Conferences', time: '4:00 PM' },
        { date: 'Aug 03', title: 'Professional Development Day', time: 'All Day' },
        { date: 'Aug 01', title: 'Q2 Grades Due', time: '5:00 PM' }
      ]),
      announcement: JSON.stringify({
        title: 'New Gradebook Software',
        content: 'A mandatory training session for the new "GradeMaster 3.0" software will be held on Aug 3rd.'
      })
    }
  ]
};

// Function to create records
async function createRecords(collection, records, relationMap = {}) {
  console.log(`Creating ${records.length} records in ${collection}...`);
  const createdRecords = [];
  
  for (const record of records) {
    // Handle relations if needed
    for (const [field, relationInfo] of Object.entries(relationMap)) {
      if (record[field]) {
        const relatedRecord = await pb.collection(relationInfo.collection).getFirstListItem(`${relationInfo.field}="${record[field]}"`);
        if (relatedRecord) {
          record[field] = relatedRecord.id;
        }
      }
    }
    
    try {
      const createdRecord = await pb.collection(collection).create(record);
      createdRecords.push(createdRecord);
      console.log(`  Created ${collection} record: ${createdRecord.id}`);
    } catch (error) {
      console.error(`  Error creating ${collection} record:`, error);
    }
  }
  
  return createdRecords;
}

// Main function to initialize data
async function initializeData() {
  try {
    console.log('Starting data initialization...');
    
    // Create admin user first
    console.log('Creating admin user...');
    try {
      const adminUser = await pb.collection('users').create(sampleData.users[0]);
      console.log(`  Created admin user: ${adminUser.id}`);
    } catch (error) {
      console.error('  Error creating admin user:', error);
    }
    
    // Create other users
    const users = await createRecords('users', sampleData.users.slice(1));
    
    // Create calendar events
    const calendarEvents = await createRecords('calendar_events', sampleData.calendar_events);
    
    // Create knowledge articles
    const knowledgeArticles = await createRecords('knowledge_articles', sampleData.knowledge_articles);
    
    // Create marketplace products
    const marketplaceProducts = await createRecords('marketplace_products', sampleData.marketplace_products);
    
    // Create games
    const games = await createRecords('games', sampleData.games);
    
    // Create media content
    const mediaContent = await createRecords('media_content', sampleData.media_content);
    
    // Create school hub dashboard data
    const schoolHubDashboard = await createRecords('school_hub_dashboard', sampleData.school_hub_dashboard);
    
    console.log('Data initialization complete!');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Check if PocketBase is running
async function checkPocketBaseStatus() {
  try {
    await pb.health.check();
    console.log('PocketBase is running.');
    return true;
  } catch (error) {
    console.error('PocketBase is not running. Please start PocketBase before running this script.');
    return false;
  }
}

// Main execution
async function main() {
  const isPocketBaseRunning = await checkPocketBaseStatus();
  if (!isPocketBaseRunning) {
    return;
  }
  
  // Try to authenticate as admin first
  try {
    console.log('Attempting to authenticate as admin...');
    await pb.admins.authWithPassword('admin@example.com', 'admin123');
    console.log('Admin authentication successful.');
  } catch (error) {
    console.log('Admin authentication failed. Proceeding without admin auth...');
    console.log('Note: Some operations may fail without admin authentication.');
  }
  
  // Proceed with data initialization
  try {
    console.log('Proceeding with data initialization...');
    await initializeData();
  } catch (error) {
    console.error('Error during data initialization:', error);
    console.log('Make sure you have imported the schema in PocketBase admin UI.');
  }
}

main();