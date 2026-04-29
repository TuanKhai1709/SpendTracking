# 💸 SpendTracker

> A **mobile-first personal finance web app** built with React and Firebase.  
> Track your income & expenses, set budgets, analyze spending patterns — all synced to the cloud in real time.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Deployed](https://img.shields.io/badge/Live-GitHub%20Pages-2ea44f?logo=github)](https://tuankhai1709.github.io/SpendTracking/)

---

## 🎯 What I Built & Why

Most expense trackers are either too complex or lack real-time sync. I built SpendTracker to be **simple, fast, and genuinely useful** for daily use on mobile — no bloat, just the features that matter.

This project demonstrates my ability to build a **full-stack web application** end-to-end: from UI/UX design and React component architecture to Firebase backend integration and automated CI/CD deployment.

---

## ✨ Core Features

### 🔐 Authentication & Security
- Email/password sign-up and login via **Firebase Auth**
- **Brute-force protection**: account lockout after repeated failed attempts
- **Math CAPTCHA** challenge triggered on suspicious login activity
- Per-user data isolation — each user only ever sees their own data in Firestore

### 📊 Dashboard
- **Monthly summary**: total income, total expenses, and net balance at a glance
- **Weekly bar chart** showing spending trends across the last 7 days
- **Category donut charts** for both expenses and income
- Month picker to browse historical months (up to 12 months back)

### 💳 Expense & Income Management
- Add, edit, and delete transactions with category, amount, and date
- Filter and browse transaction history by month
- Transactions are stored in **Cloud Firestore** and sync instantly across devices

### 🔄 Recurring Expenses
- Define recurring subscriptions or investments (e.g., Netflix, SIP funds)
- Auto-logged each month — no need to re-enter the same transactions manually

### 🎯 Budget Management
- Set monthly spending limits **per category**
- Real-time progress bars showing how much of each budget has been used
- Visual warnings when approaching or exceeding a budget

### 🗂️ Custom Categories
- Create and manage your own expense and income categories
- Categories are user-specific and persist across sessions

### 📈 Reports
- **Pie and bar charts** breaking down spending by category for any month
- Compare income vs. expenses side by side

### 🌙 Dark Mode
- System-aware theme toggle with smooth transitions
- Theme preference persisted in `localStorage`

### 🌐 Bilingual (EN / VI)
- Full UI translation between English 🇺🇸 and Vietnamese 🇻🇳
- Language toggle available in Settings — switches instantly without a page reload

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 18, React Router v6 |
| **Build Tool** | Vite 5 |
| **State Management** | React Context API (Auth, Theme, Language, Budget, Category, Recurring) |
| **Charts** | Chart.js 4, react-chartjs-2, chartjs-plugin-datalabels |
| **Authentication** | Firebase Authentication |
| **Database** | Cloud Firestore (NoSQL, real-time) |
| **Hosting & CI/CD** | GitHub Pages + GitHub Actions |

---

## 🏗️ Architecture Highlights

- **Context-driven state**: six dedicated context providers keep concerns separated and components lean
- **Private route guards**: unauthenticated users are automatically redirected to Login
- **Environment-based config**: all Firebase credentials stored as GitHub Actions secrets — never committed to source
- **Automated deployment**: every push to `main` triggers a Vite build and deploys to GitHub Pages via workflow

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [Firebase](https://firebase.google.com/) project

### 1. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** → Sign-in method → **Email/Password**
3. Create a **Firestore Database** (start in test mode)
4. Go to **Project Settings** → **Your apps** → **Add web app** → copy the config values

### 2. Install & Configure

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌍 Deploy to GitHub Pages

1. Push code to a GitHub repository
2. Go to **Settings** → **Pages** → Source: **GitHub Actions**
3. Go to **Settings** → **Secrets and variables** → **Actions** → add each `VITE_FIREBASE_*` value as a secret
4. Push to `main` — the workflow builds and deploys automatically

---

## 📁 Project Structure

```
SpendTracker/
├── .github/workflows/deploy.yml   # Automated CI/CD pipeline
├── assets/                        # Icons and static images
├── src/
│   ├── firebase.js                # Firebase SDK initialization
│   ├── App.jsx                    # Root component & route definitions
│   ├── context/                   # Global state providers
│   │   ├── AuthContext.jsx        # Firebase auth state
│   │   ├── BudgetContext.jsx      # Budget rules per category
│   │   ├── CategoryContext.jsx    # User-defined categories
│   │   ├── LangContext.jsx        # i18n (EN/VI) + currency formatting
│   │   ├── RecurringContext.jsx   # Recurring expense logic
│   │   └── ThemeContext.jsx       # Dark/light mode
│   ├── components/                # Shared UI components
│   │   ├── Navbar.jsx
│   │   ├── WeekChart.jsx
│   │   ├── BudgetCard.jsx
│   │   ├── TransactionModal.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── MenuItem.jsx
│   └── pages/                     # Route-level page components
│       ├── Dashboard.jsx
│       ├── Expenses.jsx
│       ├── Income.jsx
│       ├── Report.jsx
│       ├── BudgetManagement.jsx
│       ├── CategoryManagement.jsx
│       ├── RecurringExpenses.jsx
│       ├── Settings.jsx
│       ├── Login.jsx
│       ├── Register.jsx
│       └── ChangePassword.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 📄 License

MIT © [TuanKhai1709](https://github.com/TuanKhai1709)
