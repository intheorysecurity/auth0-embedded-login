(function () {
  const auth = window.AuthDemo;
  if (!auth) return;

  function qs(sel) {
    return document.querySelector(sel);
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function setResult(el, { ok, message }) {
    if (!el) return;
    el.classList.toggle("result--ok", Boolean(ok));
    el.classList.toggle("result--err", !ok);
    el.textContent = message || "";
  }

  // Home auth status
  const status = qs("#auth-status");
  if (status) {
    if (auth.isAuthenticated()) {
      const claims = auth.decodeJwt(auth.getIdToken()) || {};
      setText(
        status,
        `Authenticated${claims.email ? ` as ${claims.email}` : ""}.`
      );
      status.classList.add("status--ok");
    } else {
      setText(status, "Not authenticated.");
      status.classList.add("status--warn");
    }
  }

  // Login form
  const loginForm = qs("#login-form");
  if (loginForm) {
    const out = qs("#login-result");
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      setResult(out, { ok: true, message: "Logging in…" });

      const email = loginForm.elements.email.value;
      const password = loginForm.elements.password.value;

      auth.loginWithPassword(email, password, function (err) {
        if (err) {
          setResult(out, { ok: false, message: err.description || err.message || "Login failed." });
          return;
        }
        setResult(out, { ok: true, message: "Logged in. Redirecting…" });
        window.location.assign("/");
      });
    });
  }

  // Signup form
  const signupForm = qs("#signup-form");
  if (signupForm) {
    const out = qs("#signup-result");
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      setResult(out, { ok: true, message: "Creating account…" });

      const email = signupForm.elements.email.value;
      const password = signupForm.elements.password.value;

      auth.signupAndLogin(email, password, function (err) {
        if (err) {
          setResult(out, { ok: false, message: err.description || err.message || "Signup failed." });
          return;
        }
        setResult(out, { ok: true, message: "Signed up and logged in. Redirecting…" });
        window.location.assign("/");
      });
    });
  }

  // Profile page
  const profileGate = qs("#profile-gate");
  const profileJson = qs("#profile-json");
  if (profileGate && profileJson) {
    if (!auth.isAuthenticated()) {
      setText(profileGate, "Not authenticated. Please login first.");
      profileGate.classList.add("status--warn");
    } else {
      const claims = auth.decodeJwt(auth.getIdToken());
      setText(profileGate, "Authenticated. Decoded id_token claims:");
      profileGate.classList.add("status--ok");
      profileJson.textContent = JSON.stringify(claims, null, 2);
    }
  }

  // Callback page (if used)
  const callbackOut = qs("#callback-result");
  if (callbackOut) {
    const params = new URLSearchParams(window.location.search || "");
    const hashParams = new URLSearchParams(
      (window.location.hash || "").startsWith("#")
        ? (window.location.hash || "").slice(1)
        : window.location.hash || ""
    );
    const type = (
      params.get("type") ||
      hashParams.get("type") ||
      ""
    ).toLowerCase();

    // If third-party cookies are blocked (common on Safari), Auth0 can redirect
    // back to the app for cross-origin verification. This page must call:
    //   webAuth.crossOriginVerification()
    if (type === "co_verification") {
      setResult(callbackOut, {
        ok: true,
        message:
          "Completing cross-origin verification… (This is expected when third-party cookies are blocked.)"
      });

      try {
        auth.webAuth.crossOriginVerification();
      } catch (e) {
        setResult(callbackOut, {
          ok: false,
          message: e && e.message ? e.message : "crossOriginVerification failed."
        });
      }
    } else if (
      (window.location.hash && window.location.hash.includes("access_token")) ||
      hashParams.has("access_token")
    ) {
      setResult(callbackOut, { ok: true, message: "Processing redirect response…" });
      auth.webAuth.parseHash(function (err, authResult) {
        if (err) {
          setResult(callbackOut, {
            ok: false,
            message: err.description || err.error_description || err.message || "parseHash failed."
          });
          return;
        }

        if (authResult && (authResult.accessToken || authResult.idToken)) {
          auth.setSessionFromAuthResult(authResult);
          setResult(callbackOut, { ok: true, message: "Authenticated. Redirecting…" });
          window.location.replace("/");
          return;
        }

        setResult(callbackOut, { ok: false, message: "No tokens found in callback response." });
      });
    } else {
      setResult(callbackOut, {
        ok: true,
        message: `Callback loaded. Config realm/connection: "${(auth.config && auth.config.connection) || ""}".`
      });
    }
  }

  // Logout
  const logoutBtn = qs("#logout-button");
  if (logoutBtn) {
    const out = qs("#logout-result");
    logoutBtn.addEventListener("click", function () {
      setResult(out, { ok: true, message: "Logging out…" });
      auth.logout();
    });
  }
})();

