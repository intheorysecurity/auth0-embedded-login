const path = require("path");

const express = require("express");

const required = (name) => {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env (local) or set it in your host (Vercel).`
    );
  }
  return val;
};

function getBaseUrl(req) {
  const host = req.headers.host;
  const proto =
    (req.headers["x-forwarded-proto"] || "").split(",")[0].trim() ||
    "http";
  return `${proto}://${host}`;
}

function getAuth0Config(req) {
  const baseUrl = getBaseUrl(req);

  return {
    domain: required("AUTH0_DOMAIN"),
    clientID: required("AUTH0_CLIENT_ID"),
    connection: required("AUTH0_DB_CONNECTION"),
    redirectUri: process.env.AUTH0_REDIRECT_URI || `${baseUrl}/callback`,
    logoutReturnTo: process.env.AUTH0_LOGOUT_RETURN_TO || `${baseUrl}/`,
    audience: process.env.AUTH0_AUDIENCE || undefined
  };
}

function createApp() {
  const app = express();

  // Needed for correct proto/host detection on Vercel and other proxies.
  app.set("trust proxy", true);

  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use("/public", express.static(path.join(process.cwd(), "public")));
  app.use("/vendor", express.static(path.join(process.cwd(), "node_modules")));

  app.get("/", (req, res) => {
    res.render("home", { auth0Config: getAuth0Config(req) });
  });

  app.get("/login", (req, res) => {
    res.render("login", { auth0Config: getAuth0Config(req) });
  });

  // If JS fails to load, the form will submit normally. Keep credentials out of
  // the URL by accepting POST, but do not process credentials server-side.
  app.post("/login", (req, res) => {
    res.status(400).render("login", {
      auth0Config: getAuth0Config(req),
      serverError:
        "This demo requires JavaScript to be enabled and the Auth0 scripts to load. " +
        "Your browser submitted the form directly; credentials were not processed by the server."
    });
  });

  app.get("/signup", (req, res) => {
    res.render("signup", { auth0Config: getAuth0Config(req) });
  });

  app.post("/signup", (req, res) => {
    res.status(400).render("signup", {
      auth0Config: getAuth0Config(req),
      serverError:
        "This demo requires JavaScript to be enabled and the Auth0 scripts to load. " +
        "Your browser submitted the form directly; credentials were not processed by the server."
    });
  });

  app.get("/debug", (req, res) => {
    res.render("debug", {
      auth0Config: getAuth0Config(req),
      requestInfo: {
        host: req.headers.host,
        origin: req.headers.origin || null,
        forwardedProto: req.headers["x-forwarded-proto"] || null
      }
    });
  });

  // Dedicated cross-origin verification page (per Auth0 docs).
  app.get("/verification", (req, res) => {
    res.render("verification", { auth0Config: getAuth0Config(req) });
  });

  // Some flows use redirects; keeping this route helps when you decide to switch.
  app.get("/callback", (req, res) => {
    res.render("callback", { auth0Config: getAuth0Config(req) });
  });

  app.get("/profile", (req, res) => {
    res.render("profile", { auth0Config: getAuth0Config(req) });
  });

  app.get("/logout", (req, res) => {
    res.render("logout", { auth0Config: getAuth0Config(req) });
  });

  return app;
}

module.exports = { createApp };

