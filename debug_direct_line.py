#!/usr/bin/env python3
"""
Debug Direct Line API issues
Detailed debugging to understand 403 Forbidden errors
"""

import requests
import json
import time

def debug_direct_line():
    """Debug Direct Line API step by step"""
    
    direct_line_secret = "YOUR_DIRECT_LINE_SECRET_HERE"  # Add your secret from Azure Portal
    base_url = "https://directline.botframework.com/v3/directline"
    
    headers = {
        "Authorization": f"Bearer {direct_line_secret}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    print("🔍 Debugging Direct Line API")
    print("=" * 40)
    print(f"🔑 Using secret: {direct_line_secret[:20]}...")
    print(f"🌐 Base URL: {base_url}")
    
    # Test 1: Check if we can reach Direct Line at all
    print("\n1️⃣ Testing Direct Line connectivity...")
    try:
        response = requests.get(base_url, headers=headers, timeout=30)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        if response.status_code == 200:
            print("   ✅ Direct Line API reachable")
        else:
            print(f"   ⚠️  Direct Line API returned {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Try to start conversation
    print("\n2️⃣ Testing conversation creation...")
    try:
        conv_response = requests.post(
            f"{base_url}/conversations",
            headers=headers,
            timeout=30
        )
        print(f"   Status: {conv_response.status_code}")
        print(f"   Headers: {dict(conv_response.headers)}")
        print(f"   Response: {conv_response.text[:200]}")
        
        if conv_response.status_code == 201:
            print("   ✅ Conversation created successfully")
            conv_data = conv_response.json()
            conversation_id = conv_data.get("conversationId")
            print(f"   📝 Conversation ID: {conversation_id}")
            
            # Test 3: Send message to conversation
            print("\n3️⃣ Testing message sending...")
            activity = {
                "type": "message",
                "channelId": "directline",
                "from": {"id": "test-user"},
                "text": "hi",
                "locale": "sv-SE"
            }
            
            send_response = requests.post(
                f"{base_url}/conversations/{conversation_id}/activities",
                headers=headers,
                json=activity,
                timeout=30
            )
            print(f"   Status: {send_response.status_code}")
            print(f"   Response: {send_response.text[:200]}")
            
            if send_response.status_code == 200:
                print("   ✅ Message sent successfully")
                
                # Test 4: Get activities
                print("\n4️⃣ Testing activity retrieval...")
                time.sleep(2)  # Wait for bot to process
                
                activities_response = requests.get(
                    f"{base_url}/conversations/{conversation_id}/activities",
                    headers=headers,
                    timeout=30
                )
                print(f"   Status: {activities_response.status_code}")
                print(f"   Response: {activities_response.text[:200]}")
                
                if activities_response.status_code == 200:
                    print("   ✅ Activities retrieved successfully")
                else:
                    print(f"   ❌ Failed to get activities: {activities_response.status_code}")
            else:
                print(f"   ❌ Failed to send message: {send_response.status_code}")
                
        elif conv_response.status_code == 403:
            print("   ❌ 403 Forbidden - Authentication/Authorization issue")
            print("   💡 Possible causes:")
            print("      - Direct Line secret is invalid")
            print("      - Direct Line channel not properly configured")
            print("      - Bot not ready to receive messages")
            print("      - Azure Bot Service configuration issue")
        else:
            print(f"   ❌ Unexpected status: {conv_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 40)
    print("🔍 Direct Line debugging completed!")

if __name__ == "__main__":
    debug_direct_line()
