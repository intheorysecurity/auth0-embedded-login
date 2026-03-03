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
    setResult(callbackOut, {
      ok: true,
      message:
        "If you switch to redirect auth, parse the response here (e.g., webAuth.parseHash)."
    });
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

