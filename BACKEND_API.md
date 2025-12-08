# Wihngo Backend API Requirements

## Overview

This document outlines the API endpoints required by the Wihngo mobile app. The backend should be implemented at `C:\.net\Wihngo`.

## Base URL

```
https://api.wihngo.com/api
```

## Authentication

All protected endpoints require JWT Bearer token in header:

```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register

Create new user account

```json
Request:
{
  "name": "string",
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "string",
  "userId": "string",
  "name": "string",
  "email": "string"
}
```

### POST /auth/login

User login

```json
Request:
{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "string",
  "userId": "string",
  "name": "string",
  "email": "string"
}
```

### POST /auth/logout

User logout (Protected)

```json
Response: 200 OK
```

---

## 🐦 Bird Endpoints

### GET /birds

Get all birds

```json
Query Parameters:
- page: number (optional)
- limit: number (optional)
- species: string (optional)
- location: string (optional)
- isMemorial: boolean (optional)

Response: 200 OK
[
  {
    "birdId": "string",
    "name": "string",
    "species": "string",
    "commonName": "string",
    "scientificName": "string",
    "tagline": "string",
    "description": "string",
    "imageUrl": "string",
    "coverImageUrl": "string",
    "lovedBy": 0,
    "supportedBy": 0,
    "ownerId": "string",
    "ownerName": "string",
    "age": "string",
    "location": "string",
    "isLoved": false,
    "isSupported": false,
    "totalSupport": 0,
    "isMemorial": false
  }
]
```

### GET /birds/:id

Get bird by ID

```json
Response: 200 OK
{
  "birdId": "string",
  "name": "string",
  "species": "string",
  // ... all bird fields
}
```

### GET /birds/featured

Get featured birds

```json
Response: 200 OK
[/* array of Bird objects */]
```

### GET /birds/recently-supported

Get recently supported birds

```json
Response: 200 OK
[/* array of Bird objects */]
```

### POST /birds (Protected)

Create new bird

```json
Request:
{
  "name": "string",
  "species": "string",
  "commonName": "string",
  "scientificName": "string",
  "tagline": "string",
  "description": "string",
  "imageUrl": "string",
  "coverImageUrl": "string",
  "age": "string",
  "location": "string"
}

Response: 201 Created
{/* Bird object */}
```

### PUT /birds/:id (Protected)

Update bird (owner only)

```json
Request:
{
  "name": "string",
  "species": "string",
  // ... any bird fields
}

Response: 200 OK
{/* Updated Bird object */}
```

### DELETE /birds/:id (Protected)

Delete bird (owner only)

```json
Response: 204 No Content
```

### POST /birds/:id/love (Protected)

Love a bird

```json
Response: 200 OK
```

### DELETE /birds/:id/love (Protected)

Unlove a bird

```json
Response: 200 OK
```

### POST /birds/:id/support (Protected)

Support a bird financially

```json
Request:
{
  "amount": 0,
  "message": "string",
  "paymentMethod": "card|paypal|applepay|googlepay"
}

Response: 200 OK
{
  "supportId": "string",
  "birdId": "string",
  "userId": "string",
  "amount": 0,
  "message": "string",
  "createdAt": "ISO8601 string"
}
```

### GET /birds/:id/health-logs

Get health logs for a bird

```json
Response: 200 OK
[
  {
    "logId": "string",
    "birdId": "string",
    "logType": "vet|food|medicine|other",
    "title": "string",
    "description": "string",
    "cost": 0,
    "imageUrl": "string",
    "createdAt": "ISO8601 string"
  }
]
```

### POST /birds/:id/health-logs (Protected, owner only)

Add health log

```json
Request:
{
  "logType": "vet|food|medicine|other",
  "title": "string",
  "description": "string",
  "cost": 0,
  "imageUrl": "string"
}

Response: 201 Created
{/* HealthLog object */}
```

---

## 📖 Story Endpoints

### GET /stories

Get all stories

```json
Query Parameters:
- page: number (optional)
- limit: number (optional)

Response: 200 OK
[
  {
    "storyId": "string",
    "userId": "string",
    "userName": "string",
    "userAvatar": "string",
    "birdId": "string",
    "birdName": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "videoUrl": "string",
    "likes": 0,
    "commentsCount": 0,
    "createdAt": "ISO8601 string",
    "isLiked": false
  }
]
```

### GET /stories/trending

Get trending stories

```json
Response: 200 OK
[/* array of Story objects */]
```

### GET /stories/:id

Get story detail with comments

```json
Response: 200 OK
{
  "storyId": "string",
  // ... all story fields
  "comments": [
    {
      "commentId": "string",
      "storyId": "string",
      "userId": "string",
      "userName": "string",
      "userAvatar": "string",
      "content": "string",
      "createdAt": "ISO8601 string"
    }
  ]
}
```

### POST /stories (Protected)

Create new story

```json
Request:
{
  "title": "string",
  "content": "string",
  "birdId": "string",
  "imageUrl": "string",
  "videoUrl": "string"
}

Response: 201 Created
{/* Story object */}
```

### POST /stories/:id/like (Protected)

Like a story

```json
Response: 200 OK
```

### DELETE /stories/:id/like (Protected)

Unlike a story

```json
Response: 200 OK
```

### POST /stories/:id/comments (Protected)

Add comment to story

```json
Request:
{
  "content": "string"
}

