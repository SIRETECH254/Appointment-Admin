# Payment Status Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Socket.IO Integration](#socketio-integration)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ActivityIndicator } from 'react';
import io, { Socket } from 'socket.io-client';
import { useGetPaymentById, useQueryMpesaStatus } from '@/tanstack/usePayments';
import { API_BASE_URL } from '@/api/config';
import { formatPaymentStatus, getPaymentStatusVariant, formatCurrency } from '@/utils/paymentUtils';
import { formatDateTime } from '@/utils';
import type { IPayment } from '@/types/api.types';
```

## Context and State Management
- **Query Params:** `useSearchParams()` extracts `paymentId` and `checkoutId` from URL.
- **TanStack Query:** 
  - `useGetPaymentById(paymentId)` fetches payment data.
  - `useQueryMpesaStatus(checkoutId)` queries M-Pesa status as fallback (enabled: false, manually triggered).
- **Socket.IO:**
  - `socketRef` - Socket.IO connection reference
  - `socketConnected` - Socket connection status
  - `socketError` - Socket connection error message
- **Local State:**
  - `socketStatus` - Payment status from Socket.IO events
  - `isFallbackActive` - Fallback query active state
  - `timeoutRef` - Reference to fallback timeout
  - `inlineMessage` - Success/error feedback message

## UI Structure
- **Status Card:** Large status indicator (pending, processing, completed, failed) with icon and message.
- **Payment Details Card:** Payment information (amount, payment number, date, transaction reference).
- **Connection Status Card:** Socket.IO connection status and fallback query status (for M-Pesa).
- **Action Buttons:** View Details button, Retry Payment button (if failed).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Payment Status                            │
│ [Processing Spinner]                      │
│ Processing Payment...                     │
├────────────────────────────────────────────┤
│ Payment #: PAY-2025-0001                  │
│ Amount: KES 200                           │
│ Method: M-Pesa                            │
│ Date: Jan 25, 2025 10:30 AM             │
├────────────────────────────────────────────┤
│ Connection Status:                        │
│ Socket.IO: [Connected]                    │
│ Fallback Query: [Active] (if >60s)       │
├────────────────────────────────────────────┤
│ [View Details] [Retry Payment]            │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ Payment Status                                             │
│                                                            │
│                    [Processing Spinner]                    │
│                  Processing Payment...                      │
│                                                            │
│ Payment Details:                                           │
│ • Payment #: PAY-2025-0001                                 │
│ • Amount: KES 200                                          │
│ • Method: M-Pesa                                           │
│ • Date: January 25, 2025, 10:30 AM                        │
│ • Checkout ID: ws_CO_25012025103000                        │
│                                                            │
│ Connection Status (M-Pesa only):                           │
│ • Socket.IO: [Connected ✓]                               │
│ • Fallback Query: [Active] (checking status...)            │
│                                                            │
│ [View Details]              [Retry Payment]               │
└────────────────────────────────────────────────────────────┘
```

## Socket.IO Integration

### Connection Setup
- Connect to `API_BASE_URL` using `socket.io-client`.
- Subscribe to payment updates: `socket.emit('subscribe-to-payment', paymentId)`.
- Listen to events: `callback.received`, `payment.updated`, `appointment.updated`.

### M-Pesa Event Handling
- **`callback.received`** event:
  - Payload contains `CODE` and `message`.
  - Map result codes:
    - `0` = Success → Set status to 'completed'
    - `1` = Insufficient balance → Set status to 'failed'
    - `1032` = Cancelled by user → Set status to 'cancelled'
    - `1037` = Timeout → Set status to 'failed'
    - `2001` = Wrong PIN → Set status to 'failed'
    - `9999` = Keep waiting → Set status to 'processing'
    - Other codes → Set status to 'failed'
- **`payment.updated`** event:
  - Check if `payload.paymentId` matches current payment.
  - Update status from `payload.status`.

### Paystack Event Handling
- **`payment.updated`** event:
  - Check if `payload.paymentId` matches current payment.
  - Status `SUCCESS`/`PAID` → Set status to 'completed'.
  - Status `FAILED` → Set status to 'failed'.

### Fallback Query (M-Pesa Only)
- After 60 seconds (FALLBACK_TIMEOUT), if no callback received:
  - Set `isFallbackActive` to true.
  - Call `useQueryMpesaStatus(checkoutId)` to query Safaricom API.
  - Parse result code and update status accordingly.
  - Clear timeout and disconnect socket.

