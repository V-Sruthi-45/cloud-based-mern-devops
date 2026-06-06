# 🚀 TaskFlow – Cloud-Based MERN Application with DevOps

A full-stack Task Management System built using the MERN Stack and deployed using modern DevOps practices including Docker, Jenkins, Kubernetes, Prometheus, and Grafana.

---

# 📌 Project Overview

TaskFlow is a cloud-based web application that allows users to manage projects and tasks efficiently. The application demonstrates end-to-end software development and deployment practices, from frontend and backend development to containerization, CI/CD automation, Kubernetes orchestration, and monitoring.

---

# 🎯 Objectives

* Build a full-stack task management application using the MERN stack.
* Implement secure authentication and authorization.
* Containerize the application using Docker.
* Automate build and deployment using Jenkins CI/CD.
* Deploy the application on Kubernetes using Minikube.
* Monitor system performance using Prometheus and Grafana.
* Use MongoDB Atlas as a cloud-hosted database.

---

# 🛠️ Technology Stack

## Frontend

* React.js
* React Router
* Axios
* Context API
* CSS

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt.js

## Database

* MongoDB Atlas

## DevOps & Cloud

* Docker
* Docker Compose
* Jenkins
* Kubernetes (Minikube)
* Helm
* Prometheus
* Grafana
* AWS EC2
* Git & GitHub

---

# 🏗️ System Architecture

User
↓
React Frontend
↓
Express Backend API
↓
MongoDB Atlas

Containerization Layer:
Docker → Docker Compose

CI/CD Layer:
GitHub → Jenkins Pipeline

Orchestration Layer:
Kubernetes (Minikube)

Monitoring Layer:
Prometheus → Grafana

Infrastructure:
AWS EC2

---

# ✨ Features

## User Features

* User Registration
* User Login
* JWT Authentication
* Profile Management

## Project Management

* Create Projects
* View Projects
* Update Projects
* Delete Projects

## Task Management

* Create Tasks
* Assign Tasks
* Update Task Status
* Delete Tasks
* Task Statistics Dashboard

## Security Features

* Password Hashing using bcrypt
* JWT Authentication
* Input Validation
* CORS Protection
* Environment Variables
* Protected Routes

---

# 🐳 Docker Implementation

## Backend Container

* Node.js Runtime
* Express Server
* API Services

## Frontend Container

* React Build
* Nginx Web Server

## Docker Commands

```bash
docker-compose up -d --build
docker ps
docker-compose logs
docker-compose down
```

---

# ⚙️ Jenkins CI/CD Pipeline

The Jenkins pipeline automates the software delivery process.

## Pipeline Stages

1. Clone Repository
2. Verify Repository
3. Build Application
4. Docker Image Build
5. Kubernetes Deployment
6. Monitoring Verification

## Jenkins Benefits

* Automated Builds
* Faster Deployment
* Reduced Manual Errors
* Continuous Integration

---

# ☸️ Kubernetes Deployment

The application is deployed on Kubernetes using Minikube.

## Namespace

mern-devops

## Deployments

### Backend Deployment

* 2 Replicas
* Port 5000
* MongoDB Atlas Integration

### Frontend Deployment

* 2 Replicas
* Port 80

## Services

### Backend Service

* Type: ClusterIP

### Frontend Service

* Type: LoadBalancer / NodePort

## Deployment Commands

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## Verification

```bash
kubectl get pods -n mern-devops
kubectl get svc -n mern-devops
```

---

# 📊 Monitoring with Prometheus

Prometheus collects metrics from the Kubernetes cluster.

## Metrics Monitored

* CPU Usage
* Memory Usage
* Network Traffic
* Pod Metrics
* Node Metrics
* Kubernetes Resource Utilization

## Installation

```bash
helm install prometheus prometheus-community/prometheus \
-n monitoring
```

---

# 📈 Grafana Dashboard

Grafana is integrated with Prometheus for visualization.

## Dashboard Imported

Node Exporter Full

Dashboard ID: 1860

## Metrics Visualized

* CPU Utilization
* Memory Utilization
* System Load
* Network Traffic
* Disk Usage
* Node Health

## Grafana Features

* Real-time Monitoring
* Interactive Dashboards
* Historical Metrics
* Resource Usage Analysis

---

# ☁️ AWS EC2 Deployment

Infrastructure hosted on AWS EC2.

## EC2 Configuration

* Ubuntu Server
* 2 vCPU
* 2 GB RAM
* Docker Installed
* Jenkins Installed
* Kubernetes (Minikube) Installed

## Services Running

* MERN Application
* Jenkins
* Prometheus
* Grafana
* Kubernetes Cluster

---

# 📁 Project Structure

```text
mern-devops/
│
├── backend/
├── frontend/
├── k8s/
├── .github/
├── Jenkinsfile
├── docker-compose.yml
├── README.md
│
└── monitoring/
```

---

# 📚 Learning Outcomes

Through this project I gained hands-on experience in:

* MERN Stack Development
* REST API Development
* MongoDB Atlas Integration
* Docker Containerization
* Jenkins CI/CD Automation
* Kubernetes Deployment
* AWS EC2 Administration
* Prometheus Monitoring
* Grafana Dashboard Creation
* DevOps Best Practices

---

# 📌 Future Enhancements

* HTTPS using Nginx Reverse Proxy
* Kubernetes Ingress Controller
* Automated Kubernetes Deployment via Jenkins
* AlertManager Integration
* Email Notifications
* Horizontal Pod Autoscaling (HPA)

---

# 👩‍💻 Developer

Sruthi V

Cloud-Based MERN Application Deployment using Docker, Kubernetes, Jenkins, Prometheus, Grafana, MongoDB Atlas and AWS EC2.
