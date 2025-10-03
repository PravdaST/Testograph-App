# 🚀 TESTOGRAPH APP - DATABASE MIGRATION ИНСТРУКЦИИ

**⚠️ ВАЖНО:** Следвай стъпките ТОЧНО както са описани!

---

## 📋 ЩО ПРАВИ ТАЗИ МИГРАЦИЯ:

### ✅ СЪЗДАВА НОВИ ТАБЛИЦИ (с `_app` суфикс):
- `purchases` - Shopify покупки и app достъп
- `meal_plans_app` - Meal Planner данни
- `sleep_logs_app` - Sleep Protocol данни
- `lab_results_app` - Lab Testing данни
- `analytics_events_app` - Analytics tracking

### ✅ ДОБАВЯ КОЛОНИ КЪМ PROFILES:
- `age`, `weight`, `goal` - за mini apps
- `shopify_customer_id`, `total_spent` - за Shopify
- `onboarding_completed`, `last_login_at` - за UX

### ✅ СЪЗДАВА HELPER FUNCTIONS:
- `has_app_access(user_id, app_slug)` - проверка за достъп
- `get_user_apps(user_id)` - списък с отключени apps

### ❌ НЕ ПРОМЕНЯ СЪЩЕСТВУВАЩИ ТАБЛИЦИ:
- `agents`, `chat_messages`, `chat_sessions` - НЕ СЕ ПИПАТ
- `daily_entries_pro`, `weekly_measurements_pro` - НЕ СЕ ПИПАТ
- `user_settings` - НЕ СЕ ПИПА

---

## 🔧 СТЪПКА 1: ОТВОРИ SUPABASE DASHBOARD

1. Отиди на: https://supabase.com/dashboard
2. Влез с твоя account
3. Избери проект: **mrpsaqtmucxpawajfxfn**

---

## 📝 СТЪПКА 2: ОТВОРИ SQL EDITOR

1. От лявото меню кликни на: **SQL Editor**
2. Кликни на: **New query** (горе вдясно)

---

## 📄 СТЪПКА 3: КОПИРАЙ SQL MIGRATION

1. Отвори файла:
   ```
   D:\Automation\All Testograph Ecosystem\Testograph-APP\supabase\migration-app-tables.sql
   ```

2. Маркирай **ЦЕЛИЯ ФАЙЛ** (Ctrl+A)

3. Копирай го (Ctrl+C)

4. Върни се в Supabase SQL Editor

5. Постави в празното поле (Ctrl+V)

---

## ▶️ СТЪПКА 4: ИЗПЪЛНИ MIGRATION

1. Провери че SQL кодът е копиран правилно

2. Кликни бутона: **Run** (долу вдясно)

3. Изчакай да се изпълни (може да отнеме 10-15 секунди)

---

## ✅ СТЪПКА 5: ПРОВЕРИ ЗА УСПЕХ

След като migration-ът завърши, трябва да видиш:

### **Success Message:**
```
Success. No rows returned
```

Или:

```
Migration completed successfully
```

### **Ако има грешка:**
- Направи screenshot на грешката
- Копирай цялото съобщение
- Изпрати го тук в чата
- НЕ ИЗПЪЛНЯВАЙ migration-а втори път!

---

## 🔍 СТЪПКА 6: ПРОВЕРИ ТАБЛИЦИТЕ

1. От лявото меню кликни на: **Table Editor**

2. Трябва да видиш НОВИТЕ таблици:
   - `purchases`
   - `meal_plans_app`
   - `sleep_logs_app`
   - `lab_results_app`
   - `analytics_events_app`

3. Кликни на `profiles` таблица

4. Кликни на иконката за колоните (column icon)

5. Scroll надолу - трябва да видиш НОВИТЕ колони:
   - `age`
   - `weight`
   - `goal`
   - `shopify_customer_id`
   - `total_spent`
   - `onboarding_completed`
   - `last_login_at`

---

## 📸 СТЪПКА 7: ПОТВЪРДИ УСПЕХ

След като проверíш таблиците, напиши в чата:

```
✅ Migration изпълнен успешно! Всички таблици са създадени.
```

Или ако има проблем:

```
❌ Има грешка: [копирай грешката тук]
```

---

## 🆘 АКО НЕЩО СЕ ОБЪРКА:

### Ако случайно изпълниш migration-а 2 пъти:
- Не се притеснявай! SQL-ът е написан да бъде **idempotent**
- Използва `IF NOT EXISTS` и `DROP POLICY IF EXISTS`
- Може да се изпълни многократно без проблем

### Ако някои таблици вече съществуват:
- SQL-ът автоматично ще ги пропусне
- Ще създаде само липсващите

### Ако получиш Permission Error:
- Уверíse че си влязъл с правилния Supabase account
- Уверíse че си избрал правилния проект

---

## 📞 ГОТОВ ЛИ СИ?

След като изпълниш migration-а успешно, напиши в чата и ще продължим със създаването на Next.js проекта! 🚀

---

**ТИ СИ НА РЪКА СЕГА - УСПЕХ!** 💪
