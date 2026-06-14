# SnipURL | Premium URL Shortener & Click Analytics

A high-performance, full-stack URL Shortener application built with a modern, glassmorphic dark user interface. SnipURL enables users to create shortened links, customize aliases, set link expiration, generate dynamic QR codes, perform bulk CSV shortening, and track click analytics (including browser types, device form-factors, and daily click trends).

---

## 🏗️ Architecture Diagram

GitHub natively renders this diagram using Mermaid:

```mermaid
graph TD
    subgraph Client [React SPA Frontend (Port 5173)]
        A[Navbar / Routing] --> B[Login / Signup Form]
        A --> C[Dashboard]
        A --> D[Analytics Panel]
        A --> E[Public Stats Screen]
        C -->|Confetti Animation| F[Confetti Trigger]
        C -->|QR Code Modal| G[QR canvas generator]
        C -->|CSV Loader| H[CSV Multipart Post]
    end

    subgraph API [Express Backend Node Server (Port 5000)]
        I[Express Main App] --> J[JWT Auth Middleware]
        I --> K[Auth Router]
        I --> L[URL Management Router]
        I --> M[Analytics Router]
        I --> N[Redirection Handler]
        
        K -->|bcrypt & jwt| O[User Signin/Signup]
        L -->|csv-parser| P[Bulk CSV Processor]
        N -->|User-Agent Parsing| Q[Atomic Click Logger]
    end

    subgraph Data [MongoDB Database (Port 27017)]
        R[(Users Collection)]
        S[(Urls Collection)]
        T[(Clicks Collection)]
    end

    B -->|API Requests| K
    C -->|JWT Authorized Requests| L
    D -->|JWT Authorized Requests| L
    E -->|Public Stats Requests| L
    
    O -->|Mongoose ODM| R
    L -->|Mongoose ODM| S
    P -->|Mongoose ODM| S
    Q -->|Mongoose ODM| T
    Q -->|Increment Count| S
```

---

## ✨ Features Implemented

### 🔒 Authentication
- **User Signup & Login**: Implemented secure registration with email validation and encrypted passwords (hashed via `bcryptjs`).
- **Protected Dashboard Routes**: Uses JSON Web Tokens (JWT) stored locally on the client. Unauthenticated requests are immediately redirected back to the login screen.
- **Strict Data Isolation**: Mongoose queries ensure users can only see, edit, delete, or fetch analytics for their own links.

### 🔗 URL Shortening & Redirects
- **Validation**: Strict client-side and backend URL format checks using native URL validators.
- **Custom Alias**: Users can provide a slug (e.g. `promo-2026`) which will be verified for global uniqueness in MongoDB.
- **Dynamic Redirection**: Redirections are handled server-side (`GET /r/:shortCode`). The server intercepts requests, parses metrics, updates logs in the database, and issues an HTTP `302 Found` header redirect.
- **Link Expiration**: Users can choose a date after which redirection fails, displaying a styled error page.

### 📊 Performance Analytics
- **Atomic Clicks Tracking**: Logs every visit with precise timestamp, client IP, browser type, operating system, and device form factor (Mobile/Tablet/Desktop) parsed from request headers.
- **Visual Analytics Dashboard**: Detailed performance panel with totals, last clicked time, and custom-built, responsive SVG charts showing 7-day trendlines and device/browser distribution gauges.
- **Public Stats Screen**: A public route (`/stats/:code`) that lets users share statistics about their links without revealing user profile data or requiring login.

### 🛠️ Advanced Operations
- **QR Code Generator**: Generates high-fidelity QR codes on the fly using a canvas utility. Includes single-click PNG downloads.
- **Edit Destination**: Owners can edit the destination URL of any active shortened link directly from the dashboard library.
- **Bulk CSV Upload**: Drag-and-drop CSV importer that parses spreadsheet files in-memory using `csv-parser` and bulk-shortens URLs.
- **Toast Notifications**: Micro-interactions like toast notifications for copying links to clipboard, slide-up modal animations, and confetti bursts on successful creation.

---

## 🛠️ Setup Instructions

### Prerequisites
1. **Node.js** (v18 or higher recommended)
2. **MongoDB** (running locally on port 27017)

### 1. Database Verification
Ensure your local MongoDB instance is active on port 27017. You can check its state in Windows Command Prompt:
```cmd
netstat -ano | findstr 27017
```

### 2. Configure Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify the `.env` settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/url_shortener
   JWT_SECRET=super_secret_session_jwt_key_9988
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *(It will display: `Server running in production mode on port 5000` & `MongoDB Connected`)*

### 3. Configure Frontend Client
1. In a new terminal window, navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to: `http://localhost:5173/`

---

## 🧪 Testing and Verification
An automated test script has been compiled in `server`'s parent directory under `C:\Users\91944\.gemini\antigravity-ide\brain\45a984ea-70bc-4e27-9bca-13874c135557\scratch\test_api.js`.
To run the automated API testing suite:
```bash
cd C:\Users\91944\.gemini\antigravity-ide\brain\45a984ea-70bc-4e27-9bca-13874c135557\scratch
node test_api.js
```
*Expected output: All 6 test suites (User Signup, Login, Shortening with Custom Alias, Redirection Header, Protected Analytics, Public stats) will print green pass marks.*

---

## 📝 Assumptions Made
1. **Database Connection:** MongoDB runs on default configurations locally (`127.0.0.1:27017`).
2. **CSV Header Formatting:** CSV uploads assume target URLs are placed under column headers named `"url"`, `"link"`, or `"originalUrl"`. If none are found, it uses the values in the first column of the spreadsheet.
3. **URL Redirection Port:** Redirections occur from the backend endpoint `/r/:shortCode` on port 5000.
4. **User-Agent Accuracy:** Device and browser breakdowns rely on client User-Agent headers, which is standard.

---

## 🎥 Demonstration Video
> [!IMPORTANT]
> **Video Demonstration Link:** [REPLACE_WITH_YOUR_RECORDED_VIDEO_LINK_HERE]  
> *Note: Per Hackathon requirements, please record a screen presentation (via Loom, YouTube, or Drive) demonstrating signup, link shortening, redirection, and visual analytics, then insert the link above before submitting.*

---

This project is a part of a hackathon run by https://katomaran.com
