# Design System Implementation Guide

## Quick Start

### 1. Include Stylesheets in Your HTML

```html
<!-- All pages need the main styles -->
<link rel="stylesheet" href="../shared/css/styles.css">

<!-- Auth pages (login, signup, etc.) -->
<link rel="stylesheet" href="../shared/css/auth.css">

<!-- Dashboard and tool pages -->
<link rel="stylesheet" href="../shared/css/dashboard.css">
```

### 2. Include JavaScript Libraries

```html
<!-- UI utilities (modals, alerts, validation) -->
<script src="../shared/js/ui.js"></script>

<!-- Other shared utilities -->
<script src="../shared/js/storage.js"></script>
<script src="../shared/js/analytics.js"></script>
```

---

## Converting Existing Pages

### Step-by-Step Process

#### 1. Update CSS Links
Replace any existing CSS files with the new design system:

**Before:**
```html
<link rel="stylesheet" href="../shared/css/global.css">
<link rel="stylesheet" href="styles.css">
```

**After:**
```html
<link rel="stylesheet" href="../shared/css/styles.css">
<link rel="stylesheet" href="../shared/css/auth.css"> <!-- if auth page -->
```

#### 2. Update HTML Structure

**Before (Old classes):**
```html
<button class="submit-btn">Submit</button>
```

**After (Design system classes):**
```html
<button class="btn btn-primary">Изпрати</button>
```

#### 3. Update Text to Bulgarian

**Before:**
```html
<button>Sign In</button>
<label>Email</label>
```

**After:**
```html
<button>Вход</button>
<label>Имейл</label>
```

---

## Common Patterns

### 1. Converting Login Page

**Old Structure:**
```html
<div class="auth-container">
  <div class="auth-card">
    <h1>Welcome Back</h1>
    <form>
      <input type="email" placeholder="Email">
      <button>Sign In</button>
    </form>
  </div>
</div>
```

**New Structure:**
```html
<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <div class="auth-logo">HF</div>
      <h1 class="auth-title">Добре дошли обратно</h1>
      <p class="auth-subtitle">Влезте във вашия акаунт</p>
    </div>
    <div class="auth-body">
      <form class="auth-form" data-validate>
        <div class="form-group">
          <label class="form-label required">Имейл</label>
          <input type="email" class="form-input" required>
          <span class="form-error"></span>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Вход</button>
      </form>
    </div>
  </div>
</div>
```

### 2. Converting Dashboard

**Old Structure:**
```html
<nav class="navbar">
  <h2>Testograph Tools</h2>
  <button>Logout</button>
</nav>
```

**New Structure:**
```html
<div class="dashboard-wrapper">
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="/dashboard" class="sidebar-brand">
        <div class="sidebar-logo">HF</div>
        <span class="sidebar-brand-text">Health & Fitness</span>
      </a>
    </div>
    <nav class="sidebar-nav">
      <!-- Navigation items -->
    </nav>
  </aside>
  <div class="dashboard-main">
    <header class="dashboard-header">
      <!-- Header content -->
    </header>
    <main class="dashboard-content">
      <!-- Main content -->
    </main>
  </div>
</div>
<button class="sidebar-toggle">☰</button>
<div class="sidebar-overlay"></div>
```

### 3. Converting Tool Pages

**Old Card:**
```html
<div class="tool-card">
  <h3>Meal Planner</h3>
  <p>Description...</p>
  <a href="...">Open Tool</a>
</div>
```

**New Card:**
```html
<div class="card item-card">
  <img src="..." class="item-card-image" alt="...">
  <div class="card-body item-card-content">
    <h3 class="card-title">План за хранене</h3>
    <p class="card-text">Описание...</p>
    <div class="item-card-actions">
      <button class="btn btn-primary btn-sm btn-block">Отвори инструмент</button>
    </div>
  </div>
</div>
```

---

## Component Examples

### Buttons

