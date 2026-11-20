# fullstack_developer_capstone

**Repository:** `fullstack_developer_capstone`  
**Project:** `fullstack_developer_capstone` — Best Cars Dealership Review Portal

A full-stack dealership review portal built with Django, React, Node.js/Express, MongoDB, and a Flask sentiment analyzer. Visitors can browse dealerships and filter by state; registered users can sign in and post reviews. Django serves the web application and proxies dealer, review, and sentiment requests to the supporting services.

## Features

- Browse dealerships, filter by state, and view dealer details and customer reviews.
- Register and log in with Django accounts; submit reviews after logging in.
- Classify review sentiment with the included VADER service.
- Manage car makes and models in Django admin.
- Run the complete stack locally with Docker Compose.
- Build a Django + React container image for IBM Cloud Container Registry and Kubernetes.

## Run locally

Install Docker Desktop, then from the project root:

```sh
cd server
docker compose up --build
```

Open `http://localhost:8000`. The stack includes MongoDB, the Express dealer API, the Flask sentiment service, and the Django/React application. Create an admin account in a second terminal:

```sh
cd server
docker compose exec web python manage.py createsuperuser
```

Then visit `http://localhost:8000/admin/` to manage car models. The web container automatically applies database migrations, imports the included car inventory, collects static files, and starts Gunicorn.

## Local development without Docker

Start MongoDB, then run the dealer API from `server/database` with `MONGO_URL=mongodb://127.0.0.1:27017/dealershipsDB`. Start the sentiment service from `server/djangoapp/microservices` on port 5050. In `server`, create a Python virtual environment, install `requirements.txt`, run `python manage.py migrate`, and `python manage.py seed_cars`. Build the React app with `npm ci && npm run build` from `server/frontend`, then run `python manage.py runserver` from `server`.

## Container image for the Skills Network lab

The Django/React Dockerfile and Kubernetes manifest are in `server/`. The lab assigns the namespace `sn-labs-manthankhand`. From the `server` directory in the lab IDE:

```sh
export MY_NAMESPACE="sn-labs-manthankhand"
docker build -t "us.icr.io/${MY_NAMESPACE}/dealership:latest" .
docker push "us.icr.io/${MY_NAMESPACE}/dealership:latest"
```

Set the `image` field in `deployment.yml` to your actual namespace, then apply it with `kubectl apply -f deployment.yml`. Verify the rollout and service with `kubectl rollout status deployment/dealership` and `kubectl get deployments,services,pods`.

For deployments that need the dealer database and sentiment services, deploy those services as well and set `backend_url` and `sentiment_analyzer_url` to their reachable service URLs. Do not use the local Compose hostnames outside the Compose network.

## API routes

- `GET /djangoapp/get_dealers`
- `GET /djangoapp/get_dealers/<state>`
- `GET /djangoapp/dealer/<id>`
- `GET /djangoapp/reviews/dealer/<id>`
- `GET /djangoapp/get_cars`
- `POST /djangoapp/register`
- `POST /djangoapp/login`
- `GET /djangoapp/logout`
- `POST /djangoapp/add_review`

The dealer API and sentiment service are source-controlled in `server/database` and `server/djangoapp/microservices`.
