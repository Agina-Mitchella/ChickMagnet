# ChickMagnet

A poultry marketplace and hatchery platform for the 
Kenyan market — connecting buyers directly with verified, 
health-certified flocks, fresh poultry, eggs, and farm supplies.

## What This Is

ChickMagnet covers the full range of poultry commerce in one 
platform:

- **Live Birds** — day-old chicks, growers, layers, breeding stock
- **Fresh & Whole Poultry** — dressed birds, cuts, giblets
- **Processed & Value-Added** — marinated, breaded, ready-to-cook
- **Eggs** — table eggs and fertile/hatching eggs
- **Farm Supplies** — feed, vaccines, equipment

It serves two distinct buyer types:
- **Homesteaders** — retail buyers, standard checkout
- **Commercial Wholesale** — Net-30 invoice billing, bulk pricing

Beyond the storefront, ChickMagnet includes a full **Farm Operations 
module** — feed planning, vaccination scheduling, mortality/weight 
tracking, staff task management, and cost/pricing tools — so the 
business running the marketplace is managed with the same rigor as 
the platform selling on its behalf.

## Tech Stack

**Frontend**
- Built via Google AI Studio
- Hosted on Firebase Hosting

**Backend**
- Node.js / Express, containerized with Docker
- Deployed on Google Cloud Run

**Auth & Database**
- Firebase Authentication (including Google OAuth)
- Firestore

**Storage**
- Cloudflare R2 (product images, PDF exports)

**Payments**
- M-Pesa Daraja API (STK Push) — sole payment method

**Communications**
- Resend (transactional email)
- Africa's Talking (SMS — optional, pending confirmation)

**Version Control**
- Git / GitHub

## Project Structure Notes

- **Header breed dropdown** (Kienyeji, Broiler, Kenbro, Chicks, etc.) 
  replaces a traditional search bar — options are managed via the 
  Admin Dashboard, not hardcoded
- **Buyer segmentation**: "Homesteaders" and "Commercial Wholesale 
  (Net-30)" — all account-type labels should use this terminology 
  consistently across storefront and admin
- **Payment**: M-Pesa only. Stripe, Apple Pay, and Airtel Money have 
  been removed — do not reintroduce without an explicit product 
  decision
- **Admin Dashboard**: covers order tracking, claims management, 
  product/inventory content editing, and the Farm Operations module — 
  all customer-facing content should be editable here without a code 
  change

## Ownership Note

Production credentials (Firebase, M-Pesa, Google Cloud) should be 
tied to the client's business accounts, not developer personal 
accounts, to ensure the client retains full ownership and access 
after handoff.
