# AcadBuddy Backend

The backend is a RESTful API server that powers the AcadBuddy educational platform. It manages authentication, AI-driven content generation, file and media management, community features, and the core business logic of the application.

---

## Technical Architecture

| Component | Technology |
| --- | --- |
| **Runtime Environment** | Node.js (v18+) |
| **Web Framework** | Express.js (v5.2+) |
| **Database** | MongoDB via Mongoose (v9.4+) |
| **AI Orchestration** | OpenRouter SDK, Google Generative AI |
| **Asset Storage** | Cloudinary |
| **File Handling** | Multer, Sharp (Image Optimization), PDF-Parse |
| **Authentication** | JWT (Access & Refresh Tokens), bcryptjs |
| **Security & Rate Limiting** | helmet, cors, express-rate-limit |
| **Process Manager** | Nodemon (Development) |

---

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── cloudinaryConfig.js    # Multer and Sharp setup, MIME whitelist
│   │   └── db.js                  # MongoDB connection management
│   ├── controllers/
│   │   ├── authController.js      # Authentication flow (Register, Login, Refresh)
│   │   ├── cloudinary.js          # File operations (upload, compress, delete)
│   │   ├── communityController.js # Social interactions (Posts, Comments, Votes)
│   │   ├── contentController.js   # AI generation algorithms (Notes, Reports, PPTs)
│   │   ├── contextController.js   # Document ingestion and context management
│   │   ├── examController.js      # Planners, mock papers, and blueprints
│   │   ├── quizController.js      # Quiz creation, execution, and analytics
│   │   ├── sessionController.js   # Active study session tracking
│   │   ├── styleController.js     # Presentation styles management
│   │   ├── subjectController.js   # Subject CRUD operations
│   │   └── userController.js      # Profile and progress endpoints
│   ├── middleware/
│   │   └── auth.js                # Token validation and security checks
│   ├── models/                    # Data layer: Mongoose schemas
│   ├── routes/                    # API endpoints routing definitions
│   ├── services/
│   │   └── aiOrchestrator.js      # Integration with OpenRouter and LLM APIs
│   ├── utils/                     # Shared system and domain utilities
│   └── server.js                  # Application entry point and bootstrapping
├── .env                           # Environment configurations (excluded from source control)
├── .env.sample                    # Template for required environment variables
└── package.json                   # Project metadata and dependencies
```

---

## Getting Started

### Prerequisites

Ensure the following dependencies are installed or configured:
- Node.js (v18 or higher)
- Active MongoDB deployment (local or Atlas cluster)
- Cloudinary project account
- OpenRouter API credentials

### Installation

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### Environment Configuration

Use the provided sample to establish environment variables:

```bash
cp .env.sample .env
```

| Environment Variable       | Purpose                                                    | Status             |
| -------------------------- | ---------------------------------------------------------- | ------------------ |
| `PORT`                     | Designated port for server binding                         | Optional (Default: 8000) |
| `NODE_ENV`                 | Execution environment (`development` or `production`)      | Required           |
| `MONGO_URI`                | Connection string for MongoDB database                     | Required           |
| `JWT_SECRET`               | Cryptographic key for signing access tokens                | Required           |
| `JWT_REFRESH_SECRET`       | Cryptographic key for signing refresh tokens               | Required           |
| `JWT_ACCESS_EXPIRES_IN`    | Access token validity period (e.g., `15m`)                 | Optional (Default: 15m)  |
| `JWT_REFRESH_EXPIRES_IN`   | Refresh token validity period (e.g., `7d`)                 | Optional (Default: 7d)   |
| `OPENROUTER_API_KEY`       | Implementation key for AI service orchestration            | Required           |
| `OPENROUTER_MODEL`         | Targeted AI model identifier (e.g., `google/gemini-3-flash-preview`) | Required           |
| `CLOUDINARY_CLOUD_NAME`    | Allocated Cloudinary instance name                         | Required           |
| `CLOUDINARY_API_KEY`       | Cloudinary service access key                              | Required           |
| `CLOUDINARY_API_SECRET`    | Cloudinary service secure secret                           | Required           |
| `BACKEND_URL`              | Public domain of the deployed server                       | Required           |
| `FRONTEND_URL`             | Authorized CORS origin for client applications             | Required           |

### Execution

To start the server locally:

```bash
# Development usage with live reloading via Nodemon
npm run dev

# Standard production execution
npm start
```

Upon successful start, the application binds to the defined port (e.g., `http://localhost:7000`).

---

## API Reference

API endpoints are accessible under the `/api` prefix. Authenticated routes require a standard Bearer token supplied in the `Authorization` header.

