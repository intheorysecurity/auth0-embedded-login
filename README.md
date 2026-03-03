## Auth0 embedded login demo (Node.js + auth0.js)

This is a minimal Node.js + Express project that serves an embedded login UI and uses the **`auth0-js`** SDK in the browser for:

- **signup**
- **login**
- **logout**

### Prereqs

- Node.js 18+ recommended
- An Auth0 tenant
- An Auth0 **Database Connection** (typically `Username-Password-Authentication`)

### 1) Auth0 dashboard setup

Create (or reuse) an Auth0 application.

- **Application type**: Single Page Application (recommended for embedded login with a public client)
- **Allowed Callback URLs**: `http://localhost:3000/callback`
- **Allowed Logout URLs**: `http://localhost:3000/`
- **Allowed Web Origins**: `http://localhost:3000`
- **Cross-Origin Verification Fallback URL**: `http://localhost:3000/verification`

To use embedded username/password (database) login with `auth0-js`:

- Enable **Cross-Origin Authentication** (tenant / client setting, depending on your Auth0 dashboard layout)
- Ensure your Database Connection is enabled for your application
- Make sure your verification fallback page loads Auth0’s cross-origin verification handler (this demo does on `/verification`)

### 2) Configure env vars

Copy the example env file and fill it in:

```bash
cp .env.example .env
```

Set:

- `AUTH0_DOMAIN` (e.g. `dev-abc123.us.auth0.com`)
- `AUTH0_CLIENT_ID`
- `AUTH0_DB_CONNECTION` (usually `Username-Password-Authentication`)

### 3) Install and run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Deploy to Vercel

This repo includes a Vercel serverless entry at `api/index.js` and a `vercel.json` rewrite so routes like `/login` and `/signup` work without an Express “listen”.

- You **do not** need to set `PORT` on Vercel.
- Set Vercel Environment Variables:
  - `AUTH0_DOMAIN`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_DB_CONNECTION`
  - (recommended) `AUTH0_AUDIENCE`

In Auth0, update URLs to your Vercel HTTPS origin:

- **Allowed Web Origins**: `https://<your-app>.vercel.app`
- **Allowed Origins (CORS)**: `https://<your-app>.vercel.app`
- **Allowed Callback URLs**: `https://<your-app>.vercel.app/callback`
- **Allowed Logout URLs**: `https://<your-app>.vercel.app/`
- **Cross-Origin Verification Fallback URL**: `https://<your-app>.vercel.app/verification`

### What’s implemented

- **Signup**: `/signup` uses `webAuth.signupAndLogin(...)`
- **Login**: `/login` uses `webAuth.login(...)` with `realm` = your database connection
- **Logout**: `/logout` clears stored tokens then calls `webAuth.logout(...)`

### Important notes

- This demo stores tokens in **`localStorage`** for simplicity. For production, prefer more robust patterns and avoid storing long-lived tokens in browser storage.
- Embedded login is not recommended for many production scenarios; Auth0’s recommended approaches often use hosted Universal Login instead.
- If you see **“Unable to configure verification page”** / **failed cross-origin authentication**, it’s usually because the browser is blocking third‑party cookies and your app wasn’t handling the `type=co_verification` redirect on the callback URL (or the app origin isn’t whitelisted in Auth0).

