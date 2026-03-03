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

To use embedded username/password (database) login with `auth0-js`:

- Enable **Cross-Origin Authentication** (tenant / client setting, depending on your Auth0 dashboard layout)
- Ensure your Database Connection is enabled for your application

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

### What’s implemented

- **Signup**: `/signup` uses `webAuth.signupAndLogin(...)`
- **Login**: `/login` uses `webAuth.login(...)` with `realm` = your database connection
- **Logout**: `/logout` clears stored tokens then calls `webAuth.logout(...)`

### Important notes

- This demo stores tokens in **`localStorage`** for simplicity. For production, prefer more robust patterns and avoid storing long-lived tokens in browser storage.
- Embedded login is not recommended for many production scenarios; Auth0’s recommended approaches often use hosted Universal Login instead.