### Authentication (`/api/auth`)

| Method | Endpoint    | Authorization | Function |
| ------ | ----------- | ------------- | -------- |
| POST   | `/register` | Public        | Registers a new user entity |
| POST   | `/login`    | Public        | Authenticates user, returning access and refresh tokens |
| POST   | `/refresh`  | Refresh Token | Replaces an expired access token using a valid refresh token |
| GET    | `/me`       | Required      | Retrieves the current authenticated user's metadata |

### Users (`/api/users`)

| Method | Endpoint          | Authorization | Function |
| ------ | ----------------- | ------------- | -------- |
| GET    | `/profile`        | Required      | Retrieves the authenticated profile data |
| PUT    | `/profile`        | Required      | Modifies the authenticated profile data |
| GET    | `/progress`       | Required      | Retrieves aggregated user learning statistics |
| GET    | `/recent-content` | Required      | Lists historically accessed platform content |

### Subjects (`/api/subjects`)

| Method | Endpoint | Authorization | Function |
| ------ | -------- | ------------- | -------- |
| GET    | `/`      | Required      | Lists all academic subjects for the user |
| GET    | `/:id`   | Required      | Retrieves full details for a specified subject |
| POST   | `/`      | Required      | Provisions a new academic subject |
| PUT    | `/:id`   | Required      | Updates subject metadata |
| DELETE | `/:id`   | Required      | Archives/Removes a subject instance |

### Content Engine (`/api/content`)

| Method | Endpoint      | Authorization | Function |
| ------ | ------------- | ------------- | -------- |
| GET    | `/:subjectId` | Required      | Retrieves generated content for a subject |
| GET    | `/item/:id`   | Required      | Accesses specific AI-generated content details |
| POST   | `/notes`      | Required      | Prompts AI for comprehensive study notes |
| POST   | `/report`     | Required      | Prompts AI for an academic report artifact |
| POST   | `/ppt`        | Required      | Prompts AI for presentation slides logic |
| PUT    | `/:id`        | Required      | Updates content parameters |
| DELETE | `/:id`        | Required      | Discards a specified content item |

### Document Context Ingestion (`/api/context`)

| Method | Endpoint             | Authorization | Function |
| ------ | -------------------- | ------------- | -------- |
| GET    | `/:subjectId`        | Required      | Retrieves active reference documents for the subject |
| GET    | `/:subjectId/search` | Required      | Queries indexed document contexts |
| POST   | `/`                  | Required      | Ingests a new document as an AI reference (Multipart) |
| PUT    | `/:id`               | Required      | Modifies context metadata |
| DELETE | `/:id`               | Required      | Removes context indexing |

### Diagnostics and Exams (`/api/exam`)

| Method | Endpoint            | Authorization | Function |
| ------ | ------------------- | ------------- | -------- |
| POST   | `/blueprint`        | Required      | Generates an automated examination blueprint |
| POST   | `/planner`          | Required      | Organizes dynamic revision schedules |
| POST   | `/rapid-sheets`     | Required      | Outputs highly summarized revision references |
| POST   | `/mock-paper`       | Required      | Autogenerates a standard mock paper |
| GET    | `/plans/:subjectId` | Required      | Fetches stored examination plans for a subject |

### Assessment (`/api/quiz`)

| Method | Endpoint                | Authorization | Function |
| ------ | ----------------------- | ------------- | -------- |
| GET    | `/:subjectId`           | Required      | Lists available subject quizzes |
| POST   | `/`                     | Required      | Automates Quiz generation operations |
| POST   | `/attempt`              | Required      | Submits an interactive quiz payload |
| GET    | `/analytics/:subjectId` | Required      | Evaluates scoring and behavioral analytics |

### Session Tracking (`/api/sessions`)

| Method | Endpoint   | Authorization | Function |
| ------ | ---------- | ------------- | -------- |
| GET    | `/`        | Required      | Aggregates all user learning sessions |
| POST   | `/start`   | Required      | Initializes the timer for a new study session |
| PUT    | `/:id/end` | Required      | Commits an active study session |

### Visual Layout Engine (`/api/styles`)

| Method | Endpoint        | Authorization | Function |
| ------ | --------------- | ------------- | -------- |
| GET    | `/`             | Required      | Retrieves user-defined application styles |
| GET    | `/defaults`     | Required      | Fetches platform default style standards |
| POST   | `/`             | Required      | Generates a custom visual presentation framework |
| PUT    | `/:id`          | Required      | Updates custom styling templates |
| DELETE | `/:id`          | Required      | Removes a styling template |
| PUT    | `/:id/activate` | Required      | Applies a specific theme to a user profile |

### Community Interactions (`/api/community`)

