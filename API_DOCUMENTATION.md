# BloodLink Backend API Documentation

## Overview

BloodLink uses Supabase as its backend, which provides:
- **Authentication**: JWT-based auth with Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Edge Functions**: Serverless functions for custom logic
- **Real-time**: Optional real-time subscriptions

## Base URL

```
https://<project-id>.supabase.co
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting a Token

Tokens are obtained through Supabase Auth (handled automatically by the frontend SDK).

---

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Profile Creation** (after signup):
```http
POST /rest/v1/profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "<user_id>",
  "full_name": "John Doe",
  "email": "user@example.com",
  "role": "donor",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": { ... }
}
```

#### Logout
```http
POST /auth/v1/logout
Authorization: Bearer <token>
```

#### Get Current User
```http
GET /auth/v1/user
Authorization: Bearer <token>
```

---

### Profiles

#### Get Profile
```http
GET /rest/v1/profiles?id=eq.<user_id>
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /rest/v1/profiles?id=eq.<user_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone": "+1987654321"
}
```

---

### Donors

#### Create Donor Profile
```http
POST /rest/v1/donors
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "<user_id>",
  "blood_group": "O+",
  "city": "New York",
  "age": 25,
  "gender": "male",
  "phone": "+1234567890",
  "availability": true
}
```

**Validation:**
- `blood_group`: Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-
- `age`: Must be between 18 and 65
- `weight_kg`: Must be at least 50 (if provided)

#### Update Donor Profile
```http
PATCH /rest/v1/donors?id=eq.<user_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "availability": false,
  "city": "Los Angeles"
}
```

#### Delete Donor Profile
```http
DELETE /rest/v1/donors?id=eq.<user_id>
Authorization: Bearer <token>
```

#### Search Donors
```http
GET /functions/v1/search-donors?blood_group=O+&city=New York&available_only=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `blood_group` (optional): Filter by blood group
- `city` (optional): Filter by city (partial match)
- `available_only` (optional, default: true): Only show available donors
- `verified_only` (optional, default: false): Only show verified donors
- `limit` (optional, default: 50, max: 100)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "blood_group": "O+",
      "city": "New York",
      "availability": true,
      "verified": true,
      "full_name": "John Doe",
      ...
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 25
  }
}
```

---

### Blood Requests

#### Create Blood Request
```http
POST /rest/v1/blood_requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient_name": "Jane Doe",
  "blood_group": "A+",
  "units_required": 3,
  "hospital_name": "City Hospital",
  "city": "New York",
  "contact_person": "John Doe",
  "contact_phone": "+1234567890",
  "urgency": "urgent",
  "description": "Scheduled surgery"
}
```

**Validation:**
- `units_required`: Must be between 1 and 20
- `urgency`: Must be one of: normal, urgent, critical
- `contact_phone`: Valid phone format required

#### Get Blood Requests
```http
GET /rest/v1/blood_requests?select=*,requester:profiles!blood_requests_requester_id_fkey(*)&status=eq.open
Authorization: Bearer <token>
```

#### Update Request Status
```http
PATCH /rest/v1/blood_requests?id=eq.<request_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "fulfilled"
}
```

#### Delete Blood Request
```http
DELETE /rest/v1/blood_requests?id=eq.<request_id>&requester_id=eq.<user_id>
Authorization: Bearer <token>
```

---

### Notifications

#### Get Notifications
```http
GET /functions/v1/notifications?limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "blood_request",
      "title": "New Blood Request",
      "message": "A patient needs O+ blood...",
      "read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "unread_count": 3
}
```

#### Mark Notification as Read
```http
PUT /functions/v1/notifications?id=<notification_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "read": true
}
```

#### Delete Notification
```http
DELETE /functions/v1/notifications?id=<notification_id>
Authorization: Bearer <token>
```

---

### Admin Endpoints

Admin endpoints require the user to have `role: 'admin'`.

#### Get Dashboard Statistics
```http
GET /functions/v1/admin-stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": {
    "total_donors": 1000,
    "verified_donors": 750,
    "available_donors": 600,
    "total_requests": 500,
    "open_requests": 50,
    "critical_requests": 5,
    "fulfilled_requests": 400,
    "donors_by_blood_group": { "A+": 350, "O+": 370, ... },
    "recent_requests": [...]
  }
}
```

#### Verify/Unverify Donor
```http
PATCH /rest/v1/donors?id=eq.<donor_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "verified": true
}
```

#### Admin Delete User
```http
DELETE /rest/v1/profiles?id=eq.<user_id>
Authorization: Bearer <admin_token>
```

---

## Database Schema

### Tables

#### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (references auth.users) |
| full_name | text | User's full name |
| email | text | Email address |
| phone | text | Phone number (optional) |
| role | text | One of: donor, recipient, admin |
| avatar_url | text | Profile image URL (optional) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### donors
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (references profiles) |
| blood_group | text | One of: A+, A-, B+, B-, AB+, AB-, O+, O- |
| city | text | City name |
| availability | boolean | Whether available to donate |
| last_donation_date | date | Date of last donation |
| age | integer | Age (18-65) |
| gender | text | One of: male, female, other, prefer_not_to_say |
| phone | text | Contact phone |
| verified | boolean | Admin verification status |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### blood_requests
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| requester_id | uuid | Foreign key to profiles |
| patient_name | text | Patient's name |
| blood_group | text | Required blood group |
| units_required | integer | Number of units needed (1-20) |
| hospital_name | text | Hospital name |
| city | text | City name |
| contact_person | text | Contact person's name |
| contact_phone | text | Contact phone |
| urgency | text | One of: normal, urgent, critical |
| status | text | One of: open, fulfilled, closed |
| description | text | Additional details (optional) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### donations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| donor_id | uuid | Foreign key to profiles |
| request_id | uuid | Foreign key to blood_requests (optional) |
| donated_at | timestamptz | Donation timestamp |
| notes | text | Notes (optional) |

#### notifications
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to profiles |
| type | text | Notification type |
| title | text | Notification title |
| message | text | Notification message (optional) |
| data | jsonb | Additional data (optional) |
| read | boolean | Whether read |
| created_at | timestamptz | Creation timestamp |

---

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles
- Users can read all profiles
- Users can only update/delete their own profile
- Admins can manage all profiles

### Donors
- All authenticated users can read donors (for search)
- Users can only CRUD their own donor profile
- Admins can manage all donor profiles

### Blood Requests
- All authenticated users can read requests
- Users can only CRUD their own requests
- Admins can manage all requests

### Notifications
- Users can only access their own notifications

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Frontend Integration

The frontend uses the Supabase JavaScript SDK. API calls are made through:

1. **Direct SDK calls** (handled by `src/lib/api.ts`)
2. **Edge Function calls** for complex operations

### Example Usage

```typescript
import { searchDonors, createBloodRequest } from './lib/api';

// Search donors
const { data, total } = await searchDonors({
  blood_group: 'O+',
  city: 'New York',
  available_only: true
});

// Create blood request
const { data, error } = await createBloodRequest({
  patient_name: 'Jane Doe',
  blood_group: 'A+',
  units_required: 2,
  hospital_name: 'City Hospital',
  city: 'New York',
  contact_person: 'John Doe',
  contact_phone: '+1234567890',
  urgency: 'urgent'
});
```

---

## Environment Variables

Required environment variables (pre-configured in `.env`):

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

The backend uses Supabase's service role key internally for Edge Functions (automatically configured).

---

## Deployment

The backend is automatically deployed with Supabase. To deploy updated Edge Functions:

1. Update the function code in `supabase/functions/<function-name>/index.ts`
2. Deploy using the Supabase CLI or Supabase MCP

Database migrations are applied via the Supabase MCP `apply_migration` tool.
