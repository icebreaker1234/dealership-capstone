import React, { useEffect, useState } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import reviewIcon from "../assets/reviewicon.png";

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [state, setState] = useState("All");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/djangoapp/get_dealers").then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => { if (!response.ok) throw new Error(data.error || "Unable to load dealers"); setDealers(data.dealers || []); setStates([...new Set((data.dealers || []).map((dealer) => dealer.state))].sort()); setError(""); })
      .catch((problem) => { setDealers([]); setError(problem.message); });
  }, []);
  const filter = async (nextState) => {
    setState(nextState);
    const path = nextState === "All" ? "/djangoapp/get_dealers" : `/djangoapp/get_dealers/${encodeURIComponent(nextState)}`;
    try {
      const response = await fetch(path); const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to filter dealers");
      setDealers(result.dealers || []); setError("");
    } catch (problem) { setDealers([]); setError(problem.message); }
  };
  const loggedIn = Boolean(sessionStorage.getItem("username"));
  return <><Header /><main className="dealers-page">
    <h1>Find a dealership</h1><label htmlFor="state">Filter by state </label>
    <select id="state" value={state} onChange={(event) => filter(event.target.value)}><option value="All">All States</option>{states.map((item) => <option key={item} value={item}>{item}</option>)}</select>
    {error && <p role="alert">{error}. Start the dealer database service and refresh.</p>}
    <table className="table"><thead><tr><th>ID</th><th>Dealer Name</th><th>City</th><th>Address</th><th>ZIP</th><th>State</th>{loggedIn && <th>Review Dealer</th>}</tr></thead>
      <tbody>{dealers.map((dealer) => <tr key={dealer.id}><td>{dealer.id}</td><td><a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a></td><td>{dealer.city}</td><td>{dealer.address}</td><td>{dealer.zip}</td><td>{dealer.state}</td>{loggedIn && <td><a href={`/postreview/${dealer.id}`}><img src={reviewIcon} className="review_icon" alt="Review dealer" /></a></td>}</tr>)}</tbody></table>
  </main></>;
}
