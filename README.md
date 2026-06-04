# ⚡ TaskFlow — Cloud-Based MERN Application

> **Cloud-Based MERN Application Deployment using Docker, MongoDB Atlas, and CI/CD**  
> A production-ready Task & Project Management System demonstrating Full Stack, DevOps, and Cloud Engineering practices.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [MongoDB Atlas Setup](#mongodb-atlas-setup)
6. [Running Locally (Without Docker)](#running-locally)
7. [Running with Docker](#running-with-docker)
8. [GitHub Actions CI/CD Setup](#github-actions-cicd)
9. [API Documentation](#api-documentation)
10. [Cloud Deployment Guides](#cloud-deployment-guides)
11. [Security Features](#security-features)
12. [Resume Talking Points](#resume-talking-points)

---

## Project Overview

**TaskFlow** is a full-stack web application for managing projects and tasks. It showcases:

- **MERN Stack**: MongoDB Atlas, Express.js, React.js, Node.js
- **Containerization**: Docker + Docker Compose (multi-stage builds)
- **CI/CD**: GitHub Actions with automated build, test, and Docker image push
- **Cloud Database**: MongoDB Atlas (free tier supported)
- **Security**: JWT authentication, bcrypt hashing, Helmet, rate limiting, CORS
- **Deployment Ready**: AWS EC2, Render, Railway, Azure App Service

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Context API |
| Backend | Node.js 20, Express 4, JWT, bcrypt, express-validator |
| Database | MongoDB Atlas (cloud) |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Security | Helmet, CORS, Rate Limiting, Input Validation |
| Logging | Morgan (HTTP), Console (structured emoji logs) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                  │
│   Push → Install → Build → Docker Build → GHCR Push    │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────▼──────────────────┐
          │         Docker Compose            │
          │  ┌─────────────┐  ┌────────────┐  │
          │  │  Frontend   │  │  Backend   │  │
          │  │ React/Nginx │  │  Node.js   │  │
          │  │  Port 3000  │  │  Port 5000 │  │
          │  └──────┬──────┘  └─────┬──────┘  │
          │         │   taskflow-   │          │
          │         └───network─────┘          │
          └─────────────────────────────────────┘
                           │
          ┌────────────────▼──────────────────┐
          │         MongoDB Atlas             │
          │    (Cloud - No local container)   │
          │  Collections: users/projects/tasks│
          └───────────────────────────────────┘
```

---

## Folder Structure

```
mern-devops/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions pipeline
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Profile
│   │   ├── projectController.js# Project CRUD
│   │   └── taskController.js   # Task CRUD + Stats
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   ├── errorHandler.js     # Global error handler
│   │   └── validate.js         # express-validator handler
│   ├── models/
│   │   ├── User.js             # User schema + bcrypt hooks
│   │   ├── Project.js          # Project schema
│   │   └── Task.js             # Task schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── app.js                  # Express app config
│   ├── server.js               # Entry point
│   ├── Dockerfile              # Multi-stage Docker build
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Alert.js    # Notification banners
│   │   │   │   └── Spinner.js  # Loading indicator
│   │   │   └── layout/
│   │   │       └── Navbar.js   # Navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state (Context API)
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── ProjectsPage.js
│   │   │   ├── TasksPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── NotFoundPage.js
│   │   ├── routes/
│   │   │   └── ProtectedRoute.js
│   │   ├── services/
│   │   │   ├── api.js          # Axios with interceptors
│   │   │   ├── projectService.js
│   │   │   └── taskService.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css           # Global dark theme styles
│   ├── Dockerfile              # Build React → Serve with Nginx
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## MongoDB Atlas Setup

### Step 1: Create Free Cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **"Try Free"** → Sign up / Log in
3. Choose **Free (M0)** tier → Select a cloud provider and region
4. Click **"Create Cluster"** (takes ~2 min)

### Step 2: Create Database User
1. Navigate to **Security → Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `taskflow_user` | Password: (generate a strong one)
5. Set privileges to **"Atlas Admin"** or **"Read and Write to any database"**
6. Click **"Add User"**

### Step 3: Allow Network Access
1. Navigate to **Security → Network Access**
2. Click **"Add IP Address"**
3. For development: **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add your server's specific IP address

### Step 4: Get Connection String
1. Go to **Deployment → Database**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js** | Version: **5.5 or later**
5. Copy the URI — it looks like:
   ```
   mongodb+srv://taskflow_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database user's password
7. Add your database name: `...mongodb.net/mern_taskmanager?retryWrites...`

### Step 5: Configure .env
```bash
# backend/.env
MONGODB_URI=mongodb+srv://taskflow_user:YourPassword@cluster0.xxxxx.mongodb.net/mern_taskmanager?retryWrites=true&w=majority
```

---

## Running Locally

### Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (free tier)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/mern-devops.git
cd mern-devops
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret
nano .env
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 4. Configure Frontend
```bash
cd frontend
cp .env.example .env
# .env already has REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

---

## Running with Docker

### Prerequisites
- Docker Engine >= 24
- Docker Compose >= 2

### 1. Configure Environment
```bash
# Copy and fill backend .env
cp backend/.env.example backend/.env
nano backend/.env
# Set MONGODB_URI, JWT_SECRET, and CORS_ORIGIN=http://localhost:3000
```

### 2. Build and Start Services
```bash
# Build images and start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### 4. Stop Services
```bash
docker-compose down        # Stop containers
docker-compose down -v     # Stop + remove volumes
```

### 5. Useful Docker Commands
```bash
# Check running containers
docker ps

# Inspect container
docker exec -it taskflow-backend sh

# Check image sizes
docker images | grep taskflow

# Remove all stopped containers
docker system prune -f
```

---

## GitHub Actions CI/CD

### Setup Steps

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial MERN DevOps project"
git remote add origin https://github.com/YOUR_USERNAME/mern-devops.git
git push -u origin main
```

#### 2. Add GitHub Secrets
Navigate to: **GitHub Repo → Settings → Secrets and Variables → Actions**

Add these secrets:
| Secret Name | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Your generated JWT secret |
| `REACT_APP_API_URL` | Your production backend URL |

#### 3. Workflow Triggers
The pipeline runs on:
- **Push to `main`**: Full pipeline including Docker build + push to GHCR
- **Push to `develop`**: CI validation only
- **Pull Request to `main`**: CI validation

#### 4. Pipeline Jobs
```
Push to main
    │
    ├── backend-ci     → Install deps → Run tests → Security audit
    │
    ├── frontend-ci    → Install deps → Build React → Check size
    │
    └── docker-build   → Build backend image → Build frontend image
            │           → Push to ghcr.io (main branch only)
            │
            └── deployment-summary → Print deployment log
```

#### 5. Pull Docker Images (after CI)
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull images
docker pull ghcr.io/YOUR_USERNAME/mern-devops/backend:latest
docker pull ghcr.io/YOUR_USERNAME/mern-devops/frontend:latest
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login user |
| GET | `/auth/profile` | ✅ | Get current profile |
| PUT | `/auth/profile` | ✅ | Update profile |
| PUT | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/logout` | ✅ | Logout |

**Register / Login Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

**Authorization Header** (for protected routes):
```
Authorization: Bearer <token>
```

### Project APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | Get all projects (with search/filter) |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get single project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project (cascades tasks) |

**Query Parameters (GET /projects):**
```
?search=design&status=active&priority=high&page=1&limit=20
```

### Task APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks (with filter) |
| GET | `/tasks/stats` | Get dashboard statistics |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

**Query Parameters (GET /tasks):**
```
?project=<projectId>&status=in-progress&priority=high&search=bug
```

**Dashboard Stats Response:**
```json
{
  "success": true,
  "stats": {
    "totalProjects": 5,
    "totalTasks": 23,
    "tasksByStatus": {
      "todo": 8,
      "in-progress": 6,
      "review": 3,
      "completed": 6
    }
  }
}
```

---

## Cloud Deployment Guides

### Option 1: AWS EC2

```bash
# 1. Launch Ubuntu 22.04 EC2 instance (t2.micro free tier)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# 4. Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# 5. Clone repository
git clone https://github.com/your-username/mern-devops.git
cd mern-devops

# 6. Create .env
nano backend/.env
# Add MONGODB_URI, JWT_SECRET, CORS_ORIGIN=http://your-ec2-ip:3000

# 7. Set frontend API URL
echo "REACT_APP_API_URL=http://your-ec2-ip:5000/api" > frontend/.env

# 8. Deploy
docker compose up -d --build

# 9. Open ports in EC2 Security Group:
#    - Port 3000 (Frontend)
#    - Port 5000 (Backend API)
```

### Option 2: Render (Free Tier)

**Backend (Web Service):**
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. Add environment variables in Render dashboard

**Frontend (Static Site):**
1. New → Static Site
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `build`
5. Add: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### Option 3: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Set environment variables
railway variables set MONGODB_URI="your-atlas-uri"
railway variables set JWT_SECRET="your-secret"

# Deploy frontend  
cd ../frontend
railway up
railway variables set REACT_APP_API_URL="https://your-backend.up.railway.app/api"
```

### Option 4: Azure App Service

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login

# Create resource group
az group create --name TaskFlowRG --location eastus

# Create App Service Plan
az appservice plan create --name TaskFlowPlan --resource-group TaskFlowRG --sku B1 --is-linux

# Deploy Backend
az webapp create --resource-group TaskFlowRG --plan TaskFlowPlan \
  --name taskflow-backend --runtime "NODE:20-lts"

az webapp config appsettings set --resource-group TaskFlowRG \
  --name taskflow-backend \
  --settings MONGODB_URI="your-uri" JWT_SECRET="your-secret" NODE_ENV="production"

# Deploy using Docker
az webapp config container set --resource-group TaskFlowRG \
  --name taskflow-backend \
  --docker-custom-image-name ghcr.io/your-username/mern-devops/backend:latest
```

---

## Security Features

| Feature | Implementation |
|---|---|
| Password Hashing | bcryptjs with salt rounds=12 |
| Authentication | JWT with 7-day expiry, stored in localStorage |
| Authorization | Middleware verifies token on every protected route |
| HTTP Security Headers | Helmet.js (CSP, XSS protection, etc.) |
| Rate Limiting | 100 requests per 15 min per IP |
| CORS | Configured to allow only specified frontend origin |
| Input Validation | express-validator on all POST/PUT routes |
| Payload Size Limit | 10kb max body size |
| MongoDB Safety | Mongoose schema validation prevents injection |
| Environment Secrets | All credentials in .env, never committed |
| Non-root Docker | Containers run as non-root `nodeuser` |
| Docker Health Checks | Automatic container restart on failure |

---

## Resume Talking Points

> Use these bullet points on your resume under the project:

**"Cloud-Based MERN Application Deployment using Docker, MongoDB Atlas, and CI/CD"**

- Built a full-stack Task Management System using **React.js, Node.js, Express.js, and MongoDB Atlas** with JWT-based authentication and role-based access control
- Containerized the application using **Docker multi-stage builds** (Node.js + Nginx) and orchestrated services with **Docker Compose** with health checks and custom networking
- Implemented a **GitHub Actions CI/CD pipeline** that automatically validates code, builds Docker images, and pushes to GitHub Container Registry (GHCR) on each push to `main`
- Secured REST APIs with **JWT authentication middleware, bcrypt password hashing, Helmet.js security headers, rate limiting, and CORS configuration**
- Designed and implemented **3 MongoDB schemas** (User, Project, Task) with proper indexing, virtuals, and Mongoose validation for data integrity
- Deployed the application on **AWS EC2 using Docker Compose**, with MongoDB Atlas as the cloud database, achieving zero-downtime deployments
- Followed **DevOps best practices**: environment variable management, structured logging, container health checks, and graceful shutdown handling
