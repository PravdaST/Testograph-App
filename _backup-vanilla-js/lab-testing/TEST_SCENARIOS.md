# Lab Testing Guide - Test Scenarios

## Manual Testing Guide

### Scenario 1: Finding a Lab in Sofia
**Steps**:
1. Open `index.html` in browser
2. Click "Справочник Лаборатории" tab (should be active by default)
3. Select "София" from city dropdown
4. Observe: Table shows only Sofia labs

**Expected Results**:
- Shows 3 labs: МДЛ, Рамус, СМДЛ
- All have Sofia as city
- Prices range 78-92 лв for packages
- "Без час" badge shows for МДЛ and Рамус
- Website links present for all

**Pass Criteria**: ✅ Only Sofia labs visible, badges correct

---

### Scenario 2: Search for Specific Lab
**Steps**:
1. Clear city filter (set to "Всички градове")
2. Type "МДЛ" in search box
3. Observe: Real-time filtering

**Expected Results**:
- Shows 5 МДЛ labs (София, Пловдив, Варна, Бургас, Русе)
- All have МДЛ in name
- Same chain, different locations

**Pass Criteria**: ✅ Only МДЛ labs visible across all cities

---

### Scenario 3: Combined Filter
**Steps**:
1. Select "Пловдив" from city dropdown
2. Type "Здраве" in search box
3. Observe: Both filters applied

**Expected Results**:
- Shows 1 lab: "Лаборатория Здраве"
- City: Пловдив
- Package price: 75 лв
- "Без час" badge visible

**Pass Criteria**: ✅ Single lab matching both criteria

---

### Scenario 4: Interpret Optimal Results (Age 25)
**Steps**:
1. Click "Интерпретатор" tab
2. Enter values:
   - Age: 25
   - Total T: 750 ng/dL
   - Free T: 20 pg/mL
   - SHBG: 35 nmol/L
   - Estradiol: 25 pg/mL
3. Click "Анализирай Резултати"

**Expected Results**:
- Status: "Оптимален тестостерон" (GREEN card)
- Recommendation: "Поздравления! Вашият тестостерон е в оптималния диапазон..."
- Shows 750 ng/dL vs 600-900 optimal range
- All markers show ✓ (check marks)
- No warnings

**Pass Criteria**: ✅ Green status, positive message, all values optimal

---

### Scenario 5: Interpret Suboptimal Results (Age 35)
**Steps**:
1. Clear previous form
2. Enter values:
   - Age: 35
   - Total T: 400 ng/dL
   - Free T: 9 pg/mL
   - SHBG: 65 nmol/L
3. Click "Анализирай Резултати"

**Expected Results**:
- Status: "Под-оптимален тестостерон" (YELLOW card)
- Recommendation: "...под оптималното ниво. TESTOGRAPH ще помогне"
- Shows 400 ng/dL vs 500-800 optimal range
- Free T shows ⚠ (9 < 10 optimal)
- SHBG shows ⚠ (65 > 60 optimal)
- Warning: "Високо SHBG може да намали свободния тестостерон"

**Pass Criteria**: ✅ Yellow status, TESTOGRAPH recommendation, warnings shown

---

### Scenario 6: Interpret Low Results (Age 45)
**Steps**:
1. Clear previous form
2. Enter values:
   - Age: 45
   - Total T: 220 ng/dL
3. Click "Анализирай Резултати"

**Expected Results**:
- Status: "Клинично нисък тестостерон" (RED card)
- Recommendation: "...под клиничната норма. Препоръчваме консултация с ендокринолог..."
- Shows 220 ng/dL vs 450-700 optimal range (40-50 age group)
- Clinical low threshold: <250 ng/dL (exceeded)

**Pass Criteria**: ✅ Red status, doctor recommendation, clinical concern

---

### Scenario 7: Add First Lab Result
**Steps**:
1. Click "Проследяване" tab
2. Click "Добави резултат" button
3. Fill form:
   - Date: 2025-01-15
   - Total T: 450
   - Free T: 12
   - SHBG: 45
   - Estradiol: 28
   - Notes: "Baseline before program"
4. Click "Запази"

**Expected Results**:
- Form closes
- Alert: "Резултатът е запазен успешно!"
- Table shows 1 row with data
- Chart displays (1 point)
- No stats shown (need 2+ results)

**Pass Criteria**: ✅ Result saved, table updated, chart rendered

---

