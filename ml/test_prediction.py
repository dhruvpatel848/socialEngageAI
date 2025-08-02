import requests
import json
import time

# Define the API endpoint
url = 'http://localhost:8000/predict'

# Create test data with more extreme values to test confidence calculation
test_data_1 = {
    "post_text": "Check out our new product launch! #innovation #tech",
    "media_type": "image",
    "hashtags": "innovation,tech",
    "followers_count": 5000,
    "following_count": 1000,
    "account_age": 365
}

test_data_2 = {
    "post_text": "Just a quick update on our progress.",
    "media_type": "text",
    "hashtags": "",
    "followers_count": 100,
    "following_count": 500,
    "account_age": 30
}

test_data_3 = {
    "post_text": "Exciting news! We've just released our latest product with amazing features! Check it out now! #newproduct #amazing #technology #innovation #startup",
    "media_type": "video",
    "hashtags": "newproduct,amazing,technology,innovation,startup",
    "followers_count": 50000,
    "following_count": 200,
    "account_age": 1095
}

# Test all three cases
test_cases = [
    ("Case 1 - Balanced post with image", test_data_1),
    ("Case 2 - Simple text post with new account", test_data_2),
    ("Case 3 - Enthusiastic video post with established account", test_data_3)
]

for case_name, test_data in test_cases:
    print(f"\n===== {case_name} =====")
    # Send POST request to the API
    response = requests.post(url, json=test_data)
    
    # Print the response
    print("Status Code:", response.status_code)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Likes: {result['likes']:.2f}")
        print(f"Shares: {result['shares']:.2f}")
        print(f"Comments: {result['comments']:.2f}")
        print(f"Engagement Level: {result['engagement_level']}")
        print(f"Confidence Score: {result['confidence_score']:.4f}")
        print(f"Recommended Post Time: {result['recommended_post_time']}")
        
        # Print top 5 feature importance
        print("\nTop 5 Feature Importance:")
        sorted_features = sorted(result['feature_importance'].items(), key=lambda x: x[1], reverse=True)[:5]
        for feature, importance in sorted_features:
            print(f"  {feature}: {importance:.4f}")
    else:
        print("Error:", response.text)