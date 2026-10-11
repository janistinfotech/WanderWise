# 🚀 WanderWise — DevOps & Platform Integration Activity Report
## Week 7 Laboratory Activity: Git, Docker, CI/CD Pipelines & Cloud Deployment

---

## 📌 Submission Information
- **Application Name**: WanderWise — Smart Travel Planner and Itinerary Management System
- **Activity**: Week 7 DevOps and Platform Integration
- **Student Name / Group**: *[Insert Your Name / Group Members Here]*
- **Course & Section**: *[Insert Course Code & Section Here]*
- **Date**: October 2026
- **Repository URL**: `https://github.com/janistinfotech/WanderWise`
- **Live Deployment URL**: `https://wanderwise-app-asun.onrender.com`

---

## 🗺️ 1. DevOps Architecture & Pipeline Workflow

```text
+-----------------------------------------------------------------------------------+
|                                DEVELOPER WORKSTATION                               |
|  - React + Vite SPA (Tailwind CSS, Lucide Icons, SVG Budget Analytics)             |
|  - Node.js + Express REST API (JWT Auth, PostgreSQL Adapter, Health Checks)       |
|  - Local Testing: node:test runner & Vitest unit tests                            |
+------------------------------------------+----------------------------------------+
                                           |
                                      (git push)
                                           v
+-----------------------------------------------------------------------------------+
|                            GITHUB REPOSITORY (main branch)                        |
|  - Branch Protection, Pull Requests, Secrets Management (RENDER_DEPLOY_HOOK_URL)   |
+------------------------------------------+----------------------------------------+
                                           |
                                (triggers workflow)
                                           v
+-----------------------------------------------------------------------------------+
|                        GITHUB ACTIONS CI/CD PIPELINE                              |
|                                                                                   |
|  [ Job 1: test-and-lint ]                                                         |
|    ├── Checkout Source Code                                                       |
|    ├── Setup Node.js 20                                                           |
|    ├── npm ci (Install Server & Client dependencies)                              |
|    ├── npm run lint (ESLint Code Quality Check)                                   |
|    ├── npm run test:server (Backend API Health & Auth Tests)                      |
|    ├── npm run test:client (Frontend Budget & Form Logic Tests)                   |
|    └── npm run client:build (Production Vite Bundle)                             |
|                                                                                   |
|  [ Job 2: docker-build ] (Requires Job 1 Pass)                                    |
|    ├── Setup Docker Buildx                                                        |
|    ├── Build Fullstack Unified Container (`wanderwise:v1.0.0`)                    |
|    └── Build Microservice Images (`wanderwise-server`, `wanderwise-client`)       |
|                                                                                   |
|  [ Job 3: deploy ] (Requires Job 1 & Job 2 Pass; main branch only)                |
|    └── Automated Zero-Downtime Deployment via Render Webhook                      |
+------------------------------------------+----------------------------------------+
                                           |
                                (automated webhook)
                                           v
+-----------------------------------------------------------------------------------+
|                           RENDER CLOUD PLATFORM                                   |
|  - Managed PostgreSQL 16 Service (Persistent Relational Storage)                  |
|  - Docker Web Service (Unified Express + Nginx/Vite Container)                    |
|  - Live Health Monitoring: /api/health                                            |
+-----------------------------------------------------------------------------------+
```

---

## 📸 2. Required Screenshots for Evaluation

> [!IMPORTANT]
> Take screenshots of each numbered step below and paste them into the designated sections.

---

### 📷 Screenshot 1: Git Repository & Initial Commit
*Evidence of local git repository initialization, clean commits, and branch configuration.*

```bash
# Command to show git status & log:
git status
git log --oneline -n 5
```

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|                   [ PASTE SCREENSHOT 1 HERE: GIT LOG & STATUS ]               |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 2: Local Application Execution
*Evidence of the live application running locally with data persistence.*

- **Dashboard**: `http://localhost:5173` showing metric cards, upcoming schedule, and recent trips.
- **Budget Planner**: Showing the SVG Donut chart, remaining budget calculation, and expense ledger.

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|             [ PASTE SCREENSHOT 2A: DASHBOARD VIEW (METRICS & TRIPS) ]          |
|                                                                               |
+-------------------------------------------------------------------------------+
|                                                                               |
|             [ PASTE SCREENSHOT 2B: BUDGET PLANNER & CHARTS VIEW ]             |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 3: Automated Unit Testing & Linting
*Evidence of backend tests (`node --test`), frontend tests (`vitest`), and code linting (`eslint`) passing cleanly.*

```bash
# Terminal command:
npm run lint
npm test
```

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|            [ PASTE SCREENSHOT 3: TERMINAL RUNNING LINT & TEST SUITES ]        |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 4: Docker Container Build
*Evidence of Docker building the production container image without errors.*

```bash
# Terminal command:
docker build -t wanderwise:v1.0.0 .
```

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|            [ PASTE SCREENSHOT 4: DOCKER BUILD TERMINAL OUTPUT ]               |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 5: Docker Compose Multi-Container Orchestration
*Evidence of the three services (`postgres`, `server`, and `client`) running concurrently in Docker Compose.*

