# JustWatchTV

JustWatchTV is personalized and easy way of experiencing youtube with no distractions.

This is a simple yet powerful way of content consumption.


## Deployment URL's:
- https://justwatchtv.vercel.app
- https://just-watch-tv.vercel.app


## Frontend:
- This layer consists only root page (/). As everything is rendered in one page.
- If any other endpoint is hit other than the root and api then the view is redirected to root.
- Implemented using NextJS.


## Backend For Frontend (BFF) API:
- This layer consists of API's which combines other API's to provide seamless response.
- As layer consists following API endpoints.

### Routes:
- /api/search?query=<string>      (GET)    Retrieves the search results.
- /api/search-next-page           (POST)   Retrieves the more data with the search context.
- /api/suggestions?query=<string> (GET)    Retrieves search suggestions list.


## Running In Local

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Developed By Nikhil Gajam
