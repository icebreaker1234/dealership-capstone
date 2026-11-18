import React, { useState } from 'react';
import "./Login.css";
import Header from '../Header/Header';

export default function Login({ onClose }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const login = async (event) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/djangoapp/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ userName, password }) });
      const result = await response.json();
      if (!response.ok || result.status !== "Authenticated") throw new Error(result.error || "The user could not be authenticated.");
      sessionStorage.setItem("username", result.userName);
      window.location.assign("/");
    } catch (problem) { setError(problem.message); setBusy(false); }
  };
  return <><Header /><main className="container py-5"><form className="login_panel card p-4" onSubmit={login}>
    <h1 className="h3">Sign in</h1><label>Username<input autoComplete="username" type="text" name="username" className="input_field form-control" value={userName} onChange={(event) => setUserName(event.target.value)} required /></label>
    <label>Password<input autoComplete="current-password" name="password" type="password" className="input_field form-control" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    {error && <p role="alert">{error}</p>}<div className="d-flex gap-2"><button className="action_button btn btn-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Login"}</button><button className="action_button btn btn-outline-secondary" type="button" onClick={() => onClose ? onClose() : window.location.assign("/")}>Cancel</button></div>
    <a href="/register" className="mt-3">Create an account</a></form></main></>;
}
