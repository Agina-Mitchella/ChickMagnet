# Sol Handmades — Incident Response Runbook

This document details operational procedures and step-by-step response playbooks for platform incidents across the frontend (Vercel) and backend (Google Cloud Run + PostgreSQL + Redis).

---

## 🚨 Emergency Contacts & Quick Reference

- **Admin Dashboard**: `/admin` (or `/admin/devops`)
- **Status Page**: `https://chickmagnet.app/status`
- **Google Cloud Console**: `https://console.cloud.google.com/run?project=chickmagnet-prod`
- **Safaricom Daraja Portal**: `https://developer.safaricom.co.ke`
- **Vercel Dashboard**: `https://vercel.com/chickmagnet`

---

## Playbook 1: Backend Service Down (`/health` returning 50x / Unreachable)

### Symptoms
- Sentry alerts trigger for high 50x error rate or uptime check failure.
- Uptime monitor reports `/health` returning non-200 or timeout.

### Execution Procedure

1. **Check Cloud Run Logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sol-handmades-api" --limit 50 --format json
   ```

2. **Verify if Recent Deployment Caused Outage**:
   - If error started immediately after a new deployment, execute an immediate traffic rollback to the previous healthy revision:
   ```bash
   gcloud run services update-traffic sol-handmades-api \
     --region europe-west2 \
     --to-revisions PREV=100
   ```

3. **Check Database Connectivity**:
   - Verify Cloud SQL instance state:
   ```bash
   gcloud sql instances describe sol-postgres-prod
   ```
   - Check if database connections are maxed out or refusing connections.

4. **Check Redis Connectivity**:
   - Ping Redis instance via GCP Memorystore or connection string:
   ```bash
   redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD ping
   ```

5. **Activate Emergency Maintenance Mode**:
   - Trigger maintenance mode via administrative API or Admin UI (`/admin`) so buyers receive a graceful explanation screen while engineering investigates:
   ```bash
   curl -X POST https://sol-handmades-api.run.app/api/v1/maintenance \
     -H "Content-Type: application/json" \
     -d '{"isMaintenance": true, "message": "Our market sanctuary is undergoing brief rejuvenation. We will return shortly."}'
   ```

---

## Playbook 2: Database Connection Refused / Pool Exhausted

### Symptoms
- Logs show `PrismaClientInitializationError: Can't reach database server` or `Error: Too many connections`.

### Execution Procedure

1. **Inspect Active Connection Count**:
   - Check Cloud SQL CPU and connection metrics in Google Cloud Console.
   
2. **Restart Cloud Run Container Pool**:
   - Restarting Cloud Run instances cleanly tears down hung connection pools:
   ```bash
   gcloud run services update sol-handmades-api \
     --region europe-west2 \
     --update-env-vars RESTART_TRIGGER=$(date +%s)
   ```

3. **Scale Up Database Connection Limit**:
   - If traffic surge caused connection exhaustion, adjust PgBouncer or Cloud SQL `max_connections`:
   ```bash
   gcloud sql instances patch sol-postgres-prod --database-flags max_connections=200
   ```

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
4. Deploy updated Cloud Run revision referencing the new secret version.
5. Verify application health check `/health` passes.
6. Verify auth flow and payment endpoints.
