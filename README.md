# NyayaAI

NyayaAI is a full-stack legal case analysis and case-management platform built with the MERN stack. It helps legal teams organize cases, process case documents, review evidence, search statutes and similar cases, and use AI-assisted analysis to support research and preparation.

> **Important:** NyayaAI is an assistive research tool. Its summaries, predictions, classifications, and bail assessments must be reviewed by a qualified legal professional and must not be treated as legal advice or an automated judicial decision.

## Features

### Case management

- Create, update, list, and delete legal cases.
- Track case numbers, case types, statuses, courts, parties, summaries, key laws, and outcomes.
- View a case workspace containing documents, evidence, analysis, predictions, similar cases, and activity history.
- Export case information as a PDF report.

### Document and evidence management

- Upload case files, FIRs, evidence, witness statements, legal arguments, court records, and other supported documents.
- Process PDF, DOC/DOCX, TXT, and common image formats.
- Extract text from PDFs and documents.
- Use OCR for image-based documents through Tesseract.js.
- Classify and organize evidence against a case.

### AI-assisted legal analysis

- Generate document summaries, key facts, named entities, and case timelines.
- Generate analysis and case predictions from available case material.
- Ask contextual questions through case chat.
- Generate bail assessments for eligible matters.
- Fall back to basic local extraction and summarization when an AI request is unavailable, where supported by the analysis service.

### Legal research tools

- Search and look up statutes and sections through the statute concordance interface.
- Search for similar cases using legal-term and keyword matching.
- Use OpenAI embeddings when configured, with a text-based similarity fallback.

### Security and administration

- JWT-based authentication.
- Protected routes and role-based authorization for administrative and judicial workflows.
- Password hashing with bcrypt.
- Request validation with Joi.
- Audit logging for important case, document, analysis, prediction, statute, bail, and export actions.
- HTTP security headers, CORS configuration, request logging, and API rate limiting.

## Technology stack

### Frontend

- React 18
- Vite
- React Router
- Axios
- Lucide React and Heroicons
- Framer Motion
- Custom CSS with responsive layouts

### Backend

- Node.js with ES modules
- Express.js
- Mongoose
- JWT and bcryptjs
- Joi validation
- Multer file uploads
- PDFParse, Mammoth, and Tesseract.js for document processing
- PDFKit for PDF report generation
- OpenAI API for analysis and embeddings
- Winston and Morgan for logging

### Infrastructure

- MongoDB
- Nginx and PM2 can be used for production deployment
- Docker Compose configuration is included for MongoDB, the backend, and the frontend

## Project structure

```text
nyaya-ai/
├── client/                 # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── api/             # Axios API modules
│       ├── components/      # Shared UI and layout components
│       ├── context/         # Authentication context
│       ├── hooks/           # Reusable React hooks
│       └── pages/           # Application pages
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/          # Environment and database setup
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, uploads, validation, and errors
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # REST API routes
│   │   ├── services/        # Analysis, document, AI, audit, and search logic
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- Node.js 18 or later
- npm
- MongoDB 7 or a compatible MongoDB deployment
- An OpenAI API key for AI-powered analysis and embedding features
- Docker Desktop, if using Docker Compose

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/DilipBhandarich/NyayaAi.git
cd NyayaAi
```

### 2. Configure the backend

Create a `.env` file in the `server/` directory. You can start from the root `.env.example` file:

```bash
cp .env.example server/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example server/.env
```

At minimum, set a secure JWT secret and your OpenAI API key:

```env
MONGODB_URI=mongodb://localhost:27017/nyaya_ai
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
EMBEDDING_MODEL=text-embedding-3-small
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=50
```

The backend loads environment variables through `dotenv`. If `OPENAI_API_KEY` is not set, AI-backed operations may be unavailable, although local fallback processing is available for some analysis steps.

### 3. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 4. Start MongoDB

Start MongoDB locally and ensure it is available at `mongodb://localhost:27017`, or update `MONGODB_URI` to point to a MongoDB Atlas cluster or another deployment.

### 5. Start the backend

From `server/`:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

The backend listens on `http://localhost:5000` by default. Its health endpoint is:

```text
GET http://localhost:5000/health
```

### 6. Start the frontend

In a separate terminal, from `client/`:

```bash
npm run dev
```

The Vite development server is available at `http://localhost:5173`.

The frontend calls the API through `/api`. During local development, configure the Vite development server or access the frontend through the same origin strategy used by your environment so that `/api` requests reach the backend on port 5000.

