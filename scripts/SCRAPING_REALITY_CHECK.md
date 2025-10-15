# 🔍 Web Scraping за Lab Data - Реалност Check

## ❌ ПРОБЛЕМИ С ПРОСТИЯ SCRAPING

Тестовият scraper **НЕ РАБОТИ** защото:

1. **404 Errors** - URL-ите за ценоразписи не са публично достъпни или се казват по-различно
2. **JavaScript Required** - Повечето модерни сайтове са SPA (Single Page Applications)
3. **Anti-scraping** - Сайтовете имат защити (Cloudflare, rate limiting)
4. **No Public Price API** - Лабораториите НЕ публикуват цени онлайн (искат да ти се обадиш)

---

## 🎯 РЕАЛНА СИТУАЦИЯ

### Synevo (https://www.synevo.bg)
- ✅ Има онлайн каталог с изследвания
- ❌ Цените НЕ СА видими без login/запитване
- 📞 Трябва да се обадиш: **02 9 863 864**

### Kandilarov (https://kandilarov.com)
- ✅ Имат ценоразпис секция
- ⚠️ Изисква JavaScript rendering (React/Vue app)
- 📞 Алтернатива: **0700 70 117**

### LINA (https://www.lina-bg.com)
- ✅ Имат локации
- ❌ Цените са скрити или в PDF файлове
- 📞 Номерът варира по града

---

## ✅ ПРЕПОРЪЧАНИ РЕШЕНИЯ

### 🥇 РЕШЕНИЕ 1: Ръчна актуализация (РЕАЛНО РАБОТИ)

**Време:** 1 ден
**Разходи:** 0 лв
**Точност:** 100%

```bash
# PHONE SCRIPT
"Здравейте, обаждам се от Testograph.
 Може ли да ми кажете актуалните цени за:
 - Total Testosterone (общ тестостерон)
 - Free Testosterone (свободен тестостерон)
 - Пакет: Total T + Free T + SHBG + Estradiol + LH

 Също, необходимо ли е записване на час?"
```

**Резултат:** 15 мин x 28 лаборатории = 7 часа чиста работа

---

### 🥈 РЕШЕНИЕ 2: Puppeteer Scraping (АКО има публични цени)

Ако Kandilarov НАИСТИНА има онлайн ценоразпис, използвай Puppeteer:

```bash
npm install puppeteer
```

```javascript
// scripts/scrape-kandilarov-advanced.mjs
import puppeteer from 'puppeteer';

async function scrapeKandilarovWithPuppeteer() {
  const browser = await puppeteer.launch({
    headless: false, // Виж какво става
  });

  const page = await browser.newPage();

  // Go to price page
  await page.goto('https://kandilarov.com/cennik', {
    waitUntil: 'networkidle2'
  });

  // Wait for content to load (adjust selector based on real page)
  await page.waitForSelector('.price-table', { timeout: 10000 });

  // Extract data
  const prices = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.price-table tr'));

    return rows
      .map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return null;

        return {
          test: cells[0]?.textContent?.trim(),
          price: cells[1]?.textContent?.trim()
        };
      })
      .filter(item => item && item.test?.toLowerCase().includes('testosterone'));
  });

  console.log('Found prices:', prices);

  await browser.close();
  return prices;
}

scrapeKandilarovWithPuppeteer();
```

**ВАЖНО:** Тествай на РЕАЛЕН сайт и adjust селекторите!

---

### 🥉 РЕШЕНИЕ 3: PDF Parsing

Ако лабораториите имат PDF ценоразписи:

```bash
npm install pdf-parse
```

```javascript
import fs from 'fs';
import pdf from 'pdf-parse';

async function parsePricePDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);

  // Search for "Testosterone" in PDF text
  const lines = data.text.split('\n');
  const testosteronePrices = lines.filter(line =>
    line.toLowerCase().includes('testosterone')
  );

  console.log(testosteronePrices);
}

parsePricePDF('./kandilarov-prices.pdf');
```

---

### 🥇 РЕШЕНИЕ 4: Google Sheets Import (BEST!)

Направи Google Sheet с данните и import-вай го:

**Setup:**
1. Създай Google Sheet: https://sheets.google.com
2. Попълни данни (може да copy-paste от PDF-и)
3. Publish as CSV: File → Share → Publish to web → CSV
4. Import в app-а:

```javascript
// scripts/import-from-google-sheets.mjs
import fetch from 'node-fetch';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv';

async function importFromGoogleSheets() {
  const response = await fetch(SHEET_URL);
  const csv = await response.text();

  // Parse CSV
  const lines = csv.split('\n');
  const labs = lines.slice(1).map(line => {
    const [city, name, address, phone, price_total_t, price_free_t] = line.split(',');
    return { city, name, address, phone, price_total_t, price_free_t };
  });

  console.log(`Imported ${labs.length} labs`);
  return labs;
}
```

**Предимства:**
- ✅ Лесно за update (само edit-ваш Sheet-а)
- ✅ Колегите могат да помагат
- ✅ Винаги актуално (auto-sync)

---

## 🎯 МОЯ ПРЕПОРЪКА

За **TESTOGRAPH PRODUCTION:**

### Фаза 1: Launch (1-2 дни)
1. **Обади се до ТОП 10 лаборатории** (Synevo x3, Kandilarov x3, LINA x4)
2. **Попълни Google Sheet** с данните
3. **Import в app** от Sheet-а
4. **Deploy!** 🚀

### Фаза 2: Scaling (1-3 месеца)
1. **User contributions** - Позволи на users да докладват грешки
2. **Партньорства** - Свържи се с Synevo за официални данни
3. **Affiliate program** - Предложи им комисионна

### Фаза 3: Automation (6+ месеца)
1. **API интеграция** с големите вериги
2. **Real-time цени** от partner API-та
3. **Automated updates** всеки ден

---

## 📞 QUICK START (СЕГА)

```bash
# 1. Обади се на Synevo
tel: 02 9 863 864
Попитай: Цени за Total T, Free T, Пакет

# 2. Обади се на Kandilarov
tel: 0700 70 117
Същото

# 3. Актуализирай файла
code lib/data/labs-database.ts

# 4. Update timestamp
export const LAST_UPDATED = '2025-01-20' // Днес
```

**Резултат:** 30 min работа = 10 верифицирани лаборатории = ГОТОВО ЗА LAUNCH! 🎉

---

## 💡 BOTTOM LINE

**Web scraping е добра идея, НО:**
- Изисква време за development (2-5 дни)
- Може да не работи (защити, JS, скрити цени)
- Може да счупи при промяна на сайт

**Ръчното обаждане:**
- Гарантирано работи
- 100% точност
- 1 ден работа за 28 лаборатории

**За production:** Започни с ръчно, после автоматизирай! 🚀