```html
<!-- Primary action -->
<button class="btn btn-primary">Запази</button>

<!-- Secondary action -->
<button class="btn btn-secondary">Добави</button>

<!-- Destructive action -->
<button class="btn btn-accent">Изтрий</button>

<!-- Outline button -->
<button class="btn btn-outline">Отказ</button>

<!-- Ghost button -->
<button class="btn btn-ghost">Настройки</button>

<!-- Block button (full width) -->
<button class="btn btn-primary btn-block">Вход</button>

<!-- Small button -->
<button class="btn btn-primary btn-sm">Малък</button>

<!-- Large button -->
<button class="btn btn-primary btn-lg">Голям</button>

<!-- Disabled button -->
<button class="btn btn-primary" disabled>Неактивен</button>

<!-- Loading button -->
<button class="btn btn-primary" disabled>
  <span class="spinner spinner-sm"></span>
  Зареждане...
</button>
```

### Forms

```html
<!-- Standard input -->
<div class="form-group">
  <label class="form-label required">Име</label>
  <input type="text" class="form-input" required>
  <span class="form-help">Въведете вашето име</span>
  <span class="form-error"></span>
</div>

<!-- Input with error -->
<div class="form-group">
  <label class="form-label required">Имейл</label>
  <input type="email" class="form-input error" value="invalid">
  <span class="form-error">Невалиден имейл адрес</span>
</div>

<!-- Select dropdown -->
<div class="form-group">
  <label class="form-label">Категория</label>
  <select class="form-select">
    <option>Изберете...</option>
    <option>Опция 1</option>
    <option>Опция 2</option>
  </select>
</div>

<!-- Textarea -->
<div class="form-group">
  <label class="form-label">Описание</label>
  <textarea class="form-textarea"></textarea>
</div>

<!-- Checkbox -->
<div class="form-check">
  <input type="checkbox" id="agree" class="form-check-input">
  <label for="agree" class="form-check-label">Съгласен съм с условията</label>
</div>

<!-- Password with toggle -->
<div class="form-group">
  <label class="form-label required">Парола</label>
  <div class="password-group">
    <input type="password" class="form-input" required>
    <button type="button" class="password-toggle">👁</button>
  </div>
  <span class="form-error"></span>
</div>
```

### Cards

```html
<!-- Basic card -->
<div class="card">
  <div class="card-body">
    <h3 class="card-title">Заглавие</h3>
    <p class="card-text">Съдържание...</p>
  </div>
</div>

<!-- Card with header and footer -->
<div class="card">
  <div class="card-header">
    <h3>Заглавие</h3>
  </div>
  <div class="card-body">
    Съдържание...
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Действие</button>
  </div>
</div>

<!-- Item card (for exercises, meals) -->
<div class="card item-card">
  <img src="image.jpg" class="item-card-image" alt="...">
  <div class="card-body item-card-content">
    <h3 class="card-title">Заглавие</h3>
    <p class="card-text">Описание...</p>
    <div class="item-card-actions">
      <button class="btn btn-primary btn-sm">Виж повече</button>
      <button class="btn btn-outline btn-sm">Добави</button>
    </div>
  </div>
</div>

<!-- Stat card -->
<div class="stat-card">
  <div class="stat-icon primary">📊</div>
  <div class="stat-content">
    <div class="stat-label">Тренировки</div>
    <div class="stat-value">24</div>
    <div class="stat-trend up">+12% от миналия месец</div>
  </div>
</div>
```

### Alerts

```html
<!-- Success alert -->
<div class="alert alert-success">
  Успешно запазихте промените
</div>

<!-- Error alert -->
<div class="alert alert-error">
  Възникна грешка при запазване
</div>

<!-- Warning alert -->
<div class="alert alert-warning">
  Внимание: Проверете данните
</div>

<!-- Info alert -->
<div class="alert alert-info">
  Имате 3 нови известия
</div>
```

### Tables

```html
<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr>
        <th>Показател</th>
        <th>Стойност</th>
        <th>Статус</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Холестерол</td>
        <td>180 mg/dL</td>
        <td><span class="badge badge-secondary">Нормално</span></td>
      </tr>
      <tr>
        <td>Тестостерон</td>
        <td>550 ng/dL</td>
        <td><span class="badge badge-secondary">Нормално</span></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Striped table -->
<table class="table table-striped">
  <!-- ... -->
</table>

<!-- Small table -->
<table class="table table-sm">
  <!-- ... -->
</table>
```