## API Integration
- **Get Endpoint:** `GET /api/payments/:paymentId` via `useGetPaymentById(paymentId)`.
- **M-Pesa Status Query:** `GET /api/payments/mpesa-status/:checkoutId` via `useQueryMpesaStatus(checkoutId)` (fallback only).
- **Response:** Payment object with status and transaction references.

## Components Used
- React Router DOM: `useSearchParams`, `useNavigate` for routing and query params.
- Socket.IO Client: `io` for real-time connection.
- TanStack Query: `useGetPaymentById`, `useQueryMpesaStatus` hooks.
- React: `ActivityIndicator` for loading spinner.
- Utility Functions: `formatPaymentStatus`, `getPaymentStatusVariant`, `formatCurrency` from `@/utils/paymentUtils`, `formatDateTime` from `@/utils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `badge`, `badge-success`, `badge-error`, `badge-soft`, `alert-error`, `alert-success`.

## Error Handling
- **Loading State:** Show loading indicator while fetching payment data.
- **Error State:** Display `alert-error` with API error message if fetch fails.
- **Socket Connection Error:** Display connection error message, show fallback query option.
- **Fallback Query Error:** Display error message, allow retry payment.
- **No Payment Found:** Display error message and link back to payment list.

## Navigation Flow
- Route: `/payments/status?paymentId=...&checkoutId=...` (query params).
- **View Details Button:** Navigate to `/payments/:paymentId` (payment details).
- **Retry Payment Button:** Navigate back to payment initiation page (if applicable).
- **Auto-navigation:** On successful payment, optionally navigate to payment details or appointment details.

## Functions Involved
- **`startTracking`** — Initializes Socket.IO connection and sets up event listeners.
  ```tsx
  const startTracking = useCallback((trackingPaymentId: string, trackingMethod: string) => {
    // Clear existing timers and connections
    clearPaymentTimers();
    
    // Connect Socket.IO
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Set up event listeners
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('subscribe-to-payment', trackingPaymentId);
      setSocketConnected(true);
    });
    
    // M-Pesa listeners
    if (trackingMethod === 'mpesa') {
      socketRef.current.on('callback.received', handleMpesaCallback);
      socketRef.current.on('payment.updated', handlePaymentUpdate);
    }
    
    // Paystack listeners
    if (trackingMethod === 'paystack') {
      socketRef.current.on('payment.updated', handlePaymentUpdate);
    }
    
    // Fallback query for M-Pesa after 60 seconds
    if (trackingMethod === 'mpesa' && checkoutId) {
      timeoutRef.current = setTimeout(async () => {
        setIsFallbackActive(true);
        const res = await refetchMpesaStatus();
        // Handle result...
        setIsFallbackActive(false);
        clearPaymentTimers();
      }, 60000);
    }
  }, [checkoutId, refetchMpesaStatus]);
  ```

- **`handleMpesaResultCode`** — Handles M-Pesa result codes from callbacks.
  ```tsx
  const handleMpesaResultCode = useCallback((resultCode: number, resultMessage: string) => {
    clearPaymentTimers();
    switch (resultCode) {
      case 0:
        setSocketStatus('completed');
        break;
      case 1:
        setSocketStatus('failed');
        setSocketError('Insufficient M-Pesa balance');
        break;
      case 1032:
        setSocketStatus('cancelled');
        setSocketError('Payment cancelled by user');
        break;
      // ... other cases
      default:
        setSocketStatus('failed');
        setSocketError(resultMessage || `Transaction failed with code ${resultCode}`);
    }
  }, []);
  ```

- **`clearPaymentTimers`** — Cleans up Socket.IO connection and timers.
  ```tsx
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);
  ```

## Implementation Details
- **Real-time Updates:** Socket.IO provides real-time payment status updates.
- **Fallback Mechanism:** M-Pesa fallback query ensures status is checked even if callback is delayed.
- **Status Indicators:** Visual indicators (spinner, checkmark, error icon) based on payment status.
- **Connection Status:** Display Socket.IO connection status for transparency.
- **Auto-cleanup:** Clean up Socket.IO connection and timers on component unmount.

## Future Enhancements
- Payment receipt generation on success.
- SMS/Email notification on payment completion.
- Payment history timeline.
- Retry payment with different method option.
