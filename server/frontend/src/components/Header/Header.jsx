import React, { useState } from 'react';
import "../assets/style.css";
import "../assets/bootstrap.min.css";

export default function Header() {
  const [busy, setBusy] = useState(false);
  const logout = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await fetch("/djangoapp/logout", { method: "GET", credentials: "same-origin" });
      sessionStorage.clear();
      window.location.assign("/");
    } catch (_error) { setBusy(false); alert("Could not log out. Please try again."); }
  };
  const username = sessionStorage.getItem("username");
  return <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: "darkturquoise", minHeight: "1in" }}>
    <div className="container-fluid"><a className="navbar-brand fw-bold" href="/">Best Cars</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
      <div className="collapse navbar-collapse" id="navbarText"><ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item"><a className="nav-link" href="/">Home</a></li><li className="nav-item"><a className="nav-link" href="/about">About Us</a></li><li className="nav-item"><a className="nav-link" href="/contact">Contact Us</a></li>
      </ul><div className="d-flex align-items-center gap-3">{username ? <><span className="username">{username}</span><a className="nav_item" href="/djangoapp/logout" onClick={logout}>{busy ? "Signing out…" : "Logout"}</a></> : <><a className="nav_item" href="/login">Login</a><a className="nav_item" href="/register">Register</a></>}</div></div>
    </div></nav>;
}
