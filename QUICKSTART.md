# 🚀 QUICK START - MongoDB Atlas Setup

## ✅ CONNECTION DETAILS SAVED

**MongoDB Atlas Connection String:**
```
mongodb+srv://pawannonmedical_db_user:upioHPP1FPEAdYE0@pk.lkfxvzj.mongodb.net/ethara-ai?retryWrites=true&w=majority
```

**Status:** ✅ Connection configured in `backend/.env`

---

## 📋 SETUP MONGODB COLLECTIONS

### Option 1: Automatic Setup (Recommended)
Run this command from `backend/` directory:
```bash
npm run setup-db
```

**Expected output:**
```
✓ Connected to MongoDB
✓ Created users collection
✓ Created users indexes
✓ Created projects collection
✓ Created projects indexes
✓ Created tasks collection
✓ Created tasks indexes

✅ MongoDB setup complete!
```

---

### Option 2: Manual Setup (Copy-Paste in MongoDB Compass)

1. Open **MongoDB Compass**
2. Connect using the connection string above
3. Select database: `ethara-ai`
4. Go to "Playground" tab
5. Copy & paste the code from: `MONGODB_SETUP.js`
6. Run the script

---

### Option 3: Manual Setup (mongosh Shell)

```bash
# Connect to MongoDB
mongosh "mongodb+srv://pawannonmedical_db_user:upioHPP1FPEAdYE0@pk.lkfxvzj.mongodb.net/ethara-ai?retryWrites=true&w=majority"

# Select database
use ethara-ai

# Then paste all commands from MONGODB_SETUP.js file
```

---

## 🔧 SETUP STEPS

### Step 1: Create Collections & Indexes
```bash
cd backend
npm run setup-db
```

### Step 2: Seed Demo Data
```bash
npm run seed
```

**Expected output:**
```
✓ MongoDB connected: pk.lkfxvzj.mongodb.net
✓ Cleared existing data
✓ Created 3 users (1 ADMIN, 2 MEMBERS)
✓ Created 3 projects
✓ Created 7 tasks

✅ Seed data created successfully!

Demo Users:
  Admin: admin@ethara.ai / password123
  Member: john@ethara.ai / password123
  Member: sarah@ethara.ai / password123
```

### Step 3: Start Development Server
```bash
npm run dev
```

**Expected output:**
```
✓ MongoDB connected: pk.lkfxvzj.mongodb.net
Server running on port 5000
```

### Step 4: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  Local:   http://localhost:5173/
  press h + enter to show help
```

### Step 5: Test Application
1. Open http://localhost:5173
2. Login with: `admin@ethara.ai` / `password123`
3. You should see the Dashboard

---

## 📊 MONGODB COLLECTIONS SCHEMA

### Collection 1: users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: "ADMIN" | "MEMBER",
  signup_timestamp: Date,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}
```

### Collection 2: projects
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  created_by: ObjectId (ref → users._id),
  members: [
    {
      user_id: ObjectId (ref → users._id),
      joined_at: Date
    }
  ],
  created_at: Date,
  updated_at: Date
}
```

### Collection 3: tasks
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  priority: "LOW" | "MEDIUM" | "HIGH",
  assigned_to: ObjectId (ref → users._id),
  project_id: ObjectId (ref → projects._id),
  due_date: Date,
  created_at: Date,
  updated_at: Date
}
```

---

## 🎯 COMMANDS REFERENCE

```bash
# From backend/ directory

# Setup MongoDB collections & indexes
npm run setup-db

# Seed demo data (3 users, 3 projects, 7 tasks)
npm run seed

# Start development server
npm run dev

# Start production server
npm start

# Build frontend
npm run build
```

---

## ✅ VERIFICATION

### Check MongoDB Connection
```bash
# From backend/
npm run dev

# Look for:
# ✓ MongoDB connected: pk.lkfxvzj.mongodb.net
# Server running on port 5000
```

### Check Collections Exist
1. Open MongoDB Compass
2. Connect with your connection string
3. Select `ethara-ai` database
4. You should see 3 collections:
   - **users** (with indexes)
   - **projects** (with indexes)
   - **tasks** (with indexes)

### Check API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Expected: {"message":"Ethara AI API is running"}
```

---

## 📁 CLEAN DIRECTORY STRUCTURE

```
Ethara-AI/
├── backend/
│   ├── config/
│   │   └── db.js (MongoDB connection)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   ├── scripts/
│   │   ├── setup-mongodb.js (new)
│   │   └── seed.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── MONGODB_SETUP.js (manual setup)
├── Ethara-AI-Postman-Collection.json
├── railway.json
└── package.json
```

---

## 🎯 NEXT STEPS

1. ✅ Run `npm run setup-db` (from backend/)
2. ✅ Run `npm run seed` (from backend/)
3. ✅ Run `npm run dev` (from backend/)
4. ✅ Run `npm run dev` (from frontend/)
5. ✅ Open http://localhost:5173
6. ✅ Login with admin@ethara.ai / password123

---

## 🚀 PRODUCTION DEPLOYMENT

When ready to deploy to Railway:

1. MongoDB collections already created ✅
2. Connection string in `backend/.env` ✅
3. Run: `git add .` → `git commit` → `git push`
4. Railway deploys automatically

---

**Everything is ready to go! Start with Step 1 above.** 🎯