## Available npm scripts

### Client

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production frontend bundle |
| `npm run preview` | Preview the production frontend build |

### Server

| Command | Description |
| --- | --- |
| `npm start` | Start the Express server |
| `npm run dev` | Start the server with Nodemon |

## Main application routes

The frontend currently includes pages for:

- `/login` - Sign in
- `/register` - Create an account
- `/dashboard` - Case and activity overview
- `/cases` - Case list
- `/cases/:id` - Case details and workspace
- `/cases/:id/chat` - Case-specific AI chat
- `/cases/:id/analysis` - Analysis and predictions
- `/statutes` - Statute search and lookup
- `/audit` - Audit log review for authorized users

## REST API overview

All API routes are mounted under `/api`.

| Area | Example endpoints | Purpose |
| --- | --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | Account and session management |
| Cases | `GET /api/cases`, `POST /api/cases`, `GET /api/cases/:id` | Case CRUD and case analysis triggers |
| Documents | `POST /api/cases/:id/documents`, `GET /api/cases/:id/documents` | Upload and manage case documents |
| Evidence | `GET /api/cases/:id/evidence`, `POST /api/cases/:id/evidence` | Record and review evidence |
| Chat | `GET /api/cases/:id/chat`, `POST /api/cases/:id/chat` | Case-context conversation |
| Predictions | `GET /api/cases/:id/predictions` | Retrieve generated predictions |
| Bail | `POST /api/cases/:id/bail-assessment`, `GET /api/cases/:id/bail-assessments` | Generate and retrieve bail assessments |
| Similar cases | `GET /api/cases/:id/similar` | Find related cases |
| Statutes | `GET /api/statutes`, `GET /api/statutes/lookup/:section` | Search and look up statutes |
| Dashboard | `GET /api/dashboard/stats` | Dashboard metrics |
| Audit | `GET /api/audit`, `GET /api/audit/case/:caseId` | Review recorded activity |

Protected endpoints require a bearer token:

```http
Authorization: Bearer <jwt-token>
```

## Document processing flow

1. An authenticated user creates or selects a case.
2. The user uploads a supported document from the case workspace.
3. The backend stores the file under the configured upload directory and creates a document record in MongoDB.
4. Text is extracted from the document. PDFs and office documents use text extraction; image files can use OCR.
5. Extracted text and metadata are made available to analysis, evidence, chat, and similarity-search services.
6. Analysis results are stored against the case and can be reviewed or exported.

Supported upload extensions include `.pdf`, `.docx`, `.doc`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.tiff`, and `.bmp`.

## Docker Compose

The repository includes services for MongoDB, the Express backend, and the production frontend:

```bash
docker compose up --build
```

The default Docker ports are:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

The Compose setup uses a MongoDB replica set configuration so it can support MongoDB features required by vector-search workflows. For local development, running MongoDB directly and the client/server with npm is usually simpler.

Stop the Compose services with:

```bash
docker compose down
```

Add `-v` only when you intentionally want to remove the Compose-managed database volume and its data.

## Production considerations

- Replace the default JWT secret with a long, randomly generated secret.
- Store API keys and database credentials in a secret manager or protected environment configuration.
- Use MongoDB Atlas or a secured MongoDB deployment rather than an unauthenticated local database.
- Serve the frontend and API over HTTPS.
- Restrict `CLIENT_URL` and CORS origins to trusted domains.
- Put the Node.js service behind Nginx and use PM2 or another process supervisor.
- Configure persistent storage and backups for uploaded documents.
- Review AI-generated output before using it in legal work.
- Configure log retention and protect audit logs from unauthorized modification.

## Troubleshooting

### Backend exits while connecting to MongoDB

Confirm that MongoDB is running and that `MONGODB_URI` points to the correct host, port, database, and credentials.

### Frontend cannot reach the API

Confirm that the backend is listening on port 5000, the frontend is running on port 5173, and the development proxy or reverse proxy maps `/api` to the backend.

### AI analysis does not run

Check `OPENAI_API_KEY`, `OPENAI_MODEL`, network access, and the backend logs. Some document-analysis operations can use local fallbacks, but AI-specific features require a configured provider.

### File uploads fail

Check the file extension, the `MAX_UPLOAD_SIZE_MB` value, and write permissions for `UPLOAD_DIR`.

## License

No license file is currently included. Add a license before distributing or accepting external contributions.

## Author

Developed by [Dileep Bhandari CH](https://github.com/DilipBhandarich).
