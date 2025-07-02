# JustWatchTV

```
JustWatchTV is personalized and easy way of experiencing youtube with no distractions.
This is a simple yet powerful way of content consumption.
```

## Features:
- Quick search queries can be added to local storage.
- Homepage search string can be updated.
- Previously watched list will get updated to local storage till 10 videos with saved watching time.
- Button to scroll from selected video to video player and vice versa.
- Lazy loaded data when scrolled to the bottom of the page.
- Option to enable or disable short video's.
- Playlist video support.
- Search suggestions available.

## Deployment URL's:
- https://justwatchtv.vercel.app
- https://just-watch-tv.vercel.app

## Frontend:
- This layer consists only root (/). As everything is rendered in one page.
- If any endpoint is hit other than the root or api then the page is redirected to root.
- Implemented using NextJS.

## Backend For Frontend (BFF) API:
- This layer consists of APIs that integrate other APIs to deliver a seamless response.
- Take a look at the following routes for more info.

### Routes:
```
/api/search?query=string            (GET)    Returns videos list based on search query.
/api/search-next-page               (POST)   Returns more videos list based on nextPageObj.
/api/search-playlists?query=string  (GET)    Returns playlists based on the query.
/api/suggestions?query=string       (GET)    Returns suggestions list based on search query.
```

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
Open [http://localhost:3000](http://localhost:3000) with your browser to see the project running.

### Developed By Nikhil Gajam
