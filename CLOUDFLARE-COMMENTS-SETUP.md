# BXBC customer comments — Cloudflare Pages setup

The customer feedback feature uses Cloudflare Pages Functions and a Cloudflare D1 database. Public submissions are saved as **pending** and are never displayed until an administrator approves them.

## 1. Create the D1 database

1. Open Cloudflare Dashboard → **Workers & Pages** → **D1 SQL Database** (or Storage & databases → D1).
2. Create a database, for example `bxbc-comments`.
3. Open the database's SQL console and run the contents of `migrations/0001_comments.sql`.

## 2. Bind D1 to the Pages project

Open the Pages project connected to this repository → **Settings** → **Functions** → **D1 database bindings**.

- Variable name: `DB`
- D1 database: `bxbc-comments` (select the database you created)

Save and redeploy the Pages project after changing bindings.

## 3. Set secrets

In Pages project → **Settings** → **Variables and Secrets**, add these as **encrypted secrets** for Production (and Preview too only if you want comments/admin to work on preview deployments):

- `COMMENTS_ADMIN_PASSWORD`: a unique, strong password for the comments moderation page.
- `COMMENTS_SESSION_SECRET`: a long, random secret (at least 32 random bytes). Generate one locally with a password manager or a cryptographically secure generator. Do not use your website password or commit either secret to GitHub.

Redeploy after saving secrets.

## 4. Deploy and test

Pushes to the connected production branch should trigger a Pages deployment. Test the deployed site:

- `/feedback.html` — customer form.
- `/api/comments` — returns approved comments only.
- `/admin-comments.html` — administrator moderation page.
- `/api/admin/comments` — protected moderation queue; should return 401 when signed out.

Submit a test comment. It should show a success message but **must not** appear publicly yet. Sign in at `/admin-comments.html`, approve the test comment, then reload the home page. Only then should it appear under “What customers say”.

## Notes

- The public form accepts a name, one of the configured roles, and a comment of 8–1,000 characters.
- Admin sessions are HTTP-only, Secure, SameSite=Strict cookies and expire after 8 hours.
- Do not expose the admin password in frontend code or add it to the repository.
- If the API says the comments service is not configured, check that the `DB` binding exists and the deployment was redeployed.
- This feature requires Cloudflare Pages Functions and D1; it will not work if the site is served only as static files without Functions enabled.
