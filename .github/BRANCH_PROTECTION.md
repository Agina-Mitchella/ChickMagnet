# Branch Protection & Environment Promotion Policy

## Branch Protection Rules (`main`)

The `main` branch represents the stable production environment for **Sol Handmades**. The following rules are enforced via GitHub repository settings:

1. **Direct Pushes Forbidden**:
   - `main` branch is locked against direct `git push`.
   - All code changes must enter `main` via a Pull Request (PR).

2. **Required Reviewers**:
   - Every PR targeting `main` requires at least **1 approved review** from an authorized repository code owner.

3. **Status Check Enforcement**:
   - All CI workflows (`Frontend CI/CD Pipeline` and `Backend CI/CD Pipeline`) must pass with 100% success before merging is allowed.
   - Required status checks include:
     - TypeScript compilation (`tsc --noEmit`)
     - ESLint linting
     - Automated unit/integration tests (`vitest`)
     - Secret leak scanning (`TruffleHog`)
     - Database migration drift validation (`prisma migrate diff`)

4. **Up-to-Date Branch Enforcement**:
   - Pull request branches must be up to date with `main` before merging.

5. **No Force Pushes**:
   - Force pushes (`git push --force`) are strictly blocked on `main`.

---

## Environment Promotion Lifecycle

```
[ Local Dev ]  --->  [ Preview PR ]  --->  [ Production main ]
 .env.local            Vercel Preview        Vercel Prod + Cloud Run
                       Cloud Run Revision
```

1. **Development (`dev`)**:
   - Runs locally or on feature branches using `.env.local`.
   - Uses test Stripe keys and local Docker containers (PostgreSQL + Redis).

2. **Preview (`preview`)**:
   - Automatically triggered on every Pull Request to `main`.
   - Deploys preview frontend to a unique Vercel URL.
   - Deploys backend to a Cloud Run preview revision.
   - Uses test Stripe API keys and isolated preview database schema.

3. **Production (`production`)**:
   - Automatically triggered only on merge to `main`.
   - Deploys frontend to production domain (`sol-alpha-gules.vercel.app`).
   - Deploys backend to Google Cloud Run with minScale=1 (zero cold starts).
   - Executes automated smoke tests (`/health` & `/api/v1/products`).
   - Rolls back automatically if smoke tests fail.