Response: 201 Created
{/* StoryComment object */}
```

### GET /stories/bird/:birdId

Get stories for a specific bird

```json
Response: 200 OK
[/* array of Story objects */]
```

### GET /stories/user/:userId

Get stories by a specific user

```json
Response: 200 OK
[/* array of Story objects */]
```

---

## 👤 User Endpoints

### GET /users/:id

Get user profile

```json
Response: 200 OK
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "bio": "string",
  "avatarUrl": "string",
  "location": "string",
  "isOwner": false,
  "lovedBirds": ["birdId1", "birdId2"],
  "supportedBirds": ["birdId3", "birdId4"],
  "ownedBirds": ["birdId5"],
  "storiesCount": 0,
  "totalSupport": 0
}
```

### PUT /users/:id (Protected, own profile only)

Update user profile

```json
Request:
{
  "name": "string",
  "bio": "string",
  "avatarUrl": "string",
  "location": "string"
}

Response: 200 OK
{/* Updated UserProfile object */}
```

### GET /users/:id/loved-birds

Get birds loved by user

```json
Response: 200 OK
[/* array of Bird objects */]
```

### GET /users/:id/supported-birds

Get birds supported by user

```json
Response: 200 OK
[/* array of Bird objects */]
```

### GET /users/:id/owned-birds

Get birds owned by user

```json
Response: 200 OK
[/* array of Bird objects */]
```

---

## 🔍 Search Endpoints

### GET /search

Global search

```json
Query Parameters:
- q: string (required, min 2 chars)

Response: 200 OK
{
  "birds": [/* array of Bird objects */],
  "stories": [/* array of Story objects */],
  "users": [/* array of User objects */]
}
```

### GET /search/birds

Search birds only

```json
Query Parameters:
- q: string (required)

Response: 200 OK
[/* array of Bird objects */]
```

### GET /search/stories

Search stories only

```json
Query Parameters:
- q: string (required)

Response: 200 OK
[/* array of Story objects */]
```

### GET /search/users

Search users only

```json
Query Parameters:
- q: string (required)

Response: 200 OK
[/* array of User objects */]
```

---

## 🔔 Notification Endpoints (Future)

### GET /notifications (Protected)

Get user notifications

```json
Response: 200 OK
[
  {
    "notificationId": "string",
    "userId": "string",
    "type": "support|love|comment|story|recommendation",
    "title": "string",
    "message": "string",
    "imageUrl": "string",
    "isRead": false,
    "createdAt": "ISO8601 string",
    "relatedId": "string"
  }
]
```

### PUT /notifications/:id/read (Protected)

Mark notification as read

```json
Response: 200 OK
```

### GET /notifications/preferences (Protected)

Get notification preferences

```json
Response: 200 OK
{
  "supportNotifications": true,
  "loveNotifications": true,
  "commentNotifications": true,
  "storyNotifications": true,
  "recommendationNotifications": true,
  "emailNotifications": false
}
```

### PUT /notifications/preferences (Protected)

Update notification preferences

```json
Request:
{
  "supportNotifications": true,
  "loveNotifications": true,
  // ... other preferences
}

Response: 200 OK
{/* Updated preferences */}
```

---

## 📊 Analytics Endpoints (Future)

### GET /birds/:id/analytics (Protected, owner only)

Get bird analytics

```json
Response: 200 OK
{
  "views": 0,
  "lovesOverTime": [/* time series data */],
  "supportOverTime": [/* time series data */],
  "topSupporters": [/* array of users */]
}
```

---

## 🔒 Error Responses

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Validation error description"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 📝 Implementation Notes

### Database Schema Recommendations

**Users Table**

- userId (PK, GUID)
- name
- email (unique)
- passwordHash
- bio
- avatarUrl
- location
- isOwner
- createdAt
- updatedAt

**Birds Table**

- birdId (PK, GUID)
- ownerId (FK to Users)
- name
- species
- commonName
- scientificName
- tagline
- description
- imageUrl
- coverImageUrl
- age
- location
- isMemorial
- createdAt
- updatedAt

**BirdLoves Table** (many-to-many)

- loveId (PK)
- birdId (FK)
- userId (FK)
- createdAt

**BirdSupports Table**

- supportId (PK, GUID)
- birdId (FK)
- userId (FK)
- amount (decimal)
- message
- paymentMethod
- paymentStatus
- createdAt

**Stories Table**

- storyId (PK, GUID)
- userId (FK)
- birdId (FK, nullable)
- title
- content
- imageUrl
- videoUrl
- createdAt
- updatedAt

**StoryLikes Table** (many-to-many)

- likeId (PK)
- storyId (FK)
- userId (FK)
- createdAt

**StoryComments Table**

- commentId (PK, GUID)
- storyId (FK)
- userId (FK)
- content
- createdAt

**BirdHealthLogs Table**

- logId (PK, GUID)
- birdId (FK)
- logType (enum)
- title
- description
- cost (decimal, nullable)
- imageUrl
- createdAt

**Notifications Table**

- notificationId (PK, GUID)
- userId (FK)
- type (enum)
- title
- message
- imageUrl
- isRead
- relatedId
- createdAt

### Security Requirements

1. Password hashing with bcrypt or similar
2. JWT token expiration (24 hours recommended)
3. Rate limiting on all endpoints
4. Input validation and sanitization
5. HTTPS only
6. CORS configuration for mobile app
7. SQL injection protection
8. XSS protection

### Performance Recommendations

1. Implement pagination on all list endpoints (default 20 items)
2. Add caching for frequently accessed data
3. Optimize database queries with indexes
4. Use CDN for images
5. Implement database connection pooling
6. Add API response compression

### Payment Integration

- Integrate Stripe for card payments
- PayPal SDK for PayPal payments
- Apple Pay/Google Pay native integrations
- Store payment transactions securely
- Implement webhook handlers for payment confirmations
- PCI compliance for card data

---

**Backend Repository**: `C:\.net\Wihngo`

This API specification should be implemented as a .NET Web API project with Entity Framework Core.
