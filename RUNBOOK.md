# ChickMagnet incident response runbook

This runbook reflects the deployed storefront as verified on 11 October 2026.
The frontend is hosted on Vercel and uses Firebase Authentication and Firestore
directly. No Cloud Run API is currently connected to the storefront.

## Quick reference

- Storefront: `https://www.chickmagnet.xyz/`
- Repository: `https://github.com/Agina-Mitchella/ChickMagnet`
- Firebase project: `chickmagnet-54dad`
- Firebase console: `https://console.firebase.google.com/project/chickmagnet-54dad`
- M-Pesa Send Money number: `0724300781`

The Vercel project and production domains are owned by
`agina-mitchelles-projects`. The Sauti Vercel CLI account cannot currently
inspect, promote, or roll back that project.

## Storefront unavailable or broken after a release

1. Check the latest `Frontend CI/CD Pipeline` run in GitHub Actions.
2. Check the latest GitHub deployment whose environment is `Production`.
3. Confirm the domain and a static asset independently:

   ```bash
   curl -I https://www.chickmagnet.xyz/
   curl -I https://www.chickmagnet.xyz/assets/<asset-from-index.html>
   ```

4. If the deployment is bad, use the owning Vercel account to roll back to the
   last verified production deployment.
5. If Vercel owner access is unavailable, revert the faulty Git commit through a
   reviewed pull request and let the existing Vercel Git integration redeploy.
6. Smoke-test desktop and mobile product browsing, sign-in, cart, checkout, and
   authenticated order history after recovery.

Do not run Firebase Hosting rollback commands: Firebase Hosting is not serving
the production storefront.

## Sign-in or account history failure

1. Check Firebase Authentication status for `chickmagnet-54dad`.
2. Confirm the required providers are still enabled. Google and email/password
   are enabled for the production project.
3. Confirm `chickmagnet.xyz` and `www.chickmagnet.xyz` are authorized domains.
4. Check the browser console for CSP or Firebase network errors.
5. Confirm the deployed Firestore rules are the reviewed rules from this
   repository. Never restore public write access as an outage workaround.
6. Reproduce with a non-admin test account before changing claims or rules.

## Orders or product data unavailable

1. Check Firestore service status and the `products`, `orders`, and `users`
   collections in `chickmagnet-54dad`.
2. Confirm the signed-in user owns the requested records, or has a verified
   admin custom claim for administrative access.
3. Review Firestore rule denials in Cloud Logging.
4. Validate rule changes with a dry run before deployment:

   ```bash
   firebase deploy --only firestore:rules --project chickmagnet-54dad --dry-run
   ```

5. Deploy or roll back rules only from a reviewed Git revision.

## M-Pesa confirmation problem

Checkout currently uses manual M-Pesa Send Money confirmation. It does not use
Daraja STK Push, callbacks, or transaction-status polling.

1. Confirm the buyer was shown `0724300781` and the correct order total.
2. Ask the buyer for the complete M-Pesa confirmation message through the
   published confirmation channel.
3. Verify the payment independently before changing the order from
   `pending_manual_review` or beginning fulfilment.
4. Treat the client-submitted order total as untrusted until it has been checked
   against current product prices and quantities.

## `/api` requests

`/api` is intentionally unavailable on Vercel and must return `404`. The old
`chickmagnet-api.run.app` hostname is invalid and must not be restored.

Before connecting a backend, verify the Google Cloud project, deployment
identity, region, Artifact Registry, service URL, runtime secrets, CORS policy,
health endpoint, smoke tests, and rollback revision. Stage the new service before
adding a Vercel rewrite or shifting production traffic.

## Dependency audit exception

Production installs currently report four high-severity audit entries that all
resolve to Firebase Firestore's Node-only `@grpc/grpc-js` dependency. The static
Vercel browser bundle does not contain `@grpc/grpc-js`, and the Express container
is not connected to production. Do not force an unsupported package override or
downgrade Firebase to silence the report.

Re-run `npm audit --omit=dev --package-lock-only` whenever Firebase is upgraded.
Remove this exception when Firestore accepts a patched `@grpc/grpc-js` release,
or before deploying any server runtime that makes the affected transport
reachable.

## Suspected account or data compromise

1. Preserve logs and record the first known event time.
2. Disable compromised Firebase users and revoke refresh tokens.
3. Rotate only credentials that are known or reasonably suspected to be
   affected; document each rotation and its dependent services.
4. Review admin custom claims, Firestore rule changes, and recent deployments.
5. Record scope, affected accounts, containment, recovery, and follow-up actions
   in the incident register without adding secrets or customer payment messages.
