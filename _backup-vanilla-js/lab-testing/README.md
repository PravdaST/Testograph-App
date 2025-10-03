# TESTOGRAPH Lab Testing Guide

A comprehensive lab testing guide with directory, results interpreter, and progress tracker for testosterone and hormone testing in Bulgaria.

## Features

### 1. Lab Directory
- **14 laboratories** across 7 major Bulgarian cities
- **Searchable and filterable** by city and name/address
- Price information for testosterone packages (75-92 лв)
- Working hours and contact information
- "No appointment needed" badges

### 2. Test Instructions
Complete guide for hormone testing:
- **What to order**: Total T, Free T, SHBG, Estradiol, LH
- **When to go**: Morning 7-9am, fasted
- **How to prepare**: Sleep, fasting, no training protocols
- Step-by-step instructions for the lab visit

### 3. Results Interpreter
Intelligent interpretation based on age-specific reference ranges:

**Age Ranges:**
- 20-30: Optimal 600-900 ng/dL, Low <300
- 30-40: Optimal 500-800 ng/dL, Low <270
- 40-50: Optimal 450-700 ng/dL, Low <250
- 50+: Optimal 400-600 ng/dL, Low <230

**Status Categories:**
- 🟢 **Optimal**: In optimal range
- 🟡 **Suboptimal**: Below optimal but above clinical low
- 🔴 **Low**: Below clinical threshold

### 4. Progress Tracker
- **Add/Edit/Delete** lab results over time
- **Data persistence** via localStorage (Supabase-compatible)
- **Visual chart** showing Total T progression over time
- **Improvement calculation** from first to last test
- **Export options**: CSV and PDF formats

## File Structure

```
lab-testing/
├── index.html          # Main HTML interface with tabs
├── app.js             # Core application logic
├── labs-data.js       # Laboratory database (14 labs)
├── styles.css         # Responsive styling
└── README.md          # This file
```

## Dependencies

### External Libraries (CDN)
- **Chart.js 4.4.0**: For progress visualization
- **jsPDF** (via pdf-utils.js): For PDF export

### Shared Utilities
- `shared/js/supabase-client.js`: Database operations
- `shared/js/pdf-utils.js`: PDF export functionality
- `shared/js/analytics.js`: Event tracking

## Usage

### Opening the App
1. Open `index.html` in a web browser
2. Navigate between tabs using the tab menu

### Finding a Lab
1. Go to "Справочник Лаборатории" tab
2. Filter by city or search by name/address
3. View prices, hours, and contact info
4. Click website link for more details

### Interpreting Results
1. Go to "Интерпретатор" tab
2. Enter age and Total Testosterone (required)
3. Optionally add Free T, SHBG, Estradiol
4. Click "Анализирай Резултати"
5. View color-coded interpretation and recommendations

### Tracking Progress
1. Go to "Проследяване" tab
2. Click "Добави резултат"
3. Enter test date and values
4. Save to local storage
5. View progression chart and statistics
6. Export data as CSV or PDF

## Data Storage

### localStorage Schema
```javascript
{
  lab_results: [
    {
      id: "timestamp",
      test_date: "2025-01-15",
      total_t: 650,
      free_t: 18.5,
      shbg: 35,
      estradiol: 25,
      lh: 4.2,
      notes: "After 3 months of program"
    }
  ]
}
```

### Supabase Integration
The app is designed to work with Supabase when configured:

**Table: `lab_results`**
```sql
CREATE TABLE lab_results (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_date DATE NOT NULL,
  total_t DECIMAL(6,2) NOT NULL,
  free_t DECIMAL(6,2),
  shbg DECIMAL(6,2),
  estradiol DECIMAL(6,2),
  lh DECIMAL(6,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

## Analytics Events

The app tracks the following events:

- `lab_result_interpreted`: When user interprets results
  - Properties: `age_range`, `total_t`, `status`

- `lab_result_saved`: When user saves a result
  - Properties: `has_free_t`, `has_shbg`, `has_estradiol`

- `lab_results_exported`: When user exports data
  - Properties: `format` (csv/pdf), `count`

## Customization

### Adding More Labs
Edit `labs-data.js`:
```javascript
{
  city: "Нов Град",
  name: "Нова Лаборатория",
  address: "ул. Примерна 123",
  phone: "02 123 4567",
  price_total_t: "25 лв",
  price_free_t: "35 лв",
  price_package: "85 лв",
  hours: "Пон-Пет: 7:00-17:00",
  no_appointment: true,
  website: "https://example.com"
}
```

### Modifying Reference Ranges
Edit the `ranges` object in `app.js` > `interpretResults()`:
```javascript
const ranges = {
  "20-30": { optimal: [600, 900], low: 300 },
  // Add more age ranges...
};
```

### Styling
All styles are in `styles.css` using CSS custom properties:
```css
:root {
  --primary-color: #2563eb;
  --success-color: #059669;
  --warning-color: #d97706;
  --danger-color: #dc2626;
}
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (responsive design)

## Performance

- **Fast loading**: Minimal dependencies
- **Local-first**: Data stored locally
- **Responsive**: Works on all screen sizes
- **Accessible**: Semantic HTML and ARIA labels

## Future Enhancements

- [ ] Multi-user support with authentication
- [ ] Email/SMS reminders for retesting
- [ ] PDF report generation with charts
- [ ] Export to doctor-friendly formats
- [ ] Integration with wearable devices
- [ ] Trend analysis and predictions
- [ ] Multi-language support

## License

Part of the TESTOGRAPH mini app suite.

## Support

For issues or questions about the lab testing guide, please refer to the main TESTOGRAPH documentation.
