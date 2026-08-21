# 🐔 ChickMagnet — Platform Documentation

Welcome to the comprehensive documentation for **ChickMagnet**, a premium poultry, live bird, and processed meats e-commerce & farm operations platform.

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Core Architecture & Tech Stack](#2-core-architecture--tech-stack)
3. [Key Application Modules](#3-key-application-modules)
4. [Payment Gateway Integrations](#4-payment-gateway-integrations)
   - [Safaricom Lipa Na M-Pesa (Daraja API)](#safaricom-lipa-na-m-pesa-daraja-api)
   - [Wholesale Net-30 Purchase Orders](#wholesale-net-30-purchase-orders)
5. [User Roles & Authentication](#5-user-roles--authentication)
6. [API Reference & Endpoint Directory](#6-api-reference--endpoint-directory)
7. [Environment Variables & Configuration](#7-environment-variables--configuration)
8. [Local Development & Deployment Guide](#8-local-development--deployment-guide)

---

## 1. Executive Summary

**ChickMagnet** bridges the gap between commercial poultry hatcheries, organic poultry farmers, B2B wholesale buyers (restaurants, supermarkets), and retail consumers. 

### Unique Value Propositions:
- **Batch Traceability Portal**: Track exact hatch dates, biosecurity clearance, parent stock lineage, and vaccination certificates per batch.
- **Weight-Tolerance Checkout**: Pre-authorizes payment with a standard ±10% weight variance buffer for fresh, whole-dressed birds.
- **Mortality Claim Ritual**: Guaranteed 100% Live-Arrival protection for day-old chick shipments with instant photo claims.
- **Multi-Temperature Logistics**: Specialized cold-chain and ventilated live transport routing.
- **Wholesale Portal**: Tiered B2B pricing, credit lines, and Net-30 purchase order workflows.

---

## 2. Core Architecture & Tech Stack

The application is built using a modern **Full-Stack Express + React (Vite)** architecture configured for high performance, containerization, and seamless API proxying.

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Tailwind CSS, Motion (Framer Motion) |
| **Icons & Design** | Lucide React, Custom SVG Brand System |
| **Backend API** | Node.js, Express.js (v4/v5 API routes under `/api/v1`) |
| **Database & Auth** | Firebase Firestore (NoSQL), Firebase Auth |
| **Notifications** | Transactional Email (Resend) & SMS Alerts (Africa's Talking) |
| **Payments** | Safaricom M-Pesa Daraja 2.0 (STK Push) |
| **Log Infrastructure** | Structured JSON Logger with correlation IDs |
| **Containerization** | Docker, Docker Compose, Cloud Run (`cloudrun.yaml`) |

---

## 3. Key Application Modules

### 1. Storefront & Product Catalogue (`/src/components/ProductCard.tsx`, `ProductDetail.tsx`)
- Displays live birds (Day-Old Chicks, Broilers, Layers, Kienyeji) and processed poultry products.
- Features weight sliders, pack options, hatch dates, and real-time stock indicators.

### 2. Batch Traceability Portal (`/src/components/BatchTraceabilityPortal.tsx`)
- Allows customers to input a Batch ID printed on delivery crates.
- Displays biosecurity ratings, farm location, vet inspection logs, feed types, and vaccination histories.

### 3. Farm Operations Module (`/src/components/FarmOperationsModule.tsx`)
- Dedicated dashboard for poultry keepers to track flock sizes, daily egg production, feed conversion ratios (FCR), mortality counts, and temperature sensors.

### 4. Admin CMS & Management Portal (`/src/components/AdminDashboard.tsx`)
- Live dynamic brand manager for updating platform name, logo, banner announcements, hero copy, product catalogues, and order fulfillment statuses.

### 5. Mortality Claim Ritual (`/src/components/MortalityClaimRitual.tsx`)
- Customer self-service portal for submitting live-bird shipment loss claims with picture uploads and automated refund/replacement triggers.

---

## 4. Payment Gateway Integrations

ChickMagnet features a specialized mobile money engine designed for Safaricom Lipa Na M-Pesa.

### Safaricom Lipa Na M-Pesa (Daraja API)
- **Mode**: Express STK Push (`CustomerPayBillOnline`).
- **Flow**: 
  1. Customer enters M-Pesa phone number at checkout (`07XX...` or `2547XX...`).
  2. Server issues `POST /api/v1/payments/mpesa/stkpush`.
  3. Safaricom sends an instant PIN prompt directly to customer phone handset.
  4. Backend receives IPN callback via `POST /api/v1/payments/mpesa/callback` and updates order status.
  5. Frontend polls `GET /api/v1/payments/mpesa/status/:checkoutRequestId` for real-time UI confirmation.

### Wholesale Net-30 Purchase Orders
- Approved wholesale accounts can complete checkout using a Purchase Order (PO) number with 30-day deferred billing.

---

## 5. User Roles & Authentication

Authentication is handled via Firebase Auth combined with custom JWT tokens and Role-Based Access Control (RBAC):

1. **Customer**: Can browse products, make orders, track batches, and submit mortality claims.
2. **Keeper / Farmer**: Access to the Farm Operations dashboard, flock logs, and batch creation.
3. **Admin**: Full control over platform settings, CMS content, global orders, user roles, and payment logs.

---

## 6. API Reference & Endpoint Directory

All API routes are served under the `/api/v1` namespace:

### Payments API (`/api/v1/payments`)
- `POST /api/v1/payments/mpesa/stkpush`: Triggers M-Pesa STK Push prompt to phone.
- `POST /api/v1/payments/mpesa/callback`: Safaricom Instant Payment Notification (IPN) webhook.
- `GET /api/v1/payments/mpesa/status/:checkoutRequestId`: Poll status of an M-Pesa transaction.

### Auth API (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Authenticates user & issues session JWT.
- `POST /api/v1/auth/register`: Creates new customer account.
- `POST /api/v1/auth/logout`: Invalidates session token.

### Products & Orders API (`/api/v1/products`, `/api/v1/orders`)
- `GET /api/v1/products`: Fetches active product list with live inventory.
- `POST /api/v1/orders`: Creates a new poultry order.
- `GET /api/v1/orders/:id`: Fetches order details & tracking status.

---

## 7. Environment Variables & Configuration

Create a `.env` file in the project root based on `.env.example`:

```env
# Server Setup
PORT=3000
NODE_ENV=development

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=205792581271
VITE_FIREBASE_APP_ID=1:...

# Safaricom M-Pesa Daraja Credentials
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback

# Cloud Storage: Railway Storage / Persistent Volume
RAILWAY_STORAGE_ENDPOINT=https://storage.railway.app
RAILWAY_STORAGE_ACCESS_KEY=your_railway_storage_access_key
RAILWAY_STORAGE_SECRET_KEY=your_railway_storage_secret_key
RAILWAY_STORAGE_BUCKET=chickmagnet-storage
RAILWAY_VOLUME_MOUNT_PATH=/data/storage
```

---

## 8. Local Development & Deployment Guide

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Starts the full-stack server on `http://localhost:3000` with Express handling API routes and Vite serving frontend HMR assets.

### Build for Production
```bash
npm run build
```
Compiles Vite frontend assets to `dist/` and bundles the backend Express server with `esbuild` to `dist/server.cjs`.

### Start Production Server
```bash
npm run start
```
Runs the production server via `node dist/server.cjs`.

---

© 2026 ChickMagnet. All rights reserved.
