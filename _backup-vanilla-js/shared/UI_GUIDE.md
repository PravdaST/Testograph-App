# UI/UX Design System Guide

## Overview
This document defines the design standards, UI conventions, and Bulgarian language text patterns for the Health & Fitness Tools platform.

---

## 1. Design Principles

### Core Values
- **Clarity**: Information should be clear and easy to understand
- **Consistency**: Similar patterns across all tools
- **Accessibility**: WCAG AA compliant, keyboard navigable
- **Performance**: Fast loading, optimized for mobile
- **Professional**: Masculine, health-focused aesthetic

### Visual Hierarchy
1. Use size, weight, and color to establish hierarchy
2. Important actions use primary colors
3. Destructive actions use accent (red) color
4. Success states use secondary (green) color

---

## 2. Color System

### Primary Colors
```css
--primary: #2563eb (Blue) - Main actions, links
--secondary: #16a34a (Green) - Health, success, positive actions
--accent: #dc2626 (Red) - Warnings, deletions, alerts
```

### When to Use Each Color

**Primary (Blue)**
- Login/Submit buttons
- Primary call-to-action buttons
- Active navigation items
- Important links

**Secondary (Green)**
- Success messages
- Health-related metrics (good ranges)
- Add/Save buttons
- Positive trends

**Accent (Red)**
- Delete buttons
- Error messages
- Warning alerts
- Out-of-range health metrics

---

## 3. Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes
- **h1**: 30-36px (Page titles)
- **h2**: 24px (Section headers)
- **h3**: 20px (Card titles)
- **body**: 16px (Default)
- **small**: 14px (Helper text)
- **xs**: 12px (Labels, badges)

### Bulgarian Language Support
The font stack fully supports Cyrillic characters. Test all UI text with:
- Uppercase: АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ
- Lowercase: абвгдежзийклмнопрстуфхцчшщъьюя

---

## 4. Spacing System

### Spacing Scale
```css
--space-xs: 8px   - Tight spacing (badges, small gaps)
--space-sm: 16px  - Standard spacing (form fields, buttons)
--space-md: 24px  - Medium spacing (cards, sections)
--space-lg: 32px  - Large spacing (page sections)
--space-xl: 48px  - Extra large (page headers)
```

### Usage Guidelines
- Use consistent spacing throughout
- Maintain rhythm with the spacing scale
- Never use arbitrary values (7px, 13px, etc.)

---

## 5. Components

### Buttons

#### Primary Actions
```html
<button class="btn btn-primary">Вход</button>
<button class="btn btn-primary">Запази</button>
<button class="btn btn-primary">Потвърди</button>
```

**When to use**: Main actions, form submissions, primary CTAs

#### Secondary Actions
```html
<button class="btn btn-secondary">Добави</button>
<button class="btn btn-secondary">Създай</button>
```

**When to use**: Positive actions, creating new items

#### Outline Buttons
```html
<button class="btn btn-outline">Отказ</button>
<button class="btn btn-outline">Назад</button>
```

**When to use**: Cancel actions, secondary options

#### Destructive Actions
```html
<button class="btn btn-accent">Изтрий</button>
<button class="btn btn-accent">Премахни</button>
```

**When to use**: Delete, remove, destructive operations

### Forms

#### Standard Input
```html
<div class="form-group">
  <label class="form-label required">Име</label>
  <input type="text" class="form-input" placeholder="Въведете име">
  <span class="form-help">Моля, въведете вашето име</span>
</div>
```

#### Input with Error
```html
<div class="form-group">
  <label class="form-label required">Имейл</label>
  <input type="email" class="form-input error" value="invalid">
  <span class="form-error">Невалиден имейл адрес</span>
</div>
```

### Cards

#### Exercise/Meal Card
```html
<div class="card item-card">
  <img src="image.jpg" class="item-card-image" alt="Exercise">
  <div class="card-body item-card-content">
    <h3 class="card-title">Название</h3>
    <p class="card-text">Описание...</p>
    <div class="item-card-actions">
      <button class="btn btn-primary btn-sm">Виж повече</button>
      <button class="btn btn-outline btn-sm">Добави</button>
    </div>
  </div>
</div>
```

