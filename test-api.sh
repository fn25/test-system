#!/bin/bash

# API Testing Script
BASE_URL="http://localhost:10001"
API_URL="$BASE_URL/api"

echo "==============================================="
echo "Testing Quiz Application API"
echo "==============================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | json_pp
echo ""
echo ""

# Test 2: Register User
echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }')
echo "$REGISTER_RESPONSE" | json_pp
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""
echo ""

# Test 3: Login
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | json_pp
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "New Token: $TOKEN"
echo ""
echo ""

# Test 4: Get User Profile
echo "4. Testing Get User Profile..."
curl -s "$API_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Test 5: Create Quiz (Admin only - will fail for regular user)
echo "5. Testing Create Quiz (should fail - user not admin)..."
curl -s -X POST "$API_URL/quiz" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Quiz",
    "description": "This is a test quiz",
    "instructions": "Answer all questions",
    "timeLimit": 30,
    "passingScore": 70,
    "category": "General",
    "difficulty": "easy",
    "isPublic": true
  }' | json_pp
echo ""
echo ""

# Test 6: List Quizzes
echo "6. Testing List Quizzes..."
curl -s "$API_URL/quiz" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

echo "==============================================="
echo "API Testing Complete!"
echo "==============================================="
echo ""
echo "Note: To test admin endpoints, you need to manually"
echo "set the user role to 'admin' in the database."
echo ""
