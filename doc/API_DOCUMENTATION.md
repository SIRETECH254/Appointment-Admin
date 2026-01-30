# Appointment Admin API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints available in the Appointment Admin application. The API follows RESTful conventions and uses JWT-based authentication with role-based access control.

**Base URL:** `http://localhost:4500` (configurable via `VITE_API_URL` environment variable)

All API endpoints are prefixed with `/api`, so the full URL format is: `http://localhost:4500/api/{endpoint}`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Authentication Flow

1. **Login/Register** - Obtain access token and refresh token
2. **OTP Verification** - Verify account via OTP sent to email/phone
3. **Token Storage** - Tokens are stored in localStorage
4. **Automatic Refresh** - Access tokens are automatically refreshed when expired (401 response)
5. **Token Refresh** - Use refresh token to get a new access token

### Role-Based Access Control

The system uses a unified user model with roles:
- `customer` - Regular customers booking appointments
- `staff` - Staff members providing services
- `admin` - Administrators managing the system

---

## API Endpoints

### Auth Endpoints

**Base:** `/api/auth`

#### Register
- **Endpoint:** `POST /auth/register`
- **Description:** User registration with OTP verification
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to email/phone",
    "data": {
      "userId": "string",
      "email": "string"
    }
  }
  ```

#### Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify OTP and activate account
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Account activated",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": { ... }
    }
  }
  ```

#### Resend OTP
- **Endpoint:** `POST /auth/resend-otp`
- **Description:** Resend OTP for verification
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```

#### Login
- **Endpoint:** `POST /auth/login`
- **Description:** User login (email/phone + password)
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": { ... }
    }
  }
  ```

#### Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Logout user and invalidate tokens
- **Auth Required:** Yes

#### Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Description:** Send password reset email
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```

#### Reset Password
- **Endpoint:** `POST /auth/reset-password/:token`
- **Description:** Reset password with token from email
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "newPassword": "string"
  }
  ```

#### Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Description:** Refresh JWT access token
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "string"
    }
  }
  ```

#### Get Current User
- **Endpoint:** `GET /auth/me`
- **Description:** Get current authenticated user profile
- **Auth Required:** Yes

---

### User Endpoints

**Base:** `/api/users`

#### Get Own Profile
- **Endpoint:** `GET /users/profile`
- **Description:** Get current user profile
- **Auth Required:** Yes

#### Update Own Profile
- **Endpoint:** `PUT /users/profile`
- **Description:** Update own profile
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "avatar": "string"
  }
  ```
- **Content-Type:** `application/json` or `multipart/form-data` (for avatar upload)

#### Change Password
- **Endpoint:** `PUT /users/change-password`
- **Description:** Change user password
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

#### Get Notification Preferences
- **Endpoint:** `GET /users/notifications`
- **Description:** Get notification preferences
- **Auth Required:** Yes

#### Update Notification Preferences
- **Endpoint:** `PUT /users/notifications`
- **Description:** Update notification preferences
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "email": "boolean",
    "sms": "boolean",
    "push": "boolean",
    "appointmentReminders": "boolean",
    "promotions": "boolean"
  }
  ```

#### Admin Create User
- **Endpoint:** `POST /users/admin-create`
- **Description:** Admin creates a new customer account
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "password": "string"
  }
  ```

#### Get Customers
- **Endpoint:** `GET /users/customers`
- **Description:** Get all customers (paginated)
- **Auth Required:** Yes (Admin/Staff)
- **Query Parameters:**
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
  - `search` - Search query
  - `status` - Filter by status (active/inactive)

#### Get User by ID
- **Endpoint:** `GET /users/:userId`
- **Description:** Get single user details
- **Auth Required:** Yes (Admin)

#### Update User
- **Endpoint:** `PUT /users/:userId`
- **Description:** Update user (admin only)
- **Auth Required:** Yes (Admin)

#### Delete User
- **Endpoint:** `DELETE /users/:userId`
- **Description:** Delete user (admin only)
- **Auth Required:** Yes (Admin)

#### Update User Status
- **Endpoint:** `PUT /users/:userId/status`
- **Description:** Activate/deactivate user account
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "isActive": "boolean"
  }
  ```

#### Set User Admin Role
- **Endpoint:** `PUT /users/:userId/admin`
- **Description:** Set user as admin
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "isAdmin": "boolean"
  }
  ```

#### Get User Roles
- **Endpoint:** `GET /users/:userId/roles`
- **Description:** Get user's assigned roles
- **Auth Required:** Yes (Admin)