| Method | Endpoint              | Authorization | Function |
| ------ | --------------------- | ------------- | -------- |
| GET    | `/posts`              | Public        | Aggregates trending and broad community outputs |
| GET    | `/posts/:id`          | Public        | Retrieves individual community discussion payloads |
| POST   | `/posts`              | Required      | Constructs a formalized community post (Multipart) |
| POST   | `/posts/:id/vote`     | Required      | Commits an Upvote/Downvote metric to a discussion |
| POST   | `/posts/:id/comment`  | Required      | Submits a discussion comment |
| GET    | `/posts/:id/comments` | Public        | Navigates post commentary |
| POST   | `/posts/:id/clone`    | Required      | Duplicates an artifact into personal subjects |
| POST   | `/posts/:id/report`   | Required      | Elevates moderation requests |
| DELETE | `/posts/:id`          | Required      | Deletes user-owned discussions |

### Media Handlers (`/api/cloudinary`)

| Method | Endpoint             | Authorization | Function |
| ------ | -------------------- | ------------- | -------- |
| GET    | `/config`            | Public        | Verifies downstream Cloudinary configurations |
| POST   | `/upload`            | Required      | Handles a standard singular file upload |
| POST   | `/upload-multiple`   | Required      | Processes batch uploads (Maximum 10 concurrent items) |
| DELETE | `/delete/:public_id` | Required      | Wipes media by specific Cloudinary identifier |

### Core System

| Method | Endpoint           | Authorization | Function |
| ------ | ------------------ | ------------- | -------- |
| GET    | `/`                | Public        | Returns standard API version indexing |
| GET    | `/api/health`      | Public        | Executes deep environment health checking |
| GET    | `/ping`            | Public        | Submits standard Keep-Alive packet |
| GET    | `/api/test-ai-key` | Public        | Executes OpenRouter validation diagnosis |

---

## Technical Constraints

### Media Upload Policies

Files are strictly cross-referenced against a MIME type whitelist layer before proceeding to control structures. Invalid artifacts return an immediate `400 Bad Request` condition.

| Media Category | Valid Extension Formats                | Constraint |
| -------------- | -------------------------------------- | ---------- |
| Image Data     | `.jpg`, `.png`, `.gif`, `.webp`, `.svg`| 5 MB       |
| PDF Documents  | `.pdf`                                 | 20 MB      |
| Video Media    | `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`| 100 MB     |
| Audio Data     | `.mp3`, `.wav`, `.ogg`, `.aac`, `.flac`| 25 MB      |
| Text/Data Files| `.docx`, `.pptx`, `.xlsx`, `.txt`, `.csv`| 10 MB      |

### Content Optimization Process

All standard image uploads undergo server-side optimization processes mapping through the Sharp framework prior to external Cloudinary storage:

- **Format Control**: Actively transcoded to WebP matrices at 82% resolution parameters.
- **Dimensional Limitations**: Anchored at a 2048x2048 pixel aspect constraint; no upscaling processes allowed.
- **Resource Efficiency**: Averages 40-60% payload reductions while preventing degradation of visible render quality.

Cloudinary integrates adaptive mechanisms using `quality: auto` and `fetch_format: auto`, allowing fluid resolution deliveries per standard client architectures.

---

## Security Framework

### Access Model

The API employs strict dual-token persistence models:

1. **Access Token Generation**: High security (15-minute standard expiration). Passed via standard `Authorization: Bearer <token>` implementations.
2. **Refresh Token Validation**: Persistent memory (7-day standard cycle). Restricted natively to the `POST /api/auth/refresh` validation endpoints to securely produce valid Access layers.

### Data Flood Protection

Service endpoints operate under strict threshold limits; allowing a maximum of **70 operations per client minute** based on valid IP origins. Service abuses return standard `429 Too Many Requests` responses.

---

## Error Reporting Operations

Rejected actions or execution flaws fall back to a consistent framework representation:

```json
{
  "error": "Short, explicit error definition",
  "message": "Human-readable diagnostic output"
}
```

Limit breaches natively output equivalent payloads specifying precise constraint failures matching `400` or `413` system codes.

---

## Infrastructure Deployment Configurations

Designed for straightforward deployments aligning with platform structures like Render, note the following conditions:

- Initialize `NODE_ENV=production` within target bounds to enforce production logging parameters.
- Bind `FRONTEND_URL` endpoints carefully allowing active CORS origins matching frontend deployment standards (Vercel targets auto-permitted).
- Active sleep-prevention behaviors employ periodic platform pings utilizing the set `BACKEND_URL` reference variable ensuring maximum runtime bounds across constrained infrastructure environments.