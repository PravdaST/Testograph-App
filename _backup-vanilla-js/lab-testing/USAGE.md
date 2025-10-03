# Lab Testing Guide - Quick Start

## How to Use

### 1. Open the Application
Simply open `index.html` in your web browser:
```bash
open lab-testing/index.html
# or
firefox lab-testing/index.html
```

### 2. Navigation
The app has 4 main sections accessible via tabs:

#### 📍 Lab Directory
**Purpose**: Find testosterone testing labs in Bulgaria

**Steps**:
1. Click "Справочник Лаборатории" tab
2. Use city dropdown to filter by location
3. Use search box to find specific labs
4. View prices, hours, and contact info

**Example Search**:
- Filter: София
- Search: "МДЛ"
- Result: Shows all МДЛ labs in Sofia

#### 📋 Test Instructions
**Purpose**: Learn how to prepare for hormone testing

**Content**:
- Which tests to order (Total T, Free T, SHBG, etc.)
- When to go (7-9am, fasted)
- Preparation checklist (sleep, fasting, no training)
- Step-by-step lab visit guide

**Use Case**: Read this before your first lab visit

#### 📊 Results Interpreter
**Purpose**: Understand your test results

**Steps**:
1. Click "Интерпретатор" tab
2. Enter your age (e.g., 35)
3. Enter Total Testosterone in ng/dL (e.g., 550)
4. Optionally add:
   - Free Testosterone (pg/mL)
   - SHBG (nmol/L)
   - Estradiol (pg/mL)
5. Click "Анализирай Резултати"

**Example Input**:
```
Age: 32
Total T: 450 ng/dL
Free T: 12 pg/mL
SHBG: 45 nmol/L
Estradiol: 28 pg/mL
```

**Result**: Color-coded interpretation with recommendations

#### 📈 Progress Tracker
**Purpose**: Track testosterone levels over time

**Steps**:
1. Click "Проследяване" tab
2. Click "Добави резултат" button
3. Fill in the form:
   - Test Date (required)
   - Total T (required)
   - Other values (optional)
   - Notes (optional)
4. Click "Запази"

**Features**:
- View all results in a table
- Edit or delete existing results
- See improvement percentage
- Visualize progress with chart
- Export to CSV or PDF

## Sample Workflow

### First Time User
1. **Read Instructions** (Tab 2)
   - Learn what tests to order
   - Understand preparation requirements

2. **Find a Lab** (Tab 1)
   - Filter by your city
   - Note the price and hours
   - Call to confirm or just go

3. **Get Tested**
   - Go to lab 7-9am, fasted
   - Request "пълен хормонален панел"
   - Get results in 1-3 days

4. **Interpret Results** (Tab 3)
   - Enter your results
   - Get instant interpretation
   - Understand your status

5. **Track Progress** (Tab 4)
   - Save your first result
   - Return in 3-6 months
   - Compare improvement

### Returning User
1. **Get Retested**
   - Same lab, same time of day
   - Follow same preparation

2. **Add New Result** (Tab 4)
   - Click "Добави резултат"
   - Enter new values
   - Save

3. **View Progress**
   - See chart update automatically
   - Check improvement percentage
   - Export for records

## Data Management

### Local Storage
- All data saved to browser localStorage
- Persists between sessions
- Specific to this browser

### Export Options

**CSV Export**:
- Click "Експорт CSV" button
- Downloads: `testograph-results-YYYY-MM-DD.csv`
- Open in Excel/Google Sheets

**PDF Export**:
- Click "Експорт PDF" button
- Downloads: `testograph-lab-results.pdf`
- Share with doctor

### Data Privacy
- No data sent to servers
- Everything stored locally
- Can clear browser data to reset

## Tips & Best Practices

### For Accurate Results
1. **Consistent timing**: Always test at same time (7-9am)
2. **Same lab**: Use same lab for comparability
3. **Preparation**: Follow all prep instructions
4. **Frequency**: Test every 3-6 months
5. **Notes**: Add context (diet changes, training, etc.)

### Using the Interpreter
- Always enter Total T (most important)
- Free T and SHBG help understand bioavailability
- Estradiol important if converting too much T to E2
- Compare to age-specific ranges

### Tracking Progress
- Minimum 2 tests for comparison
- 3+ tests shows clear trends
- Chart helps visualize changes
- Export before clearing browser

## Troubleshooting

### Labs not showing?
- Check city filter (set to "Всички градове")
- Clear search box
- Refresh page

### Results not saving?
- Check required fields (Date, Total T)
- Ensure localStorage is enabled
- Try different browser

### Chart not displaying?
- Need at least 1 saved result
- Check if Chart.js loaded (refresh page)
- Try in different browser

### Export not working?
- Allow downloads in browser
- Check popup blocker
- Try CSV if PDF fails

## Reference Ranges

### Total Testosterone (ng/dL)
| Age | Optimal | Low | Clinical Low |
|-----|---------|-----|--------------|
| 20-30 | 600-900 | 300-599 | <300 |
| 30-40 | 500-800 | 270-499 | <270 |
| 40-50 | 450-700 | 250-449 | <250 |
| 50+ | 400-600 | 230-399 | <230 |

### Other Markers (General)
- **Free Testosterone**: 10-30 pg/mL (optimal)
- **SHBG**: 20-60 nmol/L (optimal)
- **Estradiol**: 10-40 pg/mL (men)
- **LH**: 1.5-9.3 mIU/mL

## Support

For questions or issues:
1. Check this USAGE guide
2. Read README.md for technical details
3. Refer to main TESTOGRAPH documentation

## Quick Command Reference

### Browser Console (for debugging)
```javascript
// View all saved results
JSON.parse(localStorage.getItem('lab_results'))

// Clear all data
localStorage.removeItem('lab_results')

// Check labs data
console.table(labsData)

// Check app instance
app
```

### File Locations
- Main app: `lab-testing/index.html`
- Lab data: `lab-testing/labs-data.js`
- Styles: `lab-testing/styles.css`
- Logic: `lab-testing/app.js`

---

**Last Updated**: 2025-10-02
**Version**: 1.0.0
