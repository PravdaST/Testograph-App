# Design System Quick Reference

## CSS Imports

```html
<!-- Main styles (required for all pages) -->
<link rel="stylesheet" href="../shared/css/styles.css">

<!-- Auth pages only -->
<link rel="stylesheet" href="../shared/css/auth.css">

<!-- Dashboard pages only -->
<link rel="stylesheet" href="../shared/css/dashboard.css">
```

## JavaScript Imports

```html
<!-- UI components (recommended for all pages) -->
<script src="../shared/js/ui.js"></script>
```

---

## Colors

| Variable | Value | Use Case |
|----------|-------|----------|
| `--primary` | #2563eb | Main actions, links |
| `--secondary` | #16a34a | Success, health metrics |
| `--accent` | #dc2626 | Warnings, delete actions |
| `--dark` | #1f2937 | Headings, dark text |
| `--text` | #111827 | Body text |
| `--text-muted` | #6b7280 | Secondary text |

---

## Spacing

| Class | Size | Pixels |
|-------|------|--------|
| `gap-xs`, `p-xs`, `mt-xs` | --space-xs | 8px |
| `gap-sm`, `p-sm`, `mt-sm` | --space-sm | 16px |
| `gap-md`, `p-md`, `mt-md` | --space-md | 24px |
| `gap-lg`, `p-lg`, `mt-lg` | --space-lg | 32px |
| `gap-xl`, `p-xl`, `mt-xl` | --space-xl | 48px |

---

## Buttons

```html
<button class="btn btn-primary">Запази</button>
<button class="btn btn-secondary">Добави</button>
<button class="btn btn-accent">Изтрий</button>
<button class="btn btn-outline">Отказ</button>
<button class="btn btn-ghost">Настройки</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Малък</button>
<button class="btn btn-primary">Нормален</button>
<button class="btn btn-primary btn-lg">Голям</button>
<button class="btn btn-primary btn-block">Цял ред</button>
```

---

## Forms

```html
<!-- Input -->
<div class="form-group">
  <label class="form-label required">Име</label>
  <input type="text" class="form-input" required>
  <span class="form-error"></span>
</div>

<!-- Select -->
<select class="form-select">
  <option>Опция</option>
</select>

<!-- Textarea -->
<textarea class="form-textarea"></textarea>

<!-- Checkbox -->
<div class="form-check">
  <input type="checkbox" class="form-check-input" id="cb">
  <label class="form-check-label" for="cb">Етикет</label>
</div>
```

---

## Cards

```html
<!-- Basic -->
<div class="card">
  <div class="card-body">
    <h3 class="card-title">Заглавие</h3>
    <p class="card-text">Текст</p>
  </div>
</div>

<!-- With header/footer -->
<div class="card">
  <div class="card-header"><h3>Заглавие</h3></div>
  <div class="card-body">Съдържание</div>
  <div class="card-footer">Футър</div>
</div>

<!-- Stat card -->
<div class="stat-card">
  <div class="stat-icon primary">📊</div>
  <div class="stat-content">
    <div class="stat-label">Етикет</div>
    <div class="stat-value">42</div>
    <div class="stat-trend up">+10%</div>
  </div>
</div>
```

---

## Alerts

```html
<div class="alert alert-success">Успех</div>
<div class="alert alert-error">Грешка</div>
<div class="alert alert-warning">Предупреждение</div>
<div class="alert alert-info">Информация</div>
```

---

## Tables

```html
<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr><th>Колона</th></tr>
    </thead>
    <tbody>
      <tr><td>Данни</td></tr>
    </tbody>
  </table>
</div>
```

---

## Badges

```html
<span class="badge badge-primary">Нов</span>
<span class="badge badge-secondary">Активен</span>
<span class="badge badge-accent">Важно</span>
```

---

## Layout

```html
<!-- Container -->
<div class="container">Съдържание</div>

<!-- Grid -->
<div class="grid grid-cols-1 grid-md-2 grid-lg-3 gap-md">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Flex -->
<div class="flex justify-between items-center gap-sm">
  <div>Ляво</div>
  <div>Дясно</div>
</div>
```

---

## JavaScript Components

### Alerts

```javascript
Alert.success('Съобщение');
Alert.error('Съобщение');
Alert.warning('Съобщение');
Alert.info('Съобщение');
```

### Modals

```javascript
Modal.show('Заглавие', '<p>Съдържание</p>');

Modal.confirm('Сигурни ли сте?', () => {
  // Confirmed
});

Modal.alert('Съобщение');
```

### Loading

```javascript
Loading.show('Зареждане...');
Loading.hide();

Loading.button(btn, true, 'Запазване...');
Loading.button(btn, false);
```

### Validation

