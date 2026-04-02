# Backend API Summary (for Frontend)

Base URL: http://localhost:5000/api

Auth header for protected APIs:
Authorization: Bearer <token>

## Common Response

Success: JSON object or JSON array (depends on endpoint).

Error format:
{
  "message": "..."
}

Common status codes:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 405 Method Not Allowed
- 500 Internal Server Error

## Auth

- POST /auth/register
  - Public
  - Body (JSON):
    {
      "name": "Nguyen A",
      "email": "a@example.com",
      "password": "secret123",
      "role": "user|owner"
    }
  - Response:
    {
      "token": "<jwt>"
    }

- POST /auth/login
  - Public
  - Body (JSON):
    {
      "email": "a@example.com",
      "password": "secret123"
    }
  - Response:
    {
      "token": "<jwt>"
    }

- GET /auth/me
  - Protected
  - Response: current user profile

- PUT /auth/me (application/json)
  - Protected
  - Supported fields: name, phone, address

- PUT /auth/me (multipart/form-data)
  - Protected
  - Supported fields: name, phone, address, avatar(file)

- PATCH /auth/change-password
  - Protected
  - Body (JSON):
    {
      "currentPassword": "old_password",
      "newPassword": "new_password_123"
    }

## Admin Users

All endpoints below require admin role.

- GET /admin/users
  - Query (optional): q, role, isActive, page, limit
  - Response:
    {
      "items": [...users],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
      }
    }

- GET /admin/users/{id}
  - Get user detail

- PATCH /admin/users/{id}/profile
  - Body (JSON): any of name, email, phone, address, avatar

- PATCH /admin/users/{id}/role
  - Body (JSON):
    {
      "role": "user|owner|admin"
    }

- PATCH /admin/users/{id}/status
  - Body (JSON):
    {
      "isActive": true
    }

- DELETE /admin/users/{id}
  - Delete user account

## Cars

- GET /cars
  - Public
  - Query (optional): available, q, minPrice, maxPrice

- GET /cars/me/my-cars
  - Protected
  - Role: owner, admin

- GET /cars/{id}
  - Public
  - Includes latestReviews (max 5)

- POST /cars
  - Protected
  - Role: owner, admin
  - multipart/form-data
  - Fields: owner(optional-admin), make, model, year, plate, pricePerDay, available, location, images(files)

- PUT /cars/{id}
  - Protected
  - Role: owner, admin
  - JSON body (partial update supported)

- PUT /cars/{id}/with-images
  - Protected
  - Role: owner, admin
  - multipart/form-data (info + images)

- DELETE /cars/{id}
  - Protected
  - Role: owner, admin

## Posts

- GET /posts
  - Public
  - Query (optional): postType, location
  - Returns only active + approved posts

- POST /posts
  - Protected
  - Role: user, owner, admin
  - Body (JSON):
    {
      "postType": "rent_request|car_offer",
      "title": "...",
      "content": "...",
      "location": "...",
      "contactPhone": "...",
      "budgetPerDay": 900000,
      "car": 123
    }
  - New post default status: pending

- GET /posts/me/list
  - Protected
  - List current user posts

- PUT /posts/{id}
  - Protected
  - Owner of post or admin

- DELETE /posts/{id}
  - Protected
  - Owner of post or admin

- GET /posts/admin/pending
  - Protected
  - Admin only

- PATCH /posts/admin/{id}/approve
  - Protected
  - Admin only
  - Body optional:
    {
      "reviewNote": "Valid content"
    }

- PATCH /posts/admin/{id}/reject
  - Protected
  - Admin only
  - Body optional:
    {
      "reviewNote": "Missing information"
    }

## Bookings

- POST /bookings
  - Protected
  - Body (JSON):
    {
      "carId": 1,
      "startDate": "2026-04-10",
      "endDate": "2026-04-12"
    }
  - Notes:
    - endDate must be after startDate
    - Prevents overlap with pending/confirmed bookings
    - totalPrice is computed by backend

- GET /bookings
  - Protected
  - List current user bookings

## Reviews

- GET /reviews/car/{carId}
  - Public
  - List reviews by car

- POST /reviews/car/{carId}
  - Protected
  - Body (JSON):
    {
      "rating": 5,
      "comment": "Good car"
    }
  - One user can review a car only once

- PUT /reviews/{id}
  - Protected
  - Owner review or admin

- DELETE /reviews/{id}
  - Protected
  - Owner review or admin

## Role Values

- user
- owner
- admin

## PostType Values

- rent_request
- car_offer

## PostStatus Values (response)

- pending
- approved
- rejected
