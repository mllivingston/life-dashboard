# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
cd life-dashboard
npm install
```

### Step 2: Setup Supabase (2 min)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy your project URL and anon key from Settings → API
4. In the SQL Editor, paste and run the contents of `supabase-setup.sql`

### Step 3: Setup Google Calendar (2 min)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API (APIs & Services → Library)
4. Create OAuth credentials (APIs & Services → Credentials)
   - Type: Web application
   - Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Client Secret

### Step 4: Configure Environment (30 sec)
Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Run the App (10 sec)
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## ✅ What You Get

- ✨ Beautiful, responsive dashboard
- 🔐 Secure authentication with Supabase
- 📅 Google Calendar integration (today + 7 days)
- ✅ To-do list with complete/delete
- 🛒 Grocery list with check-off
- 💾 All data persisted to Supabase database

## 🎯 First Steps After Login

1. Click "Connect Google Calendar" button
2. Authorize access to your calendar
3. Start adding todos and grocery items
4. Watch your calendar events populate!

## 🆘 Need Help?

Check the full `README.md` for:
- Detailed setup instructions
- Troubleshooting guide
- Deployment instructions
- Security features

Enjoy your new Life Dashboard! 🎉
