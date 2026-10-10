# BXBC customer comments — Neon + Cloudflare Pages

The customer feedback feature uses Cloudflare Pages Functions and Neon PostgreSQL. Public submissions are saved as **pending** and are never displayed until an administrator approves them.

## 1. Create the Neon table

In the Neon Console, open the correct project and branch, then open **SQL Editor**. Run the PostgreSQL SQL in `migrations/0002_neon_comments.sql`.

## 2. Add the database dependency

The repository includes `package.json` with `@neondatabase/serverless`. In Cloudflare Pages, use the repository root as the project root and make sure the deployment builds/bundles the `functions/` directory. If the existing Pages project is configured as a static-only Worker, connect the repository as a **Cloudflare Pages** project that supports Pages Functions; the APIs cannot run on a static-only deployment.

## 3. Configure Cloudflare secrets

Open Cloudflare Dashboard → **Workers & Pages** → the Pages project → **Settings** → **Variables and Secrets**. Add these as encrypted secrets for Production:

- `DATABASE_URL`: the Neon PostgreSQL connection string. Use a newly rotated password; do not commit the connection string to GitHub.
- `COMMENTS_ADMIN_PASSWORD`: a unique, strong password for the comments moderation page.
- `COMMENTS_SESSION_SECRET`: a long, random secret (at least 32 random bytes).

Redeploy after adding or changing secrets. Add the same secrets to Preview only if you want the feature enabled on preview deployments.

## 4. Test the feature

- `/feedback.html` — customer form.
- `/api/comments` — returns approved comments only.
- `/admin-comments.html` — administrator moderation page.
- `/api/admin/comments` — protected moderation queue; should return 401 when signed out.

Submit a test comment. It should show a success message but **must not** appear publicly yet. Sign in at `/admin-comments.html`, approve the test comment, then reload the home page. Only then should it appear under “From our customers”.

## Security notes

- The public form accepts a name, one of the configured roles, and a comment of 8–1,000 characters.
- New comments default to `pending`; only an authenticated administrator can change their status.
- Admin sessions are HTTP-only, Secure, SameSite=Strict cookies and expire after 8 hours.
- Never expose the database URL or admin secrets in frontend code or commit them to GitHub.
- If the API says the comments service is not configured, check that `DATABASE_URL` exists as a Pages secret and redeploy.
