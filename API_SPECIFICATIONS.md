# API Specifications & Endpoints

## API Overview

### Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.hospital-system.com/api/v1
```

### Authentication Header

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Rate Limiting

- Standard endpoints: 100 requests per minute
- Login endpoint: 5 attempts per 15 minutes
- File upload: Max 10MB per file

### Response Format

**Success Response (2xx):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-04-26T10:30:00Z"
}
```

**Error Response (4xx, 5xx):**

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { ... },
  "timestamp": "2026-04-26T10:30:00Z"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication failed
- `403 Forbidden` - Not authorized to access
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Server under maintenance

---

## Authentication Endpoints

### POST /auth/register

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+84123456789",
  "role": "patient"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "patient",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation:**

- Email: valid email format, max 255 characters
- Password: min 8 characters, must include uppercase, lowercase, number, symbol
- Full Name: max 100 characters
- Role: enum [patient, doctor, nurse, receptionist, admin]

---

### POST /auth/login

Authenticate user and get tokens.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "patient",
      "avatar_url": "http://..."
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

**Error (401):**

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```

---

### POST /auth/refresh-token

Get new access token using refresh token.

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

---

### POST /auth/logout

Logout user and invalidate tokens.

**Request:**

```
No body required
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/profile

Get current authenticated user's profile.

**Request:**

```
Headers:
Authorization: Bearer {ACCESS_TOKEN}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+84123456789",
    "role": "patient",
    "avatar_url": "http://...",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-04-26T15:45:00Z"
  }
}
```

---

## Patient Endpoints

### GET /patients

List all patients (Admin/Doctor/Receptionist).

**Query Parameters:**

```
?page=1&limit=10&search=john&sort_by=created_at&sort_order=desc
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "medical_record_number": "MR-001",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+84123456789",
        "date_of_birth": "1990-01-15",
        "gender": "M",
        "blood_type": "O+",
        "created_at": "2026-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

### POST /patients

Create new patient (Admin/Receptionist).

**Request:**

```json
{
  "email": "patient@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+84123456789",
  "date_of_birth": "1990-01-15",
  "gender": "M",
  "blood_type": "O+",
  "allergies": ["Penicillin", "Shellfish"],
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+84987654321",
    "relationship": "Spouse"
  },
  "insurance_info": {
    "provider": "VietnamCare",
    "policy_number": "POL-123456"
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "medical_record_number": "MR-001",
    "email": "patient@example.com",
    "full_name": "John Doe",
    "created_at": "2026-04-26T10:30:00Z"
  }
}
```

---

### GET /patients/{id}

Get patient details.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "medical_record_number": "MR-001",
    "email": "patient@example.com",
    "full_name": "John Doe",
    "phone": "+84123456789",
    "date_of_birth": "1990-01-15",
    "gender": "M",
    "blood_type": "O+",
    "allergies": ["Penicillin"],
    "emergency_contact": { ... },
    "insurance_info": { ... },
    "appointments_count": 5,
    "medical_records_count": 12,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### PUT /patients/{id}

Update patient information.

**Request:**

```json
{
  "full_name": "John Updated",
  "phone": "+84234567890",
  "allergies": ["Penicillin", "Ibuprofen"],
  "emergency_contact": { ... }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { ... },
  "message": "Patient updated successfully"
}
```

---

### DELETE /patients/{id}

Delete patient (Admin only).

**Response (204):**
No content

---

### GET /patients/{id}/medical-records

Get patient's medical records.

**Query Parameters:**

```
?page=1&limit=20&date_from=2026-01-01&date_to=2026-04-30
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440100",
        "doctor": { "id": "...", "full_name": "Dr. Jane Smith" },
        "appointment": { "id": "...", "date": "2026-04-20" },
        "diagnosis": "Hypertension",
        "symptoms": ["High blood pressure", "Headache"],
        "vital_signs": {
          "blood_pressure": "150/100",
          "heart_rate": 85,
          "temperature": 36.8,
          "weight": 75
        },
        "treatment_plan": "Prescribed medication, lifestyle changes",
        "created_at": "2026-04-20T10:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET /patients/{id}/appointments

