# Health & Fitness Tools - Design System

> A comprehensive, mobile-first design system for building consistent, accessible health and fitness applications.

## Overview

This design system provides a complete set of CSS styles, JavaScript components, and templates for creating professional health and fitness tools with a focus on:

- **Consistency**: Unified look and feel across all tools
- **Accessibility**: WCAG AA compliant, keyboard navigable, screen reader friendly
- **Responsiveness**: Mobile-first approach, works on all devices
- **Performance**: Optimized CSS/JS, fast loading times
- **Print-friendly**: Optimized for A4 printing
- **Bulgarian Language**: Full support for Bulgarian UI text

---

## Quick Start

### 1. Include Stylesheets

```html
<!-- Required for all pages -->
<link rel="stylesheet" href="../shared/css/styles.css">

<!-- For authentication pages (login, signup) -->
<link rel="stylesheet" href="../shared/css/auth.css">

<!-- For dashboard and tool pages with sidebar -->
<link rel="stylesheet" href="../shared/css/dashboard.css">
```

### 2. Include JavaScript

```html
<!-- UI Components (alerts, modals, validation) -->
<script src="../shared/js/ui.js"></script>
```

### 3. Use Templates

Copy from `/shared/templates/` to get started quickly:
- `auth-page-template.html` - Login/signup pages
- `dashboard-template.html` - Main dashboard with sidebar
- `tool-page-template.html` - Individual tool pages

---

## File Structure

```
/shared
├── css/
│   ├── styles.css          # Main design system (24KB)
│   ├── auth.css            # Authentication pages (7.7KB)
│   └── dashboard.css       # Dashboard layout (13KB)
├── js/
│   ├── ui.js              # UI components (alerts, modals, etc.)
│   ├── auth.js            # Authentication helpers
│   ├── storage.js         # Local storage utilities
│   └── analytics.js       # Analytics tracking
├── templates/
│   ├── auth-page-template.html
│   ├── dashboard-template.html
│   └── tool-page-template.html
├── assets/
│   └── images/            # Shared images
├── README.md              # This file
├── UI_GUIDE.md            # Complete UI/UX guidelines
├── IMPLEMENTATION_GUIDE.md # Implementation details
└── QUICK_REFERENCE.md     # Quick reference card
```

---

## Documentation

### 📘 UI_GUIDE.md
Complete design system documentation including:
- Design principles and philosophy
- Color system and usage guidelines
- Typography standards
- Component library with examples
- Bulgarian text conventions
- Accessibility standards
- Layout patterns
- Best practices

### 🔧 IMPLEMENTATION_GUIDE.md
Step-by-step implementation guide including:
- Converting existing pages
- Component examples
- JavaScript usage
- Migration checklist
- Testing guide
- Common issues and solutions

### ⚡ QUICK_REFERENCE.md
Quick reference card for developers:
- CSS class names
- Bulgarian text translations
- Common patterns
- Code snippets
- File structure

---

## Key Features

### Design System (styles.css)

**CSS Variables**
- Consistent color palette (primary, secondary, accent)
- Spacing scale (8px, 16px, 24px, 32px, 48px)
- Typography scale (12px - 36px)
- Border radius, shadows, transitions

**Components**
- Buttons (primary, secondary, accent, outline, ghost)
- Forms (inputs, selects, textareas, validation states)
- Cards (basic, with headers, stat cards, item cards)
- Tables (responsive, striped, small)
- Alerts (success, error, warning, info)
- Badges (primary, secondary, accent, outline)
- Modals/Dialogs
- Navigation/Header
- Footer

**Layout**
- Container system (standard, small, large)
- Responsive grid (1-4 columns)
- Flexbox utilities
- Spacing utilities

**Responsive Design**
- Mobile first (< 768px)
- Tablet (≥ 768px)
- Desktop (≥ 1024px)
- Wide screens (≥ 1440px)

### Authentication Pages (auth.css)

**Components**
- Auth container with gradient background
- Auth card with header/body/footer
- Auth logo component
- Password visibility toggle
- Social login buttons
- Remember me checkbox
- Forgot password link

**Features**
- Centered layout
- Mobile optimized
- Loading states
- Error handling
- Success states

### Dashboard Layout (dashboard.css)

**Components**
- Sidebar navigation with sections
- Dashboard header with search
- Stat cards with trends
- Widget containers
- Quick actions grid
- User profile section
- Notification button

**Features**
- Collapsible sidebar on mobile
- Sticky header
- Responsive grid
- Mobile overlay
- Active link highlighting