#### Stat Card
```html
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
<!-- Success -->
<div class="alert alert-success">
  Успешно запазихте промените
</div>

<!-- Error -->
<div class="alert alert-error">
  Възникна грешка при запазване
</div>

<!-- Warning -->
<div class="alert alert-warning">
  Внимание: Проверете данните
</div>

<!-- Info -->
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
        <th>Референтен диапазон</th>
        <th>Статус</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Холестерол</td>
        <td>180 mg/dL</td>
        <td>125-200 mg/dL</td>
        <td><span class="badge badge-secondary">Нормално</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 6. Bulgarian UI Text Standards

### Button Text Conventions

#### Common Actions
| Action | Bulgarian | Context |
|--------|-----------|---------|
| Login | Вход | Authentication |
| Logout | Изход | User menu |
| Sign up | Регистрация | Authentication |
| Save | Запази | Forms |
| Cancel | Отказ | Forms, modals |
| Delete | Изтрий | Destructive action |
| Edit | Редактирай | Item actions |
| Add | Добави | Creating new items |
| Create | Създай | Creating new items |
| Update | Обнови | Updating existing |
| Submit | Изпрати | Form submission |
| Confirm | Потвърди | Confirmation dialogs |
| Back | Назад | Navigation |
| Next | Напред | Multi-step forms |
| Search | Търси | Search functionality |
| Filter | Филтрирай | Data filtering |
| Export | Експортирай | Data export |
| Print | Принтирай | Printing |
| View | Виж | View details |
| Close | Затвори | Close modals/dialogs |

### Form Labels

#### User Information
- **Име**: Name
- **Имейл**: Email
- **Парола**: Password
- **Потвърди парола**: Confirm password
- **Телефон**: Phone
- **Дата на раждане**: Birth date
- **Пол**: Gender

#### Health & Fitness
- **Тегло**: Weight
- **Височина**: Height
- **Цел**: Goal
- **Ниво**: Level
- **Продължителност**: Duration
- **Повторения**: Repetitions
- **Серии**: Sets
- **Почивка**: Rest
- **Калории**: Calories
- **Протеин**: Protein
- **Въглехидрати**: Carbohydrates
- **Мазнини**: Fats

### Error Messages

#### Validation Errors
```javascript
const errors = {
  required: "Това поле е задължително",
  email: "Невалиден имейл адрес",
  password: "Паролата трябва да е поне 8 символа",
  passwordMatch: "Паролите не съвпадат",
  number: "Моля, въведете число",
  positive: "Стойността трябва да е положителна",
  date: "Невалидна дата",
  phone: "Невалиден телефонен номер",
  minLength: "Минимална дължина: {n} символа",
  maxLength: "Максимална дължина: {n} символа",
  min: "Минимална стойност: {n}",
  max: "Максимална стойност: {n}"
};
```

#### System Errors
```javascript
const systemErrors = {
  network: "Няма връзка с интернет",
  server: "Грешка на сървъра. Моля, опитайте отново",
  notFound: "Ресурсът не е намерен",
  unauthorized: "Нямате достъп до този ресурс",
  timeout: "Заявката изтече. Моля, опитайте отново",
  unknown: "Възникна неочаквана грешка"
};
```

### Success Messages

```javascript
const successMessages = {
  saved: "Успешно запазихте промените",
  created: "Успешно създадохте {item}",
  updated: "Успешно обновихте {item}",
  deleted: "Успешно изтрихте {item}",
  login: "Добре дошли!",
  logout: "Успешно излязохте",
  registered: "Регистрацията е успешна",
  emailSent: "Имейлът е изпратен",
  copied: "Копирано в клипборда"
};
```

### Loading States

```javascript
const loadingMessages = {
  loading: "Зареждане...",
  saving: "Запазване...",
  deleting: "Изтриване...",
  uploading: "Качване...",
  processing: "Обработка...",
  searching: "Търсене...",
  sending: "Изпращане..."
};
```

### Empty States

```html
<!-- No data -->
<div class="text-center p-xl">
  <p class="text-muted">Няма налични данни</p>
</div>

