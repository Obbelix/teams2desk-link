#!/bin/bash

echo "🤖 Testing Teams2Desk-Link Bot with curl"
echo "=========================================="

# Test 1: GET request (should return "bot endpoint is alive")
echo -e "\n1️⃣ Testing GET /api/bot/messages"
curl -X GET "https://jolly-coast-0f84fb503.2.azurestaticapps.net/api/bot/messages" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n\n2️⃣ Testing POST /api/bot/messages with 'hi' message"
curl -X POST "https://jolly-coast-0f84fb503.2.azurestaticapps.net/api/bot/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "text": "hi",
    "from": {"id": "test-user"},
    "conversation": {"id": "test-conv"},
    "channelId": "directline"
  }' \
  -v

echo -e "\n\n3️⃣ Testing POST /api/bot/messages with 'help' message"
curl -X POST "https://jolly-coast-0f84fb503.2.azurestaticapps.net/api/bot/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "text": "help",
    "from": {"id": "test-user"},
    "conversation": {"id": "test-conv"},
    "channelId": "directline"
  }' \
  -v

echo -e "\n\n✅ Bot testing completed!"
echo "📝 Check the responses above to see if the bot is working"
