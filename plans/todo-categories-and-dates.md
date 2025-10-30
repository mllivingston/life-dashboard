# Plan: To-Do Categories & Due Dates

**Date:** 2025-10-30  
**Status:** Planning (No code yet)

---

## Requirements

**From user:**

1. **Categories**
   - Users can add/edit/delete categories
   - Each to-do has 0 or 1 category (no multiple)
   - Can assign category at creation OR later
   - Can edit/delete category anytime

2. **Due Dates**
   - Each to-do has 0 or 1 due date (optional)
   - Can add at creation OR later
   - Can edit/delete anytime

---

## What We're Building

**Problem:** Current to-do list is too basic - no organization, no deadlines

**Success:** 
- Users can categorize to-dos (Work, Personal, etc.)
- Users can set due dates
- Users can manage both after creation

---

## Database Changes

### New Table: `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT, -- hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users see only their categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own categories"
ON categories FOR ALL
USING (auth.uid() = user_id);

-- Unique category names per user
CREATE UNIQUE INDEX categories_user_name 
ON categories(user_id, LOWER(name));
```

### Update Table: `todos`

```sql
-- Add new columns to existing todos table
ALTER TABLE todos 
  ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN due_date DATE; -- Just date, no time

-- Index for filtering by category
CREATE INDEX todos_category_id ON todos(category_id);

-- Index for filtering by due date
CREATE INDEX todos_due_date ON todos(due_date);
```

**Migration:** `supabase-migrations/002_todos_categories_dates.sql`

---

## API Changes

### New Endpoints

**Categories CRUD:**
- `GET /api/categories` - List user's categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

**Todos (existing, modify):**
- `GET /api/todos` - Add category/due_date to response
- `POST /api/todos` - Accept optional category_id, due_date
- `PATCH /api/todos/[id]` - Allow updating category_id, due_date

---

## UI Changes

### TodoList Component Updates

**Display:**
```
☐ Buy milk [Work] Due: Oct 31
☑ Call mom [Personal]
☐ Review PR [No category]
```

**Category indicator:** Badge with category name + color  
**Due date indicator:** Show if exists, highlight if overdue

### Add Todo Form

**Add fields:**
- Category dropdown (optional) - "None" or select existing
  - Link: "+ Create category" opens quick modal
- Due date picker (optional) - date input

### Edit Todo Form

**Same as add, plus:**
- Can change category (including remove)
- Can change due date (including remove)

### Category Management

**Simple UI (modal or separate section):**
- List all categories
- Inline edit (click name to edit)
- Delete button (confirm if todos exist)
- Create new (name + color picker)

---

## Files to Create

```
app/api/categories/
  ├── route.js              # GET, POST
  └── [id]/
      └── route.js          # PATCH, DELETE

components/
  ├── CategoryBadge.js     # Display category
  ├── CategoryManager.js   # CRUD categories
  └── DueDatePicker.js     # Date input

supabase-migrations/
  └── 002_todos_categories_dates.sql
```

## Files to Modify

```
components/TodoList.js
  - Add category display
  - Add due date display
  - Update add/edit forms
  - Integrate CategoryManager

app/api/todos/route.js
  - Return category info in GET
  - Accept category_id, due_date in POST
  
app/api/todos/[id]/route.js (if exists)
  - Accept category_id, due_date in PATCH
```

---

## Questions to Resolve

**Before coding:**

1. **Category colors:** Pre-defined list or free choice?
   - **Suggest:** 8 pre-defined colors (simpler UX)

2. **Due date display:** Show all or only upcoming?
   - **Suggest:** Show all, highlight if < 3 days or overdue

3. **Category deletion:** What if todos exist in that category?
   - **Suggest:** Set those todos to NULL (no category)
   - Alternative: Block deletion (requires reassignment)

4. **Default view:** Show all or filter by category?
   - **Suggest:** Show all, add category filter dropdown

5. **Sorting:** By due date or creation date?
   - **Suggest:** Default by creation, option to sort by due date

6. **Do we need "uncategorized" as explicit state?**
   - **Suggest:** No, NULL = no category is fine

**Your input needed on these ^ before I code**

---

## Validation Rules

**Categories:**
- Name: Required, 1-50 chars, unique per user
- Color: Optional hex code (if we use colors)

**Todos:**
- category_id: Optional, must exist in user's categories
- due_date: Optional, valid date format (YYYY-MM-DD)

---

## Testing Checklist

**Categories:**
- [ ] Create category
- [ ] Edit category name
- [ ] Delete category (no todos)
- [ ] Delete category (with todos) - behavior?
- [ ] Duplicate category name rejected

**Todos with categories:**
- [ ] Create todo with category
- [ ] Create todo without category
- [ ] Add category to existing todo
- [ ] Change todo's category
- [ ] Remove category from todo

**Todos with due dates:**
- [ ] Create todo with due date
- [ ] Create todo without due date
- [ ] Add due date to existing todo
- [ ] Change todo's due date
- [ ] Remove due date from todo

**Display:**
- [ ] Categories show correctly
- [ ] Due dates show correctly
- [ ] Overdue dates highlighted
- [ ] Can filter by category
- [ ] Can sort by due date

---

## Risks

**Low risk:**
- Additive changes (not breaking existing)
- Database migration is straightforward
- Can rollback by reverting migration

**Potential issues:**
- Category deletion with existing todos (need UX decision)
- Date handling across timezones (use DATE not TIMESTAMP)
- Color picker complexity (pre-defined colors simpler)

---

## Estimate

**Size:** 🟠 Large (~2 hours with AI)

**Breakdown:**
- Database migration: 15 min
- Category API: 30 min
- Todo API updates: 20 min
- UI components: 45 min
- Testing: 30 min

---

## Next Steps

**You decide:**
1. Answer questions above
2. Approve plan or request changes
3. If approved → I write code
4. If changes → I revise plan

**No code written until you approve** ✅
