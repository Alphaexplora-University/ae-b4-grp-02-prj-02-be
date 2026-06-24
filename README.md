# Bookings API

A Node.js/Express backend API for managing bookings and customer inquiries, with Supabase database integration.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Connecting to React Frontend](#connecting-to-react-frontend)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Overview

This is a RESTful API backend that handles:
- **Customer Inquiries**: Create and track booking inquiries
- **Booking Management**: View and update booking statuses
- **Authentication**: Vendor authentication for protected routes
- **CORS Support**: Configured to work with frontend applications

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom middleware-based auth
- **Dependencies**: cors, dotenv, @supabase/supabase-js

## Project Structure

```
src/
├── app.js                      # Express app configuration
├── server.js                   # Server entry point
├── bookings/
│   ├── bookings.controller.js  # Request handlers
│   ├── bookings.repository.js  # Database queries
│   ├── bookings.routes.js      # Route definitions
│   ├── bookings.service.js     # Business logic
│   └── bookings.validator.js   # Input validation
├── config/
│   └── database.js             # Database configuration
└── shared/
    ├── middleware/
    │   ├── auth.middleware.js  # Authentication middleware
    │   └── error.middleware.js # Error handling middleware
    └── utils/
        ├── appError.js         # Custom error class
        └── logger.js           # Logging utility
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Supabase Account** (for database)
- Environment variables file (`.env`)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd Project2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory (see [Environment Setup](#environment-setup))

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_api_key

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment type | `development` or `production` |
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase API key | Your API key |
| `FRONTEND_URL` | Frontend application URL (for CORS) | `http://localhost:5173` |

## Running the Server

```bash
npm start
```

The server will start on the configured `PORT` (default: 4000).

**Health Check**:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{ "status": "ok" }
```

## API Endpoints

### Base URL
```
http://localhost:4000
```

### Bookings Endpoints

#### 1. **Create a Booking Inquiry** (Public)
Create a new booking inquiry without authentication.

```http
POST /bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "serviceDate": "2026-07-15",
  "serviceType": "standard",
  "notes": "Optional booking notes"
}
```

**Response** (201 Created):
```json
{
  "id": "booking-uuid",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "serviceDate": "2026-07-15",
  "serviceType": "standard",
  "status": "pending",
  "createdAt": "2026-06-24T10:30:00Z"
}
```

---

#### 2. **Track a Booking** (Public)
Retrieve booking details using a tracking UUID.

```http
GET /bookings/track/{uuid}
```

**Response** (200 OK):
```json
{
  "id": "booking-uuid",
  "customerName": "John Doe",
  "status": "confirmed",
  "serviceDate": "2026-07-15",
  "updatedAt": "2026-06-24T11:00:00Z"
}
```

---

#### 3. **Get My Bookings** (Vendor Only - Protected)
Retrieve all bookings for the authenticated vendor.

```http
GET /bookings
Authorization: Bearer {vendor_token}
```

**Response** (200 OK):
```json
[
  {
    "id": "booking-uuid-1",
    "customerName": "John Doe",
    "status": "pending",
    "serviceDate": "2026-07-15"
  },
  {
    "id": "booking-uuid-2",
    "customerName": "Jane Smith",
    "status": "confirmed",
    "serviceDate": "2026-07-16"
  }
]
```

---

#### 4. **Update Booking Status** (Vendor Only - Protected)
Update the status of a specific booking.

```http
PATCH /bookings/{id}/status
Authorization: Bearer {vendor_token}
Content-Type: application/json

{
  "status": "confirmed"
}
```

Allowed statuses: `pending`, `confirmed`, `completed`, `cancelled`

**Response** (200 OK):
```json
{
  "id": "booking-uuid",
  "status": "confirmed",
  "updatedAt": "2026-06-24T12:00:00Z"
}
```

---

### Health Check

```http
GET /health
```

**Response** (200 OK):
```json
{ "status": "ok" }
```

## Connecting to React Frontend

This section shows how to integrate your React application with the backend API.

### 1. Install Axios (for HTTP requests)

```bash
npm install axios
```

### 2. Create an API Client

Create a file `src/api/bookingsApi.js` in your React project:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendorToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bookingsApi = {
  // Public: Create a booking inquiry
  createInquiry: (data) => api.post('/bookings', data),

  // Public: Track a booking
  trackBooking: (uuid) => api.get(`/bookings/track/${uuid}`),

  // Protected: Get vendor's bookings
  getMyBookings: () => api.get('/bookings'),

  // Protected: Update booking status
  updateBookingStatus: (id, status) => 
    api.patch(`/bookings/${id}/status`, { status }),

  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;
```

### 3. Environment Variables (React)

Create a `.env.local` file in your React project:

```env
VITE_API_URL=http://localhost:4000
```

### 4. React Component Examples

#### Example 1: Create Booking Inquiry

```javascript
import { useState } from 'react';
import { bookingsApi } from '../api/bookingsApi';

function CreateBookingForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceDate: '',
    serviceType: 'standard',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await bookingsApi.createInquiry(formData);
      setSuccess(`Booking created! Track ID: ${response.data.id}`);
      setFormData({
        customerName: '',
        customerEmail: '',
        serviceDate: '',
        serviceType: 'standard',
        notes: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="customerName"
        placeholder="Name"
        value={formData.customerName}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="customerEmail"
        placeholder="Email"
        value={formData.customerEmail}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="serviceDate"
        value={formData.serviceDate}
        onChange={handleChange}
        required
      />
      <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
      </select>
      <textarea
        name="notes"
        placeholder="Additional notes"
        value={formData.notes}
        onChange={handleChange}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Create Booking'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}

export default CreateBookingForm;
```

#### Example 2: Track Booking Status

```javascript
import { useState } from 'react';
import { bookingsApi } from '../api/bookingsApi';

function TrackBooking() {
  const [uuid, setUuid] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await bookingsApi.trackBooking(uuid);
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleTrack}>
        <input
          type="text"
          placeholder="Enter booking UUID"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Tracking...' : 'Track Booking'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {booking && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Booking Details</h3>
          <p><strong>Customer:</strong> {booking.customerName}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Service Date:</strong> {booking.serviceDate}</p>
          <p><strong>Updated:</strong> {new Date(booking.updatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default TrackBooking;
```

#### Example 3: Vendor Dashboard (Protected)

```javascript
import { useState, useEffect } from 'react';
import { bookingsApi } from '../api/bookingsApi';

function VendorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsApi.getMyBookings();
        setBookings(response.data);
      } catch (err) {
        setError('Failed to load bookings. Make sure you are authenticated.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await bookingsApi.updateBookingStatus(id, newStatus);
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.customerName}</td>
                <td>{booking.serviceDate}</td>
                <td>{booking.status}</td>
                <td>
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VendorDashboard;
```

### 5. CORS Configuration

The backend is already configured to allow requests from:
- Default: `http://localhost:5173` (Vite default)
- Custom: Set `FRONTEND_URL` in `.env`

If you need to change the frontend URL, update your `.env` file:

```env
FRONTEND_URL=http://localhost:3000
```

## Error Handling

The API returns structured error responses:

```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `404`: Not found
- `500`: Server error

## Contributing

1. Create a new branch for features
2. Follow the existing code structure
3. Test your changes before committing
4. Update documentation as needed

---

For questions or issues, contact the development team.