### UI Components (ui.js)

**Alert System**
```javascript
Alert.success('Success message');
Alert.error('Error message');
Alert.warning('Warning message');
Alert.info('Info message');
```

**Modal System**
```javascript
Modal.show('Title', 'Content', options);
Modal.confirm('Are you sure?', callback);
Modal.alert('Message');
```

**Loading States**
```javascript
Loading.show('Loading...');
Loading.hide();
Loading.button(btn, true, 'Saving...');
```

**Form Validation**
```javascript
Validator.validateForm(form);
Validator.showError(input, 'Error message');
Validator.clearError(input);
```

**Utilities**
```javascript
Utils.formatDate(date);
Utils.formatNumber(num, decimals);
Utils.copyToClipboard(text);
Utils.debounce(fn, delay);
```

---

## Color Palette

### Primary Colors
- **Primary (Blue)**: `#2563eb` - Main actions, links, active states
- **Secondary (Green)**: `#16a34a` - Success, health metrics, positive actions
- **Accent (Red)**: `#dc2626` - Warnings, deletions, errors

### Neutral Colors
- **Dark**: `#1f2937` - Headings, dark text
- **Text**: `#111827` - Body text
- **Text Muted**: `#6b7280` - Secondary text
- **Light**: `#f3f4f6` - Backgrounds
- **White**: `#ffffff` - Card backgrounds

### Semantic Colors
- **Success**: `#16a34a` (Secondary)
- **Error**: `#dc2626` (Accent)
- **Warning**: `#f59e0b`
- **Info**: `#0ea5e9`

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Helvetica Neue', Arial, sans-serif;
```

### Scale
- **h1**: 30-36px - Page titles
- **h2**: 24px - Section headers
- **h3**: 20px - Card titles
- **h4**: 18px - Subsections
- **body**: 16px - Default text
- **small**: 14px - Helper text
- **xs**: 12px - Labels, badges

---

## Spacing System

Based on 8px grid:

| Token | Size | Use Case |
|-------|------|----------|
| `--space-xs` | 8px | Tight spacing, badges |
| `--space-sm` | 16px | Standard spacing, form fields |
| `--space-md` | 24px | Medium spacing, cards |
| `--space-lg` | 32px | Large spacing, sections |
| `--space-xl` | 48px | Extra large, page headers |

---

## Components Overview

### Buttons

- **Primary**: Main call-to-action
- **Secondary**: Positive actions
- **Accent**: Destructive actions
- **Outline**: Secondary options
- **Ghost**: Subtle actions
- **Sizes**: Small, Default, Large, Block

### Forms

- **Inputs**: Text, email, password, number, date, time
- **Selects**: Dropdowns
- **Textareas**: Multi-line text
- **Checkboxes**: Single options
- **Radio buttons**: Multiple choice
- **Validation**: Real-time validation with error messages

### Cards

- **Basic**: Simple container
- **Header/Footer**: Structured cards
- **Stat Cards**: Metrics with trends
- **Item Cards**: Products/exercises/meals

### Navigation

- **Navbar**: Top navigation with mobile menu
- **Sidebar**: Dashboard side navigation
- **Footer**: Page footer with links

---

## Bulgarian Language Support

The design system includes complete Bulgarian language support:

### Common Translations

| English | Bulgarian |
|---------|-----------|
| Login | Вход |
| Sign up | Регистрация |
| Save | Запази |
| Cancel | Отказ |
| Delete | Изтрий |
| Edit | Редактирай |
| Add | Добави |
| Search | Търси |
| Loading... | Зареждане... |

See `UI_GUIDE.md` for complete translation table.

---

## Responsive Breakpoints

```css
/* Mobile first (default) */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Wide */ }
```

### Responsive Classes

- **Grid**: `grid-md-2`, `grid-lg-3`, `grid-lg-4`
- **Display**: `d-none`, `d-block`, `d-flex`
- **Spacing**: Use standard spacing classes

---

## Accessibility Features

- **WCAG AA Compliant**: Color contrast ratios meet standards
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus States**: Clear visual focus indicators
- **Screen Reader Support**: ARIA labels, semantic HTML
- **Skip Links**: Jump to main content
- **Form Validation**: Accessible error messages
- **High Contrast Mode**: Support for high contrast preferences
- **Reduced Motion**: Respects prefers-reduced-motion

---

## Print Optimization

Automatically optimized for printing:
- Hides navigation, buttons, and interactive elements
- Black and white friendly
- Optimized for A4 paper size
- Proper page breaks
- Shows URLs for links

---

## Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile Safari**: iOS 12+
- **Chrome Mobile**: Latest

---

## Performance

### CSS
- **Minified Size**: ~25KB (gzipped)
- **No External Dependencies**: Pure CSS
- **Fast Load**: Optimized selectors

### JavaScript
- **Modular**: Load only what you need
- **Vanilla JS**: No framework dependencies
- **Small Footprint**: ~15KB (ui.js)

---

## Usage Examples

### Simple Page with Navigation

```html
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <link rel="stylesheet" href="../shared/css/styles.css">
</head>
<body>
  <nav class="navbar">
    <div class="navbar-container">
      <a href="/" class="navbar-brand">Brand</a>
      <ul class="navbar-menu">
        <li><a href="#" class="navbar-link">Link</a></li>
      </ul>
    </div>
  </nav>

  <main class="container">
    <h1>Hello World</h1>
    <button class="btn btn-primary">Click Me</button>
  </main>

  <script src="../shared/js/ui.js"></script>
