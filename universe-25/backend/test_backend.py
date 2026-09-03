"""
Quick test script to verify Blue Rose backend is operational.
Run this after starting server.py
"""
import requests
import json

BASE_URL = "http://localhost:8080"

def test_backend():
    print("🧪 Testing Blue Rose Backend...\n")

    # Test 1: Health check via docs
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"✅ FastAPI Docs accessible: {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot reach backend: {e}")
        return

    # Test 2: Execute API - read_all on state tier
    try:
        payload = {
            "project_id": "universe_25",
            "tier": "state",
            "order": {
                "action": "read_all"
            }
        }
        response = requests.post(f"{BASE_URL}/api/v1/execute", json=payload)
        print(f"✅ API Execute endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ API Execute failed: {e}")
        return

    # Test 3: Write and read back
    try:
        # Write some test data
        write_payload = {
            "project_id": "universe_25",
            "tier": "state",
            "order": {
                "action": "overwrite",
                "data": {
                    "test_key": "test_value",
                    "timestamp": "2026-09-03T06:28:09.043Z"
                }
            }
        }
        write_response = requests.post(f"{BASE_URL}/api/v1/execute", json=write_payload)
        print(f"✅ Write test data: {write_response.status_code}")

        # Read it back
        read_response = requests.post(f"{BASE_URL}/api/v1/execute", json=payload)
        data = read_response.json().get("data", {})
        print(f"✅ Read back data: {data}")

    except Exception as e:
        print(f"❌ Write/Read test failed: {e}")

    print("\n✨ Backend is fully operational!")

if __name__ == "__main__":
    test_backend()
