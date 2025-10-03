# Supplement Timing Guide - Feature Specification

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│                 💪 Supplement Timing Guide               │
│        Персонализиран график за оптимизация             │
│                  на тестостерона                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ⏰ Време на събуждане: [07:00]                         │
│  🏋️ Време на тренировка: [Вечер (17-20) ▼]            │
│                                                          │
│  [🖨️ Принтирай график]  [🔄 Нулиране]                  │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬─────────────────┐
│ Общо добавки: 10 │ За тестостерон:5 │ За сън: 3       │
│ За тренировка: 2 │                  │                 │
└──────────────────┴──────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 📅 Вашият Персонализиран График          │
│                                                          │
│  07:00 ──────────────────────────────────────────       │
│     ┌──────────────────────────────────┐                │
│     │ 07:15 - TestoUP              💪 │                │
│     │ 2 капсули                        │                │
│     │ С храна                          │                │
│     │ Пиковото производство...         │                │
│     └──────────────────────────────────┘                │
│     ┌──────────────────────────────────┐                │
│     │ 07:15 - Vitamin D3           💪 │                │
│     │ 4000 IU                          │                │
│     │ С мазна храна                    │                │
│     └──────────────────────────────────┘                │
│                                                          │
│  17:30 (Pre-workout) ────────────────────────           │
│     ┌──────────────────────────────────┐                │
│     │ 17:30 - L-Carnitine          🏋️ │                │
│     │ 2 г                              │                │
│     │ На празен стомах                 │                │
│     └──────────────────────────────────┘                │
│                                                          │
│  18:15 (Post-workout) ────────────────────────          │
│     ┌──────────────────────────────────┐                │
│     │ 18:15 - Creatine             🏋️ │                │
│     │ 5 г                              │                │
│     └──────────────────────────────────┘                │
│                                                          │
│  21:30 ──────────────────────────────────────────       │
│     ┌──────────────────────────────────┐                │
│     │ 21:30 - Zinc                 💪 │                │
│     │ 15-30 mg                         │                │
│     │ С храна                          │                │
│     └──────────────────────────────────┘                │
│     ┌──────────────────────────────────┐                │
│     │ 21:30 - Magnesium            😴 │                │
│     │ 400 mg                           │                │
│     └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            ⚠️ НИКОГА НЕ КОМБИНИРАЙТЕ                    │
│                                                          │
│  ┃ Calcium + Zinc                                       │
│  ┃ Калцият и цинкът се конкурират за абсорбция.        │
│  ┃ Разделете приема им с поне 2 часа.                  │
│                                                          │
│  ┃ TestoUP + Coffee                                     │
│  ┃ Кафето може да намали абсорбцията на TestoUP.       │
│  ┃ Изчакайте 30-60 минути след приема.                 │
│                                                          │
│  ┃ Magnesium + Calcium                                  │
│  ┃ Магнезият и калцият се конкурират за абсорбция.     │
│                                                          │
│  ┃ Zinc + Iron                                          │
│  ┃ Желязото и цинкът се конкурират за абсорбция.       │
└─────────────────────────────────────────────────────────┘
```

## Color Coding System

### Categories
- **💪 Testosterone** - Orange/Red tones (#FF6B35, #FECA57)
  - TestoUP, Vitamin D3, Zinc, Omega-3, Boron, Ashwagandha

- **😴 Sleep** - Cool/Calming tones (#95E1D3, #A8E6CF)
  - Magnesium, Ashwagandha

- **🏋️ Workout** - Pink/Purple tones (#FF6B9D, #FF9A76)
  - Creatine, Vitamin C, L-Carnitine

### Severity Levels
- **High** (Red): Critical interactions - Calcium+Zinc, Zinc+Iron
- **Medium** (Yellow): Important warnings - TestoUP+Coffee, Mg+Ca
- **Low** (Green): Minor considerations

## Timing Logic Flow

```
User Input:
  ├─ Wake Time: 07:00
  └─ Workout Time: Evening (18:00)

↓

Calculate Times:
  ├─ Morning (Wake + 15min): 07:15
  │   └─ TestoUP, Vitamin D3, Omega-3, Boron
  │
  ├─ Pre-Workout (Workout - 30min): 17:30
  │   └─ L-Carnitine
  │
  ├─ Post-Workout (Workout + 15min): 18:15
  │   └─ Creatine, Vitamin C
  │
  └─ Evening (Wake + 14.5hrs): 21:30
      └─ Zinc, Magnesium, Ashwagandha

↓

Render Timeline:
  ├─ Group by hour
  ├─ Sort chronologically
  ├─ Apply color coding
  └─ Display with full details
```

## Data Structure

### Supplement Object
```javascript
{
  id: 1,
  name: "TestoUP",
  dosage: "2 капсули",
  timing: "morning",         // morning|evening|pre-workout|post-workout
  withFood: "С храна",
  withFat: false,           // true for fat-soluble vitamins
  category: "testosterone",  // testosterone|sleep|workout
  why: "Explanation...",
  color: "#FF6B35"          // Hex color for visual identification
}
```

### Interaction Object
```javascript
{
  supplements: ["Calcium", "Zinc"],
  warning: "Description of interaction",
  severity: "high"  // high|medium|low
}
```

## Print Output

When printed or exported to PDF:
- Clean, single-column layout
- No buttons or controls
- High contrast for readability
- Organized by time slots
- All supplement details included
- Interaction warnings prominent
- Date stamp and footer
- Professional formatting

## Responsive Breakpoints

- **Desktop** (1400px+): Full 3-column summary, wide timeline
- **Tablet** (768px-1400px): 2-column summary, medium timeline
- **Mobile** (<768px): Single column, stacked layout, simplified timeline

## LocalStorage Schema

```javascript
{
  supplementTimingSettings: {
    wakeTime: "07:00",
    workoutTime: "18:00"  // or null
  }
}
```

## Analytics Events

1. **page_view** - When app loads
   - Properties: { page: 'supplement_timing' }

2. **print_schedule** - When user prints/exports
   - Properties: { scheduleCount, wakeTime, hasWorkout }

3. **settings_changed** - When user updates settings
   - Properties: { field: 'wakeTime'|'workoutTime', value }

## Browser Requirements

- ES6+ JavaScript (async/await, arrow functions, template literals)
- CSS Grid and Flexbox
- LocalStorage API
- Print media queries
- Optional: jsPDF for PDF generation

## File Size Budget

- **HTML**: ~3KB
- **CSS**: ~8KB
- **JavaScript**: ~15KB
- **Data**: ~5KB
- **Total**: ~31KB (excluding shared utilities)

Fast load, no external dependencies (except optional jsPDF for PDF export).
