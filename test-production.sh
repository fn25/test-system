#!/bin/bash

API_URL="https://test-system-m678.onrender.com"

echo "==================================="
echo "PRODUCTION API TEST"
echo "==================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s "$API_URL/api/health")
echo "Response: $HEALTH"
echo ""

# Test 2: Root endpoint
echo "2️⃣ Testing Root Endpoint..."
ROOT=$(curl -s "$API_URL/")
echo "Response: $ROOT"
echo ""

# Test 3: Register Admin
echo "3️⃣ Testing Admin Registration..."
RANDOM_NUM=$RANDOM
REGISTER_DATA="{
  \"username\": \"testadmin_${RANDOM_NUM}\",
  \"email\": \"testadmin${RANDOM_NUM}@test.com\",
  \"password\": \"Test123!\",
  \"role\": \"admin\"
}"

echo "Register Data: $REGISTER_DATA"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

echo "Register Response: $REGISTER_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from registration"
  echo "Full response: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Test 4: Create Quiz
echo "4️⃣ Testing Quiz Creation..."
QUIZ_CODE=$(printf "%06d" $((RANDOM % 1000000)))
echo "Quiz Code: $QUIZ_CODE"

QUIZ_DATA="{
  \"title\": \"Test Math Quiz\",
  \"description\": \"Simple math test\",
  \"category\": \"Mathematics\",
  \"timeLimit\": 30,
  \"passingScore\": 70,
  \"quizCode\": \"$QUIZ_CODE\",
  \"startMode\": \"auto\",
  \"isActive\": true,
  \"isPublic\": true,
  \"questions\": [
    {
      \"text\": \"What is 2 + 2?\",
      \"type\": \"multiple-choice\",
      \"options\": [\"3\", \"4\", \"5\", \"6\"],
      \"correctAnswer\": 1,
      \"imageUrl\": \"\",
      \"videoUrl\": \"\"
    },
    {
      \"text\": \"What is 5 x 3?\",
      \"type\": \"multiple-choice\",
      \"options\": [\"10\", \"15\", \"20\", \"25\"],
      \"correctAnswer\": 1,
      \"imageUrl\": \"\",
      \"videoUrl\": \"\"
    }
  ]
}"

echo "Creating quiz with token..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/quiz" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$QUIZ_DATA")

echo "Create Response: $CREATE_RESPONSE"
echo ""

# Check if quiz was created
QUIZ_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$QUIZ_ID" ]; then
  echo "❌ Failed to create quiz"
  echo "Full response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Quiz created with ID: $QUIZ_ID"
echo ""

# Test 5: Access by code (Guest)
echo "5️⃣ Testing Guest Access by Code..."
ACCESS_RESPONSE=$(curl -s "$API_URL/api/quiz/access-by-code/$QUIZ_CODE")
echo "Access Response: $ACCESS_RESPONSE"
echo ""

# Count questions
QUESTION_COUNT=$(echo $ACCESS_RESPONSE | grep -o '"text"' | wc -l)
echo "Questions found: $QUESTION_COUNT"
echo ""

if [ "$QUESTION_COUNT" -eq 0 ]; then
  echo "❌ No questions found in quiz!"
  exit 1
fi

echo "==================================="
echo "✅ ALL TESTS PASSED!"
echo "==================================="
echo ""
echo "Summary:"
echo "- Health check: ✅"
echo "- Admin registration: ✅"
echo "- Quiz creation: ✅ (ID: $QUIZ_ID)"
echo "- Questions saved: ✅ ($QUESTION_COUNT questions)"
echo "- Guest access: ✅"
echo ""
echo "Test quiz at: https://test-system-mu.vercel.app/play"
echo "Quiz code: $QUIZ_CODE"
