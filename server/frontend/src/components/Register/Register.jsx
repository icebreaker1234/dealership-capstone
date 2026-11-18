import { useState } from "react";
import Header from "../Header/Header";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({ userName: "", firstName: "", lastName: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/djangoapp/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed");
      setMessage("Account created. You can now log in.");
      window.setTimeout(() => { window.location.href = "/login"; }, 700);
    } catch (error) { setMessage(error.message); }
  };

  return <><Header /><main className="register_container">
    <h1 className="header">Sign-up</h1>
    <form className="inputs" onSubmit={submit}>
      {[["userName", "Username", "text"], ["firstName", "First Name", "text"], ["lastName", "Last Name", "text"], ["email", "Email", "email"], ["password", "Password", "password"]].map(([name, label, type]) =>
        <label className="input" key={name}><span>{label}</span><input className="input_field" name={name} type={type} value={form[name]} onChange={update} required /></label>)}
      <div className="submit_panel"><button className="submit" type="submit">Register</button></div>
      {message && <p role="status">{message}</p>}
    </form>
  </main></>;
}
