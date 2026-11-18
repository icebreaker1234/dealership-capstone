import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positiveIcon from "../assets/positive.png";
import neutralIcon from "../assets/neutral.png";
import negativeIcon from "../assets/negative.png";
import reviewIcon from "../assets/reviewbutton.png";
import Header from '../Header/Header';

export default function Dealer() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([fetch(`/djangoapp/dealer/${id}`).then((response) => response.json()), fetch(`/djangoapp/reviews/dealer/${id}`).then((response) => response.json())])
      .then(([dealerData, reviewData]) => { setDealer(dealerData.dealer?.[0] || null); setReviews(reviewData.reviews || []); if (dealerData.error) setError(dealerData.error); })
      .catch(() => setError("Unable to load this dealership. Check that the database service is running."));
  }, [id]);
  const sentimentIcon = (sentiment) => sentiment === "positive" ? positiveIcon : sentiment === "negative" ? negativeIcon : neutralIcon;
  return <><Header /><main className="container py-4">{error && <p role="alert">{error}</p>}{dealer && <><div className="d-flex align-items-center gap-3"><div><h1>{dealer.full_name}</h1><p>{dealer.city}, {dealer.address}, ZIP {dealer.zip}, {dealer.state}</p></div>{sessionStorage.getItem("username") && <a href={`/postreview/${id}`}><img src={reviewIcon} width="56" alt="Post a review" /></a>}</div><h2 className="h3 mt-4">Customer reviews</h2><div className="reviews_panel">{reviews.length ? reviews.map((review) => <article className="review_panel" key={review.id}><img src={sentimentIcon(review.sentiment)} className="emotion_icon" alt={`${review.sentiment} sentiment`} /><p className="review">{review.review}</p><p className="reviewer">{review.name} · {review.car_make} {review.car_model} {review.car_year}</p></article>) : <p>No reviews yet.</p>}</div></>}</main></>;
}
