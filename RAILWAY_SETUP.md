# Railway Deployment Guide for Ethara AI

This guide explains how to deploy Ethara AI to Railway with both frontend and backend.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository with this code
- MongoDB Atlas account with a connection string

## Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster if you don't have one
3. Go to **Database** → **Connect**
4. Choose **Drivers** → **Node.js**
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
6. Save this for later

## Step 2: Deploy to Railway

### Option A: Using Railway Dashboard

1. Go to [Railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository with this code
4. Railway will auto-detect `railway.json` and set up the build

### Option B: Using Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init  # in your project root
railway up
```

## Step 3: Set Environment Variables in Railway

Once the project is created in Railway:

1. Go to your Railway project
2. Click on the **Variables** tab
3. Add these environment variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-random-secret-key-min-32-chars
CORS_ORIGIN=*
```

### How to generate JWT_SECRET

```bash
openssl rand -base64 32
```

Or use any 32+ character random string.

## Step 4: Verify Deployment

1. Go to **Deployments** tab in Railway
2. Wait for the build to complete (should see "✓ MongoDB connected")
3. Once deployed, click the **Generate Domain** button (or find your app URL)
4. Your app URL will be something like: `https://ethara-ai-production-71c5.up.railway.app`

## Step 5: Test the Application

1. Open your Railway app URL in browser
2. You should see the login page
3. Try to register a new account
4. Try to login

## Troubleshooting

### Registration/Login fails with "Registration failed"

**Causes:**
- `MONGODB_URI` not set correctly
- `JWT_SECRET` is empty or not set
- Database connection failed

**Fix:**
```bash
# In Railway dashboard:
1. Go to Variables tab
2. Check MONGODB_URI is set
3. Check JWT_SECRET is set
4. Go to Deployments → View Logs
5. Look for "MongoDB connected" message
```

### All API requests return 403

**Cause:** CORS_ORIGIN not configured correctly

**Fix:**
```bash
# In Railway dashboard Variables:
CORS_ORIGIN=* 
# or
CORS_ORIGIN=https://your-railway-url
```

### Frontend shows blank page

**Cause:** Frontend not built

**Fix:**
```bash
# This should happen automatically with railway.json
# But if not, manually rebuild in Railway dashboard
# Go to Deployments → Redeploy Latest
```

### MongoDB connection errors

**Cause:** Connection string incorrect or IP not whitelisted

**Fix:**
1. Copy connection string from MongoDB Atlas again
2. In MongoDB Atlas → Network Access, add Railway IP or use 0.0.0.0/0 (temporary)
3. Update `MONGODB_URI` in Railway Variables
4. Redeploy in Railway

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | No | `3000` | Server port (default: 3000) |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/db` | MongoDB connection string |
| `JWT_SECRET` | Yes | 32-char random string | JWT signing secret |
| `CORS_ORIGIN` | No | `*` or `https://your-url` | CORS origin (default: `*`) |

## Local Development

To test the Railway configuration locally:

```bash
# Backend
cd backend
cp .env.local .env  # or use existing .env
npm install
npm start

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173`

## Deployment Architecture

```
Railway App
├── Frontend (React + Vite)
│   └── dist/ (built static files)
└── Backend (Express + Node.js)
    ├── /api/auth
    ├── /api/projects
    ├── /api/tasks
    ├── /api/users
    └── /* (serves frontend dist/)

External Services
└── MongoDB Atlas (database)
```

## Support

If issues persist:
1. Check Railway logs: Dashboard → Deployments → View Logs
2. Check MongoDB Atlas connection logs
3. Verify environment variables are set
4. Check `.env` file has all required variables
