#!/usr/bin/env python3
"""
Test Teams2Desk-Link Bot using Direct Line API
This allows testing the bot without Teams access
"""

import requests
import json
import time
from typing import Dict, Any

def test_bot_with_direct_line(direct_line_secret: str, message: str = "hi") -> None:
    """Test bot using Direct Line API"""
    
    base_url = "https://directline.botframework.com/v3/directline"
    headers = {
        "Authorization": f"Bearer {direct_line_secret}",
        "Accept": "application/json"
    }
    
    print(f"🤖 Testing bot with message: '{message}'")
    print(f"🌐 Direct Line URL: {base_url}")
    
    try:
        # Start conversation
        print("\n1️⃣ Starting conversation...")
        conv_response = requests.post(
            f"{base_url}/conversations",
            headers=headers,
            timeout=30
        )
        conv_response.raise_for_status()
        
        conv_data = conv_response.json()
        conversation_id = conv_data.get("conversationId")
        
        if not conversation_id:
            print("❌ No conversation ID returned")
            return
            
        print(f"✅ Conversation started: {conversation_id}")
        
        # Send message
        print("\n2️⃣ Sending message...")
        activity = {
            "type": "message",
            "channelId": "directline",
            "from": {"id": "test-user"},
            "text": message,
            "locale": "sv-SE"
        }
        
        send_response = requests.post(
            f"{base_url}/conversations/{conversation_id}/activities",
            headers=headers,
            json=activity,
            timeout=30
        )
        send_response.raise_for_status()
        
        print("✅ Message sent successfully")
        
        # Wait for bot response
        print("\n3️⃣ Waiting for bot response...")
        time.sleep(3)  # Give bot time to process
        
        # Get activities
        activities_response = requests.get(
            f"{base_url}/conversations/{conversation_id}/activities",
            headers=headers,
            timeout=30
        )
        activities_response.raise_for_status()
        
        activities = activities_response.json().get("activities", [])
        
        # Find bot responses
        bot_messages = [
            activity for activity in activities 
            if activity.get("from", {}).get("id") != "test-user" 
            and activity.get("type") == "message"
        ]
        
        if bot_messages:
            print("✅ Bot responded:")
            for msg in bot_messages:
                print(f"   🤖 {msg.get('text', 'No text')}")
        else:
            print("❌ No response from bot")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_bot_endpoint_directly() -> None:
    """Test bot endpoint directly with POST request"""
    
    print("\n🔧 Testing bot endpoint directly...")
    
    url = "https://jolly-coast-0f84fb503.2.azurestaticapps.net/api/bot/messages"
    
    # Test with a simple message
    payload = {
        "type": "message",
        "text": "hi",
        "from": {"id": "test-user"},
        "conversation": {"id": "test-conv"}
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"📡 Status: {response.status_code}")
        print(f"📄 Response: {response.text[:200]}")
        
        if response.status_code == 200:
            print("✅ Bot endpoint responded successfully")
        else:
            print("❌ Bot endpoint returned error")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")

def main():
    """Main test function"""
    
    print("🤖 Teams2Desk-Link Bot Testing")
    print("=" * 40)
    
    # Test 1: Direct endpoint test
    test_bot_endpoint_directly()
    
    # Test 2: Direct Line API test (if secret provided)
    print("\n" + "=" * 40)
    print("📝 To test with Direct Line API, you need the Direct Line Secret")
    print("   You can find this in Azure Bot Service → Channels → Direct Line")
    
    # Test with Direct Line Secret
    direct_line_secret = "YOUR_DIRECT_LINE_SECRET_HERE"  # Add your secret from Azure Portal
    test_bot_with_direct_line(direct_line_secret, "hi")
    test_bot_with_direct_line(direct_line_secret, "help")

if __name__ == "__main__":
    main()
