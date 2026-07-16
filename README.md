<div align="center">

# 🏥 Smart Healthcare System — Frontend

**A production-grade, full stack healthcare web application** built with **React 19 + Vite** on the frontend and **Spring Boot 3 + Spring Security + MySQL** on the backend.
Designed to demonstrate end-to-end Java Full Stack development — from JWT-secured REST APIs to a responsive, role-based React UI.

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](#)
[![Made with Java](https://img.shields.io/badge/Made%20with-Java%20Full%20Stack-orange.svg?style=flat-square)](#)

**Backend Repository:** [🔗 HealthCare-Backend](https://github.com/ankitdoi-coder/HealthCare-Backend) — Spring Boot 3 | Spring Security | JPA/Hibernate | MySQL | JWT | OAuth2 | Razorpay

</div>

---

## 🎯 What This Project Demonstrates (Java Full Stack Perspective)

> As a Java Full Stack Developer, this project showcases ownership of the **entire vertical slice** — from database schema design to REST API development to a fully functional React UI, including third-party payment gateway integration done the right way.

| Layer | Technology | What Was Built |
|---|---|---|
| 🧩 **Backend** | Spring Boot 3 | RESTful APIs with full CRUD for Patients, Doctors, Appointments, Prescriptions, Billing, Contact Us Enquiries |
| 🔐 **Security** | Spring Security + JWT | Stateless auth, role-based access control (PATIENT / DOCTOR / ADMIN) |
| 🌐 **OAuth2** | Google OAuth2 + Spring Security | Social login with token redirect handling on the frontend |
| 💳 **Payments** | Razorpay Checkout + Server Verification | Real UPI/Card/Netbanking payments with HMAC signature verification before billing status changes |
| 🗄️ **Database** | MySQL + JPA/Hibernate | Normalized relational schema, entity relationships, lazy loading |
| 📄 **Pagination** | Spring Data `Pageable` + React page state | Server-side paginated list views across Admin, Doctor, and Patient panels instead of full-table fetches |
| 📚 **API Docs** | SpringDoc OpenAPI / Swagger UI | Self-documenting REST API at `/swagger-ui/index.html` |
| 🎨 **Frontend** | React 19 + Vite | Component-based SPA consuming all backend APIs |
| 🧠 **State** | Redux Toolkit | Centralized store: auth, appointments, doctors, patients, prescriptions |
| 📡 **HTTP Layer** | Axios + Interceptors | Auto JWT injection, 401/403 handling, token refresh detection |
| 🧭 **Routing** | React Router v7 | Role-protected routes, redirect-after-login, 404/401 handling |
| 📝 **Forms** | React Hook Form | Validated forms for login, register, appointments, prescriptions, Contact Us |
| ✨ **UX** | Tailwind CSS v4 + Framer Motion | Responsive UI with smooth animations |

---

## ✨ Features

### ⚡ Pagination
- **Admin Panel** — Doctors table, Patients table, Billing records list, and Contact Us Enquiries list are all **paginated**, with Next/Previous controls driving page state independently per tab instead of loading the entire dataset up front
- **Patient Panel** — the Find Doctors directory and My Appointments history are both **paginated**, backed by `getDoctors(page, size)` and `getMyAppointments(page, size)`
- **Doctor Panel** — the Appointments list is **paginated**, backed by `getMyAppointments(page, size)`, with page controls alongside the existing manual Refresh action
- All paginated endpoints return a Spring Data `Page<T>` shape (`content`, `totalElements`, `totalPages`, ...), and each panel's page/size state is kept independent per list so switching tabs or filters doesn't reset unrelated pagination
- Designed to keep initial load times low and payloads small as the number of doctors, patients, appointments, billing records, and enquiries grows

### 🔑 Authentication & Security
- **JWT-based stateless login** — credentials sent to `/api/auth/login`, token decoded client-side for role & expiry
- **Google OAuth2 Social Login** — Spring Security OAuth2 flow with a dedicated `OAuth2RedirectHandler` on the frontend
- **Forgot Password / Reset Password** — token-based email reset flow (`/api/auth/forgot-password`, `/api/auth/reset-password`)
- **JWT Expiry Monitoring** — background monitor warns user 5 minutes before session expiry and auto-redirects
- **Axios Request Interceptor** — automatically attaches `Authorization: Bearer <token>` to every API call
- **Axios Response Interceptor** — handles 401 (session expired) with redirect-to-login and 403 (forbidden) gracefully
- **ProtectedRoute Component** — guards all dashboard routes; redirects unauthenticated users, blocks wrong roles

### 💳 Payment Integration (Razorpay)
- **Real gateway checkout** — appointment billing settled via the official Razorpay Checkout widget (UPI, Cards, Netbanking), not a mocked button
- **Order-based flow** — frontend requests a Razorpay order from the backend (`createRazorpayOrder`) before checkout opens, so every payment is tied to a real server-issued order ID
- **Server-verified success** — on payment completion, `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` are sent to `verifyRazorpayPayment`; the backend recomputes the HMAC signature and only then flips billing status to `PAID`
- **Graceful failure handling** — distinct UI states for payment success, failure, and checkout-dismissal
- **Live billing sync** — appointment rows update from `UNPAID` to `PAID` instantly via React state, no manual refresh required
- **Test Mode validated** — full flow (order → checkout → OTP → signature verification) tested end-to-end against Razorpay's sandbox

### 🧑‍⚕️ Patient Portal
- Dashboard with personal profile and upcoming appointment summary
- Browse and search doctors by specialty or name — **paginated** doctor directory instead of loading the entire list upfront
- Book new appointments from available time slots
- View full appointment history with status (SCHEDULED / COMPLETED / CANCELLED) and payment status (PAID / UNPAID) — **paginated**, backed by `getMyAppointments(page, size)`
- Pay for appointments directly from the appointment history table via Razorpay
- Access prescriptions linked to completed appointments — each prescription shows medication details and dosage instructions
- **Professional prescription print / download** — Print button opens a styled A4 prescription slip in a new tab with clinic letterhead, doctor name, patient info, Rx symbol, medication table, and signature block; the browser print dialog opens automatically so the patient can print or save as PDF instantly
- Profile picture upload and profile settings management
- **Contact Us form** — public enquiry form (name, email, subject, message) that lands directly in the Admin panel's Enquiries tab for follow-up

### 👨‍⚕️ Doctor Portal
- **Live stats dashboard** — Total, Scheduled, Completed, Pending, and Today's appointment counts driven from Redux state via memoized selectors (`selectTodayAppointments`, `selectScheduledAppointments`, `selectCompletedAppointments`, `selectPendingAppointments`)
- **Real-time, paginated appointment list** — `getMyAppointments(page, size)` fires on mount and page change and dispatches to Redux; Next/Previous controls fetch fresh pages from the backend (`Page<AppointmentDTO>`) instead of loading the full dataset, alongside a manual **Refresh** button that re-fetches the current page with a loading spinner state
- **Full appointment context per row** — each appointment displays patient name, date, **preferred time** (formatted to 12-hr from the `appointmentTime` field), and **reason for visit** (`reasonForVisit`) so the doctor has complete context before the consultation starts
- **Appointment workflow actions** — Accept (PENDING → SCHEDULED), Complete (SCHEDULED → COMPLETED), Cancel; each action calls `updateAppointmentStatus` and dispatches `updateAppointment` to Redux for instant UI sync without a re-fetch
- **Appointments Calendar view** — monthly calendar with green dot indicators on days that have appointments, with prev/next month navigation
- **In-app Notification Bell** — fetches unread count on mount and on window `focus` event; dropdown shows all notifications with per-item mark-as-read and a mark-all-as-read action, backed by `getMyNotifications`, `markNotificationRead`, `markAllNotificationsRead`
- **Patient records** — fetched via `getMyPatients()`; gracefully falls back to deriving unique patients from completed appointments already in Redux state if the API call fails
- **Create prescriptions** — modal triggered from a completed appointment row; calls `createPrescription` and dispatches result to `prescriptionsSlice`
- **Professional prescription print** — Print button generates a fully styled A4 prescription slip in a new browser window with clinic letterhead, doctor name, patient info grid, Rx symbol, medication table (each drug on its own row), dosage instructions, and a signature/stamp block — auto-triggers the browser print dialog on open
- **Edit prescriptions** — edit modal pre-fills existing medication and dosage data
- **Profile Settings** — inline profile management without leaving the dashboard
- **Responsive sidebar** — collapses to a hamburger menu on mobile with an overlay backdrop

### 🛠️ Admin Portal
- View all registered doctors including those with pending approval — **paginated** table (page/size controls, no full-table fetch)
- Approve new doctor registrations to grant system access
- View and manage all registered patients — **paginated**, same page-by-page loading as the doctors table
- View billing records and daily/monthly revenue collected via Razorpay — billing list is **paginated** to keep initial load light
- <img src="/enquire.svg" width="16" height="16" alt="" /> **Contact Us Enquiries** — a dedicated, **paginated** tab (`getEnquries(page, size)`) listing every message submitted through the public Contact Us form, with an unread-style count badge on the sidebar nav item
  - Each row shows the sender's name, email, and subject at a glance, with the message **clamped to two lines** so row height stays consistent regardless of message length
  - A **View** button opens the full enquiry (name, email, subject, and complete message) in a modal, so long messages never break the table layout
  - The message body is rendered as plain text (never injected as HTML), so pasted links or markup in a submission can't be auto-linkified or executed

### 🌍 Public Landing Pages
- Home, About Us, Services, Appointment Info, Contact Us
- Responsive Navbar and Footer
- Animated UI with Framer Motion

---

## 🏗️ Architecture

```
src/
├── API/                    # Axios instance & config (baseURL from .env)
├── Services/               # Service layer — one file per domain
│   ├── AuthService.js      # JWT decode, token management, axios interceptors
│   ├── PatientService.js   # Appointments, doctors, prescriptions, Razorpay order/verify calls (paginated list calls take page/size)
│   ├── DoctorService.js    # Appointments, patients, prescriptions, notifications (paginated appointment list)
│   ├── AdminService.js     # Doctors, patients, billing, enquiries (all paginated list endpoints, incl. getEnquries)
│   └── ProfileService.js
├── store/                  # Redux Toolkit store
│   ├── slices/             # authSlice, appointmentsSlice, doctorsSlice, patientsSlice, prescriptionsSlice
│   ├── thunks/             # Async thunks for API calls
│   └── selectors/          # Memoized selectors for derived state
├── Components/
│   ├── DashBoards/         # PatientDashboard, DoctorDashboard, AdminDashboard (incl. Enquiries tab + details modal), ProtectedRoute — each owns its own page/size state per list
│   ├── Landing_Pages_Components/   # Home, Login, Register, ForgotPassword, ResetPassword, OAuth2RedirectHandler, Contact Us
│   └── Patient SubComponent/       # AppointmentHistory (incl. Razorpay payment modal, paginated), DoctorsList (paginated), NewAppointment
└── App.jsx                 # Router config with role-based protected routes
```

**Key architectural decisions:**
- **Service Layer Pattern** — mirrors the backend `@Service` layer; each domain has its own service file wrapping Axios calls, including Razorpay order-creation/verification and paginated list requests (`page`, `size` query params)
- **Redux Slices** — separate slices per entity, matching backend entity structure (Appointment, Doctor, Patient, Prescription)
- **Memoized Selectors** — `selectTodayAppointments`, `selectScheduledAppointments`, `selectCompletedAppointments`, `selectPendingAppointments` compute derived state without unnecessary re-renders
- **Thunks for Async** — all API calls live in thunks, keeping components clean and testable
- **ProtectedRoute HOC** — declarative route guarding with `allowedRoles` prop, mirrors Spring Security's `@PreAuthorize`
- **Optimistic UI + graceful fallback** — patient list attempts a dedicated API call; on failure, derives the list from existing appointment data already in Redux state
- **Client never owns payment truth** — the payment modal only ever reflects what the backend confirms after signature verification; no UI state change marks something "paid" on its own
- **Page state owned per list, per panel** — each paginated table/list (Admin Doctors, Admin Patients, Admin Billing, Admin Enquiries, Patient Doctor Directory, Patient Appointment History, Doctor Appointments) tracks its own current page and total pages locally, so navigating one list's pages never resets another
- **Long content never breaks table layout** — the Admin Enquiries table clamps message text to a fixed number of lines and defers full content to an on-demand modal, keeping row heights predictable regardless of message length

---

## 🧰 Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7.x-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?style=flat-square&logo=redux&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.x-0055FF?style=flat-square&logo=framer&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7.x-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Checkout.js-0C2451?style=flat-square&logo=razorpay&logoColor=white)
![Lucide](https://img.shields.io/badge/Icons-Lucide%20React-F56565?style=flat-square&logo=lucide&logoColor=white)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2-Google-4285F4?style=flat-square&logo=google&logoColor=white)
![Hibernate](https://img.shields.io/badge/ORM-JPA%2FHibernate-59666C?style=flat-square&logo=hibernate&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Swagger](https://img.shields.io/badge/API%20Docs-Swagger%2FOpenAPI-85EA2D?style=flat-square&logo=swagger&logoColor=black)

</div>

| | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 7.x |
| Routing | React Router DOM | 7.x |
| State Management | Redux Toolkit + React Redux | 2.x / 9.x |
| HTTP Client | Axios | 1.x |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Forms | React Hook Form | 7.x |
| Payments | Razorpay Checkout.js | latest |
| Notifications | Sonner + React Hot Toast | latest |
| Icons | Lucide React + React Icons | latest |
| Backend | Spring Boot 3 | 3.x |
| Security | Spring Security + JWT | stateless |
| Social Auth | OAuth2 (Google) | — |
| ORM | JPA / Hibernate | — |
| Database | MySQL | 8.x |
| Pagination | Spring Data `Pageable` / `Page<T>` | — |
| API Docs | SpringDoc OpenAPI / Swagger | — |

---

## 🔒 Security Implementation

```
Client                          Server
  │                               │
  │── POST /api/auth/login ───────►│ Spring Security AuthenticationManager
  │◄── { token: "eyJ..." } ───────│ JwtTokenProvider generates token
  │                               │
  │  saveToken(token) → localStorage
  │  decode payload → role, email, exp
  │  dispatch(setAuth({ user, token, role }))
  │                               │
  │── GET /api/patient/appointments ►│
  │   Authorization: Bearer eyJ...  │ JwtAuthFilter validates token
  │◄── [ appointments ] ───────────│ @PreAuthorize("ROLE_PATIENT")
```

- Token expiry is checked client-side on every protected route render
- A `TokenSyncProvider` component keeps Redux auth state in sync with localStorage on page refresh
- OAuth2 Google login redirects to `/oauth2/redirect?token=...` — the `OAuth2RedirectHandler` extracts and stores the token, then dispatches to Redux and routes to the correct dashboard

---

## 💰 Payment Flow (Razorpay)

```
Patient                Frontend                Backend                 Razorpay
   │                      │                       │                       │
   │── Click "Pay Now" ──►│                       │                       │
   │                      │── createRazorpayOrder►│                       │
   │                      │                       │── Create Order API ──►│
   │                      │                       │◄── order_id ──────────│
   │                      │◄── order_id, key ─────│                       │
   │                      │── rzp.open() ─────────────────────────────────►│
   │◄─────────────── Checkout UI (UPI / Card / Netbanking) ────────────────│
   │── Completes payment ────────────────────────────────────────────────►│
   │                      │◄── payment_id, order_id, signature ───────────│
   │                      │── verifyRazorpayPayment►│                      │
   │                      │                       │── Recompute HMAC      │
   │                      │◄── billingStatus: PAID │                       │
   │◄── UI updates instantly (no refresh) ────────│                       │
```

> 🔐 The frontend triggers and displays the flow, but only the backend's signature check decides what counts as paid.

---

## 📄 Pagination Flow

```
Component (page, size state)          Service Layer                    Backend
        │                                   │                              │
        │── getDoctors(page, size) ────────►│                              │
        │                                   │── GET /api/.../doctors ─────►│
        │                                   │   ?page=0&size=10            │ PageRequest.of(page, size)
        │                                   │◄── Page<DoctorDTO> ──────────│ repo.findAll(pageable)
        │◄── { content, totalElements, ─────│   { content, totalElements,  │
        │      totalPages, ... } }          │     totalPages, ... }        │
        │                                   │                              │
        │  setDoctors(response.content)                                   │
        │  setTotalPages(response.totalPages)                             │
        │                                                                  │
        │── user clicks Next → setPage(page + 1) ─── re-fetches ─────────►│
```

- Every paginated list component keeps its own `page` and `totalPages` state, independent of any other list on the same screen
- Next/Previous controls are disabled at the first/last page based on `totalPages` from the response, not guessed client-side
- Page size defaults to `10` per list unless a component needs a larger working set for client-side filtering (e.g. status filters on appointment history), in which case a larger `size` is requested explicitly rather than paginating through multiple calls

---

## 🗄️ Database Schema

The backend uses a normalized relational schema with JPA entity relationships.

![Database ER Diagram](https://raw.githubusercontent.com/ankitdoi-coder/HealthCare-Backend/main/Requirements%20&%20Architecture/04_ERD_DB.jpg)

---

## 🖼️ UI Screenshots

| Page | Preview |
|---|---|
| 🏠 Home | ![Home](./ScreenShots/Home.jpg) |
| 🔑 Login | ![Login](./ScreenShots/Login.jpg) |
| 📝 Register | ![Register](./ScreenShots/Register.jpg) |
| 📅 Appointment | ![Appointment](./ScreenShots/Appointment.jpg) |
| ℹ️ About Us | ![About](./ScreenShots/AboutUs.jpg) |
| 🩺 Services | ![Services](./ScreenShots/Services.jpg) |
| 📨 Admin — Enquiries | <img src="/enquire.svg" width="20" height="20" alt="Enquiries icon" /> |

---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js v18+
- Java JDK 17+
- Maven 3.x
- MySQL 8.x
- A Razorpay account (Test Mode keys are free)

### 1️⃣ Start the Backend

```bash
git clone https://github.com/ankitdoi-coder/HealthCare-Backend.git
cd HealthCare-Backend
# Configure application.properties with your MySQL credentials and Razorpay test keys
mvn spring-boot:run
# Runs at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
```

### 2️⃣ Start the Frontend

```bash
git clone https://github.com/ankitdoi-coder/HealthCare-Frontend.git
cd HealthCare-Frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### 3️⃣ Environment Variables

Create `.env.local` if your backend runs on a different URL:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> 💡 Razorpay's public Key ID is returned by the backend's order-creation response — it does not need to be stored in the frontend `.env`. The Key Secret lives only on the backend and is never exposed to the client.

### 4️⃣ Testing Payments

| Method | Test Value |
|---|---|
| 💳 Card Number | `4111 1111 1111 1111` (any future expiry, any CVV) |
| 📱 UPI ID | `success@razorpay` |
| 🔢 OTP | Any 4-10 digit number, e.g. `1234` |

---

## 📚 API Documentation

```
http://localhost:8080/swagger-ui/index.html
```

Covers: Auth, Patient, Doctor, Admin, Appointment, Prescription, Enquiry, and Payment endpoints with request/response schemas, including `page`/`size` query parameters on all paginated list endpoints.

---

## 🎨 Wireframes & Design

Figma wireframes available in `WireFrames & Figma UI's/`:

- Login & Register flows
- Patient, Doctor, Admin panel layouts
- Full system workflow diagram

---

## 👤 Author

**Ankit** — Java Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ankitdoi--coder-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/ankitdoi-coder)

- Built and owned the complete stack: Spring Boot backend + React frontend
- Implemented end-to-end features: JWT auth, OAuth2 Google login, role-based access, full CRUD APIs, relational DB schema, server-side pagination across every major list view, a Contact Us → Admin Enquiries pipeline, and a verified Razorpay payment integration
- Followed industry patterns: Service Layer, Repository Pattern, Redux Thunks, Protected Routes, Axios Interceptors, server-side payment trust boundaries, and paginated data-fetching patterns (`Pageable` on the backend, page/size state on the frontend)

> 💼 Open to Java Full Stack / Backend / Frontend opportunities. Feel free to connect!