### Scenario 8: Add Second Lab Result (3 months later)
**Steps**:
1. Click "Добави резултат"
2. Fill form:
   - Date: 2025-04-15
   - Total T: 580
   - Free T: 18
   - SHBG: 38
   - Estradiol: 24
   - Notes: "After 3 months TESTOGRAPH"
3. Click "Запази"

**Expected Results**:
- Table shows 2 rows (newest first)
- Chart shows 2 points with line
- Stats section appears showing:
  - First: 450 ng/dL (2025-01-15)
  - Last: 580 ng/dL (2025-04-15)
  - Improvement: +130 ng/dL (+28.9%)
  - Green positive badge

**Pass Criteria**: ✅ Improvement calculated, stats displayed, chart updated

---

### Scenario 9: Edit Existing Result
**Steps**:
1. Click ✏️ (edit) button on first result
2. Form loads with data
3. Change Total T from 450 to 460
4. Click "Запази"

**Expected Results**:
- Result updated in table
- New Total T: 460
- Chart updates
- Improvement recalculates: +120 ng/dL (+26.1%)

**Pass Criteria**: ✅ Edit successful, calculations updated

---

### Scenario 10: Delete Result
**Steps**:
1. Click 🗑️ (delete) on first result
2. Confirm dialog appears
3. Click "OK"

**Expected Results**:
- Result removed from table
- Only 1 result remains
- Chart updates (1 point)
- Stats disappear (need 2+)

**Pass Criteria**: ✅ Delete successful, UI updates

---

### Scenario 11: Export to CSV
**Steps**:
1. Add 2-3 results (if deleted)
2. Click "Експорт CSV"

**Expected Results**:
- File downloads: `testograph-results-YYYY-MM-DD.csv`
- Open in Excel/Google Sheets
- Contains headers: Дата, Общ T, Свободен T, SHBG, Естрадиол, LH, Бележки
- Contains all data rows
- UTF-8 encoding (Bulgarian characters correct)

**Pass Criteria**: ✅ CSV downloads, opens correctly, data intact

---

### Scenario 12: Export to PDF
**Steps**:
1. Ensure results exist
2. Click "Експорт PDF"

**Expected Results**:
- File downloads: `testograph-lab-results.pdf`
- Open in PDF reader
- Shows title: "Testograph - Lab Results History"
- Shows generation date
- Lists all results chronologically
- Readable format

**Pass Criteria**: ✅ PDF downloads, formatted correctly

---

### Scenario 13: Mobile Responsiveness
**Steps**:
1. Open in mobile browser or resize window to 375px width
2. Navigate through all tabs

**Expected Results**:
- Tabs scroll horizontally if needed
- Tables scroll horizontally
- Forms stack vertically
- Buttons full-width
- Chart scales down
- All features accessible

**Pass Criteria**: ✅ Usable on mobile, no overflow

---

### Scenario 14: Data Persistence
**Steps**:
1. Add several results
2. Close browser tab
3. Reopen `index.html`
4. Go to "Проследяване" tab

**Expected Results**:
- All results still present
- Chart renders with data
- Stats calculate correctly
- Data persisted in localStorage

**Pass Criteria**: ✅ Data survives browser close/reopen

---

### Scenario 15: Empty States
**Steps**:
1. Clear localStorage: `localStorage.removeItem('lab_results')`
2. Refresh page
3. Go to "Проследяване" tab

**Expected Results**:
- Shows empty state message
- "Все още нямате добавени резултати"
- "Кликнете 'Добави резултат' за да започнете"
- Chart area empty
- No stats shown

**Pass Criteria**: ✅ Helpful empty state, clear call-to-action

---

## Automated Testing Commands

### Browser Console Tests

