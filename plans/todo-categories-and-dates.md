# To Do List: Categories & Due Dates

**Date:** 2025-10-30  
**Status:** 📋 Planning  
**Estimated:** ~3 hours

---

## Requirements

**From user:**
1. **Categories** - Add/edit/delete categories. Each todo can have 0 or 1 category (not multiple). Can assign at creation or later.
2. **Due Dates** - Optional due date per todo. One date max. Can add at creation or later. Can edit/delete anytime.

---

## Problem

Current todo list is too basic - no organization (categories) and no urgency (due dates). Users can't:
- Group related tasks
- Prioritize by deadline
- See what's overdue

---

## Technical Approach

### Database Changes

**Add to `todos` table:**
```sql
ALTER TABLE todos
ADD COLUMN category_id UUID REFERENCES categories(id),
ADD COLUMN due_date DATE;

CREATE INDEX idx_todos_category ON todos(category_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
```

**New `categories` table:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT, -- Optional: hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_user ON categories(user_id);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own categories"
ON categories FOR ALL
USING (auth.uid() = user_id);
```

### API Routes

**New routes:**
- `POST /api/categories` - Create category
- `GET /api/categories` - List user's categories
- `PATCH /api/categories/[id]` - Edit category
- `DELETE /api/categories/[id]` - Delete category

**Update existing:**
- `POST /api/todos` - Accept `category_id` and `due_date`
- `PATCH /api/todos/[id]` - Allow updating category and due date

### UI Changes

**TodoList component:**
- Add category dropdown (with "None" option)
- Add date picker for due date (with "No date" option)
- Show category badge on each todo
- Show due date on each todo
- Highlight overdue items (due date < today)
- Add "Edit" mode for todos

**New CategoryManager component:**
- List all categories
- Add new category button
- Edit/delete category buttons
- Optional: color picker per category

**Layout:**
```
┌─────────────────────────────────────┐
│ Categories: [Manage]                │
│ ┌─────────┬─────────┬─────────┐   │
│ │ Work    │ Personal│ Errands │   │
│ └─────────┴─────────┴─────────┘   │
│                                     │
│ Add Todo:                           │
│ [Task input___________________]     │
│ Category: [Dropdown▼] Due: [📅]    │
│ [Add]                               │
│                                     │
│ ☐ Buy milk                          │
│   📦 Errands | 📅 Oct 31            │
│   [Edit] [Delete]                   │
│                                     │
│ ☐ Finish report (OVERDUE!)          │
│   💼 Work | 📅 Oct 29               │
│   [Edit] [Delete]                   │
└─────────────────────────────────────┘
```

---

## Files to Create/Modify

**Create:**
- `supabase-migrations/002_categories_and_dates.sql`
- `app/api/categories/route.js`
- `app/api/categories/[id]/route.js`
- `components/CategoryManager.js`

**Modify:**
- `components/TodoList.js` - Add category dropdown, date picker, edit mode
- `app/api/todos/route.js` - Accept category_id and due_date

**Dependencies (if needed):**
- `react-datepicker` or use native `<input type="date">`

---

## Success Criteria

✅ User can create a category  
✅ User can assign category to new todo  
✅ User can assign category to existing todo  
✅ User can remove category from todo (set to null)  
✅ User can edit category name  
✅ User can delete category (todos keep category_id or set to null?)  
✅ User can add due date to new todo  
✅ User can add due date to existing todo  
✅ User can remove due date from todo  
✅ Overdue todos are visually distinct  
✅ All changes persist in database  

---

## Key Decisions

### Decision 1: What happens when category is deleted?

**Options:**
- A) Set todo.category_id to NULL (todos become uncategorized)
- B) Block deletion if category has todos
- C) Cascade delete (delete all todos in category - dangerous!)

**Choice:** **A** - Set to NULL  
**Why:** Most flexible. Users can delete categories without losing todos.

**Implementation:**
```sql
ALTER TABLE todos
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE SET NULL;
```

### Decision 2: Date storage format?

**Options:**
- A) DATE (stores date only: 2025-10-31)
- B) TIMESTAMPTZ (stores date + time + timezone)

**Choice:** **A** - DATE  
**Why:** Requirements say "due date" not "due datetime". Simpler. No timezone complexity.

### Decision 3: Category color in MVP?

**Options:**
- A) Yes - Allow users to pick colors
- B) No - Auto-assign colors from preset list
- C) No colors - Just text labels

**Choice:** **C** - No colors for MVP  
**Why:** Requirements don't mention colors. Can add later. Keep simple.

---

## What We're NOT Doing

- ❌ Multiple categories per todo (requirements: one category max)
- ❌ Category colors (not in requirements)
- ❌ Recurring due dates (not in requirements)
- ❌ Due date + time (just date)
- ❌ Reminders/notifications (not in requirements)
- ❌ Category hierarchy (subcategories)
- ❌ Sorting by category or due date (can add later)
- ❌ Filtering by category (can add later)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Deleting category breaks UI | Use ON DELETE SET NULL |
| Date picker doesn't work on all browsers | Use native `<input type="date">` (widely supported) |
| Migration fails in production | Test in local Supabase first, backup before migration |
| Users confused by edit mode | Clear edit/cancel buttons, auto-save on blur |

---

## Testing Plan

**Manual tests:**
1. Create category "Work"
2. Create todo "Finish report" with category "Work" and due date "2025-10-31"
3. Create todo "Buy milk" with no category and no date
4. Edit "Buy milk" - add category "Errands", add due date "2025-11-01"
5. Edit category "Work" → rename to "Job"
6. Delete category "Job" → verify "Finish report" has no category
7. Remove due date from "Buy milk"
8. Create todo with due date in past → verify shows as overdue

**Database tests:**
```sql
-- Verify category foreign key works
SELECT * FROM todos WHERE category_id = 'uuid';

-- Verify ON DELETE SET NULL works
DELETE FROM categories WHERE id = 'uuid';
SELECT category_id FROM todos; -- Should be NULL
```

---

## Rollback

If this breaks:
```sql
-- Remove columns
ALTER TABLE todos
DROP COLUMN category_id,
DROP COLUMN due_date;

-- Drop table
DROP TABLE categories;
```

Time: 5 minutes

---

## Approval Checklist

- [x] Requirements clear?
- [x] Simplest approach?
- [x] Success criteria measurable?
- [x] Scope limited?
- [ ] **APPROVED TO START?** ⬅️ YOUR DECISION

---

**Estimated breakdown:**
- Database migration: 30 min
- API routes: 1 hour
- UI updates: 1.5 hours
- Testing: 30 min
- **Total: ~3 hours**

**Ready for your review and approval.**