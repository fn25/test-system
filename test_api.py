import requests
import json

BASE_URL = "http://localhost:10001"
API_URL = f"{BASE_URL}/api"

def print_response(title, response):
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print()

# Test 1: Health Check
print("\n🔍 Starting API Tests...")
response = requests.get(f"{BASE_URL}/health")
print_response("1. Health Check", response)

# Test 2: Register User
register_data = {
    "username": "admin1",
    "email": "admin@test.com",
    "password": "admin123",
    "fullName": "Admin User"
}
response = requests.post(f"{API_URL}/auth/register", json=register_data)
print_response("2. Register User", response)

if response.status_code == 201:
    token = response.json().get("token")
    user_id = response.json().get("user", {}).get("id")
    print(f"✅ Token received: {token[:20]}...")
    print(f"✅ User ID: {user_id}")
    
    # Test 3: Login
    login_data = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    response = requests.post(f"{API_URL}/auth/login", json=login_data)
    print_response("3. Login", response)
    
    # Test 4: Get Profile
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/auth/profile", headers=headers)
    print_response("4. Get Profile", response)
    
    # Test 5: List Quizzes
    response = requests.get(f"{API_URL}/quiz", headers=headers)
    print_response("5. List Quizzes", response)
    
    print("\n✅ All basic tests completed!")
    print("\nNote: To test admin endpoints, you need to update the user role to 'admin' in the database.")
    print(f"SQL: UPDATE users SET role = 'admin' WHERE id = {user_id};")

else:
    print("❌ Registration failed. Cannot proceed with other tests.")
