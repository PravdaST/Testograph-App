# Quick Start Guide - Meal Planner

## 🚀 Getting Started (2 minutes)

### Step 1: Open the Tool
Navigate to: `/meal-planner/index.html` in your browser

### Step 2: Enter Your Data
Fill in the form:
- **Възраст (Age)**: Your age in years (18-100)
- **Тегло (Weight)**: Your weight in kg
- **Цел (Goal)**:
  - `Увеличаване на маса` = Build muscle (+15% calories)
  - `Поддържане` = Maintain weight
  - `Отслабване` = Lose fat (-15% calories)
- **Бюджет (Budget)**:
  - `Бюджетен` = Budget-friendly meals
  - `Стандартен` = Balanced options
  - `Премиум` = Higher quality ingredients

### Step 3: Generate Your Plan
Click **"Генерирай План"** button

### Step 4: View Your Results
You'll see:
- 📊 **Stats Dashboard** - Your macro targets and averages
- 📅 **30-Day Calendar** - All your meals organized by day
- 🛒 **Shopping Lists** - Organized by week and category

### Step 5: Explore Details
- Click any **day card** to see full meal details with ingredients
- Switch **shopping list weeks** using the tabs
- Check off items as you shop

### Step 6: Save or Export
- **Download PDF**: Click "Изтегли PDF" for printable version
- **Save to Profile**: Click "Запази в профил" (requires login)
- **Create New Plan**: Click "Нов план" to start over

## 📝 Example Use Case

**User Profile:**
- Age: 30 years
- Weight: 80 kg
- Goal: Увеличаване на маса (Bulk)
- Budget: Стандартен (Standard)

**Result:**
- Calories: ~3200 kcal/day
- Protein: 160g (2g per kg)
- Fat: 124g (35% of calories)
- Carbs: 348g (remaining)

**Sample Day:**
- 🌅 Закуска: Протеинови палачинки с боровинки
- ☀️ Обяд: Пилешки гърди с ориз и броколи
- 🌙 Вечеря: Пилешка супа с ориз и зеленчуци
- 🍎 Снакс: Протеинов бар

## 🎯 Tips for Best Results

### For Muscle Building (Bulk)
- Choose `Увеличаване на маса`
- Focus on protein-rich meals
- Don't skip snacks
- Stay consistent for 30 days

### For Fat Loss (Cut)
- Choose `Отслабване`
- Meal prep for the week
- Track your portions
- Stay hydrated

### For Maintenance
- Choose `Поддържане`
- Use as template for variety
- Adjust portions as needed

## 🛒 Shopping Strategy

### Week 1 Approach:
1. Open **Седмица 1** shopping list
2. Group items by store sections
3. Check your pantry first
4. Buy in bulk for staples (rice, oats, eggs)

### Budget Tips:
- Choose `Бюджетен` tier
- Buy seasonal vegetables
- Use frozen fish/meat
- Prep meals in batches

### Premium Tips:
- Choose `Премиум` tier
- Focus on wild-caught fish
- Organic vegetables when possible
- Grass-fed meats

## 📱 Mobile Usage

The app is fully mobile-responsive:
- Swipe through calendar days
- Tap cards for details
- Use checkboxes in shopping lists
- Download PDF for offline access

## 🔄 Updating Your Plan

When to create a new plan:
- ✅ Goal changes (bulk → cut)
- ✅ Weight changes significantly (±5kg)
- ✅ Want variety in meals
- ✅ Budget changes
- ✅ Starting a new month

## ❓ FAQ

**Q: Can I customize individual meals?**
A: Currently no, but you can regenerate for different options.

**Q: Are macros exact?**
A: They're approximations. Daily totals average to your targets.

**Q: Can I use different price tiers per meal?**
A: No, one budget tier applies to all meals in the plan.

**Q: How accurate are the calculations?**
A: BMR uses Mifflin-St Jeor equation (assumes 175cm height). TDEE assumes moderate activity (1.55x).

**Q: Can I save multiple plans?**
A: Yes, with a Supabase account. Otherwise, one plan in localStorage.

**Q: Is this for weight training or general fitness?**
A: Optimized for testosterone and muscle building, but works for general fitness.

## 🔧 Troubleshooting

**Plan won't generate:**
- Check all fields are filled
- Age must be 18-100
- Weight must be positive number

**PDF won't download:**
- Check browser permissions
- Allow pop-ups from this site
- Try different browser

**Shopping list is empty:**
- Refresh the page
- Regenerate the plan
- Check browser console for errors

## 📊 Understanding Your Stats

### Calories
Your daily energy needs adjusted for your goal

### Protein (g/kg ratio)
2g per kg is optimal for muscle building and testosterone

### Fat Percentage
35% is ideal for hormone production (testosterone needs fat)

### Carbs
Fill remaining calories for energy and performance

## 🎉 Success Tips

1. **Prep on Sundays** - Cook for 3-4 days
2. **Use the checklist** - Don't forget ingredients
3. **Track progress** - Weigh weekly, adjust as needed
4. **Stay consistent** - 30 days minimum for results
5. **Mix with training** - Combine with proper exercise

## 📞 Need Help?

- Check `/meal-planner/README.md` for technical details
- Review `/meal-planner/IMPLEMENTATION_SUMMARY.md` for features
- Open browser console (F12) to see any errors

---

**Ready to optimize your nutrition? Start now! 🍽️💪**
