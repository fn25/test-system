import fetch from 'node-fetch';

// First login to get token
async function testCreateQuiz() {
  try {
    // Login
    console.log('Logging in...');
    const loginResponse = await fetch('http://localhost:10001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'admin',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('Login failed');
      return;
    }

    const token = loginData.data.token;
    console.log('\nToken:', token.substring(0, 20) + '...');

    // Create quiz
    console.log('\nCreating quiz...');
    const quizData = {
      title: 'Test Quiz',
      description: 'Test description',
      quizCode: 'TEST1234',
      isPublic: true,
      timeLimit: 30,
      passingScore: 60
    };

    const createResponse = await fetch('http://localhost:10001/api/quiz', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });

    const createData = await createResponse.json();
    console.log('\nCreate quiz response:', JSON.stringify(createData, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCreateQuiz();
