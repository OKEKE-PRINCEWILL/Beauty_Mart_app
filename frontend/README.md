# Beauty Mart Frontend

Next.js storefront for Beauty Mart, a cosmetics store delivering within Lagos.

## Requirements

- Node.js 20 or newer
- The Beauty Mart Spring Boot API

## Configuration

Copy `.env.example` to `.env.local` and change the API URL when needed:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

When the backend is unavailable, the homepage displays a catalog-unavailable state instead of failing the entire page.

## Validate

```powershell
npm run lint
npm run build
```

## Deploy to Vercel

Set these environment variables for Preview and Production before deploying:

```text
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

After Vercel assigns the production URL, add that exact origin to the backend's `FRONTEND_URL` on Render and to the Google OAuth client's authorized JavaScript origins.
