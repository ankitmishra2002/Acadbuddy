# UniPrep Copilot — Frontend

React application (Vite + Tailwind) for UniPrep Copilot. Provides subject workspaces, AI content generation, exam mode, focus sessions, and community features.

## Tech Stack
- React 19, Vite 7
- React Router 7
- Tailwind CSS
- Zustand for state management
- Axios for API calls

## Quick Start
- Create `frontend/.env` from `.env.sample`
- Install and run:
```bash
cd frontend
npm install
npm run dev
```
- Dev servers:
  - Frontend: `http://localhost:3000`
  - Backend API: configure via `VITE_API_URL` (default `http://localhost:5000/api`)

## Environment Variables
- `VITE_API_URL` — base URL for backend API (e.g., `http://localhost:5000/api`)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview built assets
- `npm run lint` — lint `src` with ESLint

## App Structure
- `src/App.jsx` — root router + layout
- `src/components/*` — reusable UI
  - `common/PrivateRoute.jsx` — auth guard
  - `content/*` — generation UIs (notes/report/ppt)
  - `exam/*` — blueprint/planner/mock/rapid sheets
  - `layout/*` — header/sidebar/app shell
- `src/pages/*` — top-level pages
  - `Dashboard`, `Subjects`, `SubjectWorkspace`, `ContentView`
  - `Community`, `PostDetail`
  - `Styles`, `Profile`, `Login`, `Landing`, `FocusMode`
- `src/services/api.js` — Axios client with interceptors
- `src/store/authStore.js` — auth state

## Auth Flow
- On login, backend returns `accessToken` and `refreshToken`
- `accessToken` attached via `Authorization: Bearer <token>`
- Interceptor automatically refreshes when a 401 occurs:
  - `POST /auth/refresh` with `refreshToken`
  - Updates tokens in `localStorage`
  - Retries original request
- On refresh failure or 401:
  - Clears tokens and redirects to `/login`

## Styling
- Tailwind configuration in `tailwind.config.js`
- Global styles in `src/index.css`

## Routing
- React Router 7
- Protected routes use `PrivateRoute.jsx`
- Layout: `Header`, `Sidebar`, `Layout` components

## API Client
- Base URL: `import.meta.env.VITE_API_URL` (`src/services/api.js`)
- JSON requests, bearer token header via interceptor

## Development Tips
- Keep `VITE_API_URL` aligned with backend `PORT`
- Ensure CORS `CLIENT_URL` on backend includes your dev origin
- Use `npm run preview` to validate production build locally

## Deployment
- Build with `npm run build` and serve `dist/`
- Set `VITE_API_URL` to your deployed backend (e.g., `https://api.uniprep.example.com/api`)

