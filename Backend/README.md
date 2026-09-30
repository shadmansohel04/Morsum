# Morsum Backend

The Backend directory contains the Spring Boot service for Morsum. It provides the REST API used by the mobile application, persists application data in PostgreSQL, stores uploaded images in Amazon S3, and exposes a STOMP WebSocket endpoint for chat.

## Stack

- Java 17
- Spring Boot 3.5.0
- Maven Wrapper
- PostgreSQL through Spring JDBC
- Amazon S3 for uploaded images
- JWT authentication
- STOMP over WebSocket with SockJS

## Prerequisites

- JDK 17
- PostgreSQL database
- AWS S3 bucket and credentials
- A shell that can run the Maven Wrapper

## Configuration

The service reads its runtime configuration from environment variables. Set these before starting the application:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | PostgreSQL JDBC connection URL |
| `USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `BUCKET_NAME` | S3 bucket name |
| `ACCESS_KEY` | AWS access key |
| `SECRET_KEY` | AWS secret key |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `API_KEY` | External service API key used by the backend |
| `SECRET_JWT` | External service JWT secret |

The default HTTP port is `8080`. Multipart uploads are limited to 10 MB. Hibernate is configured with `ddl-auto=update`, so the application updates the database schema at startup.

## Run locally

From this directory:

```powershell
./mvnw.cmd spring-boot:run
```

Or build and run the packaged application:

```powershell
./mvnw.cmd clean package
java -jar target/TheEats-0.0.1-SNAPSHOT.jar
```

Run the test suite with:

```powershell
./mvnw.cmd test
```

## API surface

The main REST groups are:

- `/account` for registration, login, profiles, friends, and JWT refresh
- `/Post` for food posts, reactions, spotlights, and pantry data
- `/dash` and `/dashboard` for dashboard and daily-post data
- `/recipe` for recipe parsing and saved recipes
- `/profile` and `/user` for profile and messaging operations

Authenticated endpoints expect an `Authorization` header containing the generated JWT. Uploaded images use the multipart field `frame`.

## WebSocket chat

The STOMP SockJS endpoint is `/ws`. Clients send application messages under `/app` and subscribe to broker topics under `/topic`. The mobile client uses the chat handlers defined in `WebSocketController`.

## Docker

Build the application first so that the jar exists at `target/TheEats-0.0.1-SNAPSHOT.jar`, then build and run the image:

```powershell
./mvnw.cmd clean package -DskipTests
docker build -t morsum-backend .
docker run --rm -p 8080:8080 --env-file .env morsum-backend
```

Do not commit `.env` or cloud credentials. The container expects the same environment variables described above.