#!/bin/bash

# Test script for complete quiz system flow
API_URL="https://test-system-m678.onrender.com/api"

echo "================================="
echo "QUIZ SYSTEM FULL FLOW TEST"
echo "================================="
echo ""

# Test 1: Register as Admin
echo "1️⃣ Testing Admin Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_admin_'$RANDOM'",
    "email": "testadmin'$RANDOM'@example.com",
    "password": "test123",
    "role": "admin"
  }')

echo "Register Response: $REGISTER_RESPONSE"
ADMIN_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to register admin"
  exit 1
fi
echo "✅ Admin registered successfully"
echo "Admin Token: $ADMIN_TOKEN"
echo ""

# Test 2: Create Quiz with Questions
echo "2️⃣ Testing Quiz Creation with Questions..."
QUIZ_CODE=$(printf "%06d" $((RANDOM % 1000000)))
echo "Generated Quiz Code: $QUIZ_CODE"

CREATE_QUIZ_RESPONSE=$(curl -s -X POST "$API_URL/quiz" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Test Quiz - Math Basics",
    "description": "A simple math quiz for testing",
    "category": "Mathematics",
    "timeLimit": 30,
    "passingScore": 70,
    "quizCode": "'$QUIZ_CODE'",
    "startMode": "auto",
    "isActive": true,
    "isPublic": true,
    "questions": [
      {
        "text": "What is 2 + 2?",
        "type": "multiple-choice",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": 1
      },
      {
        "text": "What is 5 x 3?",
        "type": "multiple-choice",
        "options": ["10", "15", "20", "25"],
        "correctAnswer": 1
      },
      {
        "text": "What is 10 - 7?",
        "type": "multiple-choice",
        "options": ["2", "3", "4", "5"],
        "correctAnswer": 1
      }
    ]
  }')

echo "Create Quiz Response: $CREATE_QUIZ_RESPONSE"
QUIZ_ID=$(echo $CREATE_QUIZ_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$QUIZ_ID" ]; then
  echo "❌ Failed to create quiz"
  exit 1
fi
echo "✅ Quiz created successfully"
echo "Quiz ID: $QUIZ_ID"
echo ""

# Test 3: Access Quiz by Code (Guest)
echo "3️⃣ Testing Guest Access by Code..."
ACCESS_RESPONSE=$(curl -s -X GET "$API_URL/quiz/access-by-code/$QUIZ_CODE")
echo "Access Response: $ACCESS_RESPONSE"

QUESTION_COUNT=$(echo $ACCESS_RESPONSE | grep -o '"questions":\[[^]]*\]' | grep -o '"text"' | wc -l)
echo "Questions found: $QUESTION_COUNT"

if [ "$QUESTION_COUNT" -eq 0 ]; then
  echo "❌ No questions found in quiz!"
  exit 1
fi
echo "✅ Quiz accessed successfully with $QUESTION_COUNT questions"
echo ""

# Test 4: Register as Student
echo "4️⃣ Testing Student Registration..."
STUDENT_REGISTER=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student_'$RANDOM'",
    "email": "teststudent'$RANDOM'@example.com",
    "password": "test123",
    "role": "user"
  }')

echo "Student Register Response: $STUDENT_REGISTER"
STUDENT_TOKEN=$(echo $STUDENT_REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$STUDENT_TOKEN" ]; then
  echo "❌ Failed to register student"
  exit 1
fi
echo "✅ Student registered successfully"
echo ""

# Test 5: Get Admin's Quizzes
echo "5️⃣ Testing Get Admin Quizzes..."
ADMIN_QUIZZES=$(curl -s -X GET "$API_URL/quiz/my-quizzes" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Admin Quizzes: $ADMIN_QUIZZES"
echo ""

echo "================================="
echo "✅ ALL TESTS COMPLETED SUCCESSFULLY!"
echo "================================="
echo ""
echo "Summary:"
echo "- Admin registered: ✅"
echo "- Quiz created: ✅ (ID: $QUIZ_ID, Code: $QUIZ_CODE)"
echo "- Questions saved: ✅ ($QUESTION_COUNT questions)"
echo "- Guest access: ✅"
echo "- Student registered: ✅"
echo ""
echo "🎮 Test the quiz at: https://test-system-mu.vercel.app/play"
echo "🔢 Use code: $QUIZ_CODE"
