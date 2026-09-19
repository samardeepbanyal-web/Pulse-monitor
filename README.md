# ⚡ PulseBoard

> **A lightweight, real-time service health and latency monitoring dashboard built with React, Vite, and Tailwind CSS.**

![PulseBoard Deployed link](https://<your-project-id>.web.app) *( live deployed link on firebase)*

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite Powered](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Google Built with AI](https://img.shields.io/badge/Submission-Google_Built_with_AI-4285F4?logo=google&logoColor=white)](https://firebase.google.com/)

---

## 📖 Overview

**PulseBoard** is an intuitive, responsive single-page dashboard designed for developers and operations teams to monitor backend services, APIs, and microservices in real time.

PulseBoard gives you immediate operational visibility through:
1. **Realistic Mock Telemetry**: 4 pre-configured microservices demonstrating healthy, slow, and degraded states out-of-the-box.
2. **Real Browser HTTP Probes**: Directly ping live CORS-enabled endpoints via `fetch` with millisecond latency calculation, status code validation, and a 5-second timeout guard.
3. **Automated Background Polling**: Monitors live services automatically every 60 seconds with an active visual countdown.
4. **Local-First Persistence**: Custom services, configurations, and latency histories persist reliably in the browser's `localStorage`—no database, backend, or cloud configuration required.

---

## ✨ Key Features

- **📊 High-Level Health Summary**:
  - **Total Monitored Services**: Real-time counter with Live vs. Mock breakdown.
  - **Operational Services**: Displays uptime percentage and healthy status count.
  - **Degraded / Down Services**: Highlights services experiencing sluggish response times ($\ge 800\,\text{ms}$) or connection failures.

- **📈 Custom SVG Sparkline Trend Charts**:
  - Zero external chart dependencies (custom, pure SVG rendering for high performance and minimal bundle size).
  - Dynamic gradient fills and line colors that adapt to current status (**Green** for Operational, **Amber** for Degraded, **Rose** for Down).
  - Hover tooltips showing historical check latency and average response time.

- **🌐 Dual-Mode Monitoring (Mock & Live)**:
  - **Live Mode**: Executes real HTTP requests directly from the user's browser, measuring millisecond roundtrip time via `performance.now()`.
  - **Mock Mode**: Simulates realistic network latency and jitter without triggering network calls.

- **⚙️ Service Configuration & Management**:
  - Add or edit services via a modal dialog: Name, Endpoint URL, HTTP Method (GET, HEAD, POST), Expected Status Code (e.g. 200), and Monitoring Mode.
  - Delete or reset to defaults at any time.

- **⏱️ Automated 60-Second Auto-Check**:
  - Automatically queries all configured Live endpoints every 60 seconds.
  - Features an on-screen countdown timer and a global **Check All** button.

- **🛡️ CORS Awareness & Guidance**:
  - Features an explicit notice banner explaining browser cross-origin constraints.
  - Includes pre-configured one-click sample endpoints (`DummyJSON`, `HttpBin`) for instant live testing.

---

## 🏗️ Architecture & Project Structure

PulseBoard is designed to be lightweight, modular, and easy to maintain:

```text
pulseboard/
├── index.html                  # HTML entry with custom typography & SVG favicon
├── package.json                # Project scripts & dependencies
├── vite.config.js              # Vite bundler configuration
├── tailwind.config.js          # Tailwind CSS design system configuration
├── postcss.config.js           # PostCSS plugins
├── firebase.json               # Google Firebase Hosting configuration
├── .gitignore                  # Git ignore rules
└── src/
    ├── main.jsx                # React DOM mount point
    ├── App.jsx                 # Main state coordinator, timer & localStorage engine
    ├── index.css               # Tailwind directives & custom scrollbars
    ├── constants/
    │   └── initialServices.js  # Pre-populated mock services & historical seed data
    ├── utils/
    │   └── monitor.js          # Health check engine (fetch, timeout, latency calc)
    └── components/
        ├── Header.jsx          # Branding, auto-refresh countdown, and global actions
        ├── SummaryCards.jsx    # Top-level metric cards
        ├── ServiceCard.jsx     # Individual service card with metrics & actions
        ├── ServiceModal.jsx    # Add / Edit service modal with validation
        └── ResponseTimeChart.jsx # Pure SVG sparkline & latency trend visualization
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pulseboard.git
   cd pulseboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## ☁️ Deployment Guide (Google Firebase Hosting)

PulseBoard is fully configured for **Google Firebase Hosting** (free tier / Spark plan) on Google Cloud CDN:

1. **Install Firebase CLI and Login:**
   ```bash
   npx -y firebase-tools@latest login
   ```

2. **Select or Create your Firebase Project:**
   ```bash
   # Use an existing project:
   npx -y firebase-tools@latest use <YOUR_PROJECT_ID>

   # Or create a new one via CLI:
   npx -y firebase-tools@latest projects:create pulseboard-<unique-id> --display-name "PulseBoard"
   npx -y firebase-tools@latest use pulseboard-<unique-id>
   ```

3. **Deploy with a single command:**
   ```bash
   npm run deploy:firebase
   ```
   Your app will be live at:
   `https://<your-project-id>.web.app`

*(Alternative 30-second deploy via Vercel: `npx -y vercel --prod`)*

---

## 🧪 Evaluator & Judge Walkthrough Guide

To evaluate the capabilities of PulseBoard:

1. **Initial Populated State**: Observe the 4 pre-loaded mock services with populated sparkline trends, uptime metrics, and degraded latency alert.
2. **Instant Check**: Click **Check All** in the top navigation or **Check Now** on an individual card to watch status and latency recalculations animate in real-time.
3. **Live Endpoint Test**:
   - Click **+ Add Service**.
   - Select **Live HTTP**.
   - Enter `https://dummyjson.com/test` (or click the quick-fill button) with expected status `200`.
   - Click **Add Service**. The dashboard immediately executes a live browser probe and plots its latency.
4. **Degraded & Down Test**:
   - Add an endpoint with an invalid status code or a broken domain (e.g. `https://httpbin.org/status/500` with expected status `200`).
   - Observe the card transition to **Down** status with an explanatory error badge.
5. **Persistence**: Reload or restart your browser. All added endpoints, modifications, and historical checks persist seamlessly.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