```bash
# Terminal command:
docker compose up -d
docker compose ps
```

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|         [ PASTE SCREENSHOT 5: DOCKER COMPOSE PS (3 RUNNING CONTAINERS) ]       |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 6: GitHub Actions CI/CD Pipeline
*Evidence of GitHub Actions successfully executing all pipeline stages (Lint & Tests, Docker Build, Deploy).*

- Navigate to your repository on GitHub -> **Actions** tab -> Click the latest workflow run.

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|          [ PASTE SCREENSHOT 6: GITHUB ACTIONS WORKFLOW RUN (ALL GREEN) ]       |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 7: Live Cloud Deployment on Render
*Evidence of the live deployed web application accessible via HTTPS URL on Render.*

- View of the live URL in browser.
- Render Dashboard showing `Deployed` status and logs.

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|           [ PASTE SCREENSHOT 7A: RENDER CLOUD SERVICE DASHBOARD ]             |
|                                                                               |
+-------------------------------------------------------------------------------+
|                                                                               |
|           [ PASTE SCREENSHOT 7B: LIVE APPLICATION AT PUBLIC HTTPS URL ]       |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 📷 Screenshot 8: Continuous Deployment Demonstration (v1.0.0 -> v1.1.0)
*Evidence of a separate commit pushing version 1.1.0, triggering the automated CI/CD pipeline, and reflecting the update on the live site.*

```text
+-------------------------------------------------------------------------------+
|                                                                               |
|        [ PASTE SCREENSHOT 8A: GITHUB ACTIONS DEPLOY TRIGGERED FOR v1.1.0 ]     |
|                                                                               |
+-------------------------------------------------------------------------------+
|                                                                               |
|        [ PASTE SCREENSHOT 8B: LIVE APPLICATION DISPLAYING v1.1.0 BADGE ]      |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 🛠️ 3. Step-by-Step Reproduction Guide

### Phase 1: Local Setup & Testing
1. **Initialize Git and verify clean branch:**
   ```bash
   git status
   ```
2. **Run Lint and Automated Tests:**
   ```bash
   npm run lint
   npm test
   ```
3. **Run Application locally:**
   ```bash
   npm run dev
   ```

---

### Phase 2: Docker Containerization
1. **Build Single Production Container:**
   ```bash
   docker build -t wanderwise:v1.0.0 .
   ```
2. **Run Full Microservice Stack with PostgreSQL:**
   ```bash
   docker compose up -d --build
   docker compose ps
   ```
3. **Verify API Healthcheck:**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

### Phase 3: GitHub Repository & Actions Setup
1. **Create a new GitHub repository** named `WanderWise`.
2. **Push local commits to GitHub:**
   ```bash
   git remote add origin https://github.com/janistinfotech/WanderWise.git
   git branch -M main
   git push -u origin main
   ```
3. **Inspect Actions Tab**:
   Verify that `.github/workflows/ci-cd.yml` automatically executes the **test-and-lint** and **docker-build** jobs!

---

### Phase 4: Render Deployment & Webhook Linking
1. Go to [Render.com](https://render.com) and create a **New Blueprint Instance**.
2. Connect the `WanderWise` repository. Render automatically reads `render.yaml`.
3. Render creates both the **PostgreSQL database** and the **Docker Web Service**.
4. Once deployed, copy the **Deploy Hook URL** from the Web Service settings.
5. In GitHub -> **Settings** -> **Secrets and variables** -> **Actions**:
   - Add Secret `RENDER_DEPLOY_HOOK_URL` with your Render hook URL.
6. Now, any future push to `main` will automatically trigger zero-downtime deployment!

---

### Phase 5: Continuous Deployment Demo (v1.0.0 -> v1.1.0)
To complete the demonstration for your professor:

1. Edit `package.json`, `client/package.json`, and `server/package.json` to change `"version": "1.1.0"`.
2. In `client/src/components/Sidebar.jsx` and `client/src/pages/SettingsPage.jsx`, update the badge text to `v1.1.0`.
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat(release): upgrade to version 1.1.0 with enhanced UI"
   git push origin main
   ```
4. Check GitHub Actions: watch the automated pipeline test, build, and trigger the live Render deploy!
5. Open your live Render URL to verify `v1.1.0` is immediately displayed on the live app!

---

## 📊 4. DevOps Principles Evaluated

1. **Infrastructure as Code (IaC)**:
   - Defined via `docker-compose.yml` and `render.yaml` ensuring repeatable, environment-agnostic infrastructure.
2. **Continuous Integration (CI)**:
   - Automated linting with ESLint and automated test suites (`node:test` and `vitest`) gatekeeping every push and pull request.
3. **Containerization & Reproducibility**:
   - Multi-stage Docker builds separate build tooling from minimal production runtimes, reducing container attack surface and image size.
4. **Configuration & Secrets Management**:
   - Application conforms to Twelve-Factor App methodology using environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`) and GitHub Secrets.
5. **Observability & Health Checks**:
   - Real-time `/api/health` endpoint reporting uptime, status, version, and database driver for container orchestrators.
