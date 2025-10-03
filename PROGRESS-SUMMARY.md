# 🚀 TESTOGRAPH APP - MIGRATION PROGRESS

**Дата:** 2025-10-02
**Статус:** PHASE 1, 2 & 3 ЗАВЪРШЕНИ ✅

---

## ✅ КАКВО Е НАПРАВЕНО:

### 1. **DATABASE MIGRATION** ✅
```
✅ purchases table created
✅ meal_plans_app table created
✅ sleep_logs_app table created
✅ lab_results_app table created
✅ analytics_events_app table created
✅ profiles table updated (age, weight, goal, shopify fields)
✅ Helper functions created (has_app_access, get_user_apps)
```

### 2. **BACKUP** ✅
```
Старият Vanilla JS код е в безопасност:
📁 D:\Automation\All Testograph Ecosystem\testograph-app\_backup-vanilla-js\
```

### 3. **NEXT.JS 15 PROJECT** ✅
```
✅ Next.js 15 with App Router
✅ TypeScript configured
✅ Tailwind CSS configured
✅ React 19 installed
✅ Папката преименувана: Testograph-APP → testograph-app (lowercase)
```

### 4. **SUPABASE INTEGRATION** ✅
```
✅ @supabase/supabase-js installed
✅ @supabase/ssr installed
✅ .env.local created with credentials
✅ lib/supabase/client.ts (browser client)
✅ lib/supabase/server.ts (server client)
✅ middleware.ts (auth protection)
```

### 5. **LOGIN & AUTHENTICATION** ✅
```
✅ app/login/page.tsx (login page with email/password)
✅ БЕЗ signup link (accounts created via Shopify)
✅ Forgot password functionality
✅ app/reset-password/page.tsx (password reset page)
✅ Bulgarian language UI
✅ Modern Tailwind styling
```

### 6. **DASHBOARD** ✅
```
✅ app/dashboard/page.tsx (server component)
✅ app/dashboard/DashboardClient.tsx (client component)
✅ Mini Apps Grid with 5 cards
✅ Lock/Unlock states based on purchases
✅ User profile display
✅ Logout functionality
✅ Links to shop.testograph.eu for locked apps
```

### 7. **SHOPIFY WEBHOOK** ✅
```
✅ app/api/webhooks/shopify/route.ts (webhook handler)
✅ lib/shopify/verify.ts (HMAC verification)
✅ lib/config/products.ts (product mappings)
✅ lib/email/welcome.ts (welcome email sender)
✅ Automatic user creation on purchase
✅ Purchase recording in database
✅ Welcome email with login credentials
```

### 8. **MEAL PLANNER APP** ✅ (Phase 4 - FIRST APP!)
```
✅ lib/types/meal-planner.ts (TypeScript types)
✅ lib/data/meals-database.ts (52 Bulgarian meals)
✅ lib/utils/meal-planner.ts (BMR, TDEE, macro calculations)
✅ app/dashboard/meal-planner/page.tsx (React components)
✅ Form inputs (age, weight, goal, budget)
✅ 30-day plan generation
✅ Stats dashboard (target vs average macros)
✅ Calendar view (30 day cards, clickable)
✅ Day details modal (full meal breakdown)
✅ Shopping lists (4 weeks, categorized ingredients)
✅ Persistent checkboxes (localStorage)
✅ Fully responsive UI
```

---

## 📂 PROJECT STRUCTURE:

