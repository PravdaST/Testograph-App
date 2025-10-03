# 30-Дневен План за Хранене (30-Day Meal Planner)

A complete meal planning tool that generates personalized 30-day meal plans with shopping lists, optimized for testosterone levels and fitness goals.

## Features

### Input Parameters
- **Age** (18-100 years)
- **Weight** (in kg)
- **Goal**:
  - Увеличаване на маса (Bulk - muscle gain)
  - Поддържане (Maintain)
  - Отслабване (Cut - fat loss)
- **Budget**:
  - Бюджетен (Budget)
  - Стандартен (Standard)
  - Премиум (Premium)

### Calculations

The tool uses scientifically-backed formulas:

```javascript
// BMR (Basal Metabolic Rate) - Assumes 175cm height
BMR = 10 × weight + 6.25 × 175 - 5 × age + 5

// TDEE (Total Daily Energy Expenditure) - Moderate activity level
TDEE = BMR × 1.55

// Goal adjustments
if (goal === "bulk") TDEE × 1.15    // +15% calories
if (goal === "cut") TDEE × 0.85     // -15% calories

// Macronutrients (optimized for testosterone)
Protein = weight × 2g               // 2g per kg bodyweight
Fat = (TDEE × 0.35) / 9            // 35% of calories
Carbs = remaining calories / 4      // Fill remainder
```

### Output Features

1. **Statistics Dashboard**
   - Target vs Average Calories
   - Daily Protein (g and g/kg ratio)
   - Carbohydrates (g and % of calories)
   - Fats (g and % of calories)

2. **30-Day Calendar View**
   - Daily meal cards with all 4 meals (breakfast, lunch, dinner, snack)
   - Total calories and macros per day
   - Click to view detailed meal information

3. **Shopping Lists**
   - Organized by week (4 weeks)
   - Categorized ingredients:
     - Месо и риба (Meat & Fish)
     - Яйца и млечни (Eggs & Dairy)
     - Плодове и зеленчуци (Fruits & Vegetables)
     - Зърнени (Grains)
     - Други (Other)
   - Interactive checkboxes

4. **Export & Save**
   - Download as PDF
   - Save to Supabase (if logged in)
   - Auto-save to localStorage

## Meal Database

The tool includes:
- **12 breakfast options** - Bulgarian staples like баница, яйца по панагюрски, омлет
- **15 lunch options** - Main meals with protein and complex carbs
- **15 dinner options** - Lighter evening meals
- **10 snack options** - Protein-rich snacks

Each meal includes:
- Name (Bulgarian)
- Macros (protein, carbs, fat in grams)
- Price tier (budget/standard/premium)
- Ingredient list

## Files Structure

```
meal-planner/
├── index.html          # Main HTML page
├── app.js             # Application logic
├── meals-data.js      # Meal database
├── styles.css         # Custom styles
└── README.md          # This file
```

## Dependencies

### JavaScript Libraries
- **jsPDF** - PDF generation (loaded dynamically)

### Shared Utilities
- `shared/js/storage.js` - localStorage management
- `shared/js/supabase-client.js` - Database operations
- `shared/js/analytics.js` - Event tracking
- `shared/js/pdf-utils.js` - PDF utilities

### Styles
- `shared/css/global.css` - Global styles
- Custom `styles.css` - Meal planner specific

## Usage

1. Open `index.html` in a web browser
2. Fill in your personal data:
   - Age
   - Weight (kg)
   - Goal (bulk/maintain/cut)
   - Budget preference
3. Click "Генерирай План" (Generate Plan)
4. View your personalized 30-day plan
5. Download PDF or save to account

## Analytics Events

The tool tracks:
- `plan_generated` - When a new plan is created
- `pdf_downloaded` - When PDF is exported
- `plan_saved` - When plan is saved

## Mobile Responsive

Fully responsive design:
- Desktop: Multi-column grid layouts
- Tablet: Adaptive grid
- Mobile: Single column, touch-friendly

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- Recipe instructions
- Meal prep guides
- Macro tracking integration
- Custom meal creation
- Meal swapping/substitution
- Allergy/preference filters
