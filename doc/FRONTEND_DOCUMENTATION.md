# Appointment Admin - Frontend Documentation

## Table of Contents
- [Technology Stack](#technology-stack)
- [Required Packages](#required-packages)
- [Architecture Overview](#architecture-overview)
- [Pages & Screens](#pages--screens)
- [Components](#components)
- [Hooks](#hooks)
- [Constants](#constants)
- [Routing Structure](#routing-structure)
- [Styling Approach](#styling-approach)
- [UI Design System](#ui-design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
- [Code Style & Best Practices](#code-style--best-practices)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Additional Resources](#additional-resources)
- [Version Information](#version-information)
- [Support & Contribution](#support--contribution)

---

## Technology Stack

- **Framework:** React (web)
- **Language:** TypeScript
- **Routing:** React Router Dom
- **Styling:** Tailwind CSS
- **Build System:** Vite
- **Platform:** Web (browser)
- **Optional:** Socket.io client for real-time updates (backend uses Socket.io for live appointment updates and reminders)

---

## Required Packages

### Core Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.0.0",
  "typescript": "~5.9.3",
  "vite": "^7.2.5"
}
```

### Routing
```json
{
  "react-router-dom": "^7.0.0"
}
```

### Styling & UI
```json
{
  "tailwindcss": "^4.1.18",
  "@tailwindcss/vite": "^4.1.18"
}
```

### HTTP & API
```json
{
  "axios": "^1.7.0"
}
```

### State Management
```json
{
  "@reduxjs/toolkit": "^2.3.0",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0",
  "@tanstack/react-query": "^5.60.0"
}
```

### Real-Time
```json
{
  "socket.io-client": "^4.8.0"
}
```

### Icons & Visual
```json
{
  "react-icons": "^5.4.0"
}
```

### Time & Date
```json
{
  "date-fns": "^4.1.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0",
  "yup": "^1.4.0"
}
```

### Dev Dependencies
```json
{
  "@types/react": "^19.2.5",
  "@types/react-dom": "^19.2.3",
  "@types/node": "^24.10.1",
  "@vitejs/plugin-react": "^5.1.1",
  "eslint": "^9.39.1",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-react-refresh": "^0.4.24",
  "typescript-eslint": "^8.46.4"
}
```

---

## Architecture Overview

### Folder Structure
```
appointment-admin/
├── src/
│   ├── routes/                   # Route components (or pages/)
│   │   ├── index.tsx             # Root redirect (auth-based)
│   │   ├── NotFound.tsx          # 404 page
│   │   ├── public/               # Public (unauthenticated) routes
│   │   │   ├── Login.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── VerifyOtp.tsx
│   │   └── protected/            # Authenticated routes (layout + guard)
│   │       ├── Layout.tsx        # Authenticated layout (sidebar, navbar)
│   │       ├── Dashboard.tsx
│   │       ├── Profile.tsx
│   │       ├── ProfileChangePassword.tsx
│   │       ├── users/
│   │       │   ├── UserList.tsx
│   │       │   ├── UserDetails.tsx
│   │       │   ├── UserAdd.tsx
│   │       │   └── UserEdit.tsx
│   │       ├── store/
│   │       │   ├── StoreConfigList.tsx
│   │       │   └── StoreConfigEdit.tsx
│   │       ├── breaks/
│   │       │   ├── BreakList.tsx
│   │       │   ├── BreakDetails.tsx
│   │       │   ├── BreakAdd.tsx
│   │       │   └── BreakEdit.tsx
│   │       ├── appointments/
│   │       │   ├── AppointmentList.tsx
│   │       │   ├── AppointmentDetails.tsx
│   │       │   ├── AppointmentAdd.tsx
│   │       │   └── AppointmentEdit.tsx
│   │       ├── payments/
│   │       │   ├── PaymentList.tsx
│   │       │   ├── PaymentDetails.tsx
│   │       │   └── PaymentAdd.tsx
│   │       ├── roles/
│   │       │   ├── RoleList.tsx
│   │       │   ├── RoleDetails.tsx
│   │       │   ├── RoleAdd.tsx
│   │       │   └── RoleEdit.tsx
│   │       ├── services/
│   │       │   ├── ServiceList.tsx
│   │       │   ├── ServiceDetails.tsx
│   │       │   ├── ServiceAdd.tsx
│   │       │   └── ServiceEdit.tsx
│   │       ├── contact/
│   │       │   ├── ContactList.tsx
│   │       │   ├── ContactDetails.tsx
│   │       │   └── ContactReply.tsx
│   │       ├── notifications/
│   │       │   ├── NotificationList.tsx
│   │       │   ├── NotificationDetails.tsx
│   │       │   └── NotificationSettings.tsx
│   │       ├── staff/
│   │       │   ├── StaffList.tsx
│   │       │   ├── StaffDetails.tsx
│   │       │   ├── StaffAdd.tsx
│   │       │   ├── StaffEdit.tsx
│   │       │   └── StaffSchedule.tsx
│   │       └── availability/
│   │           └── AvailabilityView.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # Base UI components (Design System)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── forms/
│   │   │   ├── FormInput.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── Checkbox.tsx
│   │   └── tables/
│   │       ├── Table.tsx
│   │       ├── TableHeader.tsx
│   │       ├── TableRow.tsx
│   │       └── Pagination.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useThemeColor.ts
│   │   └── queries/              # TanStack Query hooks (optional co-location)
│   │       ├── useUsers.ts
│   │       ├── useAppointments.ts
│   │       └── ...
│   │
│   ├── constants/
│   │   └── theme.ts               # Brand colors (gold), typography, spacing
│   │
│   ├── api/                       # API client and domain modules
│   │   ├── client.ts              # Axios instance + interceptors
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   ├── services.ts
│   │   ├── storeConfig.ts
│   │   ├── breaks.ts
│   │   ├── appointments.ts
│   │   ├── payments.ts
│   │   ├── notifications.ts
│   │   ├── contact.ts
│   │   ├── staff.ts
│   │   ├── availability.ts
│   │   └── index.ts
│   │
│   ├── store/                     # Redux store (e.g. auth slice)
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   └── authSlice.ts
│   │   └── persistConfig.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── ReduxProvider.tsx
│   │
│   ├── types/                     # Shared TypeScript types
│   │   └── index.ts
│   │
│   ├── assets/
│   │   └── images/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── doc/
│   └── FRONTEND_DOCUMENTATION.md
│
├── .env
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── tailwind.config.js
```

### Architecture Patterns

#### 1. **Routing**
- React Router Dom with path-based routes.
- Route groups: public (login, forgot/reset password, verify OTP) vs protected (dashboard, profile, all management pages).
- Layout route for protected area (sidebar, navbar, outlet).
- Auth guard: redirect unauthenticated users to `/login`.

#### 2. **Component Layers**
- **UI Components:** Base design system in `components/ui/` (Button, Input, Card, Modal, Alert, Badge).
- **Layout Components:** Navigation and page structure in `components/layout/` (Navbar, Sidebar, Footer, Container).
- **Form Components:** Form-specific inputs in `components/forms/` (FormInput, Select, DatePicker, Checkbox).
- **Table Components:** Data presentation in `components/tables/` (Table, TableHeader, TableRow, Pagination).
- **Route/Page Components:** Full pages in `src/routes/`.

#### 3. **Styling**
- Tailwind CSS utility-first.
- Design tokens in `constants/theme.ts` and Tailwind config (gold palette, spacing, typography).
- No inline styles for layout; prefer Tailwind classes.

#### 4. **State Management**
- **Redux (or similar):** Global app state; auth slice (user, tokens) with redux-persist (e.g. localStorage) for web.
- **AuthProvider:** Wraps app; exposes login, logout, refresh, user, isAuthenticated, isLoading; coordinates token and redirects.
- **TanStack Query:** Server state for users, roles, services, store config, breaks, appointments, payments, contact, notifications, staff; query/mutation hooks per domain.
- **Local state:** useState/useReducer for UI-only state (modals, filters, form draft).
- **Navigation state:** React Router (location, params).

#### 5. **Services Layer**
- Central API client in `api/client.ts` (axios with base URL, request/response interceptors for auth and refresh).
- Domain modules in `api/` (auth, users, roles, services, storeConfig, breaks, appointments, payments, notifications, contact, staff, availability) calling the client.
- Environment variable `VITE_API_URL` for base URL.

---

## Pages & Screens

### 1. Root Layout (`App.tsx`)
**Purpose:** Root navigation structure and app-wide configuration.

**Features:**
- React Router setup (BrowserRouter).
- Providers: QueryClientProvider (TanStack Query), Redux Provider (with persist), AuthProvider.
- Route tree: public routes, protected layout, 404.
- Global layout wrapper.

**Routes:**
- `/` — Root index (redirect by auth).
- Public routes (login, forgot-password, reset-password/:token, verify-otp).
- Protected routes under layout (dashboard, profile, users, store, breaks, appointments, payments, roles, services, contact, notifications, staff, availability).
- `*` — NotFound (404).

---

### 2. Root Index (redirect)
**Purpose:** Entry point; redirect based on auth status.

**Features:**
- If not authenticated → redirect to `/login`.
- If authenticated → redirect to `/dashboard`.
- Loading state while checking auth.

**Route:** `/`

---

### 3. Not Found Page
**Purpose:** 404 for unmatched routes.

**Features:**
- User-friendly message.
- Link/button back to dashboard or login.

**Route:** `*`

---

### 4. Public (Auth) Pages

#### Login (`/login`)
**Purpose:** User authentication.

**Features:**
- Email or phone + password form.
- Form validation.
- Error display.
- Redirect to dashboard on success.
- Links to forgot password and verify OTP if needed.

**Backend:** `POST /api/auth/login`

---

#### Forgot Password (`/forgot-password`)
**Purpose:** Request password reset.

**Features:**
- Email input.
- Submit sends reset instructions.
- Success message and link to login.

**Backend:** `POST /api/auth/forgot-password`

---

#### Reset Password (`/reset-password/:token`)
**Purpose:** Set new password with token.

**Features:**
- Token from URL params.
- New password + confirm fields.
- Validation; submit reset.
- Redirect to login on success.

**Backend:** `POST /api/auth/reset-password/:token`

---

#### Verify OTP (`/verify-otp`)
**Purpose:** Verify OTP and activate account.

**Features:**
- Email or phone + OTP input.
- Resend OTP option.
- Redirect to dashboard or login on success.

**Backend:** `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp`

---

### 5. Protected Layout
**Purpose:** Wrapper for all authenticated pages with shared chrome.

**Features:**
- Auth guard: redirect to `/login` if not authenticated.
- Sidebar (or navbar) with links to dashboard, profile, users, store, breaks, appointments, payments, roles, services, contact, notifications, staff, availability.
- Main content area (outlet).
- Optional header with user menu and logout.

**Route:** All child routes under this layout.

---

### 6. Dashboard (`/dashboard`)
**Purpose:** Authenticated home; overview and quick actions.

**Features:**
- Summary stats (e.g. today’s appointments, pending payments).
- Quick links to add appointment, view appointments, etc.
- Optional recent activity list.

**Route:** `/dashboard`

---

### 7. Profile (`/profile`)
**Purpose:** View and edit own profile.

**Features:**
- Display current user (name, email, phone, avatar, roles).
- Edit form (firstName, lastName, phone, avatar upload).
- Link to change password.
- Save and success/error feedback.

**Backend:** `GET /api/users/profile`, `PUT /api/users/profile`

**Route:** `/profile`

---

### 8. Change Password (`/profile/change-password`)
**Purpose:** Change authenticated user’s password.

**Features:**
- Current password, new password, confirm new password.
- Validation and submit.
- Success message and optional redirect to profile.

**Backend:** `PUT /api/users/change-password`

**Route:** `/profile/change-password`

---

### 9. User Management

#### User List (`/users`)
**Purpose:** List all users (admin).

**Features:**
- Table/card list with search and filters (role, status).
- Sort by name, email, status.
- Actions: view, edit, activate/deactivate.
- Pagination.
- “Add user” button.

**Backend:** `GET /api/users`, `GET /api/users/customers`

**Route:** `/users`

---

#### User Details (`/users/:id`)
**Purpose:** View single user (admin).

**Features:**
- User profile, roles, status, optional appointments/payments summary.
- Edit and delete (or deactivate) actions.

**Backend:** `GET /api/users/:userId`

**Route:** `/users/:id`

---

#### User Add (`/users/new`)
**Purpose:** Create user (admin; e.g. admin-create customer).

**Features:**
- Form: firstName, lastName, email, phone, roleName, address, city, country.
- Validation; submit.
- Redirect to user detail or list on success.

**Backend:** `POST /api/users/admin-create`

**Route:** `/users/new`

---

#### User Edit (`/users/:id/edit`)
**Purpose:** Edit user (admin).

**Features:**
- Pre-filled form; update profile, roles, status.
- Validation and save.
- Success/error feedback.

**Backend:** `PUT /api/users/:userId`, `PUT /api/users/:userId/status`, `POST /api/users/:userId/roles`, `DELETE /api/users/:userId/roles/:roleId`

**Route:** `/users/:id/edit`

---

### 10. Store Management

#### Store Config List / View (`/store`)
**Purpose:** View single store configuration (one config per app).

**Features:**
- Display: appointmentFeeType, appointmentFeeValue, currency, minBookingNotice, lateGracePeriod, allowWalkIns, notificationSettings, businessHoursTimezone.
- Link/button to edit.

**Backend:** `GET /api/store-configuration`

**Route:** `/store`

---

#### Store Config Edit (`/store/edit`)
**Purpose:** Update store configuration (admin).

**Features:**
- Form: fee type/value, min booking notice, late grace period, allow walk-ins, notification settings (sendSMS, sendEmail, sendPush, reminderTimes), timezone.
- Validation; save.
- Success/error feedback.

**Backend:** `PUT /api/store-configuration`

**Route:** `/store/edit`

---

### 11. Break Management

#### Break List (`/breaks`)
**Purpose:** List breaks (admin).

**Features:**
- Table with filters: staffId, date, from/to.
- Actions: view, edit, delete.
- “Add break” button.

**Backend:** `GET /api/breaks`

**Route:** `/breaks`

---

#### Break Details (`/breaks/:id`)
**Purpose:** View single break.

**Features:**
- staffId, startTime, endTime, reason.
- Edit and delete actions.

**Backend:** `GET /api/breaks/:breakId`

**Route:** `/breaks/:id`

---

#### Break Add (`/breaks/new`)
**Purpose:** Create break (admin).

**Features:**
- Form: staffId, startTime, endTime, reason.
- Validation; submit.

**Backend:** `POST /api/breaks`

**Route:** `/breaks/new`

---

#### Break Edit (`/breaks/:id/edit`)
**Purpose:** Edit break (admin).

**Features:**
- Pre-filled form; update and save.

**Backend:** `PUT /api/breaks/:breakId`

**Route:** `/breaks/:id/edit`

---

### 12. Appointment Management

#### Appointment List (`/appointments`)
**Purpose:** List appointments (admin/staff).

**Features:**
- Filters: status, staffId, startDate, endDate.
- Table with customer, staff, services, start/end time, status, actions (view, reschedule, cancel, check-in, complete, no-show).
- Pagination; “Add appointment” if supported.

**Backend:** `GET /api/appointments`

**Route:** `/appointments`

---

#### Appointment Details (`/appointments/:id`)
**Purpose:** View single appointment.

**Features:**
- Customer, staff, services, start/end time, status, booking fee, remaining amount, checkedInAt, actualEndTime.
- Actions: reschedule, cancel, check-in, complete, no-show, confirm (payment).

**Backend:** `GET /api/appointments/:appointmentId`, `PATCH /api/appointments/:appointmentId/*`

**Route:** `/appointments/:id`

---

#### Appointment Add (`/appointments/new`)
**Purpose:** Create appointment (admin or customer flow).

**Features:**
- Form: staffId, services (multi), startTime, endTime (or slot picker using availability API).
- Validation; slot check; submit.
- Redirect to detail or list.

**Backend:** `POST /api/appointments`, `GET /api/availability/slots`

**Route:** `/appointments/new`

---

#### Appointment Edit / Reschedule (`/appointments/:id/edit`)
**Purpose:** Reschedule or edit appointment.

**Features:**
- Pre-filled times; change start/end; validate slot.
- Save and feedback.

**Backend:** `PATCH /api/appointments/:appointmentId/reschedule`

**Route:** `/appointments/:id/edit`

---

### 13. Payment Management

#### Payment List (`/payments`)
**Purpose:** List payments (admin/staff).

**Features:**
- Filters: status, method, appointmentId.
- Table: payment number, amount, type, method, status, date, actions.
- “Record payment” or “Initiate payment” if applicable.

**Backend:** `GET /api/payments`

**Route:** `/payments`

---

#### Payment Details (`/payments/:id`)
**Purpose:** View single payment.

**Features:**
- Amount, type, method, status, transactionRef, processorRefs, appointment link.
- Optional actions (e.g. retry if failed).

**Backend:** `GET /api/payments/:paymentId`

**Route:** `/payments/:id`

---

#### Payment Add / Initiate (`/payments/new`)
**Purpose:** Record manual payment or initiate gateway payment (admin).

**Features:**
- Form or flow: appointment (optional), amount, method (MPESA/CARD/CASH), phone/email for gateway.
- Submit; redirect or show status.

**Backend:** `POST /api/payments/initiate` (or service-payment)

**Route:** `/payments/new`

---

### 14. Role Management

#### Role List (`/roles`)
**Purpose:** List roles (admin).

**Features:**
- Table: name, displayName, description, isActive, isSystemRole, actions.
- “Add role” (non-system only).

**Backend:** `GET /api/roles`

**Route:** `/roles`

---

#### Role Details (`/roles/:id`)
**Purpose:** View single role and users in role.

**Features:**
- Role details; list users by role.
- Edit and delete (if not system role).

**Backend:** `GET /api/roles/:roleId`, `GET /api/roles/:roleId/users`

**Route:** `/roles/:id`

---

#### Role Add (`/roles/new`)
**Purpose:** Create role (admin).

**Features:**
- Form: name, displayName, description, permissions, isActive.
- Submit.

**Backend:** `POST /api/roles`

**Route:** `/roles/new`

---

#### Role Edit (`/roles/:id/edit`)
**Purpose:** Edit role (admin).

**Features:**
- Pre-filled form; update and save.

**Backend:** `PUT /api/roles/:roleId`

**Route:** `/roles/:id/edit`

---

### 15. Service Management

#### Service List (`/services`)
**Purpose:** List services.

**Features:**
- Table: name, description, duration, fullPrice, sortOrder, isActive, actions.
- Toggle active; add, edit, delete.

**Backend:** `GET /api/services`

**Route:** `/services`

---

#### Service Details (`/services/:id`)
**Purpose:** View single service.

**Features:**
- Name, description, duration, fullPrice, sortOrder, isActive.
- Edit and delete actions.

**Backend:** `GET /api/services/:serviceId`

**Route:** `/services/:id`

---

#### Service Add (`/services/new`)
**Purpose:** Create service (admin).

**Features:**
- Form: name, description, duration, fullPrice, sortOrder, isActive.
- Submit.

**Backend:** `POST /api/services`

**Route:** `/services/new`

---

#### Service Edit (`/services/:id/edit`)
**Purpose:** Edit service (admin).

**Features:**
- Pre-filled form; update and save.

**Backend:** `PUT /api/services/:serviceId`, `PATCH /api/services/:serviceId/toggle-status`

**Route:** `/services/:id/edit`

---

### 16. Contact Management

#### Contact List (`/contact`)
**Purpose:** List contact form submissions (admin).

**Features:**
- Table: name, email, subject, status, date; filters (status).
- Actions: view, reply, mark read/replied/archived.

**Backend:** `GET /api/contact`

**Route:** `/contact`

---

#### Contact Details (`/contact/:id`)
**Purpose:** View single contact message.

**Features:**
- Name, email, phone, subject, message, status, userId if any.
- Reply and update status actions.

**Backend:** `GET /api/contact/:contactId`, `PATCH /api/contact/:contactId/status`

**Route:** `/contact/:id`

---

#### Contact Reply (`/contact/:id/reply`)
**Purpose:** Reply to contact (admin).

**Features:**
- Original message display; reply form (e.g. email body).
- Submit reply; mark as replied.

**Backend:** `POST /api/contact/:contactId/reply`

**Route:** `/contact/:id/reply`

---

### 17. Notification Management

#### Notification List (`/notifications`)
**Purpose:** Notification center for current user.

**Features:**
- List with unread count; filter by category (general, appointment, payment).
- Mark as read, mark all as read; delete.
- Optional link to settings.

**Backend:** `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`

**Route:** `/notifications`

---

#### Notification Details (`/notifications/:id`)
**Purpose:** View single notification.

**Features:**
- Full message, category, read status, actions if any.
- Mark as read.

**Backend:** `GET /api/notifications/:notificationId`

**Route:** `/notifications/:id`

---

#### Notification Settings (`/notifications/settings`)
**Purpose:** User notification preferences.

**Features:**
- Toggles: email, sms, inApp (or use profile/notifications API).
- Save.

**Backend:** `GET /api/users/notifications`, `PUT /api/users/notifications`

**Route:** `/notifications/settings`

---

### 18. Staff Management

#### Staff List (`/staff`)
**Purpose:** List staff (admin).

**Features:**
- Table: user (name, email), assigned services, working hours summary, status.
- Actions: view, edit, working hours, schedule.
- “Add staff” (create staff record for user).

**Backend:** `GET /api/staff`

**Route:** `/staff`

---

#### Staff Details (`/staff/:id`)
**Purpose:** View single staff.

**Features:**
- User info, services, working hours, status.
- Edit, set working hours, view schedule.

**Backend:** `GET /api/staff/:staffId`

**Route:** `/staff/:id`

---

#### Staff Add (`/staff/new`)
**Purpose:** Create staff record (admin).

**Features:**
- Link user (select existing user or create); assign services; initial working hours.
- Submit.

**Backend:** `POST /api/staff`

**Route:** `/staff/new`

---

#### Staff Edit (`/staff/:id/edit`)
**Purpose:** Edit staff (admin).

**Features:**
- Update profile, assigned services, working hours, status.
- Save.

**Backend:** `PUT /api/staff/:staffId`, `PATCH /api/staff/:staffId/working-hours`, `PATCH /api/staff/:staffId/status`

**Route:** `/staff/:id/edit`

---

#### Staff Schedule (`/staff/:id/schedule`)
**Purpose:** View staff calendar/schedule.

**Features:**
- Appointments and breaks for staff; optional date range.
- Use availability API for slot context.

**Backend:** `GET /api/staff/:staffId/schedule`, `GET /api/availability/day`

**Route:** `/staff/:id/schedule`

---

### 19. Availability (optional)

#### Availability View (`/availability`)
**Purpose:** View available slots or day summary.

**Features:**
- Select staff, service, date; display slots or day summary.
- Can be embedded in appointment add/edit instead of standalone page.

**Backend:** `GET /api/availability/slots`, `GET /api/availability/day`

**Route:** `/availability` (or embedded in appointment flow)

---

## Components

### UI Components (`components/ui/`)

- **Icons:** Use **react-icons** (e.g. `Fa*`, `Io*`, `Md*`, `Hi*` from Font Awesome, Ionicons, Material Design, Heroicons).
- **Button:** Variants primary, secondary, danger, ghost, disabled; gold primary per design system.
- **Input:** Text input with border, focus, error state; optional label and error message.
- **Card:** Container with optional accent strip (gold); padding, border-radius, shadow.
- **Modal:** Dialog overlay; title, content, footer actions; close on overlay/escape.
- **Alert:** Success, error, info variants; icon + message.
- **Badge:** Status badges (e.g. PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW; NEW, READ, REPLIED, ARCHIVED).

### Layout Components (`components/layout/`)

- **Navbar:** Top bar with logo, nav links, user menu, logout.
- **Sidebar:** Vertical nav (dashboard, profile, users, store, breaks, appointments, payments, roles, services, contact, notifications, staff, availability); collapse on small screens if needed.
- **Footer:** Optional page footer.
- **Container:** Page content wrapper with max-width and padding.

### Form Components (`components/forms/`)

- **FormInput:** Label + input + error message; optional required indicator.
- **Select:** Dropdown for single select (e.g. role, staff, service, status).
- **DatePicker:** Date and/or time selection (appointments, breaks).
- **Checkbox:** Boolean option.

### Table Components (`components/tables/`)

- **Table:** Semantic table wrapper; header + body.
- **TableHeader:** Header row with sortable column headers if needed.
- **TableRow:** Row with cells; optional click and actions.
- **Pagination:** Previous/next, page numbers, page size; integrate with list queries.

---

## Hooks

- **useAuth:** From AuthProvider; returns `{ user, isAuthenticated, isLoading, login, logout, refresh }`. Used for guard and header.
- **useThemeColor:** Optional; returns theme color by name (e.g. primary, accent) for programmatic styling.
- **TanStack Query hooks:** Co-locate with API or in `hooks/queries/`: e.g. `useUsers`, `useUser(id)`, `useAppointments`, `useAppointment(id)`, `useRoles`, `useServices`, `useStoreConfig`, `useBreaks`, `usePayments`, `useContact`, `useNotifications`, `useStaff`, `useAvailabilitySlots`. Each encapsulates `useQuery`/`useMutation` and API calls.

---

## Constants

### Theme Constants (`constants/theme.ts`)

#### Brand Palette (Gold theme)
```typescript
export const BrandColors = {
  primary: '#D4AF37',      // Primary gold - buttons, active states
  accent: '#C5A028',       // Accent gold - hover, emphasis
  soft: '#E8C547',         // Soft gold - secondary elements, success
  lightTint: '#FFF8E7',    // Light tint - card backgrounds

  text: '#000000',
  background: '#ffffff',
  border: '#e5e5e5',

  error: '#a33c3c',
  success: '#2d8a2d',
  disabled: '#f0f0f0',
  disabledText: '#999999',
};
```

#### Typography
- Headings: Poppins (or similar), bold/semibold; sizes 28–32px (h1), 22–26px (h2), 18–20px (h3).
- Body: Inter (or similar), regular; 14–16px.
- Caption: 12px; labels, helper text.

#### Spacing (4-point scale)
- xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, 2xl: 48, 3xl: 64 (px).
- Use Tailwind equivalents: p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16.

---

## Routing Structure

### Route Hierarchy

- **Public:** `/login`, `/forgot-password`, `/reset-password/:token`, `/verify-otp`
- **Protected (under layout):** `/dashboard`, `/profile`, `/profile/change-password`, `/users`, `/users/new`, `/users/:id`, `/users/:id/edit`, `/store`, `/store/edit`, `/breaks`, `/breaks/new`, `/breaks/:id`, `/breaks/:id/edit`, `/appointments`, `/appointments/new`, `/appointments/:id`, `/appointments/:id/edit`, `/payments`, `/payments/new`, `/payments/:id`, `/roles`, `/roles/new`, `/roles/:id`, `/roles/:id/edit`, `/services`, `/services/new`, `/services/:id`, `/services/:id/edit`, `/contact`, `/contact/:id`, `/contact/:id/reply`, `/notifications`, `/notifications/settings`, `/notifications/:id`, `/staff`, `/staff/new`, `/staff/:id`, `/staff/:id/edit`, `/staff/:id/schedule`, `/availability`
- **Root:** `/` → redirect by auth
- **404:** `*` → NotFound

### Auth Guard Pattern

- Protected layout (or wrapper) checks `isAuthenticated` from AuthProvider (or Redux).
- If `isLoading`, show loading UI.
- If `!isAuthenticated`, redirect to `/login` (and optionally save intended URL for post-login redirect).
- Otherwise render outlet (child routes).

---

## Styling Approach

- **Tailwind CSS:** Utility-first; content paths in config for `./src/**/*.{ts,tsx}`.
- **Theme integration:** Extend Tailwind theme in `tailwind.config.js` with colors from `constants/theme.ts` (e.g. `brand.primary`, `brand.accent`, `brand.soft`, `brand.lightTint`), fontFamily (Poppins, Inter), spacing if needed.
- **Global styles:** In `src/index.css`, use Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`); add any custom base (e.g. font imports, minimal resets).
- **Component styling:** Prefer Tailwind classes; avoid inline styles except for dynamic values. Use design tokens (gold palette, spacing) consistently.

---

## UI Design System

### Overview

The Appointment Admin UI uses a **gold** theme for primary actions and accents, with neutral backgrounds and text for readability.

**Design philosophy:** Professional, minimal, efficient; gold used for focus and key actions.

### Brand Palette (Gold)

| Role           | Hex       | Usage                          | Tailwind class       |
|----------------|-----------|--------------------------------|----------------------|
| Primary Gold   | `#D4AF37` | Primary buttons, active icons  | `bg-brand-primary`   |
| Accent Gold    | `#C5A028` | Hover, emphasis                | `bg-brand-accent`    |
| Soft Gold      | `#E8C547` | Secondary, success             | `bg-brand-soft`      |
| Light Tint     | `#FFF8E7` | Card backgrounds, subtle      | `bg-brand-tint`      |
| Text           | `#000000` | Primary text                   | `text-black`         |
| Background     | `#ffffff` | Page background                | `bg-white`           |
| Border         | `#e5e5e5` | Dividers, inputs               | `border-gray-300`    |

### Typography

- **H1:** Poppins 700, 28–32px; page titles.
- **H2:** Poppins 600, 22–26px; section titles.
- **H3:** Poppins 600, 18–20px; subsection.
- **Body:** Inter 400, 14–16px; general text.
- **Caption:** Inter 300/400, 12px; labels, helper text.

### Spacing & Grid

- 4-point scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Minimum padding for interactive elements: 16px.
- Section spacing: 24–32px; page-level up to 64px on large screens.

### Buttons

- **Primary:** Gold background (`#D4AF37`), white text; hover accent gold.
- **Secondary:** White background, gold border and text.
- **Danger:** Red for delete/destructive.
- **Ghost:** Transparent, gold text.
- **Disabled:** Gray background and text.
- Min height ~48px; border-radius e.g. `rounded-xl`.

### Forms & Inputs

- Border `#e5e5e5`; focus border gold (2px).
- Label above input; error text and border in red.
- Border-radius `rounded-lg`.
- **Form validation:** Use **yup** for schema validation with **react-hook-form** (`@hookform/resolvers/yup`).

### Cards & Containers

- White background; padding `p-6`; border-radius `rounded-2xl`; optional shadow.
- Optional 4px top accent strip in gold.

### Tables

- Header: light gold tint background (`#FFF8E7`), gold or dark text.
- Rows: white; hover light tint; border between rows.
- Align numbers/currency right; text left.

### Notifications & Alerts

- Success: soft gold or green; icon + message.
- Error: red; icon + message.
- Info: light tint background; dark text.

### Accessibility

- Contrast: body text and UI meet WCAG AA (e.g. 4.5:1).
- Focus: visible focus ring (e.g. gold or neutral).
- Touch targets: min ~48px where applicable.
- Labels: all inputs have associated labels.

### Responsive

- Breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px.
- Sidebar: collapse to drawer or top nav on small screens.
- Tables: consider horizontal scroll or card stack on mobile.

### Component Directory

- `components/ui/` — Button, Input, Card, Modal, Alert, Badge.
- `components/layout/` — Navbar, Sidebar, Footer, Container.
- `components/forms/` — FormInput, Select, DatePicker, Checkbox.
- `components/tables/` — Table, TableHeader, TableRow, Pagination.

---

## State Management

- **Redux (or similar):** Global app state; auth slice holds user and tokens. Persist to localStorage via redux-persist so sessions survive refresh. Serialize only safe fields (no raw password).
- **AuthProvider:** Wraps app; reads/writes auth state (Redux or local); provides login, logout, refresh, user, isAuthenticated, isLoading. On mount, optionally validate token or refresh; redirect unauthenticated users from protected routes.
- **TanStack Query:** Server state for all API-backed lists and details (users, roles, services, store config, breaks, appointments, payments, contact, notifications, staff). Use default staleTime (e.g. 5 min) and gcTime (e.g. 10 min); query keys per resource and filters; mutations invalidate relevant queries. Co-locate hooks with API modules or in `hooks/queries/`.
- **Local state:** useState/useReducer for modals, filters, form draft, UI toggles.
- **Navigation state:** React Router (location, params); no duplicate state for route data.

---

## API Integration

### API Client

- **File:** `api/client.ts` (or `services/api.ts`).
- **Base URL:** From `import.meta.env.VITE_API_URL` (e.g. `http://localhost:4500`).
- **Request interceptor:** Attach `Authorization: Bearer <accessToken>` from Redux or AuthProvider.
- **Response interceptor:** On 401, try refresh (e.g. `POST /api/auth/refresh-token` with refreshToken); on success update token and retry request; on failure clear auth and redirect to login. For other errors, optionally show toast or global error handler.
- **Content-Type:** `application/json` for JSON bodies; for file uploads use FormData and do not set Content-Type (browser sets multipart boundary).

### Domain Modules

- **auth:** login, logout, refreshToken, forgotPassword, resetPassword, verifyOtp, resendOtp, getMe.
- **users:** getProfile, updateProfile, changePassword, getNotificationPreferences, updateNotificationPreferences; admin: getAllUsers, getUserById, updateUser, updateUserStatus, deleteUser, adminCreateCustomer, assignRole, removeRole, getCustomers.
- **roles:** getAllRoles, getRole, getUsersByRole, createRole, updateRole, deleteRole.
- **services:** getServices, getService, createService, updateService, deleteService, toggleServiceStatus, assignServicesToStaff.
- **storeConfig:** getStoreConfiguration, updateStoreConfiguration.
- **breaks:** getBreaks, getBreak, createBreak, updateBreak, deleteBreak.
- **appointments:** getAppointments, getAppointmentById, getMyAppointments, createAppointment, confirmAppointment, rescheduleAppointment, cancelAppointment, checkIn, completeAppointment, markNoShow, deleteAppointment.
- **payments:** getPayments, getPayment, initiatePayment (and service-payment if used).
- **notifications:** getNotifications, getUnreadCount, getUnread, getByCategory, getNotification, markAsRead, markAllAsRead, deleteNotification, sendNotification, sendBulkNotification.
- **contact:** getContacts, getContact, replyToContact, updateContactStatus.
- **staff:** getStaff, getStaffList, createStaff, updateStaff, setWorkingHours, setAvailabilityStatus, getStaffSchedule.
- **availability:** getAvailableSlots, getDayAvailability.

### Environment Variables

- `VITE_API_URL` — Backend API base URL (e.g. `http://localhost:4500`).
- Do not put secrets (e.g. API keys for server-only use) in Vite env; backend handles those.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to project: `cd appointment-admin`
2. Install dependencies: `npm install`
3. Copy env: `cp .env.example .env` and set `VITE_API_URL` to your backend URL.
4. Start dev server: `npm run dev`
5. Build: `npm run build`
6. Preview build: `npm run preview`

### Development

- Run backend (Appointment API) so API calls resolve (see backend doc).
- Use React Router and AuthProvider so protected routes redirect to login when not authenticated.

---

## Code Style & Best Practices

- **TypeScript:** Strict mode; type props and API responses; avoid `any` where possible.
- **Path aliases:** Use `@/` for `src/` (e.g. `@/components/ui/Button`, `@/api/client`). Configure in `tsconfig.json` and `vite.config.ts`.
- **Components:** Functional components; named exports for components, default for page/route components if preferred.
- **Naming:** PascalCase for components; camelCase for files (e.g. `UserList.tsx`); `use` prefix for hooks; UPPER_SNAKE for constants.
- **Props:** Define interfaces or types for component props and API payloads.

---

## Security Considerations

- **Token storage (web):** Access token in memory (Redux/context) is preferable; if persisting, use redux-persist to localStorage and accept XSS risk for refresh token, or use httpOnly cookies if backend supports it. Do not store tokens in sessionStorage for long-lived refresh if avoidable.
- **HTTPS:** Use HTTPS in production for API and app.
- **Secrets:** No backend API secrets or private keys in frontend env or code.
- **Auth:** Validate token and refresh before sensitive operations; redirect to login on 401 after refresh failure.

---

## Testing

- **Unit/component:** Jest + React Testing Library; test critical UI and hooks.
- **E2E (optional):** Playwright or Cypress for login flow and one or two main admin flows.
- **API mocking:** MSW (Mock Service Worker) or similar for tests that call API.

---

## Additional Resources

- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Vite](https://vitejs.dev/)
- Backend: Appointment API documentation at `../APPOINTMENT SERVER/appointment-api/doc/`

---

## Version Information

- **Document version:** 1.0.0
- **React:** 19.x
- **TypeScript:** 5.9.x
- **Vite:** 7.x
- **Tailwind CSS:** 4.x

---

## Support & Contribution

- **New features:** Add routes and pages under `src/routes/protected/`; add API modules and query hooks as needed; document new pages in this file.
- **New components:** Place in `components/ui/`, `components/layout/`, `components/forms/`, or `components/tables/` as appropriate; follow design system (gold theme, spacing, typography).
- **Doc updates:** Keep this document in sync with route list, API modules, and design tokens when adding or changing features.

---

**Last Updated:** January 2026