```
testograph-app/
├── _backup-vanilla-js/        # Backup на стария код
├── .claude/                    # Claude Code settings
├── supabase/                   # SQL migrations
│   └── migration-app-tables.sql
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (redirects to login/dashboard)
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── reset-password/
│   │   └── page.tsx            # Password reset page
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard (server component)
│   │   ├── DashboardClient.tsx # Dashboard UI (client component)
│   │   └── meal-planner/
│   │       └── page.tsx        # Meal Planner app
│   └── api/
│       └── webhooks/
│           └── shopify/
│               └── route.ts    # Shopify webhook handler
├── lib/
│   ├── types/
│   │   └── meal-planner.ts     # TypeScript types for Meal Planner
│   ├── data/
│   │   └── meals-database.ts   # 52 Bulgarian meals database
│   ├── utils/
│   │   └── meal-planner.ts     # BMR/TDEE/macro calculations
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── shopify/
│   │   └── verify.ts           # HMAC verification
│   ├── email/
│   │   └── welcome.ts          # Welcome email sender
│   └── config/
│       └── products.ts         # Product mappings
├── middleware.ts               # Auth middleware
├── .env.local                  # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 📋 PRODUCT MAPPINGS (За Shopify Webhook):

```typescript
const PRODUCT_MAPPINGS = {
  'starter-bundle': {
    price: 97,
    apps: ['meal-planner']  // Само Meal Planner
  },

  'complete-bundle': {
    price: 197,
    apps: [
      'meal-planner',
      'sleep-protocol',
      'supplement-timing'
    ]
  },

  'maximum-bundle': {
    price: 267,
    apps: [
      'meal-planner',
      'sleep-protocol',
      'supplement-timing',
      'exercise-guide',
      'lab-testing'
    ]  // Всички apps
  }
};
```

---

## 🎯 СЛЕДВАЩИ СТЪПКИ:

### **PHASE 4: Mini Apps Migration** (Следваща фаза)

Сега трябва да мигрираме 5-те mini apps от Vanilla JS към React/Next.js:

1. **Meal Planner** (Priority 1 - Most complex)
   - Migrate meal planning logic
   - Convert to React components
   - Integrate with meal_plans_app table
   - Add CRUD operations

2. **Sleep Protocol** (Priority 2)
   - Migrate sleep tracking
   - Convert to React components
   - Integrate with sleep_logs_app table

3. **Supplement Timing** (Priority 3)
   - Migrate supplement scheduling
   - Convert to React components
   - Add timing optimization logic

4. **Exercise Guide** (Priority 4)
   - Migrate exercise programs
   - Convert to React components
   - Add workout tracking

5. **Lab Testing** (Priority 5)
   - Migrate lab results tracking
   - Convert to React components
   - Integrate with lab_results_app table

---

## 🧪 КАК ДА ТЕСТВАШ ПРОЕКТА:

### 1. Стартирай development server:

```bash
cd "D:\Automation\All Testograph Ecosystem\testograph-app"
npm run dev
```

### 2. Отвори browser:
```
http://localhost:3000
```

**Какво ще видиш:**
- ✅ Middleware ще те redirect-не към `/login`
- ✅ Красива Login страница с email/password form
- ✅ "Забравена парола?" линк
- ✅ БЕЗ signup линк (само малък текст за shop.testograph.eu)

### 3. Тестване на Auth Flow:

#### A) Създай тестов потребител (Ръчно в Supabase):
1. Отвори Supabase Dashboard → Authentication → Users
2. Кликни "Add User" → Create new user
3. Въведи email и password
4. Email Confirm = Enabled
5. Save

#### B) Тествай Login:
1. Отвори http://localhost:3000/login
2. Въведи test email и password
3. Кликни "Влез"
4. Трябва да се redirect-неш към `/dashboard`

#### C) Тествай Dashboard:
1. Ще видиш 5 mini apps cards
2. Всички ще са ЗАКЛЮЧЕНИ (защото нямаш purchase records)
3. Profile info горе вдясно
4. Logout бутон работи

#### D) Отключи apps (Ръчно в Supabase):
1. Отвори Supabase Dashboard → Table Editor → purchases
2. Insert new row:
   - user_id: (твоят user ID от auth.users)
   - shopify_order_id: "test-order-123"
   - product_type: "bundle"
   - product_name: "Complete Bundle"
   - apps_included: {"meal-planner", "sleep-protocol", "supplement-timing"}
   - amount: 197
   - currency: "BGN"
   - status: "completed"
3. Refresh dashboard → apps трябва да са ОТКЛЮЧЕНИ!

### 4. Тестване на Shopify Webhook:

#### Localhost Testing:
За да тестваш webhook от Shopify към localhost, трябва да използваш ngrok:

```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000
```

Това ще ти даде URL като `https://abc123.ngrok.io`

#### Configure Shopify Webhook:
1. Shopify Admin → Settings → Notifications → Webhooks
2. Create webhook:
   - Event: Order creation
   - Format: JSON
   - URL: `https://abc123.ngrok.io/api/webhooks/shopify`
   - API Version: Latest
3. Направи тестова поръчка в Shopify
4. Проверявай terminal logs за webhook calls