#### Assign Role to User
- **Endpoint:** `POST /users/:userId/roles`
- **Description:** Assign a role to user
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "roleId": "string"
  }
  ```

#### Remove Role from User
- **Endpoint:** `DELETE /users/:userId/roles/:roleId`
- **Description:** Remove role from user
- **Auth Required:** Yes (Admin)

---

### Service Endpoints

**Base:** `/api/services`

#### Get All Services
- **Endpoint:** `GET /services`
- **Description:** Get all services (public - returns active only for non-admin)
- **Auth Required:** No (returns active only) / Yes (Admin - returns all)
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `search` - Search by name/description
  - `isActive` - Filter by status (admin only)

#### Get Service by ID
- **Endpoint:** `GET /services/:serviceId`
- **Description:** Get single service details
- **Auth Required:** No

#### Create Service
- **Endpoint:** `POST /services`
- **Description:** Create new service (admin only)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "duration": "number",
    "fullPrice": "number",
    "depositAmount": "number",
    "isActive": "boolean"
  }
  ```

#### Update Service
- **Endpoint:** `PUT /services/:serviceId`
- **Description:** Update service (admin only)
- **Auth Required:** Yes (Admin)

#### Delete Service
- **Endpoint:** `DELETE /services/:serviceId`
- **Description:** Delete service (admin only)
- **Auth Required:** Yes (Admin)

#### Toggle Service Status
- **Endpoint:** `PATCH /services/:serviceId/toggle-status`
- **Description:** Activate/deactivate service
- **Auth Required:** Yes (Admin)

#### Assign Services to Staff
- **Endpoint:** `POST /services/assign/:userId`
- **Description:** Assign services to a staff member
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "serviceIds": ["string"]
  }
  ```

---

### Appointment Endpoints

**Base:** `/api/appointments`

#### Create Appointment
- **Endpoint:** `POST /appointments`
- **Description:** Create a new appointment (booking)
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "staffId": "string",
    "services": ["string"],
    "startTime": "ISO8601 datetime",
    "notes": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "customerId": "string",
      "staffId": "string",
      "services": [...],
      "startTime": "datetime",
      "endTime": "datetime",
      "status": "pending",
      "bookingFeeAmount": "number",
      "remainingAmount": "number"
    }
  }
  ```

#### Confirm Appointment
- **Endpoint:** `POST /appointments/:appointmentId/confirm`
- **Description:** Confirm appointment with booking fee payment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string"
  }
  ```

#### Reschedule Appointment
- **Endpoint:** `PATCH /appointments/:appointmentId/reschedule`
- **Description:** Reschedule an existing appointment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "newStartTime": "ISO8601 datetime",
    "staffId": "string"
  }
  ```

#### Cancel Appointment
- **Endpoint:** `PATCH /appointments/:appointmentId/cancel`
- **Description:** Cancel an appointment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "reason": "string"
  }
  ```

#### Check In
- **Endpoint:** `PATCH /appointments/:appointmentId/check-in`
- **Description:** Check in customer for appointment (staff/admin)
- **Auth Required:** Yes (Staff/Admin)

#### Complete Appointment
- **Endpoint:** `PATCH /appointments/:appointmentId/complete`
- **Description:** Mark appointment as completed (staff/admin)
- **Auth Required:** Yes (Staff/Admin)

#### Mark No-Show
- **Endpoint:** `PATCH /appointments/:appointmentId/no-show`
- **Description:** Mark customer as no-show (staff/admin)
- **Auth Required:** Yes (Staff/Admin)

#### List Appointments
- **Endpoint:** `GET /appointments`
- **Description:** Get all appointments (admin/staff)
- **Auth Required:** Yes (Admin/Staff)
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `status` - Filter by status (pending, confirmed, checked_in, completed, cancelled, no_show)
  - `staffId` - Filter by staff
  - `customerId` - Filter by customer
  - `startDate` - Filter from date
  - `endDate` - Filter to date

#### Get My Appointments
- **Endpoint:** `GET /appointments/my`
- **Description:** Get current user's appointments (customer)
- **Auth Required:** Yes
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `status` - Filter by status
  - `upcoming` - Boolean to get only upcoming

#### Get Appointment by ID
- **Endpoint:** `GET /appointments/:appointmentId`
- **Description:** Get single appointment details
- **Auth Required:** Yes

#### Delete Appointment
- **Endpoint:** `DELETE /appointments/:appointmentId`
- **Description:** Delete appointment (admin only)
- **Auth Required:** Yes (Admin)

---

### Availability Endpoints

**Base:** `/api/availability`

#### Get Available Slots
- **Endpoint:** `GET /availability/slots`
- **Description:** Get available time slots for booking
- **Auth Required:** No
- **Query Parameters:**
  - `staffId` - Staff member ID (required)
  - `serviceId` - Service ID (required for duration calculation)
  - `date` - Date in YYYY-MM-DD format (required)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "slots": [
        {
          "startTime": "09:00",
          "endTime": "09:30",
          "available": true
        }
      ]
    }
  }
  ```

