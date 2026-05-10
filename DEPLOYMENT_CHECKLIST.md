# Ethara AI - Railway Deployment Checklist

## ✅ Fixed Issues

- [x] Updated `railway.json` to build both frontend and backend
- [x] Changed database configuration from PostgreSQL to MongoDB
- [x] Added MongoDB connection support with `MONGODB_URI` environment variable
- [x] Backend now serves frontend static files for SPA
- [x] Added SPA fallback routing in backend
- [x] Frontend correctly configured to use `/api` relative path

## 📋 Deployment Steps

### 1. Verify GitHub Repository

- [ ] Commit all changes: `git add .` && `git commit -m "Fix Railway deployment configuration"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify `railway.json` is committed

### 2. In MongoDB Atlas

- [ ] Go to https://mongodb.com/cloud/atlas
- [ ] Create/access your cluster
- [ ] Go to Database → Connect → Drivers → Node.js
- [ ] Copy the connection string (format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
- [ ] Save this string for next step

### 3. In Railway Dashboard

- [ ] Go to https://railway.app
- [ ] Create new project → Deploy from GitHub
- [ ] Select your repository
- [ ] Wait for auto-detection of `railway.json`
- [ ] Click on the project → Variables tab
- [ ] Add these environment variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=<paste your MongoDB connection string here>
JWT_SECRET=<generate with: openssl rand -base64 32>
CORS_ORIGIN=*
```

- [ ] Generate your app domain in Railway (click "Generate Domain")
- [ ] Wait for deployment to complete

### 4. Verify Deployment

- [ ] Check Deployments tab - status should show "Success"
- [ ] Click View Logs - you should see:
  - "✓ MongoDB connected: [hostname]"
  - "Server running on port 3000"
- [ ] Open the Railway app URL in browser
- [ ] You should see the Ethara AI login page

### 5. Test Application

- [ ] Click Register → Create a test account
- [ ] Verify you receive success notification
- [ ] Click Login → Login with test credentials
- [ ] Verify you see the dashboard
- [ ] Test creating a project (if Admin)
- [ ] Test assigning a task

## 🔍 Troubleshooting

### Issue: "Registration failed" on Railway

**Check:**
```bash
# In Railway Deployments → View Logs, you should see:
✓ MongoDB connected: ...

# If you see error like "Cannot connect to MongoDB":
1. Verify MONGODB_URI is set in Variables
2. Verify MongoDB Atlas IP whitelist includes Railway
   - Go to MongoDB Atlas → Network Access
   - Add IP 0.0.0.0/0 (temporary) or Railway's IP range
```

### Issue: CORS errors in browser console

**Fix:**
```bash
# In Railway Variables, set:
CORS_ORIGIN=* 

# Or set to specific domain:
CORS_ORIGIN=https://ethara-ai-production-xxxx.railway.app
```

### Issue: Frontend shows blank page

**Check:**
```bash
# In browser Developer Tools (F12) → Network tab:
- Check if /api/health returns 200
- Check if any API calls are failing
- Check for CORS errors

# If frontend files not found:
- Check Deployments → Logs for "Serving frontend from..."
- Redeploy: Go to Deployments → Redeploy Latest
```

### Issue: Can login but dashboard is empty

**Check:**
```bash
# In browser console (F12 → Console):
- Check if API calls to /api/dashboard are succeeding
- Check if JWT token is in localStorage

# Verify:
- User has proper role assigned (Admin/Member)
- MongoDB collections have data
```

## 📚 Project Structure

```
ethara-ai/
├── frontend/           # React app
│   ├── src/
│   ├── dist/           # Built files (created by build)
│   ├── .env            # Development env vars
│   └── vite.config.js
├── backend/            # Express app
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env            # Development env vars
│   └── server.js
├── railway.json        # Railway deployment config
└── RAILWAY_SETUP.md    # Full deployment guide
```

## 🚀 Next Steps

1. **Commit & Push:**
   ```bash
   git add .
   git commit -m "Fix Railway deployment - MongoDB + frontend serving"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to railway.app → New Project → Deploy from GitHub
   - Select repository
   - Add environment variables from Step 3 above
   - Wait for deployment

3. **Test:**
   - Visit your Railway app URL
   - Test registration → login → create project → assign task

## 📞 Support

For detailed Railway setup guide, see: `RAILWAY_SETUP.md`

For local testing:
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173`
