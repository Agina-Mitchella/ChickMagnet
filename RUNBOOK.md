# Incident Response Runbook

This document details operational procedures and step-by-step response playbooks for platform incidents across static hosting (Firebase Hosting CDN) and services (Firebase Auth, Firestore, M-Pesa).

---

## 🚨 Emergency Contacts & Quick Reference

- **Admin Dashboard**: `/admin` (or `/admin/devops`)
- **Status Page**: `https://chickmagnet.co.ke/status`
- **Firebase Console**: `https://console.firebase.google.com`
- **Safaricom Daraja Portal**: `https://developer.safaricom.co.ke`

---

## Playbook 1: Backend Service Down (`/health` returning 50x / Unreachable)

### Symptoms
- Sentry alerts trigger for high 50x error rate or uptime check failure.
- Uptime monitor reports `/health` returning non-200 or timeout.

### Execution Procedure

1. **Check Build & Deployment Status**:
   ```bash
   firebase hosting:channel:list
   ```

2. **Roll Back Static Site to Previous Release**:
   ```bash
   firebase hosting:clone chickmagnet-prod:previous chickmagnet-prod:live
   ```

3. **Check Database & Cache Connectivity**:
   - Verify Firebase Firestore / Redis connectivity.

4. **Activate Emergency Maintenance Mode**:
   - Trigger maintenance mode via administrative API or Admin UI (`/admin`):
   ```bash
   curl -X POST https://chickmagnet-api.run.app/api/v1/maintenance \
     -H "Content-Type: application/json" \
     -d '{"isMaintenance": true, "message": "Our market sanctuary is undergoing brief rejuvenation. We will return shortly."}'
   ```

---

## Playbook 2: Database Connection Refused / Pool Issues

### Symptoms
- Logs show connection errors or high latency.

### Execution Procedure

1. **Check Firestore Status**:
   - Check Google Cloud status dashboard or Firebase Console for Firestore database metrics.

3. **Verify Security Rules & Indexing**:
   - Check that firestore.rules and composite indexes are deployed and active.

4. **Notify Status Subscribers**:
   - If downtime exceeds 5 minutes, update status page with incident status `IDENTIFIED`.

---

## Playbook 3: Mobile Money Processing Failures / STK Push Timeouts

### Symptoms
- Orders remain in `PENDING` status despite buyer entering PIN.
- Safaricom Daraja callback timeouts.

### Execution Procedure

1. **Verify Safaricom Daraja Service Status**:
   - Check Safaricom Daraja sandbox/production API response codes.
   - Verify network latency to M-Pesa endpoints (`api.safaricom.co.ke`).

2. **Inspect Webhook Callback Logs**:
   - Query logs for `[MPESA_WEBHOOK_RECEIVED]`.
   - Inspect failed callback attempts for missing payload signatures or timeout errors.

3. **Verify Transaction Status via Manual Poll**:
   - If callback was delayed, invoke `GET /api/v1/payments/mpesa/status/:checkoutRequestId`.

4. **Temporary Checkout Pause**:
   - If Safaricom is undergoing scheduled maintenance, display announcement banner via Admin CMS.

---

## Playbook 4: Suspected Security Breach or Compromise

### Symptoms
- Unrecognized admin logins, unexpected API volume, or refresh token reuse alerts (`REFRESH_TOKEN_THEFT_DETECTED`).

### Execution Procedure

1. **Rotate Secret Manager Credentials Immediately**:
   - Access Google Cloud Secret Manager and issue new versions for:
     - `MPESA_CONSUMER_KEY` & `MPESA_CONSUMER_SECRET` & `MPESA_PASSKEY`
     - `REDIS_PASSWORD`
     - `RESEND_API_KEY`

2. **Invalidate Active User Sessions & Purge Cache**:
   - Invalidate Firebase Auth sessions via Firebase Console or Admin SDK if required.
   - Purge Redis cache:
   ```bash
   redis-cli -h $REDIS_HOST FLUSHALL
   ```

3. **Review Audit Logs for Breach Window**:
   - Query `devops_audit_logs.json` or Cloud Logging:
   ```bash
   gcloud logging read 'jsonPayload.event="REFRESH_TOKEN_THEFT_DETECTED" OR jsonPayload.event="FAILED_LOGIN_ATTEMPT"' --limit 200
   ```

4. **GDPR Notification Compliance (72-Hour Window)**:
   - If personal data was compromised, draft and dispatch notification emails to affected users within **72 hours** as required by GDPR Article 33.

5. **Post-Mortem Documentation**:
   - Record time of discovery, root cause analysis, impacted accounts, and corrective actions taken in `devops_security_incidents.json`.

---

## 🔄 Quarterly 90-Day Secret Rotation Procedure

1. Schedule secret rotation during low-traffic window (e.g., 03:00 UTC).
2. Generate new API credentials for external integrations (M-Pesa, Resend, Redis).
3. Update Google Cloud Secret Manager with secret version:
   ```bash
   gcloud secrets versions add MPESA_PASSKEY --data-file=new_secret.txt
   ```
4. Deploy static site or updated environment configuration.
5. Verify application loads and services pass.
6. Verify auth flow and checkout endpoints.
