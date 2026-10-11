# Release controls and ownership

This document describes the release path that is actually configured. It does
not claim that repository settings are enforced unless they have been verified
in GitHub or Vercel.

## Verified release path (11 October 2026)

- `main` is the default branch of `Agina-Mitchella/ChickMagnet`.
- The Vercel Git integration creates `Production` deployments for pushes to
  this repository. GitHub records show those deployments are owned by
  `agina-mitchelles-projects`.
- `chickmagnet.xyz` and `www.chickmagnet.xyz` are served by Vercel.
- The Sauti Vercel CLI account (`sautionlineai-3596`) cannot access that Vercel
  project or either production domain. A Git push can trigger the existing Git
  integration, but the Sauti account cannot inspect, promote, or roll back the
  resulting deployment directly.
- The previous `chickmagnet-api.run.app` destination is not a valid Cloud Run
  service URL. The frontend currently uses Firebase Auth and Firestore directly,
  so Vercel returns `404` for `/api` until a real backend is provisioned.

## GitHub Actions

- `Frontend CI/CD Pipeline` runs a clean install, TypeScript checks, and the
  production build. Vercel deployment is intentionally left to the existing Git
  integration so one push cannot create duplicate releases.
- Vercel runs a frontend-only Vite build. The Express bundle is built and tested
  separately and must never be published inside the static `dist` output.
- `Backend CI/CD Pipeline` scans changed Git history for verified secrets and
  proves that the Cloud Run container can build. It does not deploy.
- Third-party Actions are pinned to reviewed commit SHAs. Checkout credentials
  are not persisted after checkout.

## Required repository settings

The current GitHub credentials cannot read branch-protection settings for this
repository. Verify these controls in GitHub, and configure any that are absent,
before treating `main` as protected:

1. Require a pull request and at least one approving review.
2. Require `Frontend Quality Checks & Build`, `Secret Scan`, and
   `Build Cloud Run Container`.
3. Require the branch to be current before merging.
4. Disable force pushes and branch deletion.

## Production release checklist

1. Review the exact diff and confirm there are no unrelated generated files or
   credentials.
2. Run `npm ci`, `npm run lint`, `npm run build`, and `git diff --check`.
3. Push the reviewed commit to `main`.
4. Wait for both GitHub workflows and the GitHub `Production` deployment status.
5. Smoke-test `https://www.chickmagnet.xyz/` on desktop and mobile, including
   sign-in, product browsing, cart, checkout, and authenticated order history.
6. Confirm `/api` returns `404`; it must not silently serve the SPA shell.

## Backend deployment prerequisites

Do not restore automated Cloud Run deployment until all of the following are
known and tested:

- Google Cloud project and deployment identity
- Cloud Run region and service name
- Artifact Registry repository
- Exact `*.run.app` service URL and successful `/health` response
- Runtime secrets and database/cache dependencies
- A rollback command that names a real prior revision
- CORS permission for `https://chickmagnet.xyz` and
  `https://www.chickmagnet.xyz`

After those values exist, stage and smoke-test a new revision before shifting
production traffic.