</body>
</html>
```

### Login Page

```html
<link rel="stylesheet" href="../shared/css/styles.css">
<link rel="stylesheet" href="../shared/css/auth.css">

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <div class="auth-logo">HF</div>
      <h1 class="auth-title">Добре дошли</h1>
    </div>
    <div class="auth-body">
      <form class="auth-form" data-validate>
        <!-- Form fields -->
      </form>
    </div>
  </div>
</div>
```

### Dashboard with Sidebar

```html
<link rel="stylesheet" href="../shared/css/styles.css">
<link rel="stylesheet" href="../shared/css/dashboard.css">

<div class="dashboard-wrapper">
  <aside class="sidebar">
    <!-- Sidebar content -->
  </aside>
  <div class="dashboard-main">
    <header class="dashboard-header">
      <!-- Header -->
    </header>
    <main class="dashboard-content">
      <!-- Content -->
    </main>
  </div>
</div>
```

---

## Migration Guide

### From Existing Codebase

1. **Replace CSS imports** with design system files
2. **Update HTML classes** to use design system classes
3. **Translate text** to Bulgarian
4. **Add validation** to forms with `data-validate`
5. **Use UI components** (Alert, Modal, Loading)
6. **Test responsiveness** on mobile/tablet/desktop
7. **Verify accessibility** with keyboard navigation

See `IMPLEMENTATION_GUIDE.md` for detailed migration steps.

---

## Testing Checklist

- [ ] Desktop browsers (Chrome, Firefox, Safari)
- [ ] Mobile devices (iOS, Android)
- [ ] Tablet devices
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Print preview
- [ ] Color contrast
- [ ] Bulgarian text display
- [ ] Form validation
- [ ] Responsive breakpoints

---

## Contributing

When adding new components or updating the design system:

1. Follow existing naming conventions
2. Maintain accessibility standards
3. Test on all supported browsers
4. Update documentation
5. Add examples to templates
6. Verify Bulgarian translations

---

## Support & Resources

### Documentation Files
- **README.md** (this file) - Overview and quick start
- **UI_GUIDE.md** - Complete UI/UX guidelines (18KB)
- **IMPLEMENTATION_GUIDE.md** - Implementation details (18KB)
- **QUICK_REFERENCE.md** - Quick reference card (9KB)

### Templates
- **auth-page-template.html** - Authentication page example
- **dashboard-template.html** - Dashboard with sidebar example
- **tool-page-template.html** - Tool page with filters example

### Getting Help
1. Check the documentation files above
2. Review template files for working examples
3. Use browser DevTools to inspect styles
4. Check console for JavaScript errors
5. Verify all files are properly loaded

---

## Changelog

### Version 1.0 (October 2025)
- Initial release
- Complete design system with CSS variables
- Authentication page styles
- Dashboard layout with sidebar
- UI component library (JavaScript)
- Three template files
- Complete documentation
- Bulgarian language support
- WCAG AA accessibility compliance
- Print optimization
- Mobile-first responsive design

---

## License

Proprietary - Health & Fitness Tools Platform

---

**Version**: 1.0
**Last Updated**: October 2025
**Maintained by**: UI/UX Team

---

## Quick Links

- [UI Guidelines](./UI_GUIDE.md) - Complete UI/UX guide
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - How to use the system
- [Quick Reference](./QUICK_REFERENCE.md) - Cheat sheet for developers
- [Templates](./templates/) - Ready-to-use page templates

**Get Started:** Copy a template from `/shared/templates/` and start building!
