import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

export default function PostReview() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [models, setModels] = useState([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    Promise.all([fetch(`/djangoapp/dealer/${id}`).then((response) => response.json()), fetch("/djangoapp/get_cars").then((response) => response.json())])
      .then(([dealerData, carData]) => { setDealer(dealerData.dealer?.[0] || null); setModels(carData.CarModels || []); })
      .catch(() => setMessage("Could not load the dealership or car list. Please refresh."));
  }, [id]);

  const submit = async (event) => {
    event.preventDefault(); setMessage("");
    if (!sessionStorage.getItem("username")) { setMessage("Please log in before posting a review."); return; }
    const [make, ...modelParts] = model.split(" ");
    try {
      const response = await fetch("/djangoapp/add_review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionStorage.getItem("username"), dealership: Number(id), review, purchase: true, purchase_date: date, car_make: make, car_model: modelParts.join(" "), car_year: Number(year) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit the review");
      window.location.assign(`/dealer/${id}`);
    } catch (error) { setMessage(error.message); }
  };
  return <><Header /><main className="container py-4"><h1>{dealer?.full_name || "Post a review"}</h1><form className="card p-4 gap-3" onSubmit={submit}>
    <label htmlFor="review">Your review</label><textarea id="review" rows="5" value={review} onChange={(event) => setReview(event.target.value)} required />
    <label htmlFor="purchaseDate">Purchase date</label><input id="purchaseDate" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
    <label htmlFor="car">Car make and model</label><select id="car" value={model} onChange={(event) => setModel(event.target.value)} required><option value="">Choose a car</option>{models.map((item) => <option key={`${item.CarMake}-${item.CarModel}-${item.Year}`} value={`${item.CarMake} ${item.CarModel}`}>{item.CarMake} {item.CarModel}</option>)}</select>
    <label htmlFor="year">Model year</label><input id="year" type="number" min="2015" max="2023" value={year} onChange={(event) => setYear(event.target.value)} required />
    {message && <p role="alert">{message}</p>}<button className="postreview" type="submit">Post Review</button>
  </form></main></>;
}