```javascript
// Test 1: Check labs data loaded
console.assert(labsData.length === 14, "Should have 14 labs");
console.assert(labsData.filter(l => l.city === "София").length === 3, "Sofia should have 3 labs");

// Test 2: Check app initialized
console.assert(typeof app !== 'undefined', "App should be initialized");
console.assert(app.filteredLabs.length === 14, "All labs should be visible initially");

// Test 3: Test city filter
document.getElementById('city-filter').value = 'Пловдив';
document.getElementById('city-filter').dispatchEvent(new Event('change'));
console.assert(app.filteredLabs.length === 3, "Plovdiv should have 3 labs");

// Test 4: Test search filter
document.getElementById('city-filter').value = '';
document.getElementById('city-filter').dispatchEvent(new Event('change'));
document.getElementById('search-filter').value = 'МДЛ';
document.getElementById('search-filter').dispatchEvent(new Event('input'));
console.assert(app.filteredLabs.length === 5, "Should find 5 МДЛ labs");

// Test 5: Add test result
app.labResults = [];
const testResult = {
  id: Date.now().toString(),
  test_date: "2025-01-15",
  total_t: 500,
  notes: "Test"
};
app.labResults.push(testResult);
localStorage.setItem('lab_results', JSON.stringify(app.labResults));
console.assert(app.labResults.length === 1, "Should have 1 result");

// Test 6: Check interpretation ranges
const ranges20_30 = { optimal: [600, 900], low: 300 };
console.assert(750 >= ranges20_30.optimal[0] && 750 <= ranges20_30.optimal[1], "750 should be optimal for 20-30");
console.assert(250 < ranges20_30.low, "250 should be low for 20-30");

// Test 7: Clear test data
localStorage.removeItem('lab_results');
console.log("Test data cleared");
```

## Performance Tests

### Load Time
```javascript
// In browser console
performance.mark('start');
window.location.reload();
// After reload:
performance.mark('end');
performance.measure('load', 'start', 'end');
console.log(performance.getEntriesByName('load')[0].duration + 'ms');
// Expected: < 500ms
```

### Filter Performance
```javascript
// Test filter speed
console.time('filter');
document.getElementById('search-filter').value = 'МДЛ';
document.getElementById('search-filter').dispatchEvent(new Event('input'));
console.timeEnd('filter');
// Expected: < 10ms
```

### Chart Render Performance
```javascript
// Test chart rendering
console.time('chart');
app.renderChart();
console.timeEnd('chart');
// Expected: < 100ms
```

## Regression Test Checklist

After any code changes, verify:

- [ ] All 14 labs display correctly
- [ ] City filter works for all cities
- [ ] Search filter works (case-insensitive)
- [ ] Combined filters work
- [ ] Age ranges correct for all groups
- [ ] Interpretation logic accurate
- [ ] Color coding correct (red/yellow/green)
- [ ] Add result saves to localStorage
- [ ] Edit result updates correctly
- [ ] Delete result removes and updates
- [ ] Chart renders with data
- [ ] Stats calculate improvement
- [ ] CSV export includes all fields
- [ ] PDF export formats correctly
- [ ] Mobile responsive on 375px width
- [ ] Data persists across sessions
- [ ] Empty states show appropriately
- [ ] No console errors
- [ ] Analytics events fire (if connected)

## Edge Cases

### Edge Case 1: Very High Testosterone
- Age: 30, Total T: 1200 ng/dL
- Expected: "Над оптималния диапазон" message

### Edge Case 2: Zero Values
- Total T: 0
- Expected: Shows as low, recommend doctor

### Edge Case 3: Missing Optional Fields
- Only age + total T
- Expected: Interprets correctly, no errors

### Edge Case 4: Future Date
- Test date: 2026-12-31
- Expected: Accepts, sorts correctly

### Edge Case 5: Many Results (100+)
- Add 100 results
- Expected: Table scrolls, chart readable, export works

### Edge Case 6: Long Notes (1000 chars)
- Enter 1000 character note
- Expected: Saves, displays with scroll/truncation

### Edge Case 7: Browser Without localStorage
- Disable localStorage
- Expected: Shows error or uses fallback

### Edge Case 8: Offline Mode
- Disconnect internet
- Expected: App still works (no CDN dependencies fail)

## Bug Report Template

If issues found:

```
**Bug**: [Short description]

**Steps to Reproduce**:
1.
2.
3.

**Expected**: [What should happen]

**Actual**: [What actually happened]

**Browser**: [Chrome 120, Firefox 119, etc.]

**Console Errors**: [Paste any errors]

**Screenshots**: [If applicable]
```

## Sign-Off Checklist

Before considering testing complete:

- [ ] All 15 scenarios pass
- [ ] All automated tests pass
- [ ] All edge cases handled
- [ ] All regression tests pass
- [ ] No console errors or warnings
- [ ] Performance benchmarks met
- [ ] Mobile testing complete
- [ ] Data persistence verified
- [ ] Export functions work
- [ ] Documentation accurate

**Tested By**: _______________
**Date**: _______________
**Status**: _______________

---

**Last Updated**: 2025-10-02
**Version**: 1.0.0
