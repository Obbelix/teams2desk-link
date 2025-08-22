#!/usr/bin/env python3
"""
Simple bot testing script
Tests basic bot functionality without complex authentication
"""

import requests
import json

def test_bot_endpoints():
    """Test various bot endpoints"""
    
    base_url = "https://jolly-coast-0f84fb503.2.azurestaticapps.net"
    
    print("🤖 Testing Teams2Desk-Link Bot Endpoints")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
        if response.status_code == 200:
            print("   ✅ Health endpoint working")
        else:
            print("   ❌ Health endpoint failed")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Bot endpoint GET
    print("\n2️⃣ Testing bot endpoint GET...")
    try:
        response = requests.get(f"{base_url}/api/bot/messages", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
        if response.status_code == 200:
            print("   ✅ Bot GET endpoint working")
        else:
            print("   ❌ Bot GET endpoint failed")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Bot endpoint POST (will fail due to auth, but we can see the error)
    print("\n3️⃣ Testing bot endpoint POST...")
    try:
        payload = {
            "type": "message",
            "text": "hi",
            "from": {"id": "test-user"},
            "conversation": {"id": "test-conv"}
        }
        response = requests.post(f"{base_url}/api/bot/messages", 
                               json=payload, 
                               timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
        if response.status_code == 401:
            print("   ⚠️  Bot POST endpoint requires authentication (expected)")
        elif response.status_code == 200:
            print("   ✅ Bot POST endpoint working")
        else:
            print(f"   ❌ Bot POST endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Create case endpoint
    print("\n4️⃣ Testing create-case endpoint...")
    try:
        payload = {
            "title": "Test Case",
            "description": "Test case from bot testing script",
            "priority": "Medium"
        }
        response = requests.post(f"{base_url}/api/create-case", 
                               json=payload, 
                               timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}")
        if response.status_code == 200:
            print("   ✅ Create case endpoint working")
        else:
            print(f"   ❌ Create case endpoint failed with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Bot endpoint testing completed!")
    print("\n📝 Summary:")
    print("   - GET endpoints should work (200)")
    print("   - POST to /api/bot/messages will fail (401) - requires Teams auth")
    print("   - POST to /api/create-case may work if service desk is configured")

if __name__ == "__main__":
    test_bot_endpoints()
