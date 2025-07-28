const PocketBase = require('pocketbase/cjs');

// Initialize PocketBase client
const pb = new PocketBase('http://127.0.0.1:8090');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const userData = {
      email: 'test@school.com',
      password: 'test123456',
      passwordConfirm: 'test123456',
      name: 'Test User'
    };
    
    const user = await pb.collection('users').create(userData);
    console.log('✓ Test user created successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('ID:', user.id);
    
    console.log('\nYou can now login with:');
    console.log('Email: test@school.com');
    console.log('Password: test123456');
    
  } catch (error) {
    console.error('Error creating test user:', error);
    
    if (error.status === 400) {
      console.log('\nThis might mean:');
      console.log('1. User already exists');
      console.log('2. Password too short');
      console.log('3. Invalid email format');
    }
  }
}

// Check if PocketBase is running
async function checkPocketBaseStatus() {
  try {
    await pb.health.check();
    console.log('PocketBase is running.');
    return true;
  } catch (error) {
    console.error('PocketBase is not running. Please start PocketBase first.');
    return false;
  }
}

async function main() {
  const isPocketBaseRunning = await checkPocketBaseStatus();
  if (!isPocketBaseRunning) {
    return;
  }
  
  await createTestUser();
}

main();