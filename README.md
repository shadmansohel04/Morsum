# Morsum

Morsum is a food-focused social application composed of an Expo mobile client, a Spring Boot backend, and a Flask food-recognition service.

## Repository layout

| Directory | Responsibility | Local port |
| --- | --- | --- |
| [`Mobile`](Mobile/) | Expo React Native client for the feed, pantry, profiles, uploads, recipes, and chat | Expo-managed |
| [`Backend`](Backend/) | Spring Boot REST API, PostgreSQL persistence, S3 image storage, JWT authentication, and WebSocket chat | `8080` |
| [`InferenceModel`](InferenceModel/) | Flask/PyTorch service that classifies food images with a ResNet-50 model | `3000` |

Each service has its own detailed setup guide:

- [Mobile README](Mobile/README.md)
- [Backend README](Backend/README.md)
- [InferenceModel README](InferenceModel/README.md)

## Architecture

```text
+------------------+       REST / STOMP        +------------------+
|                  | ------------------------> |                  |
|  Expo Mobile     |                           |  Spring Backend  |
|                  | <------------------------ |                  |
+--------+---------+                            +--------+---------+
         |                                               |
         | multipart image                               | PostgreSQL
         v                                               | AWS S3
+------------------+                                      v
|                  |
| Food Inference   |
| Flask + PyTorch  |
|                  |
+------------------+
```

The mobile app reads service URLs from `Mobile/app.json` under `expo.extra`:

- `backendURI` points to the Spring REST API.
- `foodMSUri` points to the food-recognition service.

The backend uses `/ws` as its STOMP SockJS endpoint. Protected REST requests use the JWT returned by `/account/login` in the `Authorization` header. Image uploads use the multipart field name `frame`.

## Prerequisites

Install the tools required by the services you plan to run:

- Git
- Node.js and npm
- JDK 17
- Python 3.10 for the inference service
- PostgreSQL
- Docker, if running services in containers
- Android Studio or Xcode for native mobile development

Cloud-backed features also require an AWS S3 bucket and the backend credentials described in [Backend configuration](Backend/README.md#configuration).

## Local development

Start the services from separate terminals. Start PostgreSQL first, then the backend and inference service, and finally the mobile client.

### 1. Backend

Set the backend environment variables documented in [Backend/README.md](Backend/README.md), then run:

```powershell
cd Backend
./mvnw.cmd spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 2. Inference service

```powershell
cd InferenceModel
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python application.py
```

The classifier will be available at `http://localhost:3000`. Confirm it is healthy with:

```powershell
curl.exe http://localhost:3000/
```

### 3. Mobile client

Update `Mobile/app.json` so `backendURI` and `foodMSUri` point to hosts reachable by the emulator or physical device. For a physical phone, do not use `localhost`; use the development computer's LAN address.

```powershell
cd Mobile
npm install
npm start
```

Use the Expo developer menu to open the app, or run `npm run android`, `npm run ios`, or `npm run web`.

## Build and test

Backend tests:

```powershell
cd Backend
./mvnw.cmd test
```

Mobile linting:

```powershell
cd Mobile
npm run lint
```

The inference service currently has no repository test suite. Its health endpoint and `/detect` request documented in [InferenceModel/README.md](InferenceModel/README.md) provide a basic smoke test.

## Configuration and secrets

Do not commit database passwords, JWT secrets, AWS credentials, model deployment credentials, or local environment files. Backend configuration is supplied through environment variables. Mobile service URLs are currently stored in `Mobile/app.json`; update them for local or staging deployments and restart Expo after changing them.

## Docker

Both server components include Dockerfiles. See the service READMEs for the exact build commands and required environment variables:

- [Backend Docker instructions](Backend/README.md#docker)
- [InferenceModel Docker instructions](InferenceModel/README.md#docker)