#### Get Day Availability
- **Endpoint:** `GET /availability/day`
- **Description:** Get availability summary for a day
- **Auth Required:** No
- **Query Parameters:**
  - `staffId` - Staff member ID (optional, returns all staff if not provided)
  - `date` - Date in YYYY-MM-DD format (required)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "date": "2025-01-30",
      "totalSlots": 16,
      "availableSlots": 10,
      "bookedSlots": 6
    }
  }
  ```

---

### Break Endpoints

**Base:** `/api/breaks`

#### Get All Breaks
- **Endpoint:** `GET /breaks`
- **Description:** Get all staff breaks (admin only)
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `staffId` - Filter by staff
  - `date` - Filter by date
  - `startDate` - Filter from date
  - `endDate` - Filter to date

#### Get Break by ID
- **Endpoint:** `GET /breaks/:breakId`
- **Description:** Get single break details
- **Auth Required:** Yes (Admin)

#### Create Break
- **Endpoint:** `POST /breaks`
- **Description:** Create staff break (admin only)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "staffId": "string",
    "startTime": "ISO8601 datetime",
    "endTime": "ISO8601 datetime",
    "reason": "string",
    "isRecurring": "boolean",
    "recurringPattern": {
      "frequency": "daily" | "weekly",
      "daysOfWeek": [0-6],
      "endDate": "ISO8601 date"
    }
  }
  ```

#### Update Break
- **Endpoint:** `PUT /breaks/:breakId`
- **Description:** Update break (admin only)
- **Auth Required:** Yes (Admin)

#### Delete Break
- **Endpoint:** `DELETE /breaks/:breakId`
- **Description:** Delete break (admin only)
- **Auth Required:** Yes (Admin)

---

### Payment Endpoints

**Base:** `/api/payments`

#### Initiate Payment
- **Endpoint:** `POST /payments/initiate`
- **Description:** Initiate payment for booking fee
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "appointmentId": "string",
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "paymentId": "string",
      "checkoutRequestId": "string",
      "status": "pending"
    }
  }
  ```

#### Service Payment
- **Endpoint:** `POST /payments/service-payment`
- **Description:** Pay remaining amount after appointment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "appointmentId": "string",
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string",
    "amount": "number"
  }
  ```

#### Get All Payments
- **Endpoint:** `GET /payments`
- **Description:** Get all payments (admin only)
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `status` - Filter by status (pending, completed, failed)
  - `method` - Filter by method (mpesa, paystack)
  - `type` - Filter by type (booking_fee, service_payment)
  - `startDate` - Filter from date
  - `endDate` - Filter to date

#### Get Payment by ID
- **Endpoint:** `GET /payments/:paymentId`
- **Description:** Get single payment details
- **Auth Required:** Yes

#### M-Pesa Webhook
- **Endpoint:** `POST /payments/webhooks/mpesa`
- **Description:** M-Pesa payment callback (internal)
- **Auth Required:** No (validated by M-Pesa signature)

#### Paystack Webhook
- **Endpoint:** `POST /payments/webhooks/paystack`
- **Description:** Paystack payment callback (internal)
- **Auth Required:** No (validated by Paystack signature)

---

### Notification Endpoints

**Base:** `/api/notifications`

#### Send Notification
- **Endpoint:** `POST /notifications`
- **Description:** Send notification (admin only)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "recipientId": "string",
    "type": "email" | "sms" | "push" | "in_app",
    "category": "appointment" | "payment" | "system" | "promotional",
    "subject": "string",
    "message": "string",
    "actions": [
      {
        "label": "string",
        "type": "link" | "action",
        "value": "string"
      }
    ]
  }
  ```

#### Get User Notifications
- **Endpoint:** `GET /notifications`
- **Description:** Get current user's notifications
- **Auth Required:** Yes
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `isRead` - Filter by read status

#### Get Unread Count
- **Endpoint:** `GET /notifications/unread-count`
- **Description:** Get unread notification count
- **Auth Required:** Yes

#### Get Unread Notifications
- **Endpoint:** `GET /notifications/unread`
- **Description:** Get all unread notifications
- **Auth Required:** Yes

#### Get Notifications by Category
- **Endpoint:** `GET /notifications/category/:category`
- **Description:** Get notifications by category
- **Auth Required:** Yes
- **Categories:** `appointment`, `payment`, `system`, `promotional`

#### Mark as Read
- **Endpoint:** `PATCH /notifications/:notificationId/read`
- **Description:** Mark notification as read
- **Auth Required:** Yes

#### Mark All as Read
- **Endpoint:** `PATCH /notifications/read-all`
- **Description:** Mark all notifications as read
- **Auth Required:** Yes

#### Delete Notification
- **Endpoint:** `DELETE /notifications/:notificationId`
- **Description:** Delete notification
- **Auth Required:** Yes

---

### Contact Endpoints

**Base:** `/api/contact`

#### Submit Contact Message
- **Endpoint:** `POST /contact`
- **Description:** Submit contact form message (public, optional auth for auto-fill)
- **Auth Required:** No (optional)
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "subject": "string",
    "message": "string"
  }
  ```

