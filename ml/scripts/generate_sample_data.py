#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Generate sample social media data for EngageAI.

This script generates synthetic social media post data with engagement metrics
for testing and development purposes.
"""

import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from faker import Faker

# Initialize Faker
fake = Faker()

# Configuration
NUM_POSTS = 1000
NUM_USERS = 50
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          'data', 'synthetic_data.csv')

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# Media types
MEDIA_TYPES = ['image', 'video', 'text']

# Popular hashtags
POPULAR_HASHTAGS = [
    'marketing', 'socialmedia', 'digital', 'business', 'entrepreneur',
    'success', 'motivation', 'startup', 'innovation', 'technology',
    'leadership', 'strategy', 'growth', 'branding', 'contentmarketing',
    'influencer', 'advertising', 'ecommerce', 'seo', 'analytics'
]

# Generate user data
def generate_users(num_users):
    users = []
    for i in range(1, num_users + 1):
        user_id = f'user{i:03d}'
        followers_count = int(np.random.lognormal(8, 1.2))
        following_count = int(np.random.lognormal(6, 1))
        account_age = random.randint(30, 2000)  # days
        
        users.append({
            'user_id': user_id,
            'followers_count': followers_count,
            'following_count': following_count,
            'account_age': account_age
        })
    
    return users

# Generate post text
def generate_post_text():
    templates = [
        "Check out our new {product}! It's going to revolutionize the {industry}.",
        "We're excited to announce our partnership with {company} for the upcoming {event}.",
        "Watch our tutorial on how to {action} in our latest {product} update.",
        "Happy {day}! Start your {timeframe} with our {adjective} tips for {topic}.",
        "Join us for a live {event_type} with our {role} tomorrow at {time}.",
        "Behind the scenes look at our {team} working on the next big {project_type}.",
        "Our {report_type} is now available. Check out our {metric} and {achievement_type}!",
        "Tips and tricks for maximizing your {goal} with our {product}.",
        "Exclusive {content_type} with {expert_type} on future trends in {industry}.",
        "Celebrating our {milestone} today! Thank you to all our {audience}!"
    ]
    
    template = random.choice(templates)
    
    replacements = {
        'product': random.choice(['product', 'service', 'platform', 'app', 'software', 'tool']),
        'industry': random.choice(['industry', 'market', 'field', 'sector']),
        'company': f"@{fake.company().split()[0].lower()}",
        'event': random.choice(['conference', 'webinar', 'workshop', 'summit', 'meetup']),
        'action': random.choice(['improve productivity', 'boost engagement', 'increase conversions', 'optimize performance']),
        'day': random.choice(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        'timeframe': random.choice(['week', 'day', 'month', 'quarter']),
        'adjective': random.choice(['helpful', 'insightful', 'practical', 'valuable', 'essential']),
        'topic': random.choice(['productivity', 'marketing', 'sales', 'customer service', 'leadership']),
        'event_type': random.choice(['Q&A session', 'webinar', 'discussion', 'interview']),
        'role': random.choice(['CEO', 'CTO', 'product manager', 'lead developer', 'marketing director']),
        'time': f"{random.randint(1, 12)} {random.choice(['AM', 'PM'])} {random.choice(['EST', 'PST', 'GMT'])}",
        'team': random.choice(['design team', 'development team', 'marketing team', 'research team']),
        'project_type': random.choice(['project', 'product', 'feature', 'release']),
        'report_type': random.choice(['annual report', 'quarterly update', 'market analysis', 'case study']),
        'metric': random.choice(['growth', 'performance', 'results', 'achievements']),
        'achievement_type': random.choice(['milestones', 'successes', 'accomplishments']),
        'goal': random.choice(['productivity', 'efficiency', 'performance', 'results']),
        'content_type': random.choice(['interview', 'discussion', 'conversation', 'Q&A']),
        'expert_type': random.choice(['industry expert', 'thought leader', 'specialist', 'consultant']),
        'milestone': random.choice(['1-year anniversary', '5-year anniversary', '10,000 customers milestone', 'product launch']),
        'audience': random.choice(['customers', 'users', 'followers', 'community', 'partners'])
    }
    
    for key, value in replacements.items():
        template = template.replace('{' + key + '}', value)
    
    return template

# Generate hashtags
def generate_hashtags():
    num_hashtags = random.randint(1, 5)
    hashtags = random.sample(POPULAR_HASHTAGS, num_hashtags)
    return '#' + ' #'.join(hashtags)

# Generate timestamp
def generate_timestamp(start_date=None):
    if start_date is None:
        start_date = datetime.now() - timedelta(days=180)
    
    end_date = datetime.now()
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_days)
    
    # Add random hour and minute
    random_date = random_date.replace(
        hour=random.randint(8, 20),
        minute=random.choice([0, 15, 30, 45])
    )
    
    return random_date.strftime('%Y-%m-%dT%H:%M:%S')

# Generate engagement metrics based on features
def generate_engagement(post_data):
    # Base engagement
    base_likes = random.randint(10, 50)
    base_shares = random.randint(5, 20)
    base_comments = random.randint(2, 15)
    
    # Follower factor (more followers = more engagement)
    follower_factor = np.log1p(post_data['followers_count']) / 10
    
    # Media type factor
    media_factors = {
        'image': {'likes': 1.2, 'shares': 1.0, 'comments': 0.8},
        'video': {'likes': 1.5, 'shares': 1.8, 'comments': 1.3},
        'text': {'likes': 0.7, 'shares': 0.6, 'comments': 1.0}
    }
    
    # Time factor (posts during business hours get more engagement)
    timestamp = datetime.strptime(post_data['timestamp'], '%Y-%m-%dT%H:%M:%S')
    hour = timestamp.hour
    day = timestamp.weekday()  # 0 = Monday, 6 = Sunday
    
    # Higher engagement during business hours on weekdays
    time_factor = 1.0
    if 9 <= hour <= 17 and 0 <= day <= 4:  # Business hours on weekdays
        time_factor = 1.3
    elif day >= 5:  # Weekend
        time_factor = 0.8
    
    # Hashtag factor (more hashtags = more discoverability)
    hashtag_count = post_data['hashtags'].count('#')
    hashtag_factor = 1.0 + (hashtag_count * 0.05)  # 5% boost per hashtag
    
    # Calculate final engagement with some randomness
    likes = int(base_likes * follower_factor * media_factors[post_data['media_type']]['likes'] * time_factor * hashtag_factor * random.uniform(0.8, 1.2))
    shares = int(base_shares * follower_factor * media_factors[post_data['media_type']]['shares'] * time_factor * hashtag_factor * random.uniform(0.7, 1.3))
    comments = int(base_comments * follower_factor * media_factors[post_data['media_type']]['comments'] * time_factor * hashtag_factor * random.uniform(0.9, 1.1))
    
    return likes, shares, comments

# Main function to generate data
def generate_data(num_posts, num_users):
    # Generate users
    users = generate_users(num_users)
    
    # Generate posts
    posts = []
    for i in range(1, num_posts + 1):
        # Select a random user
        user = random.choice(users)
        
        # Generate post data
        post_data = {
            'post_id': i,
            'post_text': generate_post_text(),
            'media_type': random.choice(MEDIA_TYPES),
            'hashtags': generate_hashtags(),
            'timestamp': generate_timestamp(),
            'user_id': user['user_id'],
            'followers_count': user['followers_count'],
            'following_count': user['following_count'],
            'account_age': user['account_age']
        }
        
        # Generate engagement metrics
        likes, shares, comments = generate_engagement(post_data)
        post_data['likes'] = likes
        post_data['shares'] = shares
        post_data['comments'] = comments
        
        posts.append(post_data)
    
    # Convert to DataFrame
    df = pd.DataFrame(posts)
    
    # Sort by timestamp
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')
    df['timestamp'] = df['timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S')
    
    return df

# Generate and save data
def main():
    print(f"Generating {NUM_POSTS} synthetic social media posts...")
    df = generate_data(NUM_POSTS, NUM_USERS)
    
    # Save to CSV
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Data saved to {OUTPUT_FILE}")
    
    # Print sample
    print("\nSample data:")
    print(df.head())
    
    # Print statistics
    print("\nData statistics:")
    print(f"Total posts: {len(df)}")
    print(f"Posts by media type:\n{df['media_type'].value_counts()}")
    print(f"\nEngagement statistics:")
    print(f"Likes: mean={df['likes'].mean():.1f}, median={df['likes'].median()}, max={df['likes'].max()}")
    print(f"Shares: mean={df['shares'].mean():.1f}, median={df['shares'].median()}, max={df['shares'].max()}")
    print(f"Comments: mean={df['comments'].mean():.1f}, median={df['comments'].median()}, max={df['comments'].max()}")

if __name__ == "__main__":
    main()