# Life Dashboard 📊

> Personal productivity dashboard integrating Google Calendar, todos, and grocery lists with enterprise-grade error handling.

**Version:** 1.1.0 (Phase 1 Complete)  
**Status:** ✅ Production Ready  
**Live Demo:** [life-dashboard-ri1t.vercel.app](https://life-dashboard-ri1t.vercel.app)

---

## ✨ Features

### Core Functionality
- 📅 **Google Calendar Integration** - View upcoming events
- ✅ **Todo List** - Track daily tasks
- 🛒 **Grocery List** - Manage shopping items
- 🔐 **Secure Authentication** - Email/password via Supabase

### Production-Ready Features (Phase 1)
- 🛡️ **Error Handling** - Component-level error boundaries
- 📊 **Error Logging** - Comprehensive error tracking in database
- 🔍 **Health Monitoring** - Real-time system status endpoint
- 📝 **Structured Logging** - Automatic context enrichment
- 🎯 **Graceful Degradation** - Components fail independently

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google Cloud Console account

### Installation

```bash
# Clone repository
git clone https://github.com/mllivingston/life-dashboard.git
cd life-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
# (Copy SQL from supabase-migrations/ to Supabase SQL Editor)

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

**Full setup instructions:** See [DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## 📚 Documentation

Comprehensive documentation organized by purpose:

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Technical design, system overview | Understanding how it works |
| **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** | Development workflow, testing, debugging | Working on code |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Production deployment, monitoring | Deploying to Vercel |
| **[CHANGELOG.md](docs/CHANGELOG.md)** | Version history, what changed | Tracking changes |
| **[TIME-TRACKING.md](docs/TIME-TRACKING.md)** | Time estimates, actual time spent | Planning work |

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (React Server Components)
- Tailwind CSS
- React Hooks

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- Google Calendar API

**Infrastructure:**
- Vercel (hosting)
- Supabase Cloud (database)
- GitHub (version control)

---

## 📈 Project Status

### Completed: Phase 1 - Foundation ✅

**Time:** 45 minutes  
**Delivered:**
- Error logging database with RLS
- Structured logger utility
- React error boundaries
- Health check endpoint with HTML dashboard

**Documentation:** [Phase 1 in CHANGELOG.md](docs/CHANGELOG.md#110---2025-10-29)

### Roadmap

**Phase 2: Resilience** (Planned - ~2.3 hours)
- Retry logic with exponential backoff
- Automatic token refresh
- Timeout handling
- Circuit breaker for APIs

**Phase 3: Multi-Calendar** (Planned - ~2.5 hours)
- Calendar service abstraction
- Outlook Calendar support
- Unified multi-calendar view

**Phase 4: Observability** (Planned - ~2.3 hours)
- Error dashboard UI
- Alerting system
- Request tracing
- Performance monitoring

---

## 🛠️ Development

### Key Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Utilities
npm run lint             # Check code style
```

### Project Structure

```
life-dashboard/
├── app/                   # Next.js pages and API routes
│   ├── page.js           # Main dashboard
│   ├── login/            # Authentication
│   └── api/              # Backend endpoints
│       ├── health/       # Health check (NEW)
│       ├── calendar/     # Calendar API
│       └── auth/         # OAuth
├── components/           # React components
│   ├── Calendar.js       # Calendar widget
│   ├── TodoList.js       # Todo list
│   ├── GroceryList.js    # Grocery list
│   └── ErrorBoundary.js  # Error handling (NEW)
├── lib/                  # Utilities
│   ├── logger.js         # Logging utility (NEW)
│   └── supabase/         # Database client
├── docs/                 # Documentation (NEW)
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── CHANGELOG.md
└── supabase-migrations/  # Database migrations
    └── 001_error_logs.sql (NEW)
```

---

## 🔍 Monitoring

### Health Check

**Endpoint:** `/api/health`

View system status at:
```
Local: http://localhost:3000/api/health
Production: https://life-dashboard-ri1t.vercel.app/api/health
```

**Features:**
- Beautiful HTML dashboard (browsers)
- JSON API (monitoring tools)
- Auto-refresh every 30 seconds
- Checks: database, auth, calendar, system

### Error Logs

Errors automatically logged to Supabase `error_logs` table.

**Query recent errors:**
```sql
SELECT * FROM error_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🤝 Contributing

Currently a solo project, but contributions welcome!

**Before contributing:**
1. Read [DEVELOPMENT.md](docs/DEVELOPMENT.md)
2. Check [ARCHITECTURE.md](docs/ARCHITECTURE.md)
3. Follow existing code style
4. Test locally before pushing

**Commit message format:**
```
<type>: <description>

Types: feat, fix, docs, refactor, test, chore
```

---

## 📊 Performance

**Bundle Size:** ~215KB (compressed)  
**API Response:** < 100ms (database queries)  
**Health Check:** < 500ms  
**Error Logging:** < 10ms overhead  

**Optimizations:**
- Server-side rendering
- Automatic code splitting
- Database query indexing
- Efficient error boundaries

---

## 🔐 Security

**Implemented:**
- Row-level security (RLS) on all tables
- HTTPS enforced (Vercel)
- HTTP-only session cookies
- OAuth tokens encrypted at rest
- Environment variables secured

**Roadmap:**
- Rate limiting (Phase 2)
- CSRF protection (Phase 4)
- 2FA support (Future)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Calendar API](https://developers.google.com/calendar) - Calendar integration

---

## 📞 Support

**Issues:** [GitHub Issues](https://github.com/mllivingston/life-dashboard/issues)  
**Documentation:** [docs/](docs/)  
**Health Check:** [/api/health](https://life-dashboard-ri1t.vercel.app/api/health)

---

## 📈 Stats

**Development Time:**
- Phase 1: 45 minutes (vs 2 hours estimated)
- With AI assistance: 4x faster development
- Total project: ~8 hours (projected)

**Code Quality:**
- ✅ Error handling: Enterprise-grade
- ✅ Database security: RLS enabled
- ✅ Code organization: Modular
- ✅ Documentation: Comprehensive

---

**Made with ❤️ and lots of ☕**

_Last updated: October 29, 2025_
