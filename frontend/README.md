# Frontend

The frontend is a single-page application that provides the user interface for the Academic Help Buddy academic assistant platform. It enables students to manage subjects, generate AI-powered study content, prepare for exams, engage with a peer community, and track their learning progress.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router DOM v7 |
| State Management | Zustand |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Markdown Rendering | react-markdown |
| Icons | Lucide React / React Icons |
| Date Utilities | date-fns |

---

## Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── components/             # Shared, reusable UI components
│   ├── pages/
│   │   ├── Landing.jsx         # Public landing page
│   │   ├── Login.jsx           # Authentication page (login + register)
│   │   ├── Dashboard.jsx       # Main user dashboard with progress overview
│   │   ├── Subjects.jsx        # Subject listing and management
│   │   ├── SubjectWorkspace.jsx# Per-subject content workspace
│   │   ├── ContentView.jsx     # AI-generated content viewer and editor
│   │   ├── Styles.jsx          # Output style configuration
│   │   ├── Community.jsx       # Community post feed
│   │   ├── PostDetail.jsx      # Individual community post with comments
│   │   ├── FocusMode.jsx       # Distraction-free reading mode
│   │   └── Profile.jsx         # User profile and settings
│   ├── services/
│   │   └── api.js              # Axios instance with interceptors and token refresh
│   ├── store/
│   │   └── authStore.js        # Zustand store for authentication state
│   ├── App.jsx                 # Root component and route declarations
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── .env                        # Local environment variables (not committed)
├── .env.sample                 # Environment variable template
├── vite.config.js              # Vite build and dev server configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── vercel.json                 # Vercel deployment configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- The backend server running (see `/backend/README.md`)

### Installation

```bash
# From the project root
cd frontend
npm install
```

### Environment Configuration

Copy the sample file and fill in the backend URL:

```bash
cp .env.sample .env
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for all API requests | `http://localhost:7000/api` |

> In production, set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`) via your hosting platform's environment variable settings.

### Running the Development Server

```bash
npm run dev
```

The application opens at `http://localhost:3000`.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start the Vite dev server with hot module replacement |
| Build | `npm run build` | Compile and bundle for production |
| Preview | `npm run preview` | Serve the production build locally |
| Lint | `npm run lint` | Run ESLint across all source files |

---

## Application Pages

### Landing
Public-facing marketing page. Presents the platform's features and directs users to register or log in.

### Login / Register
Combined authentication page. Handles account creation and login. On successful login, access and refresh tokens are stored and the user is redirected to the Dashboard.

### Dashboard
The primary interface after login. Shows a summary of the user's subjects, recent activity, learning progress statistics, and quick-access shortcuts.

### Subjects
Displays all subjects created by the user. Allows creation, editing, and deletion of subjects. Each subject acts as a workspace container for content, context, quizzes, and exam tools.

### Subject Workspace
Per-subject view that aggregates all tools available for a given subject: content generation, context upload, quizzes, and exam preparation sections.

### Content View
Renders AI-generated content (notes, reports, presentation outlines) in a rich markdown viewer. Supports editing, exporting, and switching to Focus Mode.

### Styles
Allows users to configure and activate output styles that influence how the AI formats generated content (tone, structure, depth, etc.). System default styles are also available.

### Community
A shared feed of study posts from all users. Supports filtering, searching, upvoting, downvoting, and cloning posts directly into your own subjects.

### Post Detail
Full view of a community post including its content, vote count, and threaded comments. Authenticated users can comment, vote, clone, or report.

### Focus Mode
Distraction-free reading view for any content item. Strips navigation and UI chrome to maximise reading focus.

### Profile
User account settings including display name, avatar, and password management.

---

## State Management

Authentication state is managed globally via a **Zustand** store (`authStore.js`). It holds the current user object and exposes `login`, `logout`, and `register` actions. The store interacts with the Axios instance in `api.js`.

### Token Refresh Flow

The Axios response interceptor in `services/api.js` automatically handles expired access tokens:

1. A `401 Unauthorized` response is detected on any request.
2. The interceptor checks for a stored refresh token in `localStorage`.
3. If present, it makes a silent `POST /api/auth/refresh` call.
4. On success, the new access token is stored and the original request is retried transparently.
5. If the refresh also fails, both tokens are cleared and the user is redirected to `/login`.

---

## API Communication

All API calls go through the shared Axios instance in `src/services/api.js`, which:

- Sets the `Content-Type: application/json` header by default (automatically removed for `FormData` uploads, allowing the browser to set the correct multipart boundary).
- Attaches the `Authorization: Bearer <token>` header on every request if a token is in `localStorage`.
- Logs structured error objects to the console in development for easier debugging.
- Implements the automatic token refresh flow described above.

---

## Routing

Client-side routing is handled by **React Router DOM v7**. The `vercel.json` configuration rewrites all paths to `/index.html` to ensure deep links and page refreshes work correctly in production without returning 404 errors from the hosting server.

---

## Deployment

The frontend is designed for deployment on **Vercel**.

### Steps

1. Connect the repository to Vercel.
2. Set the root directory to `frontend`.
3. Add the environment variable `VITE_API_URL` with your production backend URL.
4. Deploy. Vercel will run `npm run build` and serve the `dist/` output.

The included `vercel.json` handles SPA routing rewrites and sets long-term cache headers for static assets automatically.