### Badges

```html
<span class="badge badge-primary">Нов</span>
<span class="badge badge-secondary">Активен</span>
<span class="badge badge-accent">Важно</span>
<span class="badge badge-warning">Изчакващ</span>
<span class="badge badge-outline">По подразбиране</span>
```

---

## Using JavaScript Components

### Alerts

```javascript
// Show success alert
Alert.success('Успешно запазихте промените');

// Show error alert
Alert.error('Възникна грешка при запазване');

// Show warning alert
Alert.warning('Внимание: Проверете данните');

// Show info alert
Alert.info('Имате 3 нови известия');

// Custom duration (0 = no auto-hide)
Alert.success('Съобщение', 10000);

// Clear all alerts
Alert.clear();
```

### Modals

```javascript
// Simple modal
Modal.show(
  'Заглавие',
  '<p>Съдържание на модала...</p>',
  {
    confirmText: 'OK',
    onConfirm: () => {
      console.log('Confirmed');
    }
  }
);

// Confirmation dialog
Modal.confirm(
  'Сигурни ли сте, че искате да изтриете този елемент?',
  () => {
    // User confirmed
    deleteItem();
  },
  {
    title: 'Потвърждение',
    confirmText: 'Да, изтрий',
    cancelText: 'Отказ'
  }
);

// Alert dialog (no cancel)
Modal.alert('Операцията е завършена успешно!', 'Успех');

// Modal with form
Modal.show(
  'Създаване на елемент',
  `
    <form id="item-form" data-validate>
      <div class="form-group">
        <label class="form-label required">Име</label>
        <input type="text" class="form-input" id="item-name" required>
        <span class="form-error"></span>
      </div>
    </form>
  `,
  {
    confirmText: 'Създай',
    cancelText: 'Отказ',
    onConfirm: () => {
      const form = document.getElementById('item-form');
      if (Validator.validateForm(form)) {
        const name = document.getElementById('item-name').value;
        createItem(name);
        return true; // Close modal
      }
      return false; // Keep modal open
    }
  }
);
```

### Loading States

```javascript
// Show full-page loading
Loading.show('Зареждане на данни...');

// Hide loading
Loading.hide();

// Button loading state
const button = document.getElementById('submit-btn');
Loading.button(button, true, 'Запазване...');

// Reset button
Loading.button(button, false);

// Example with async operation
async function saveData() {
  const button = document.getElementById('save-btn');
  Loading.button(button, true, 'Запазване...');

  try {
    await api.save(data);
    Alert.success('Данните са запазени');
  } catch (error) {
    Alert.error('Грешка при запазване');
  } finally {
    Loading.button(button, false);
  }
}
```

### Form Validation

```javascript
// Automatic validation with data-validate attribute
<form data-validate>
  <!-- Form fields -->
</form>

// Manual validation
const form = document.getElementById('my-form');
if (Validator.validateForm(form)) {
  // Form is valid
  submitForm();
}

// Individual field validation
const emailInput = document.getElementById('email');
if (Validator.email(emailInput.value)) {
  Validator.clearError(emailInput);
} else {
  Validator.showError(emailInput, 'Невалиден имейл адрес');
}

// Custom validation
const ageInput = document.getElementById('age');
if (Validator.range(ageInput.value, 18, 100)) {
  Validator.clearError(ageInput);
} else {
  Validator.showError(ageInput, 'Възрастта трябва да е между 18 и 100');
}
```

### Utilities

```javascript
// Format date
Utils.formatDate(new Date()); // "02.10.2025"
Utils.formatDate(new Date(), true); // "02.10.2025 14:30"

// Format number
Utils.formatNumber(1234567.89, 2); // "1 234 567.89"

// Debounce
const debouncedSearch = Utils.debounce((query) => {
  searchItems(query);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// Copy to clipboard
Utils.copyToClipboard('Text to copy');

// Get initials
Utils.getInitials('Иван Петров'); // "ИП"

// Scroll to element
const element = document.getElementById('target');
Utils.scrollTo(element, 80); // 80px offset for fixed header
```

---