<!-- No results -->
<div class="text-center p-xl">
  <p class="text-muted">Няма намерени резултати</p>
  <button class="btn btn-primary mt-md">Опитайте отново</button>
</div>

<!-- No items -->
<div class="text-center p-xl">
  <p class="text-muted">Все още нямате добавени елементи</p>
  <button class="btn btn-primary mt-md">Добави първи елемент</button>
</div>
```

### Confirmation Dialogs

```javascript
const confirmations = {
  delete: "Сигурни ли сте, че искате да изтриете {item}?",
  cancel: "Сигурни ли сте, че искате да отмените? Незапазените промени ще бъдат загубени.",
  logout: "Сигурни ли сте, че искате да излезете?",
  discard: "Сигурни ли сте, че искате да отхвърлите промените?"
};
```

---

## 7. Layout Patterns

### Dashboard Layout

```html
<div class="dashboard-wrapper">
  <div class="sidebar">
    <!-- Sidebar content -->
  </div>
  <div class="dashboard-main">
    <div class="dashboard-header">
      <!-- Header content -->
    </div>
    <div class="dashboard-content">
      <!-- Main content -->
    </div>
  </div>
</div>
```

### Page Layout

```html
<div class="container">
  <div class="page-header">
    <h1 class="page-title">Заглавие на страницата</h1>
    <p class="page-description">Описание...</p>
    <div class="page-actions">
      <button class="btn btn-primary">Главно действие</button>
    </div>
  </div>
  <!-- Page content -->
</div>
```

---

## 8. Responsive Breakpoints

```css
/* Mobile first approach */
Base: < 768px (Mobile)
Tablet: >= 768px
Desktop: >= 1024px
Wide: >= 1440px
```

### Mobile Guidelines
- Stack columns vertically
- Use full-width buttons
- Hide/collapse navigation
- Increase touch target sizes (min 44x44px)
- Reduce padding/spacing

### Tablet Guidelines
- 2-column layouts
- Show simplified navigation
- Medium spacing

### Desktop Guidelines
- Multi-column layouts
- Full navigation
- Hover states
- Generous spacing

---

## 9. Accessibility Standards

### WCAG AA Compliance

#### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

#### Focus States
- All interactive elements must have visible focus
- Use `outline: 2px solid var(--primary)` for focus
- Never use `outline: none` without alternative

#### Keyboard Navigation
- All functionality available via keyboard
- Logical tab order
- Skip to content link for screen readers
- Escape to close modals

#### Screen Reader Support
```html
<!-- Use semantic HTML -->
<button>Not <div onclick="...">

<!-- ARIA labels when needed -->
<button aria-label="Затвори">×</button>

<!-- Screen reader only text -->
<span class="sr-only">Допълнителна информация</span>
```

---

## 10. Form Validation Patterns

### Real-time Validation
- Validate on blur (after user leaves field)
- Show errors immediately
- Remove errors when fixed
- Use clear, helpful error messages

### Example Implementation
```html
<div class="form-group">
  <label class="form-label required">Имейл</label>
  <input
    type="email"
    class="form-input"
    id="email"
    required
    aria-describedby="email-error"
  >
  <span class="form-error" id="email-error" role="alert"></span>
</div>
```

```javascript
// Validation on blur
input.addEventListener('blur', (e) => {
  if (!validateEmail(e.target.value)) {
    e.target.classList.add('error');
    errorSpan.textContent = 'Невалиден имейл адрес';
  } else {
    e.target.classList.remove('error');
    errorSpan.textContent = '';
  }
});
```

---

## 11. Loading States

### Button Loading
```html
<button class="btn btn-primary" disabled>
  <span class="spinner spinner-sm"></span>
  Запазване...
</button>
```

### Page Loading
```html
<div class="loading-overlay">
  <div class="spinner spinner-lg"></div>
  <p>Зареждане...</p>
