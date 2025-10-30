# Development Guide

How to develop, test, and debug Life Dashboard locally.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Console account
- Code editor

### Initial Setup

1. **Clone:**
```bash
git clone https://github.com/mllivingston/life-dashboard.git
cd life-dashboard
```

2. **Install:**
```bash
npm install
```

3. **Environment:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# NextAuth
NEXTAUTH_SECRET=generate_with_openssl
NEXTAUTH_URL=http://localhost:3000

# Logging
NEXT_PUBLIC_LOG_LEVEL=debug
```

4. **Database:**
Run migrations in Supabase SQL Editor:
- `supabase-setup.sql`
- `supabase-migrations/001_error_logs.sql`

5. **Run:**
```bash
npm run dev
```

6. **Open:** http://localhost:3000

---

## Development Workflow

See [WORKFLOW.md](./WORKFLOW.md) for detailed git and deployment workflow.

### Quick Guide

```bash
# Pull latest
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes, test, commit
git add .
git commit -m "feat: description"

# Push to create preview deployment
git push origin feature/my-feature

# Test on preview URL, then merge PR
```

---

## Testing

### Manual Testing Checklist

**Core Functionality:**
- [ ] App loads without errors
- [ ] Sign in/sign up works
- [ ] Calendar loads events
- [ ] Add/delete todos
- [ ] Add/delete grocery items
- [ ] Sign out works

**Error Handling:**
- [ ] Health endpoint shows status
- [ ] Error logs in Supabase
- [ ] Error boundaries work
- [ ] Components fail independently

**Responsive:**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1440px)

### Testing Health Check

```bash
curl http://localhost:3000/api/health | jq
```

### Testing Error Boundaries

Add test error:
```javascript
// In Calendar.js
if (true) throw new Error('TEST ERROR')
```

Expected: Calendar shows error, others work.

---

## Debugging

### Debug Workflow

1. Check browser console
2. Check health endpoint
3. Check error_logs table
4. Check Supabase logs
5. Check terminal

### Common Debug Commands

```bash
# Clear cache
rm -rf .next

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Debug logging
NEXT_PUBLIC_LOG_LEVEL=debug npm run dev
```

### Common Issues

**"Failed to fetch calendar"**
1. Check health endpoint - token expired?
2. Check google_tokens table
3. Check browser console
4. Try reconnecting

**"Logger not writing to database"**
1. Check RLS policies
2. Check Supabase credentials
3. Test manual insert

**"Health endpoint 503"**
1. Check tables exist
2. Verify Supabase connection
3. Run migrations

---

## Code Style

### JavaScript

```javascript
// Use const by default
const fetchData = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
  if (error) throw error
  return data
}
```

### React

```javascript
// Functional components with hooks
export default function TodoList({ userId }) {
  const [todos, setTodos] = useState([])
  
  useEffect(() => {
    fetchTodos()
  }, [userId])
  
  return <div>{/* JSX */}</div>
}
```

### Naming

- Components: `PascalCase.js`
- Utilities: `camelCase.js`
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`

---

## Common Tasks

### Add Component

1. Create `components/NewComponent.js`
2. Write component
3. Import in `app/page.js`
4. Wrap in ErrorBoundary
5. Test

### Add API Route

1. Create `app/api/endpoint/route.js`
2. Write handler
3. Test with curl

### Add Database Table

1. Create `supabase-migrations/00X_name.sql`
2. Write SQL with RLS
3. Run in Supabase
4. Test queries

---

## Troubleshooting

### Port 3000 in use

```bash
lsof -i :3000
kill -9 <PID>
# Or use different port
PORT=3001 npm run dev
```

### Module not found

```bash
npm install
# Check jsconfig.json
```

### Database connection fails

1. Check .env.local
2. Verify Supabase project active
3. Test connection:
```javascript
const { data } = await supabase.from('todos').select('count')
```

### OAuth not working

1. Check Google Cloud Console redirect URI
2. Must exactly match: `http://localhost:3000/api/auth/google/callback`
3. No trailing slash!

---

## Resources

**Internal:**
- [WORKFLOW.md](./WORKFLOW.md) - Git & deployment
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [ROADMAP.md](./ROADMAP.md) - What's next
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

**External:**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

_Happy coding! 🚀_