#### Get All Messages
- **Endpoint:** `GET /contact`
- **Description:** Get all contact messages (admin only)
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `status` - Filter by status (new, read, replied, archived)

#### Get Message by ID
- **Endpoint:** `GET /contact/:contactId`
- **Description:** Get single contact message
- **Auth Required:** Yes (Admin)

#### Update Status
- **Endpoint:** `PATCH /contact/:contactId/status`
- **Description:** Update message status
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "status": "new" | "read" | "replied" | "archived"
  }
  ```

#### Reply to Message
- **Endpoint:** `POST /contact/:contactId/reply`
- **Description:** Reply to contact message
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "reply": "string"
  }
  ```

---

### Role Endpoints

**Base:** `/api/roles`

#### Get All Roles
- **Endpoint:** `GET /roles`
- **Description:** Get all roles
- **Auth Required:** Yes (Admin)

#### Get Role by ID
- **Endpoint:** `GET /roles/:roleId`
- **Description:** Get single role details
- **Auth Required:** Yes (Admin)

#### Create Role
- **Endpoint:** `POST /roles`
- **Description:** Create new role (admin only)
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "name": "string",
    "displayName": "string",
    "description": "string",
    "permissions": ["string"]
  }
  ```

#### Update Role
- **Endpoint:** `PUT /roles/:roleId`
- **Description:** Update role (admin only)
- **Auth Required:** Yes (Admin)

#### Delete Role
- **Endpoint:** `DELETE /roles/:roleId`
- **Description:** Delete role (admin only, non-system roles only)
- **Auth Required:** Yes (Admin)

#### Get Users by Role
- **Endpoint:** `GET /roles/:roleId/users`
- **Description:** Get all users with specific role
- **Auth Required:** Yes (Admin)

#### Get Customer Users
- **Endpoint:** `GET /roles/customer/users`
- **Description:** Get all users with customer role
- **Auth Required:** Yes (Admin/Staff)

---

### Store Configuration Endpoints

**Base:** `/api/store-configuration`

#### Get Store Configuration
- **Endpoint:** `GET /store-configuration`
- **Description:** Get store configuration
- **Auth Required:** Yes (Admin)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "appointmentFeeType": "percentage" | "fixed",
      "appointmentFeeValue": "number",
      "currency": "string",
      "minBookingNotice": "number",
      "maxAdvanceBooking": "number",
      "lateGracePeriod": "number",
      "cancellationPolicy": {
        "allowCancellation": "boolean",
        "minNoticeHours": "number",
        "refundPercentage": "number"
      },
      "businessHours": {
        "monday": { "open": "09:00", "close": "17:00", "isOpen": true },
        ...
      },
      "businessHoursTimezone": "string",
      "notificationSettings": {
        "appointmentReminder": {
          "enabled": "boolean",
          "hoursBeforeArray": [24, 1]
        },
        ...
      }
    }
  }
  ```

#### Update Store Configuration
- **Endpoint:** `PUT /store-configuration`
- **Description:** Update store configuration (admin only)
- **Auth Required:** Yes (Admin)
- **Request Body:** Same structure as GET response data

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., slot already booked)
- `500` - Internal Server Error

## Error Handling

The API client automatically handles:
- **401 Unauthorized** - Attempts to refresh the access token using the refresh token
- **Token Refresh** - Automatically retries the original request after token refresh
- **FormData** - Automatically handles file uploads with proper Content-Type headers

## Usage Example

```typescript
import { authAPI, appointmentAPI, serviceAPI } from '@/api';

// Login
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get available slots
const slots = await availabilityAPI.getSlots({
  staffId: 'staffId',
  serviceId: 'serviceId',
  date: '2025-01-30'
});

// Create appointment
const appointment = await appointmentAPI.create({
  staffId: 'staffId',
  services: ['serviceId1', 'serviceId2'],
  startTime: '2025-01-30T09:00:00Z',
  notes: 'Customer notes'
});

// Confirm with payment
await appointmentAPI.confirm(appointment.data._id, {
  paymentMethod: 'mpesa',
  phoneNumber: '254712345678'
});
```

## Notes

- All dates should be in ISO 8601 format
- File uploads use `FormData` and are automatically handled
- Pagination parameters: `page` (default: 1), `limit` (default: 10)
- All ObjectId references should be valid MongoDB ObjectIds
- Phone numbers should include country code (e.g., 254712345678 for Kenya)
- Availability slots are calculated dynamically based on staff working hours, breaks, and existing appointments

---

**Last Updated:** January 2025  
**Version:** 1.0.0