</div>
```

### Skeleton Loading
For cards and lists, consider using skeleton screens instead of spinners.

---

## 12. Icon Usage

### Icon Library
Recommended: Use emoji or a lightweight icon library like:
- Lucide Icons
- Heroicons
- Feather Icons
- Font Awesome (only if needed)

### Common Icons
- ➕ Add
- ✏️ Edit
- 🗑️ Delete
- 💾 Save
- 🔍 Search
- ⚙️ Settings
- 👤 User
- 📊 Stats/Reports
- 📅 Calendar
- ⏱️ Time
- 🍎 Meal
- 💪 Exercise
- 🛏️ Sleep
- 💊 Supplement

---

## 13. Print Optimization

### Print-Friendly Elements
- Remove navigation, buttons
- Use black & white
- Optimize for A4 paper
- Show important data only
- Include page breaks where needed

### Print Classes
```html
<!-- Hide from print -->
<div class="no-print">...</div>

<!-- Show only in print -->
<div class="print-only">...</div>
```

---

## 14. Performance Guidelines

### CSS
- Load critical CSS inline
- Defer non-critical CSS
- Minimize file size (current: ~25KB minified)
- Use CSS variables for theming

### Images
- Use WebP format where possible
- Lazy load images below the fold
- Provide appropriate sizes
- Use aspect ratios to prevent layout shift

### Fonts
- System font stack (no web fonts = faster load)
- Fallback fonts for all characters

---

## 15. Testing Checklist

### Visual Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS, Android)
- [ ] Test on tablet
- [ ] Test all breakpoints
- [ ] Test in dark mode (if supported)
- [ ] Test print preview

### Functional Testing
- [ ] All buttons work
- [ ] All forms validate
- [ ] All links work
- [ ] Modals open/close
- [ ] Responsive menu works
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Accessibility Testing
- [ ] Color contrast passes
- [ ] Focus states visible
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Tab order logical
- [ ] Works without mouse

### Bulgarian Text Testing
- [ ] All text in Bulgarian
- [ ] No encoding issues
- [ ] Proper grammar
- [ ] Consistent terminology
- [ ] Appropriate tone

---

## 16. Component Library Quick Reference

### Import Stylesheets
```html
<!-- All pages -->
<link rel="stylesheet" href="/shared/css/styles.css">

<!-- Auth pages only -->
<link rel="stylesheet" href="/shared/css/auth.css">

<!-- Dashboard pages only -->
<link rel="stylesheet" href="/shared/css/dashboard.css">
```

### Common Patterns

#### Full-width Button
```html
<button class="btn btn-primary btn-block">Вход</button>
```

#### Button Group
```html
<div class="flex gap-sm">
  <button class="btn btn-primary">Запази</button>
  <button class="btn btn-outline">Отказ</button>
</div>
```

#### Form with Validation
```html
<form class="auth-form">
  <div class="form-group">
    <label class="form-label required">Имейл</label>
    <input type="email" class="form-input" required>
    <span class="form-error"></span>
  </div>
  <button type="submit" class="btn btn-primary btn-block">Вход</button>
</form>
```

#### Modal
```html
<div class="modal-backdrop" id="myModal">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Заглавие</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <!-- Content -->
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline">Отказ</button>
      <button class="btn btn-primary">Потвърди</button>
    </div>
  </div>
</div>
```

---

## 17. Best Practices Summary

### Do's ✅
- Use semantic HTML
- Follow the spacing scale
- Use CSS variables
- Write Bulgarian text properly
- Test on real devices
- Optimize for performance
- Make it accessible
- Keep it consistent

### Don'ts ❌
- Don't use inline styles
- Don't use arbitrary spacing values
- Don't mix languages
- Don't ignore accessibility
- Don't create custom components without checking existing ones
- Don't use !important (unless absolutely necessary)
- Don't forget mobile users
- Don't skip testing

---

## 18. Support & Resources

### File Structure
```
/shared
  /css
    styles.css      - Main design system
    auth.css        - Authentication pages
    dashboard.css   - Dashboard layout
  /js
    main.js         - Shared JavaScript
  /assets
    /images         - Shared images
    /icons          - Icon files
```

### Getting Help
- Review this guide first
- Check existing implementations
- Use browser DevTools to inspect
- Test in multiple browsers
- Ask for code review

---

**Version**: 1.0
**Last Updated**: October 2025
**Maintained by**: UI/UX Team