## Layout Examples

### Responsive Grid

```html
<!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
<div class="grid grid-cols-1 grid-md-2 grid-lg-3 gap-md">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>

<!-- Mobile: 1 column, Desktop: 4 columns -->
<div class="grid grid-cols-1 grid-lg-4 gap-sm">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### Flexbox Layouts

```html
<!-- Horizontal layout with space between -->
<div class="flex justify-between items-center">
  <h2>Title</h2>
  <button class="btn btn-primary">Action</button>
</div>

<!-- Centered content -->
<div class="flex justify-center items-center" style="min-height: 400px;">
  <div>Centered content</div>
</div>

<!-- Vertical layout with gap -->
<div class="flex flex-col gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Container

```html
<!-- Standard container (max-width: 1200px) -->
<div class="container">
  Content...
</div>

<!-- Small container (max-width: 768px) -->
<div class="container container-sm">
  Content...
</div>

<!-- Large container (max-width: 1440px) -->
<div class="container container-lg">
  Content...
</div>
```

---

## Accessibility Checklist

### Required Elements

- [ ] Include skip to content link
- [ ] Use semantic HTML (nav, main, footer, etc.)
- [ ] Add ARIA labels to icon buttons
- [ ] Include alt text for images
- [ ] Use form labels with for attribute
- [ ] Add role="alert" to error messages
- [ ] Ensure proper heading hierarchy
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify color contrast

### Example Accessible Page Structure

```html
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Health & Fitness</title>
  <link rel="stylesheet" href="../shared/css/styles.css">
</head>
<body>
  <!-- Skip to content -->
  <a href="#main-content" class="skip-to-content">Прескочи към съдържанието</a>

  <!-- Navigation -->
  <nav class="navbar" role="navigation">
    <!-- Nav content -->
  </nav>

  <!-- Main content -->
  <main id="main-content" role="main">
    <!-- Page content -->
  </main>

  <!-- Footer -->
  <footer class="footer" role="contentinfo">
    <!-- Footer content -->
  </footer>

  <script src="../shared/js/ui.js"></script>
</body>
</html>
```

---

## Migration Checklist

### Per Page:

- [ ] Update CSS links to design system
- [ ] Update all text to Bulgarian
- [ ] Replace custom classes with design system classes
- [ ] Add `data-validate` to forms
- [ ] Add error spans to form fields
- [ ] Update button classes
- [ ] Update card structure
- [ ] Add accessibility attributes
- [ ] Test on mobile
- [ ] Test keyboard navigation
- [ ] Verify print styles

### Global:

- [ ] All pages use consistent navigation
- [ ] All pages use consistent footer
- [ ] All pages use Bulgarian text
- [ ] All forms validated consistently
- [ ] All modals use Modal component
- [ ] All alerts use Alert component
- [ ] All loading states use Loading component

---

## Testing Guide

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Responsive Testing
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1024px width
- Wide: 1440px width

### Print Testing
- Print preview in Chrome
- Check page breaks
- Verify hidden elements
- Ensure readable black/white

### Accessibility Testing
- Tab through all interactive elements
- Test with keyboard only (no mouse)
- Use browser dev tools accessibility checker
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Verify color contrast with tools

---

## Common Issues & Solutions

### Issue: Styles not applying
**Solution:** Check CSS file path is correct and file is loaded in browser network tab

### Issue: Modal not closing
**Solution:** Ensure ui.js is loaded before your custom scripts

### Issue: Form validation not working
**Solution:** Add `data-validate` attribute to form element

### Issue: Mobile menu not toggling
**Solution:** Check that ui.js is loaded and initMobileNav() is called

### Issue: Bulgarian characters displaying incorrectly
**Solution:** Ensure `<meta charset="UTF-8">` in HTML head

### Issue: Buttons too small on mobile
**Solution:** Use `btn-block` class for full-width mobile buttons

---

## Support

For questions or issues with the design system:

1. Check this implementation guide
2. Review the UI_GUIDE.md
3. Look at template files in shared/templates/
4. Check browser console for errors
5. Verify all CSS/JS files are loaded

---

**Version:** 1.0
**Last Updated:** October 2025