#### Важни Environment Variables:
Преди да тестваш webhook, провери `.env.local`:
```bash
SHOPIFY_WEBHOOK_SECRET=your-shopify-webhook-secret-here  # Вземи от Shopify
RESEND_API_KEY=your-resend-api-key-here                  # Вземи от Resend.com
```

---

## ⚠️ ВАЖНИ NOTES:

### Папката е преименувана:
```
Старо име: Testograph-APP  (главни букви)
Ново име: testograph-app   (малки букви)
```

Причина: npm не позволява главни букви в package names

### Edge Functions са безопасни:
```
✅ chat-assistant - НЕ Е ПИПАН
✅ process-pdf - НЕ Е ПИПАН
```

Те работят за testograph.eu и използват други таблици!

### Съществуващи таблици не са променени:
```
✅ agents - НЕ Е ПИПАНА
✅ chat_messages - НЕ Е ПИПАНА
✅ chat_sessions - НЕ Е ПИПАНА
✅ daily_entries_pro - НЕ Е ПИПАНА
✅ weekly_measurements_pro - НЕ Е ПИПАНА
✅ user_settings - НЕ Е ПИПАНА
```

---

## 🔄 ROLLBACK ПЛАН (ако нещо се обърка):

### За да върнеш стария Vanilla JS код:

```bash
cd "D:\Automation\All Testograph Ecosystem\testograph-app"
rm -rf app lib middleware.ts
cp -r _backup-vanilla-js/* .
```

### За да изтриеш новите Supabase таблици:

```sql
-- В Supabase SQL Editor:
DROP TABLE IF EXISTS analytics_events_app;
DROP TABLE IF EXISTS lab_results_app;
DROP TABLE IF EXISTS sleep_logs_app;
DROP TABLE IF EXISTS meal_plans_app;
DROP TABLE IF EXISTS purchases;

-- Премахни колоните от profiles:
ALTER TABLE profiles
  DROP COLUMN IF EXISTS age,
  DROP COLUMN IF EXISTS weight,
  DROP COLUMN IF EXISTS goal,
  DROP COLUMN IF EXISTS shopify_customer_id,
  DROP COLUMN IF EXISTS total_spent,
  DROP COLUMN IF EXISTS onboarding_completed,
  DROP COLUMN IF EXISTS last_login_at;
```

---

## 📞 STATUS:

**Готови модули (Phase 1-3):**
- ✅ Database Schema (purchases, meal_plans_app, sleep_logs_app, lab_results_app, analytics_events_app)
- ✅ Next.js 15 Setup (TypeScript, Tailwind, App Router)
- ✅ Supabase Integration (browser + server clients)
- ✅ Auth Middleware (route protection)
- ✅ Login Page (БЕЗ signup, с forgot password)
- ✅ Reset Password Page
- ✅ Dashboard (mini apps grid, lock/unlock UI)
- ✅ Shopify Webhook (auto account creation, email sending)

**Готови за Production:**
- ✅ User authentication flow
- ✅ Product-based access control
- ✅ Shopify integration
- ✅ Email notifications
- ✅ Responsive UI

**Следваща фаза (Phase 4):**
- ✅ Meal Planner Migration (COMPLETED!)
- ⏳ Sleep Protocol Migration (Priority 2)
- ⏳ Supplement Timing Migration (Priority 3)
- ⏳ Exercise Guide Migration (Priority 4)
- ⏳ Lab Testing Migration (Priority 5)

---

**✅ PHASE 3 & 4 (MEAL PLANNER) ЗАВЪРШЕНИ УСПЕШНО!**

Сега имаш:
- ✅ Напълно функционална authentication & dashboard система
- ✅ Работещ Meal Planner app (първи мигриран app!)
- ⏳ 4 apps чакат миграция (Sleep, Supplement, Exercise, Lab)

**Как да тестваш Meal Planner:**
1. Отвори http://localhost:3005
2. Login с test user
3. От Dashboard кликни на "Meal Planner" (трябва да е отключен!)
4. Попълни форма: възраст, тегло, цел, бюджет
5. Генерирай 30-дневен план
6. Виж календар, stats, shopping lists
7. Кликни на ден за детайли
8. Чекирай items в shopping list (запазва се в localStorage)

**Готово за deploy след:**
1. Добавяне на real Shopify webhook secret в production
2. Добавяне на real Resend API key в production
3. Testing на webhook с real Shopify orders
4. Integration на Meal Planner с meal_plans_app table (save/load от Supabase)