Get patient's appointments.

**Query Parameters:**

```
?status=scheduled&date_from=2026-05-01
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "doctor": { "id": "...", "full_name": "Dr. Jane Smith" },
        "appointment_date": "2026-05-10",
        "appointment_time": "14:30",
        "status": "scheduled",
        "reason_for_visit": "Regular checkup",
        "created_at": "2026-04-26T10:30:00Z"
      }
    ]
  }
}
```

---

### GET /patients/{id}/invoices

Get patient's invoices.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "invoice_number": "INV-001",
        "invoice_date": "2026-04-20",
        "total_amount": 500000,
        "paid_amount": 300000,
        "status": "partially_paid",
        "due_date": "2026-05-20"
      }
    ]
  }
}
```

---

## Appointment Endpoints

### POST /appointments

Book new appointment.

**Request:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440500",
  "appointment_date": "2026-05-15",
  "appointment_time": "14:30",
  "reason_for_visit": "Regular checkup",
  "notes": "Patient has urgent concern"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "patient": { "id": "...", "full_name": "John Doe" },
    "doctor": { "id": "...", "full_name": "Dr. Jane Smith" },
    "appointment_date": "2026-05-15",
    "appointment_time": "14:30",
    "status": "scheduled",
    "created_at": "2026-04-26T10:30:00Z"
  }
}
```

---

### GET /appointments

List appointments with filters.

**Query Parameters:**

```
?status=scheduled&date_from=2026-05-01&doctor_id=xxx&page=1
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "appointments": [ ... ],
    "pagination": { ... }
  }
}
```

---

### GET /appointments/availability

Get doctor's available time slots.

**Query Parameters:**

```
?doctor_id=xxx&date=2026-05-15
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "doctor_id": "550e8400-e29b-41d4-a716-446655440500",
    "date": "2026-05-15",
    "available_slots": [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "14:00",
      "14:30",
      "15:00"
    ]
  }
}
```

---

### PUT /appointments/{id}

Update appointment.

**Request:**

```json
{
  "appointment_date": "2026-05-16",
  "appointment_time": "15:00",
  "reason_for_visit": "Follow-up consultation"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### PUT /appointments/{id}/status

Update appointment status.

**Request:**

```json
{
  "status": "completed"
}
```

**Status Values:** `scheduled`, `completed`, `cancelled`, `no-show`

---

### DELETE /appointments/{id}

Cancel appointment.

**Response (204):**
No content

---

## Medical Record Endpoints

### POST /medical-records

Create medical record.

**Request:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440200",
  "diagnosis": "Hypertension",
  "symptoms": ["High blood pressure", "Headache"],
  "vital_signs": {
    "blood_pressure": "150/100",
    "heart_rate": 85,
    "temperature": 36.8,
    "weight": 75,
    "height": 180
  },
  "treatment_plan": "Prescribed medication, lifestyle changes",
  "notes": "Follow-up in 2 weeks"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### GET /medical-records/{id}

Get medical record detail.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patient": { ... },
    "doctor": { ... },
    "appointment": { ... },
    "diagnosis": "Hypertension",
    "symptoms": [ ... ],
    "vital_signs": { ... },
    "treatment_plan": "...",
    "prescriptions": [ ... ],
    "test_results": [ ... ],
    "attachments": [ ... ],
    "created_at": "2026-04-20T10:30:00Z"
  }
}
```

---

### POST /medical-records/{id}/upload

Upload attachment to medical record.

**Request:**

```
Content-Type: multipart/form-data
file: [binary file]
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "file_id": "550e8400-e29b-41d4-a716-446655440400",
    "file_name": "lab_results.pdf",
    "file_url": "http://api.../uploads/lab_results.pdf",
    "file_size": 1024000,
    "uploaded_at": "2026-04-26T10:30:00Z"
  }
}
```

---

## Medication Endpoints

### GET /medications

List all medications.

**Query Parameters:**

