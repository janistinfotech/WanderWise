# 🧭 WanderWise — Smart Travel Planner and Itinerary Management System

[![CI/CD Pipeline](https://github.com/janistinfotech/WanderWise/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/janistinfotech/WanderWise/actions)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue.svg)](https://www.docker.com/)
[![Node](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Week 7 DevOps and Platform Integration Activity**  
> WanderWise is a complete, modern, containerized web application designed for comprehensive travel management: intelligent day-by-day itineraries, visual budget tracking, destination exploration, and secure multi-user data isolation.

---

## 🔗 Live Application & Repository Links
- **GitHub Repository**: `https://github.com/janistinfotech/WanderWise`
- **Live Deployed Web Application**: `https://wanderwise-app-asun.onrender.com`
- **DevOps Documentation**: See [DEVOPS_DOCUMENTATION.md](./DEVOPS_DOCUMENTATION.md) for step-by-step rubric evaluation and screenshot locations.

---

## 🌟 Key Application Features

### 1. 📊 Executive Dashboard
- **Trip Statistics**: Real-time KPI cards displaying Total Planned Trips, Upcoming Trips, Completed Trips, Total Estimated Budget, Total Spent, and Remaining Funds.
- **Upcoming Schedule**: Immediate chronological view of next scheduled activities across active itineraries.
- **Recent Plans**: Quick-access travel cards with status badges and budget indicators.

### 2. ✈️ Trip Management
- Create, view, edit, and delete travel itineraries.
- Enter destination, departure and return dates, notes, budget cap, and cover images (with built-in Philippine presets).
- Filter trips by status (**Upcoming**, **Ongoing**, **Completed**, **All Trips**) and instant keyword search.
- Safe deletion modals preventing accidental data loss.

### 3. 📅 Itinerary Builder
- Day-by-day schedule builder (Day 1, Day 2, Day 3, etc.).
- Add activities with time slot, title, location, category tags (Sightseeing, Food, Adventure, Leisure, Transport), estimated cost, and notes.
- Interactive completion checkboxes to check off completed tour activities on the go.

### 4. 💰 Travel Budget Planner
- Total trip budget allocation and real-time expense ledger.
- Categorized spending: Transportation, Accommodation, Food, Tours & Activities, Miscellaneous.
- **Interactive SVG Donut Chart** and category progress bars displaying budget consumption percentages.
- Alert badges warning when a trip exceeds the allocated budget limit.

### 5. 🏝️ Destination Explorer
- Curated Philippine travel spots featuring **Batangas**, **Baguio City**, **Palawan (El Nido & Coron)**, **Cebu & Moalboal**, **Bohol (Panglao & Chocolate Hills)**, **Siargao Island**, **Boracay**, and **Batanes**.
- Filter by region (MIMAROPA, Cordillera, CALABARZON, Visayas, Caraga) and search keyword.
- **Save to Favorites** toggle persisted per user account.
- **"Plan Trip Here" CTA**: 1-click modal pre-populating trip destination.

### 6. 🔐 User Accounts & Data Security
- Secure user registration and login with bcrypt password hashing and JSON Web Tokens (JWT).
- Strict multi-tenant data separation (users only access their own trips, itineraries, and expenses).
- Built-in **1-Click Demo Login** (`demo@wanderwise.com` / `password123`) for effortless evaluation.

### 7. ⚙️ Settings & System Information
- Profile customization: Full Name, Travel Style, Avatar URL, and Bio.
- Currency switcher (**PHP ₱**, **USD $**, **EUR €**, **SGD S$**, **JPY ¥**).
- DevOps specification display showing application version **v1.1.0**, Docker status, and CI/CD parameters.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 with Vite | High-performance SPA with fast HMR |
| **Styling** | Tailwind CSS & Lucide Icons | Responsive, elegant modern travel UI |
| **Backend** | Node.js with Express | RESTful API with modular controllers and middleware |
| **Database** | PostgreSQL 16 (w/ SQLite fallback) | ACID-compliant relational storage with auto-migrations |
| **Authentication** | JWT & bcryptjs | Stateless, secure user session management |
| **Containerization**| Docker & Docker Compose | Multi-stage Dockerfiles and container orchestration |
| **CI/CD** | GitHub Actions | Automated Linting, Unit Testing, Docker build & Deploy |
| **Hosting** | Render / Docker platform | Automated zero-downtime deployment |

---

## 📁 Project Folder Structure

```text
WanderWise/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD Pipeline
├── client/                       # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── components/           # UI Modals, Navbar, Sidebar, Charts, Cards
│   │   ├── context/              # AuthContext & AppContext
│   │   ├── pages/                # Dashboard, Trips, Itinerary, Budget, etc.
│   │   ├── services/             # API Axios/Fetch client
│   │   ├── tests/                # Frontend Vitest unit tests
│   │   ├── App.jsx
│   │   ├── index.css             # Tailwind base & custom animations
│   │   └── main.jsx
│   ├── Dockerfile                # Multi-stage Nginx production container
│   ├── nginx.conf                # Nginx SPA router configuration
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                       # Backend Express API
│   ├── src/
│   │   ├── config/               # Database adapter (PostgreSQL + SQLite fallback)
│   │   ├── controllers/          # Business logic (Auth, Trips, Itinerary, Budget)
│   │   ├── middleware/           # JWT Auth & Error Handling
│   │   ├── models/               # schema.sql PostgreSQL DDL
│   │   ├── routes/               # Express REST routes
│   │   ├── seed/                 # Initial Philippine destinations & demo data
│   │   ├── tests/                # Automated Node test runner suite
│   │   └── index.js              # Server entrypoint
│   ├── Dockerfile                # Production Node.js Alpine container
│   └── package.json
├── docker-compose.yml            # Local multi-container orchestration (DB, API, Web)
├── Dockerfile                    # Fullstack unified container for Render/Cloud
├── render.yaml                   # Infrastructure-as-Code for Render Blueprint
├── README.md                     # Project overview and setup instructions
├── DEVOPS_DOCUMENTATION.md       # Week 7 Activity Evaluation & Screenshot Guide
└── package.json                  # Root orchestration script
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v22 or higher (required for the built-in SQLite fallback)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/) *(optional for direct local node run, required for container run)*

---

### Option A: Local Development (Fastest, Zero-Config)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/janistinfotech/WanderWise.git
   cd WanderWise
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Run automated tests and linting:**
   ```bash
   npm test
   npm run lint
   ```

4. **Start backend and frontend concurrently:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Client Web App: `http://localhost:5173`
   - Backend API Health: `http://localhost:5000/api/health`
   - Default Demo Login: `demo@wanderwise.com` / `password123` (or click **1-Click Live Demo**)

> **Note on Database**: WanderWise includes an intelligent database adapter in `server/src/config/db.js`. If a PostgreSQL database is available via `DATABASE_URL`, it uses PostgreSQL; if running offline without Docker, it seamlessly uses Node's built-in SQLite engine with zero configuration required!

---

### Option B: Local Docker Compose (Full PostgreSQL Stack)

Run the full production-mirrored multi-container stack (PostgreSQL + Express + Nginx):

1. **Start all services with Docker Compose:**
   ```bash
   docker compose up --build
   ```

2. **Access services:**
   - Web Application: `http://localhost` (Port 80 via Nginx)
   - Backend API: `http://localhost:5000`
   - PostgreSQL Database: `localhost:5432`

3. **Stop containers:**
   ```bash
   docker compose down -v
   ```

---

## 🐳 Docker Production Build (Single Container)

To test the unified production container (used for Render deployment):

```bash
# Build image
docker build -t wanderwise:v1.0.0 .

# Run container
docker run -p 5000:5000 -e PORT=5000 -e JWT_SECRET=mysecretkey wanderwise:v1.0.0

# Verify
curl http://localhost:5000/api/health
```

---

## 🔄 Automated CI/CD Pipeline (GitHub Actions)

The repository includes a production GitHub Actions workflow defined in `.github/workflows/ci-cd.yml`.

### Pipeline Stages
1. **Lint & Automated Tests**:
   - Checks out code on Ubuntu.
   - Installs client and server dependencies cleanly (`npm ci`).
   - Runs ESLint validation.
   - Runs backend automated tests (`node --test`).
   - Runs frontend unit tests (`vitest run`).
   - Compiles Vite production bundle.
2. **Containerization Check**:
   - Builds the unified Fullstack Docker container.
   - Builds the client and server microservice images.
   - Confirms zero build errors and container viability.
3. **Automated Deployment**:
   - Runs only on pushes to the `main` branch after all previous checks succeed.
   - Triggers zero-downtime hosting deployment (e.g. Render deploy webhook).

---

## ☁️ Deployment Instructions (Render)

### Step 1: Deploy with Blueprint (`render.yaml`)
1. Create a free account on [Render.com](https://render.com).
2. Go to **Blueprints** -> **New Blueprint Instance**.
3. Connect your GitHub repository `WanderWise`.
4. Render will read `render.yaml` and automatically provision:
   - A managed PostgreSQL database (`wanderwise-db`).
   - A Docker web service (`wanderwise-app`) linked to the database.
5. Click **Apply**. Render will build and deploy the app!

### Step 2: Configure Automated CI/CD Deployment Hook
1. In your Render Dashboard, go to your `wanderwise-app` Web Service.
2. Scroll to **Deploy Hook** and copy the URL (e.g., `https://api.render.com/deploy/srv-xxxx?key=yyyy`).
3. In your GitHub repository:
   - Navigate to **Settings** -> **Secrets and variables** -> **Actions**.
   - Click **New repository secret**.
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: *(Paste your copied Deploy Hook URL)*
4. Every push to `main` will now automatically test, build, and deploy your live app!

---

## 🔄 Demonstrating Continuous Deployment (v1.0.0 -> v1.1.0)

Per evaluation requirements, WanderWise is structured for an immediate demonstration of Continuous Deployment:

1. **Verify Baseline (v1.0.0)**:
   - Check the version badge in the sidebar footer and Settings page (`v1.0.0`).
2. **Introduce a Visible Update (v1.1.0)**:
   - Update `version` in `package.json`, `client/package.json`, and `server/package.json` to `1.1.0`.
   - Update the badge in `client/src/components/Sidebar.jsx` and `client/src/pages/SettingsPage.jsx`.
3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat(release): upgrade to v1.1.0 with enhanced UI"
   git push origin main
   ```
4. **Inspect Pipeline**:
   - Watch GitHub Actions execute the CI/CD pipeline and trigger the live deployment automatically!

---

## ❓ Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| `Port 5000 in use` | Another process is using port 5000 | Kill existing process or set `PORT=5001` in `.env` |
| `PostgreSQL connection refused` | Local Postgres is not running | App automatically falls back to local SQLite in development mode |
| `Docker command not found` | Docker Desktop is not installed or running | Install Docker Desktop or run via standard Node mode (`npm run dev`) |
| `GitHub Actions Deploy skipped` | `RENDER_DEPLOY_HOOK_URL` secret missing | Add secret under Repo Settings -> Secrets & Variables -> Actions |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
