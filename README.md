# SnipURL – Premium URL Shortener & Click Analytics

A full-stack URL Shortener application that allows users to create short links, manage URLs, track analytics, generate QR codes, create custom aliases, upload URLs in bulk, and monitor link performance through a modern dashboard.

---

# 📌 Problem Statement

Managing long URLs is inconvenient and difficult to share. Users also lack visibility into how their links perform after sharing.

SnipURL solves this by providing:

* Secure user authentication
* Custom URL shortening
* Analytics tracking
* QR code generation
* Bulk URL creation
* Public statistics pages

---

# 🧠 AI Planning Document

## Problem

Users need a simple platform to shorten URLs and monitor engagement through analytics.

## Solution

Build a secure URL shortening platform where authenticated users can:

* Create short URLs
* Track click analytics
* Generate QR codes
* Manage all links from a dashboard

## Workflow

User → React Frontend → Express Backend → MongoDB Database

---

# ✨ Features

## 🔒 Authentication

* User Signup
* User Login
* JWT Authentication
* Protected Routes
* Password Hashing using bcryptjs

## 🔗 URL Shortening

* Create Short URLs
* Unique Short Code Generation
* Custom Alias Support
* URL Validation
* Expiry Date Support
* Server-side Redirect Handling

## 📊 Analytics

* Total Click Count
* Last Visited Time
* Recent Visit History
* Device Analytics
* Browser Analytics
* Operating System Analytics
* Daily Click Trends

## 🛠 Advanced Features

* QR Code Generation
* Edit Destination URL
* Delete URL
* Bulk URL Shortening
* Public Stats Page
* Responsive Dashboard
* Toast Notifications

---

# 🏗️ Architecture Diagram

```mermaid
graph TD

A[React Frontend]

B[Express Backend]

C[(MongoDB)]

A --> B

B --> C
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* React Router
* Axios

## Backend

* Node.js
* Express.js
* JWT
* bcryptjs

## Database

* MongoDB
* Mongoose

---

# 📝 Assumptions Made

1. MongoDB runs locally on port 27017.
2. Users must authenticate before accessing the dashboard.
3. Analytics data is stored in MongoDB.
4. Custom aliases must be unique.
5. Expired links cannot be accessed.

---

# 🚀 Setup Instructions

## Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd url-shortener
```

## Backend Setup

```bash
cd server
npm install
npm start
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/url_shortener
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 📷 Screenshots

## Login Page

(Add Screenshot)

## Dashboard

(Add Screenshot)

## Analytics Page

(Add Screenshot)

## QR Code Generator

(Add Screenshot)

---

# 🗄️ Sample Database Entries

## Users Collection

(Add MongoDB Screenshot)

## URLs Collection

(Add MongoDB Screenshot)

## Clicks Collection

(Add MongoDB Screenshot)

---

# 📋 Backend Logs

```text
MongoDB Connected
Server running on port 5000

POST /api/auth/login
User Login: demo@gmail.com

POST /api/urls/shorten
Short URL Created: yuva

GET /r/yuva

Click Recorded
```

---

# 🎥 Demonstration Video

Video Link:

PASTE_YOUR_YOUTUBE_OR_LOOM_LINK_HERE

---

# 📄 Future Enhancements

* Geolocation Analytics
* Team Collaboration
* API Key Access
* Custom Domains
* Advanced Reporting

---

This project is a part of a hackathon run by https://katomaran.com
