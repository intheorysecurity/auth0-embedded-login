const path = require("path");

const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const required = (name) => {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env and fill it in.`
    );
  }
  return val;
};

const auth0Config = {
  domain: required("AUTH0_DOMAIN"),
  clientID: required("AUTH0_CLIENT_ID"),
  connection: required("AUTH0_DB_CONNECTION"),
  redirectUri:
    process.env.AUTH0_REDIRECT_URI || `http://localhost:${PORT}/callback`,
  logoutReturnTo:
    process.env.AUTH0_LOGOUT_RETURN_TO || `http://localhost:${PORT}/`,
  audience: process.env.AUTH0_AUDIENCE || undefined
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/vendor", express.static(path.join(__dirname, "node_modules")));

app.get("/", (req, res) => {
  res.render("home", { auth0Config });
});

app.get("/login", (req, res) => {
  res.render("login", { auth0Config });
});

app.get("/signup", (req, res) => {
  res.render("signup", { auth0Config });
});

app.get("/debug", (req, res) => {
  res.render("debug", {
    auth0Config,
    requestInfo: {
      host: req.headers.host,
      origin: req.headers.origin || null,
      forwardedProto: req.headers["x-forwarded-proto"] || null
    }
  });
});

// Dedicated cross-origin verification page (per Auth0 docs).
app.get("/verification", (req, res) => {
  res.render("verification", { auth0Config });
});

// Some flows use redirects; keeping this route helps when you decide to switch.
app.get("/callback", (req, res) => {
  res.render("callback", { auth0Config });
});

app.get("/profile", (req, res) => {
  res.render("profile", { auth0Config });
});

app.get("/logout", (req, res) => {
  res.render("logout", { auth0Config });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

