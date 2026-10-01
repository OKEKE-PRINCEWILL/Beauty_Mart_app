# Beauty Mart

Full-stack cosmetics store with a Spring Boot API at the repository root and a Next.js storefront in `frontend/`.

## Requirements

- Java 21 or newer
- A PostgreSQL database

Maven does not need to be installed globally. The repository includes the Maven Wrapper.

## Local configuration

Copy `.env.example` to `.env`, then replace the placeholder values with your PostgreSQL connection details. The `.env` file is ignored by Git.

## Run

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs on `http://localhost:8080` by default.

The application reads Render's injected `PORT` environment variable automatically. The database variables in `.env.example` should be added to the Render web service when deployment begins.

## Test

```powershell
.\mvnw.cmd test
Invoke-RestMethod http://localhost:8080/api/health
```

The health endpoint returns:

```json
{
  "status": "ok"
}
```

## Product API

```text
GET /api/products
GET /api/products/{id}
```

Examples:

```powershell
Invoke-RestMethod http://localhost:8080/api/products
Invoke-RestMethod http://localhost:8080/api/products/1
```

Flyway creates the `products` table and seeds the starter catalog when the application connects to a new database.

## Deploy to Render

The repository includes a multi-stage `Dockerfile` and `render.yaml`. Creating a
Render Blueprint deploys a Docker web service named `beauty-mart-api`.

The Blueprint prompts for the Supabase Session pooler JDBC URL, database
username and password, Google client ID, frontend URL, and Mailgun settings.
Use port `5432` with `sslmode=require`; the transaction pooler on port `6543`
is not suitable for Hibernate's prepared statements.

## Deploy the frontend to Vercel

Import this same repository into Vercel and set the project's Root Directory to `frontend`. Configure the two variables documented in `frontend/.env.example`, using the deployed Render API URL for `NEXT_PUBLIC_API_URL`.
