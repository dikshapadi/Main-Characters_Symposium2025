import json
import requests

# Use the exact IP address and port that Flask is running on
url = "http://127.0.0.1:5000/predict"

# Sample JSON payload
data = {
    "UserID": "U999",
    "HR": 85.0,
    "HRV": 40.0,
    "SpO2": 97.0,
    "Steps": 50,
    "Distance": 0.04,
    "Calories": 3.5,
    "ActiveTime": 1.0,
    "SleepDuration": 7.5,
    "SleepEfficiency": 90.0,
    "Height": 170.0,
    "Weight": 70.0,
    "Age": 35,
    "Sex": "Male",
    "DrinkingHabits": "Occasional",
    "SmokingHabits": "Non-smoker",
    "PastMedicalHistory": "Other",
    "Depression": "No",
    "Context": "Work"
}

try:
    # Send POST request
    response = requests.post(url, json=data, timeout=30)
    
    # Print response details
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        json_response = response.json()
        print(f"Response JSON: {json.dumps(json_response, indent=2)}")
    except requests.exceptions.JSONDecodeError:
        print(f"Raw Response Text: {response.text}")
        print("Could not decode JSON response")
    
    # Raise an error for bad status codes
    response.raise_for_status()
    
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to server. Is it running?")
except requests.exceptions.Timeout:
    print("Error: Request timed out")
except requests.exceptions.RequestException as e:
    print(f"Error: {str(e)}")