# SimplyTutor Web

Single-page app for **SimplyTutor**, a micro-learning platform built on the Feynman Technique. Learners explain a concept in their own words, an AI tutor marks it, and a short quiz targets the gaps.

- **Live app:** https://simply-tutor-frontend.vercel.app
- **API repo:** https://github.com/tesikaasemi2003/SimplyTutor-Backend

## Features

- Sign in and register, with sessions that survive a page refresh and tokens that refresh automatically.
- A Feynman technique welcome carousel for new learners (index cards that rotate, then "Let's go").
- Topic list with category filter.
- Explain page: lined notebook writing area, draft autosave, AI tutor notes (misconceptions, gaps, suggestions), clarity score and change since the last attempt.
- Quiz generated around the learner's gaps, scored on the server, with a review of every answer.
- Dashboard: learning streak, 7-day activity, mastery per topic, quiz trend and score charts.
- History: reopen past feedback, delete explanations and quiz attempts.
- Admin: create, edit and delete topics (admin role only).

## Tech stack

React, TypeScript, Vite, TailwindCSS, Redux Toolkit, React Router, Axios, Recharts.

## Routes

| Path | Who | Page |
|---|---|---|
| `/login`, `/register` | Logged-out users | Authentication |
| `/dashboard` | Logged in | Progress overview |
| `/topics` | Logged in | Topic list |
| `/topics/:id/explain` | Logged in | Write an explanation, get feedback |
| `/topics/:id/quiz` | Logged in | Quiz |
| `/history` | Logged in | Past explanations and quizzes |
| `/admin/topics` | Admin | Manage topics |
| anything else | Everyone | 404 page |

## State and data

- **Redux Toolkit** holds the auth session (`user`, `loading`, `initialized`). Page data such as topics or dashboard figures lives in the page that uses it.
- `service/api.ts` is an Axios instance with two interceptors: the request interceptor adds the access token, and the response interceptor refreshes it once on a `401` and retries the request.
- Route guards (`RequireAuth`, `GuestOnly`) wait for `initialized`, so a refresh does not bounce a signed-in user to the login page.

## Design and accessibility

- Design tokens (colors, fonts) are defined once in `src/index.css` with Tailwind `@theme`.
- Visual language: lined notebook paper and a highlighter. Highlight yellow is the single accent, red and green are used only for meaning.
- Animations only play for meaningful moments and respect `prefers-reduced-motion`.
- Native `<dialog>` for the welcome carousel, labelled form fields, visible focus outlines, live regions for status messages, and text alternatives for charts and bars.

## Project structure

```
src/
  components/   Button, TextField, ScoreBar, FeedbackNotes, charts, AppShell ...
  pages/        Login, Register, Dashboard, Topics, Explain, Quiz, History, AdminTopics, NotFound
  router/       guards.tsx
  service/      api.ts and one file per API area
  store/        Redux store and auth slice
  hooks/        typed Redux hooks, useCountUp
  types/        shared TypeScript types
```

## Getting started

Requirements: Node.js 20 or newer and the API running (see the API repo).

```bash
git clone https://github.com/tesikaasemi2003/SimplyTutor-Frontend.git
cd SimplyTutor-Frontend
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, for example `http://localhost:5000/api/v1` |

Vite embeds `VITE_` variables into the built JavaScript, so never put secrets here. Changing it needs a rebuild or redeploy.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Type-check and production build |
| `npm run lint` | Lint the code |
| `npm run preview` | Preview the production build |

## Deployment

Deployed on **Vercel**. `vercel.json` rewrites every path to `index.html`, so reloading a client-side route such as `/dashboard` does not return a 404. Set `VITE_API_URL` in the Vercel project, and set the deployed frontend URL as `CORS_ORIGIN` on the API.