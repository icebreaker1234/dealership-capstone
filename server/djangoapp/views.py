import json
import logging
from pathlib import Path

import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from . import restapis
from .models import CarMake, CarModel, DealerReview

logger = logging.getLogger(__name__)


def _local_data(filename, key):
    data_path = Path(__file__).resolve().parents[1] / "database" / "data" / filename
    return json.loads(data_path.read_text(encoding="utf-8")).get(key, [])


def _dealer_list():
    return _local_data("dealerships.json", "dealerships")


def _body(request):
    try:
        return json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    username, password = data.get("userName", ""), data.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"userName": username, "error": "Invalid username or password"}, status=401)
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def logout_user(request):
    logout(request)
    return JsonResponse({"status": "Logged out"})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    username = (data.get("userName") or data.get("username") or "").strip()
    password = data.get("password") or ""
    email = (data.get("email") or "").strip()
    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=409)
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=(data.get("firstName") or data.get("first_name") or "").strip(),
        last_name=(data.get("lastName") or data.get("last_name") or "").strip(),
    )
    return JsonResponse({"userName": user.username, "status": "Registered"}, status=201)


def get_dealerships(request):
    try:
        return JsonResponse({"status": 200, "dealers": restapis.get_request("fetchDealers")})
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        logger.warning("Dealer service unavailable: %s", exc)
        return JsonResponse({"status": 200, "dealers": _dealer_list()})


def get_dealerships_by_state(request, state):
    try:
        return JsonResponse({"status": 200, "dealers": restapis.get_request("fetchDealers/" + state)})
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        logger.warning("Dealer service unavailable: %s", exc)
        dealers = [dealer for dealer in _dealer_list() if dealer.get("state", "").casefold() == state.casefold()]
        return JsonResponse({"status": 200, "dealers": dealers})


def get_dealer_details(request, dealer_id):
    try:
        return JsonResponse({"status": 200, "dealer": restapis.get_request(f"fetchDealer/{dealer_id}")})
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        logger.warning("Dealer service unavailable: %s", exc)
        dealer = [dealer for dealer in _dealer_list() if int(dealer.get("id", -1)) == dealer_id]
        return JsonResponse({"status": 200, "dealer": dealer})


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = restapis.get_request(f"fetchReviews/dealer/{dealer_id}")
        for review in reviews:
            try:
                review["sentiment"] = restapis.analyze_review_sentiments(review.get("review", "")).get("sentiment", "neutral")
            except (requests.RequestException, ValueError, KeyError, TypeError):
                review["sentiment"] = "neutral"
        return JsonResponse({"status": 200, "reviews": reviews})
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        logger.warning("Review service unavailable: %s", exc)
        reviews = [review for review in _local_data("reviews.json", "reviews") if int(review.get("dealership", -1)) == dealer_id]
        for review in reviews:
            review["sentiment"] = "neutral"
        reviews.extend(DealerReview.objects.filter(dealership=dealer_id).values(
            "id", "name", "dealership", "review", "purchase", "purchase_date",
            "car_make", "car_model", "car_year", "sentiment",
        ))
        return JsonResponse({"status": 200, "reviews": reviews})


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Login required"}, status=401)
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    required = ("name", "dealership", "review", "purchase_date", "car_make", "car_model", "car_year")
    if any(not data.get(field) for field in required):
        return JsonResponse({"error": "All review fields are required"}, status=400)
    try:
        saved = restapis.post_review(data)
        try:
            saved["sentiment"] = restapis.analyze_review_sentiments(data["review"]).get("sentiment", "neutral")
        except (requests.RequestException, ValueError, KeyError, TypeError):
            saved["sentiment"] = "neutral"
        return JsonResponse({"status": 200, "review": saved})
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        logger.warning("Could not submit review: %s", exc)
        local_review = DealerReview.objects.create(
            name=data["name"], dealership=int(data["dealership"]), review=data["review"],
            purchase=bool(data.get("purchase", False)), purchase_date=data["purchase_date"],
            car_make=data["car_make"], car_model=data["car_model"], car_year=int(data["car_year"]),
            sentiment="neutral",
        )
        return JsonResponse({"status": 200, "review": {
            "id": local_review.id, "name": local_review.name, "dealership": local_review.dealership,
            "review": local_review.review, "purchase": local_review.purchase,
            "purchase_date": local_review.purchase_date, "car_make": local_review.car_make,
            "car_model": local_review.car_model, "car_year": local_review.car_year,
            "sentiment": local_review.sentiment,
        }})


def get_cars(request):
    cars = CarModel.objects.select_related("make").all()
    return JsonResponse({"CarModels": [{"CarMake": car.make.name, "CarModel": car.name, "Year": car.year} for car in cars]})


def seed_cars(request):
    if not request.user.is_staff:
        return JsonResponse({"error": "Admin access required"}, status=403)
    sample = [("Toyota", "Camry", "Sedan", 2022), ("Honda", "Civic", "Sedan", 2021), ("Ford", "Escape", "SUV", 2023)]
    for make_name, model_name, kind, year in sample:
        make, _ = CarMake.objects.get_or_create(name=make_name)
        CarModel.objects.get_or_create(make=make, name=model_name, year=year, defaults={"vehicle_type": kind})
    return JsonResponse({"status": "Car makes and models ready"})


def about(request):
    return render(request, "About.html")


def contact(request):
    return render(request, "Contact.html")
