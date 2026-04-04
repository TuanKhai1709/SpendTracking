# SpendTracker

A lightweight personal expense tracking web app optimized for mobile browsers.

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React (Vite), Chart.js
- **Auth:** JWT-based authentication

## Setup

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm run install-all
```

### Development

```bash
npm run dev
```

This starts both the Express server (port 5000) and the Vite dev server (port 3000).

### Production Build

```bash
npm run build
npm start
```

The app will be available at `http://localhost:5000`.

## Deployment (Render)

1. Push this repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo
4. Set the following:
   - **Build Command:** `npm run install-all && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Set `JWT_SECRET` to a secure random string

## Project Structure

```
SpendTracker/
├── server/
│   ├── index.js          # Express server
│   ├── db.js             # SQLite setup
│   ├── middleware/auth.js # JWT auth middleware
│   └── routes/
│       ├── auth.js       # Login & Register
│       ├── expenses.js   # Expense CRUD
│       └── income.js     # Income CRUD
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── api.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       └── pages/
└── package.json
```
