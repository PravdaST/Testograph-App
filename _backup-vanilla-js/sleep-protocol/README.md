# Sleep Protocol - Interactive Sleep Optimization Tool

A comprehensive web application for optimizing sleep quality through personalized routines, bedroom environment optimization, and progress tracking.

## Features

### 1. Sleep Assessment Form
- **Sleep Duration**: Track how many hours you currently sleep
- **Bedtime**: Set your preferred bedtime
- **Fall Asleep Time**: Monitor how long it takes to fall asleep
- **Night Wake-ups**: Track sleep interruptions

### 2. Personalized Evening Routine Generator
Based on your assessment, the app generates a complete 2-hour evening routine:
- **2 hours before bed**: Stop all screen time
- **1.5 hours before**: Take Melatonin (5mg) + Magnesium (400mg)
- **70 minutes before**: Light stretching or gentle yoga
- **1 hour before**: Warm shower/bath
- **30 minutes before**: Reading or meditation
- **15 minutes before**: Prepare bedroom environment
- **Bedtime**: Sleep environment ready

### 3. Bedroom Optimization Checklist
Interactive 10-item checklist covering:
- Complete darkness (blackout curtains)
- Optimal temperature (18-20°C / 64-68°F)
- Electronics removal
- Phone management
- Mattress quality
- Bedding materials
- White noise/fan
- Clutter removal
- Eye mask option
- Air quality

### 4. Sleep Tracker
Comprehensive tracking system with:
- **Daily logging**: Bedtime, wake time, quality rating (1-10)
- **Automatic calculations**: Sleep hours computed automatically
- **7-day chart**: Visual trend of sleep quality using Chart.js
- **Statistics**: Average quality and hours for 7-day and 30-day periods
- **History view**: Recent sleep logs display

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Charting**: Chart.js v4.4.0
- **PDF Generation**: jsPDF v2.5.1
- **Data Storage**: LocalStorage + Supabase (optional)
- **Analytics**: Custom analytics tracking

## File Structure

```
sleep-protocol/
├── index.html          # Main application HTML
├── styles.css          # Responsive styles
├── app.js             # Application logic
└── README.md          # Documentation
```

## Dependencies

The application uses CDN-hosted libraries:
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
- jsPDF: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

Shared utilities:
- `../shared/js/supabase-client.js` - Database integration
- `../shared/js/pdf-utils.js` - PDF export functionality
- `../shared/js/analytics.js` - Event tracking

## Usage

### Getting Started

1. Open `index.html` in a web browser
2. Complete the sleep assessment form
3. Review your personalized routine
4. Work through the bedroom optimization checklist
5. Start tracking your sleep daily

### PDF Export

Click "Export as PDF" to download your personalized routine and checklist. The PDF includes:
- Target bedtime and routine start time
- Complete evening routine timeline
- Bedroom optimization checklist with current completion status

### Data Persistence

All data is automatically saved to localStorage:
- `sleep_assessment` - Your assessment responses
- `sleep_routine` - Generated routine data
- `sleep_checklist` - Checklist completion status
- `sleep_logs` - All sleep log entries

### Analytics Events

The app tracks the following events:
- `page_view` - Initial page load
- `assessment_completed` - Assessment form submission
- `checklist_item_toggled` - Checklist item check/uncheck
- `sleep_log_added` - New sleep log entry
- `pdf_exported` - PDF export action
- `section_viewed` - Navigation between sections

## Supabase Integration

To enable cloud storage, configure your Supabase credentials in `shared/js/supabase-client.js`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Create a `sleep_logs` table with the following schema:

```sql
CREATE TABLE sleep_logs (
  id BIGINT PRIMARY KEY,
  date DATE NOT NULL,
  bedtime TIME NOT NULL,
  waketime TIME NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 10),
  hours DECIMAL(3,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Responsive Design

The application is fully responsive with breakpoints at:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential improvements:
- Sleep cycle analysis
- Sunrise/sunset integration
- Smart device integration (Fitbit, Apple Watch)
- Weekly/monthly reports
- Sleep hygiene education modules
- Customizable supplement recommendations
- Social sharing features
- Multi-language support

## License

This is a standalone module of the Mini App Builder project.

## Support

For issues or questions, refer to the main project documentation.