```javascript
// Auto-validate forms with data-validate
<form data-validate>...</form>

// Manual validation
if (Validator.validateForm(form)) {
  // Valid
}

// Field-specific
Validator.showError(input, 'Грешка');
Validator.clearError(input);
```

### Utils

```javascript
Utils.formatDate(new Date()); // "02.10.2025"
Utils.formatNumber(1234.56, 2); // "1 234.56"
Utils.copyToClipboard('текст');
Utils.getInitials('Иван Петров'); // "ИП"
Utils.debounce(fn, 300);
```

---

## Bulgarian Text Reference

| English | Bulgarian |
|---------|-----------|
| Login | Вход |
| Logout | Изход |
| Sign up | Регистрация |
| Save | Запази |
| Cancel | Отказ |
| Delete | Изтрий |
| Edit | Редактирай |
| Add | Добави |
| Create | Създай |
| Update | Обнови |
| Submit | Изпрати |
| Confirm | Потвърди |
| Back | Назад |
| Next | Напред |
| Search | Търси |
| Filter | Филтрирай |
| Export | Експортирай |
| Print | Принтирай |
| Close | Затвори |
| Loading... | Зареждане... |
| Email | Имейл |
| Password | Парола |
| Name | Име |
| This field is required | Това поле е задължително |
| Invalid email | Невалиден имейл адрес |
| Success | Успех |
| Error | Грешка |
| Warning | Предупреждение |

---

## Responsive Breakpoints

| Size | Min Width | Prefix |
|------|-----------|--------|
| Mobile | < 768px | Default |
| Tablet | ≥ 768px | `md-` |
| Desktop | ≥ 1024px | `lg-` |

### Examples:
- `grid-cols-1` - 1 column on mobile
- `grid-md-2` - 2 columns on tablet+
- `grid-lg-3` - 3 columns on desktop+

---

## Common Patterns

### Page with Navigation

```html
<nav class="navbar">
  <div class="navbar-container">
    <a href="/" class="navbar-brand">Brand</a>
    <ul class="navbar-menu">
      <li><a href="#" class="navbar-link">Link</a></li>
    </ul>
  </div>
</nav>

<main class="container">
  <div class="page-header">
    <h1 class="page-title">Title</h1>
    <p class="page-description">Description</p>
  </div>
  <!-- Content -->
</main>

<footer class="footer">
  <div class="footer-container">
    <!-- Footer content -->
  </div>
</footer>
```

### Form with Validation

```html
<form data-validate>
  <div class="form-group">
    <label class="form-label required">Label</label>
    <input type="text" class="form-input" required>
    <span class="form-error"></span>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Filterable Grid

```html
<div class="card mb-lg">
  <div class="card-body">
    <div class="flex gap-sm">
      <select class="form-select" id="filter">
        <option>All</option>
      </select>
      <input type="search" class="form-input" placeholder="Search...">
    </div>
  </div>
</div>

<div class="grid grid-cols-1 grid-md-2 grid-lg-3 gap-md">
  <!-- Grid items -->
</div>
```

---

## Print Optimization

```html
<!-- Hide from print -->
<div class="no-print">Won't print</div>

<!-- Show only in print -->
<div class="print-only">Only in print</div>
```

Print styles automatically:
- Hide navigation, buttons
- Optimize for A4 paper
- Use black & white
- Add page breaks where needed

---

## Accessibility

```html
<!-- Skip link -->
<a href="#main" class="skip-to-content">Skip to content</a>

<!-- Main content -->
<main id="main">...</main>

<!-- ARIA labels -->
<button aria-label="Close">×</button>

<!-- Error messages -->
<span class="form-error" role="alert">Error</span>

<!-- Screen reader only -->
<span class="sr-only">Hidden text</span>
```

---

## File Structure

```
/shared
  /css
    styles.css          - Main design system ⭐
    auth.css           - Authentication pages
    dashboard.css      - Dashboard layout
  /js
    ui.js              - UI components ⭐
    auth.js            - Authentication
    storage.js         - Local storage
    analytics.js       - Analytics
  /templates
    auth-page-template.html
    dashboard-template.html
    tool-page-template.html
  UI_GUIDE.md          - Full UI/UX guide
  IMPLEMENTATION_GUIDE.md - Implementation details
  QUICK_REFERENCE.md   - This file
```

---

## Getting Started

1. **Copy template:** Use a template from `/shared/templates/`
2. **Include CSS:** Add required stylesheets
3. **Include JS:** Add `ui.js` for components
4. **Update text:** Change to Bulgarian
5. **Test:** Mobile, desktop, print, accessibility

---

## Examples

See complete examples in:
- `/shared/templates/auth-page-template.html`
- `/shared/templates/dashboard-template.html`
- `/shared/templates/tool-page-template.html`

---

**Quick Tip:** When in doubt, check the templates folder for working examples!
