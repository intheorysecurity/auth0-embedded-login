(function () {
  const config = window.__AUTH0_CONFIG__ || {};

  if (!config.domain || !config.clientID) {
    // Config is injected by the server; without it there's nothing to do.
    return;
  }

  const webAuth = new auth0.WebAuth({
    domain: config.domain,
    clientID: config.clientID,
    redirectUri: config.redirectUri,
    responseType: "token id_token",
    scope: "openid profile email",
    audience: config.audience
  });

  const storageKey = "auth0_demo_tokens";

  function nowMs() {
    return new Date().getTime();
  }

  function readTokens() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeTokens(tokens) {
    localStorage.setItem(storageKey, JSON.stringify(tokens));
  }

  function clearTokens() {
    localStorage.removeItem(storageKey);
  }

  function setSession(authResult) {
    const expiresAt = nowMs() + (authResult.expiresIn || 0) * 1000;
    writeTokens({
      accessToken: authResult.accessToken,
      idToken: authResult.idToken,
      expiresAt
    });
  }

  function isAuthenticated() {
    const tokens = readTokens();
    return Boolean(tokens && tokens.expiresAt && nowMs() < tokens.expiresAt);
  }

  function getIdToken() {
    const tokens = readTokens();
    return tokens && tokens.idToken ? tokens.idToken : null;
  }

  function decodeJwt(token) {
    const parts = (token || "").split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");

    try {
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function loginWithPassword(email, password, cb) {
    webAuth.login(
      {
        realm: config.connection,
        username: email,
        password: password
      },
      function (err, authResult) {
        if (err) return cb(err);
        setSession(authResult);
        cb(null, authResult);
      }
    );
  }

  function signupAndLogin(email, password, cb) {
    webAuth.signupAndLogin(
      {
        connection: config.connection,
        email: email,
        password: password
      },
      function (err, authResult) {
        if (err) return cb(err);
        setSession(authResult);
        cb(null, authResult);
      }
    );
  }

  function logout() {
    clearTokens();
    webAuth.logout({
      returnTo: config.logoutReturnTo,
      clientID: config.clientID
    });
  }

  window.AuthDemo = {
    webAuth,
    isAuthenticated,
    readTokens,
    clearTokens,
    getIdToken,
    decodeJwt,
    loginWithPassword,
    signupAndLogin,
    logout
  };
})();

