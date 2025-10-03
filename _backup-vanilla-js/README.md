# Testograph Tools

> Science-based toolkit for optimizing testosterone naturally through nutrition, sleep, exercise, and supplementation

## Overview

Testograph Tools is a comprehensive web application providing 5 specialized tools to help users optimize their testosterone levels naturally through evidence-based protocols.

### The 5 Tools

1. **Meal Planner** - Personalized meal plans with testosterone-optimized macros
2. **Sleep Protocol** - Custom sleep routines for maximum overnight recovery
3. **Supplement Timing** - Precise timing recommendations for T-boosting supplements
4. **Exercise Guide** - Science-backed workouts for testosterone optimization
5. **Lab Testing** - Track and interpret testosterone levels over time

## Features

- **Guest Mode**: Try all tools immediately without creating an account
- **User Accounts**: Save your data and sync across devices with Supabase authentication
- **Local Storage**: All data stored locally in guest mode for privacy
- **PDF Export**: Download and print your personalized protocols
- **Analytics**: Track your progress and usage patterns
- **Mobile Responsive**: Works seamlessly on all devices

## Quick Start

### Option 1: Simple File Server (No Installation)

Just open `index.html` in your browser, or use Python's built-in server:

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open http://localhost:8080 in your browser.

### Option 2: Using npm scripts

```bash
# Install http-server globally (one time only)
npm install -g http-server

# Start the server
npm start
```

### Option 3: Live development server

```bash
# Install live-server globally (one time only)
npm install -g live-server

# Start the dev server with auto-reload
npm run dev
```

## Supabase Setup (Optional)

To enable user authentication and cloud data storage:

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Follow the detailed instructions in `supabase/setup-instructions.md`

2. **Run the Database Schema**
   - Copy the SQL from `supabase/schema.sql`
   - Paste and run it in your Supabase SQL Editor

3. **Configure Your App**
   - Update `shared/js/supabase-client.js` with your Supabase URL and anon key
   - Or create a `.env` file (see `.env.example`)

4. **Enable Google OAuth (Optional)**
   - Configure Google OAuth in Supabase dashboard
   - Follow instructions in `supabase/setup-instructions.md`

## Project Structure

```
testograph-tools/
├── index.html                 # Landing page
├── package.json              # Project metadata
├── README.md                 # This file
├── .env.example              # Environment variables template
│
├── auth/                     # Authentication pages
│   ├── login.html
│   ├── signup.html
│   ├── app.js
│   └── styles.css
│
├── dashboard/                # Main dashboard
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── shared/                   # Shared resources
│   ├── css/
│   │   └── global.css       # Global styles
│   ├── js/
│   │   ├── supabase-client.js    # Supabase initialization
│   │   ├── auth.js               # Authentication utilities
│   │   ├── db-helpers.js         # Database CRUD operations
│   │   ├── storage.js            # LocalStorage utilities
│   │   ├── analytics.js          # Event tracking
│   │   └── pdf-utils.js          # PDF generation
│   └── assets/               # Images, icons, etc.
│
├── supabase/                 # Database configuration
│   ├── schema.sql           # Database tables and policies
│   └── setup-instructions.md
│
└── [Tool Directories]        # Individual tool apps
    ├── meal-planner/
    ├── sleep-protocol/
    ├── supplement-timing/
    ├── exercise-guide/
    └── lab-testing/
```

## Technologies Used

### Frontend
- **Pure HTML/CSS/JavaScript** (ES6+) - No frameworks required
- **CSS Variables** - Modern, maintainable styling
- **Vanilla JS** - Lightweight and fast

### Backend/Database
- **Supabase** - PostgreSQL database with built-in auth and RLS
- **Row Level Security (RLS)** - Secure data access policies

### External Libraries (CDN)
- **Supabase JS Client** - Authentication and database
- **jsPDF** - PDF generation
- **Chart.js** - Data visualization (for analytics)

### Storage
- **LocalStorage** - Guest mode data persistence
- **Supabase PostgreSQL** - Authenticated user data

## Guest Mode vs Authenticated Mode

### Guest Mode
- No account required
- Data stored locally in browser
- Works offline
- Data not synced across devices
- Data lost if browser storage cleared

### Authenticated Mode
- Requires account (email or Google)
- Data synced to cloud
- Access from any device
- Persistent data storage
- Email confirmation (optional)

## Database Schema

The application uses the following tables:

- **profiles** - User profile information (age, weight, goals)
- **meal_plans** - Saved meal plans with JSONB data
- **sleep_logs** - Sleep tracking data
- **lab_results** - Testosterone test results
- **analytics_events** - User activity tracking

All tables have Row Level Security (RLS) policies ensuring users can only access their own data.

## Security

- **Row Level Security (RLS)** - Database-level security
- **No API keys in code** - Credentials stored in environment variables
- **HTTPS only** - Supabase enforces secure connections
- **Guest mode privacy** - Local-only data storage

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Adding a New Tool

1. Create a new folder in the root directory
2. Add `index.html`, `app.js`, and `styles.css`
3. Include shared utilities:
   ```html
   <script src="../shared/js/supabase-client.js"></script>
   <script src="../shared/js/auth.js"></script>
   <script src="../shared/js/db-helpers.js"></script>
   ```
4. Update the dashboard to link to your new tool

### Database Helpers

Use the `DB` global object for database operations:

```javascript
// Get user profile
const { data, error } = await DB.getProfile(userId);

// Create meal plan
await DB.createMealPlan(userId, planData, 'My Plan');

// Track analytics
await DB.trackEvent(userId, 'tool_opened', { tool: 'meal-planner' });
```

### Authentication

Use the `Auth` global object:

```javascript
// Check if authenticated
const isAuth = await Auth.isAuthenticated();

// Get current user
const user = await Auth.getCurrentUser();

// Sign out
await Auth.signOut();
```

## Troubleshooting

### Supabase Connection Issues
- Verify your URL and anon key in `supabase-client.js`
- Check that RLS policies are enabled
- Look for CORS errors in browser console

### Data Not Saving
- Check browser console for errors
- Verify you're authenticated (or in guest mode)
- Check Supabase dashboard for RLS policy issues

### PDF Generation Not Working
- Ensure jsPDF CDN is loaded
- Check browser console for script errors
- Try a different browser

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Disclaimer

**IMPORTANT**: This application provides educational information only and is not medical advice. Always consult with a qualified healthcare professional before making any changes to your diet, exercise, supplement regimen, or health practices.

The information provided is based on scientific research but individual results may vary. Testosterone optimization should be supervised by a medical professional, especially if you have any health conditions or are taking medications.

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the `supabase/setup-instructions.md` for detailed setup help
- Review browser console for error messages

## Credits

Built with dedication to science-based health optimization.

---

**Version**: 1.0.0
**Last Updated**: 2025-10-02
