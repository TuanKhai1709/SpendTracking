# SpendTracker

A lightweight personal expense tracking web app optimized for mobile browsers. Deployed on GitHub Pages with Firebase backend.

## Tech Stack

- **Frontend:** React (Vite), Chart.js
- **Auth:** Firebase Authentication
- **Database:** Cloud Firestore
- **Hosting:** GitHub Pages (via GitHub Actions)

## Setup

### Prerequisites

- Node.js 18+
- A Firebase project (free tier)

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Create a **Firestore Database** (start in test mode)
5. Go to Project Settings → Your apps → Add web app → copy config values

### Install & Run Locally

```bash
npm install
```

Create a `.env.local` file:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

```bash
npm run dev
```

### Deploy to GitHub Pages

1. Push code to GitHub
2. Go to repo **Settings** → **Pages** → Source: **GitHub Actions**
3. Go to repo **Settings** → **Secrets and variables** → **Actions** → add each `VITE_FIREBASE_*` secret
4. Push to `main` branch and it will auto-deploy

## Project Structure

```
SpendTracker/
├── .github/workflows/deploy.yml
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── firebase.js
│   ├── context/AuthContext.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── TransactionModal.jsx
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       ├── Expenses.jsx
│       └── Income.jsx
├── index.html
├── vite.config.js
└── package.json
```
