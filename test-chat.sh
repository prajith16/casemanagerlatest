#!/bin/bash

# Test Script for AI Chat API
# This script demonstrates how to use the chat endpoint

echo "=== Case Manager AI Chat Test ==="
echo ""

# Step 1: Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5226/api/Authorization/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jdoe"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Make sure the backend is running."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"
echo ""

# Step 2: Send chat message
echo "2. Sending chat message..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:5226/api/Chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "What is the Case Manager application and what are its main features?",
    "sessionId": "test-session-'$(date +%s)'"
  }')

echo "✅ Chat response received:"
echo "$CHAT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHAT_RESPONSE"
echo ""

# Step 3: Ask another question in the same session
SESSION_ID=$(echo $CHAT_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

echo "3. Asking follow-up question in session: $SESSION_ID"
CHAT_RESPONSE2=$(curl -s -X POST http://localhost:5226/api/Chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "How do I create a new case?",
    "sessionId": "'$SESSION_ID'"
  }')

echo "✅ Follow-up response received:"
echo "$CHAT_RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$CHAT_RESPONSE2"
echo ""

# Step 4: Get chat history
echo "4. Getting chat history..."
HISTORY_RESPONSE=$(curl -s -X GET "http://localhost:5226/api/Chat/history/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Chat history:"
echo "$HISTORY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HISTORY_RESPONSE"
echo ""

echo "=== Test Complete ==="
echo ""
echo "Note: You need to configure Azure OpenAI or GitHub Models API keys in appsettings.json"
echo "See AI_CHAT_README.md for configuration instructions"
