# ChickMagnet

ChickMagnet is a Kenyan storefront for chicken and eggs sold directly by ChickMagnet. It supports retail and commercial wholesale browsing, individual product URLs, carts, guest checkout, Firebase accounts, order history, and administrator product and order management.

## Current storefront

- Retail: mature chicken, fresh dressed chicken and cuts, eggs, and turkey.
- Commercial wholesale: chicks and chicken by breed and age, plus eligible egg products.
- Wholesale pricing uses the same unit price as retail. Minimum quantities are enforced per product: 10 for chicken and 5 for eggs.
- Checkout records the product total only. Delivery is quoted separately after the order is reviewed.
- Customers send product payment to `0724300781` using M-Pesa Send Money, then send the confirmation message for manual review.
- A product shown on the site is not a promise of immediate availability. ChickMagnet confirms the fulfilment date after reviewing the order and payment.

## Current architecture

- React 19 with React Router 7 framework mode and server rendering.
- Vercel serves the public site.
- Firebase Authentication provides email/password, Google, and anonymous guest sessions.
- Firestore stores customer profiles, product overrides, orders, brand settings, and administrator activity.
- The source catalogue is the safe public fallback. Firestore product documents can update or archive those listings, and new products appear only after an administrator explicitly publishes them.

## Administrator CMS

The CMS is intentionally limited to functions connected to live data:

- Overview: real product and order totals.
- Products: names, descriptions, prices, stock, images, status, and SEO fields.
- Orders: payment review and fulfilment progress.
- Brand: storefront name and logo URL.
- Activity: changes made through the CMS.

Empty Firestore collections remain empty. The application must never generate sample orders, customers, claims, certifications, batches, farm metrics, or activity records.

## Legacy Express server

`src/server.ts` and the `build:legacy-server` script build an older Express API. It is not part of the Vercel storefront runtime. Its M-Pesa STK endpoint fails closed unless complete Daraja credentials and a callback URL are configured; it must never simulate a successful payment.

## Validation

```bash
npm ci
npm run lint
npm run build
npm run test:server-contracts
npm run start
npm run test:seo
git diff --check
```

`test:seo` expects the built server to be running at `http://127.0.0.1:3000`.
