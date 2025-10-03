# Supplement Timing Guide

## Overview
A personalized supplement timing visualization tool for testosterone optimization. Creates a 24-hour timeline showing exactly when to take each supplement based on your wake time and workout schedule.

## Features

### Input Controls
- **Wake Time**: Set your wake-up time (default: 07:00)
- **Workout Time**: Choose from Morning (7-10), Lunch (12-14), Evening (17-20), or Don't train

### Supplement Database
The tool includes 10 scientifically-backed supplements for testosterone optimization:

1. **TestoUP** (Morning) - Peak testosterone production support
2. **Vitamin D3** (Morning) - Fat-soluble, testosterone support
3. **Zinc** (Evening) - Critical for testosterone, improves sleep
4. **Magnesium** (Evening) - Sleep quality and muscle relaxation
5. **Omega-3** (Morning) - Hormonal health and inflammation reduction
6. **Creatine** (Post-workout) - Strength and muscle mass
7. **Ashwagandha** (Evening) - Cortisol reduction, sleep improvement
8. **Vitamin C** (Post-workout) - Post-workout cortisol reduction
9. **L-Carnitine** (Pre-workout) - Energy and fat burning
10. **Boron** (Morning) - Increases free testosterone

### Timeline Generation
- Automatically calculates optimal timing based on your schedule
- Shows exact time, dosage, and food requirements
- Explains WHY each supplement should be taken at that time
- Color-coded by category (testosterone, sleep, workout)

### Interaction Warnings
Displays critical supplement interactions to avoid:
- Calcium + Zinc (compete for absorption)
- TestoUP + Coffee (reduces absorption)
- Magnesium + Calcium (compete for absorption)
- Zinc + Iron (compete for absorption)
- Vitamin D3 + Vitamin A (high doses interfere)

### Export & Print
- **Print**: Browser-based printing with optimized layout
- **PDF**: Generate downloadable PDF schedule (when jsPDF is available)
- Print-friendly CSS for clean, professional output

## Technical Implementation

### Files Structure
```
supplement-timing/
├── index.html          # Main HTML structure
├── app.js             # Core application logic
├── supplements-data.js # Supplement database and interactions
├── styles.css         # Responsive styles with print support
└── README.md          # Documentation
```

### Integration
- Uses `shared/js/analytics.js` for usage tracking
- Uses `shared/js/pdf-utils.js` for PDF generation
- LocalStorage for saving user preferences

### Data Model
Each supplement includes:
- `name`: Supplement name
- `dosage`: Recommended dose
- `timing`: morning | evening | pre-workout | post-workout
- `withFood`: Food requirement description
- `withFat`: Boolean for fat-soluble vitamins
- `category`: testosterone | sleep | workout
- `why`: Scientific explanation
- `color`: Brand color for visual identification

## Usage

1. **Set Your Schedule**
   - Enter your wake time
   - Select your workout time (if applicable)
   - Settings auto-save to localStorage

2. **Review Your Timeline**
   - See all supplements organized by time
   - Read dosage and food requirements
   - Understand the scientific reasoning

3. **Check Interactions**
   - Review the "NEVER COMBINE" section
   - Plan supplement spacing accordingly

4. **Print or Export**
   - Print for refrigerator/bathroom mirror
   - Download PDF for mobile reference

## Timing Logic

### Morning Supplements (15 min after wake)
- TestoUP, Vitamin D3, Omega-3, Boron
- Aligned with natural testosterone peak

### Pre-Workout (30 min before)
- L-Carnitine
- Optimizes energy and fat burning

### Post-Workout (15 min after)
- Creatine, Vitamin C
- Or at lunch time if no workout scheduled

### Evening Supplements (1.5 hours before bed)
- Zinc, Magnesium, Ashwagandha
- Supports sleep and overnight testosterone production

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile/tablet
- Print-friendly across all devices

## Future Enhancements
- More supplement options
- Personalized recommendations based on goals
- Integration with meal planning
- Calendar export (ICS format)
- Supplement reminder notifications

## Credits
Built for testosterone optimization and health enthusiasts who want to maximize supplement effectiveness through proper timing.