```
?search=aspirin&page=1&limit=20
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "medications": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440600",
        "name": "Aspirin",
        "dosage": "500mg",
        "description": "Pain reliever and fever reducer",
        "side_effects": ["Stomach upset", "Allergic reactions"],
        "stock_quantity": 500,
        "unit_price": 5000,
        "reorder_level": 100,
        "expiry_date": "2027-04-30"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST /medications

Add new medication (Admin/Pharmacist).

**Request:**

```json
{
  "name": "Paracetamol",
  "dosage": "1000mg",
  "description": "Fever and pain relief",
  "side_effects": ["Liver damage (overdose)", "Allergic reactions"],
  "drug_interactions": ["Warfarin", "Methotrexate"],
  "stock_quantity": 1000,
  "unit_price": 3000,
  "reorder_level": 200
}
```

---

## Invoice Endpoints

### POST /invoices

Create invoice.

**Request:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440200",
  "invoice_items": [
    {
      "item_type": "consultation",
      "description": "Doctor consultation",
      "quantity": 1,
      "unit_price": 200000
    },
    {
      "item_type": "medication",
      "description": "Aspirin 500mg",
      "quantity": 10,
      "unit_price": 5000
    }
  ],
  "due_date": "2026-05-26"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440300",
    "invoice_number": "INV-001",
    "invoice_date": "2026-04-26",
    "total_amount": 250000,
    "status": "pending",
    "items": [ ... ]
  }
}
```

---

### PUT /invoices/{id}/payment

Record invoice payment.

**Request:**

```json
{
  "amount_paid": 250000,
  "payment_method": "credit_card",
  "payment_reference": "TRANS-123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440300",
    "total_amount": 250000,
    "paid_amount": 250000,
    "status": "paid",
    "payment_date": "2026-04-26T10:30:00Z"
  }
}
```

---

## Report Endpoints

### GET /reports/appointments

Appointment statistics.

**Query Parameters:**

```
?date_from=2026-01-01&date_to=2026-04-30&doctor_id=xxx
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total_appointments": 250,
    "completed": 200,
    "cancelled": 30,
    "no_show": 20,
    "by_doctor": [ ... ],
    "by_status": { ... },
    "daily_trend": [ ... ]
  }
}
```

---

### GET /reports/revenue

Revenue report.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "period": "2026-01-01 to 2026-04-30",
    "total_revenue": 50000000,
    "paid": 45000000,
    "pending": 5000000,
    "by_month": [ ... ],
    "by_service": [ ... ]
  }
}
```

---

## Admin Endpoints

### GET /admin/users

List all users (Admin only).

**Query Parameters:**

```
?role=doctor&page=1&limit=20
```

---

### PUT /admin/users/{id}/role

Change user role (Admin only).

**Request:**

```json
{
  "role": "nurse"
}
```

---

### GET /admin/system-settings

Get system settings (Admin only).

---

### PUT /admin/system-settings

Update system settings (Admin only).

**Request:**

```json
{
  "hospital_name": "Central Hospital",
  "max_appointment_duration": 30,
  "appointment_reminder_time": 24,
  "business_hours_start": "08:00",
  "business_hours_end": "18:00"
}
```

---

## Error Codes

| Code                | HTTP Status | Description                           |
| ------------------- | ----------- | ------------------------------------- |
| INVALID_CREDENTIALS | 401         | Email or password incorrect           |
| TOKEN_EXPIRED       | 401         | JWT token has expired                 |
| TOKEN_INVALID       | 401         | JWT token is invalid                  |
| UNAUTHORIZED        | 403         | User not authorized to perform action |
| NOT_FOUND           | 404         | Resource not found                    |
| DUPLICATE_EMAIL     | 409         | Email already registered              |
| VALIDATION_ERROR    | 422         | Input validation failed               |
| RATE_LIMIT_EXCEEDED | 429         | Too many requests                     |
| INTERNAL_ERROR      | 500         | Internal server error                 |
| SERVICE_UNAVAILABLE | 503         | Service temporarily unavailable       |

---

_API Documentation - Last Updated: 2026-04-26_
