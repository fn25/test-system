#!/bin/bash

echo "=== TestLash Tizmi API Test ==="
echo ""

BASE_URL="http://localhost:10000/api"

echo "1. Health Check"
curl -s http://localhost:10000/health | jq .
echo ""

echo "2. Register User (with underscore)"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user_123",
    "email": "testuser@example.com",
    "password": "password123",
    "role": "user"
  }')
echo $REGISTER_RESPONSE | jq .
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"
echo ""

echo "3. Register Admin"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }')
echo $ADMIN_RESPONSE | jq .
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')
echo ""

echo "4. Create Quiz with Live Code"
QUIZ_RESPONSE=$(curl -s -X POST $BASE_URL/quiz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Test Quiz",
    "description": "Test quiz description",
    "quizCode": "123456",
    "isLive": true,
    "questions": []
  }')
echo $QUIZ_RESPONSE | jq .
QUIZ_ID=$(echo $QUIZ_RESPONSE | jq -r '.data.quiz.id')
echo ""

echo "5. Access Quiz by Code (numeric)"
curl -s $BASE_URL/quiz/access-by-code/123456 | jq .
echo ""

echo "6. Create Quiz with Alphanumeric Code"
QUIZ2_RESPONSE=$(curl -s -X POST $BASE_URL/quiz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Test Quiz 2",
    "description": "Test quiz 2",
    "quizCode": "QUIZ1234",
    "questions": []
  }')
echo $QUIZ2_RESPONSE | jq .
echo ""

echo "7. Access Quiz by Code (alphanumeric)"
curl -s $BASE_URL/quiz/access-by-code/QUIZ1234 | jq .
echo ""

echo "=== Test Complete ==="
