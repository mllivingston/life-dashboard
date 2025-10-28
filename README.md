# Life Dashboard

A comprehensive web application that integrates Google Calendar, To-Do List, and Grocery List with Supabase authentication.

## Features

- 🔐 **Authentication**: Secure login with Supabase
- 📅 **Google Calendar**: View today's events and upcoming week
- ✅ **To-Do List**: Create, complete, and delete tasks
- 🛒 **Grocery List**: Manage your shopping items
- 💾 **Data Persistence**: All data stored in Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **APIs**: Google Calendar API

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier works)
- A Google Cloud project with Calendar API enabled

## Setup Instructions

### 1. Clone and Install

```bash
cd life-dashboard
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public key

3. Run this SQL in the Supabase SQL Editor to create the required tables:

```sql
-- Create todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create grocery_items table
CREATE TABLE grocery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create google_tokens table
CREATE TABLE google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for todos
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for grocery_items
CREATE POLICY "Users can view their own grocery items" ON grocery_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grocery items" ON grocery_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grocery items" ON grocery_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grocery items" ON grocery_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for google_tokens
CREATE POLICY "Users can view their own tokens" ON google_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON google_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON google_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON google_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click **Enable**

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Select **Web application**
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
   - Copy the **Client ID** and **Client Secret**

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### First Time Setup

1. **Sign Up**: Create an account on the login page
2. **Connect Google Calendar**: Click "Connect Google Calendar" button
3. **Authorize**: Grant permissions to read your calendar
4. **Start Using**: Add todos, grocery items, and view your calendar!

### Features

- **Calendar**: Automatically fetches events for today and the next 7 days
- **To-Do List**: Click checkbox to mark complete, delete button to remove
- **Grocery List**: Same functionality as to-do list
- **Auto-refresh**: Click refresh button on calendar to update events

## Project Structure

```
life-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/google/callback/
│   │   │   └── route.js          # Google OAuth callback
│   │   └── calendar/
│   │       └── route.js          # Fetch calendar events
│   ├── login/
│   │   └── page.js               # Login/signup page
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Main dashboard
│   └── globals.css               # Global styles
├── components/
│   ├── Calendar.js               # Calendar component
│   ├── TodoList.js               # To-do list component
│   └── GroceryList.js            # Grocery list component
├── lib/
│   ├── supabase/
│   │   ├── client.js             # Client-side Supabase
│   │   └── server.js             # Server-side Supabase
│   └── google-calendar.js        # Google Calendar utilities
├── middleware.js                 # Auth middleware
└── package.json
```

## Security Features

- Row Level Security (RLS) on all database tables
- Protected routes via middleware
- Secure token storage in Supabase
- Environment variable protection

## Troubleshooting

### Google Calendar not connecting
- Verify redirect URI matches exactly in Google Cloud Console
- Check that Calendar API is enabled
- Ensure environment variables are set correctly

### Authentication issues
- Confirm Supabase URL and keys are correct
- Check that RLS policies are created
- Verify email confirmation if enabled in Supabase

### Database errors
- Run the SQL setup script again
- Check Supabase logs in the dashboard
- Verify user_id columns reference auth.users

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Update Google OAuth redirect URI to production URL
5. Deploy!

### Environment Variables for Production

Update these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (use production URL)
- `NEXTAUTH_URL` (use production URL)
- `NEXTAUTH_SECRET`

## License

MIT

## Support

For issues and questions, please check:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
