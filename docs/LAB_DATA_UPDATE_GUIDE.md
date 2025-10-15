# 📊 Ръководство за актуализация на данни за лаборатории

## ⚠️ ВАЖНО
Данните в `lib/data/labs-database.ts` са **ориентировъчни** и **ТРЯБВА** да се актуализират преди production deploy!

---

## 🎯 4 МЕТОДА ЗА СЪБИРАНЕ НА РЕАЛНИ ДАННИ

### ✅ МЕТОД 1: Ръчна актуализация (ПРЕПОРЪЧАН за старт)

**Време:** 2-3 дни
**Разходи:** 0 лв (само време)
**Точност:** 95-100%

**Стъпки:**
1. **Обади се до всяка лаборатория:**
   ```
   Позвъни на посочения телефон и попитай:
   - Актуална цена за Total Testosterone
   - Актуална цена за Free Testosterone
   - Пакетна цена (Total T + Free T + SHBG + Estradiol + LH)
   - Работни часове
   - Необходимо ли е записване на час?
   - Точен адрес на локацията
   ```

2. **Провери сайтовете:**
   - Synevo: https://www.synevo.bg/prices
   - Kandilarov: https://kandilarov.com/cennik
   - LINA: https://www.lina-bg.com/prices

3. **Актуализирай файла:**
   ```typescript
   // lib/data/labs-database.ts
   {
     city: "София",
     name: "Synevo България - Люлин",
     address: "бул. България 102", // ТОЧЕН адрес!
     phone: "02 9 863 864",
     price_total_t: "24 лв", // АКТУАЛНА цена
     price_free_t: "35 лв",
     price_package: "48 лв",
     hours: "Пон-Пет: 7:00-18:30, Съб: 8:00-14:00",
     no_appointment: true,
     website: "https://www.synevo.bg"
   }
   ```

4. **Обнови LAST_UPDATED:**
   ```typescript
   export const LAST_UPDATED = '2025-01-20' // Днешна дата
   ```

---

### 🤖 МЕТОД 2: Web Scraping (автоматичен)

**Време:** 1 седмица разработка
**Разходи:** 0 лв (ако сам го правиш)
**Точност:** 80-90%

**Технологии:**
- Puppeteer / Playwright за динамични сайтове
- Cheerio за статични HTML страници
- Cron job за автоматична актуализация

**Пример скрипт:**
```javascript
// scripts/scrape-synevo-prices.js
const puppeteer = require('puppeteer');

async function scrapeSynevoPrices() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.synevo.bg/prices');

  const prices = await page.evaluate(() => {
    // Намери Total Testosterone цена
    const totalT = document.querySelector('[data-test="total-testosterone"]')?.textContent;
    return { total_t: totalT };
  });

  console.log(prices);
  await browser.close();
}

scrapeSynevoPrices();
```

**Предимства:**
- Автоматично update на цени
- Scaling за 100+ лаборатории

**Недостатъци:**
- Сайтовете могат да променят структурата
- Legal/ethical въпроси (виж Terms of Service)
- Не всички лаборатории имат онлайн цени

---

### 🗺️ МЕТОД 3: Google Places API

**Време:** 1 ден интеграция
**Разходи:** ~$50-100/месец (зависи от calls)
**Точност:** 70-80% (липсват цени)

**Какво дава:**
- ✅ Актуални адреси
- ✅ Телефонни номера
- ✅ Работни часове
- ✅ Reviews/рейтинги
- ❌ НЯМА цени на тестове

**Setup:**
```javascript
// lib/utils/google-places.ts
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

async function getLabDetails(labName: string, city: string) {
  const query = `${labName} ${city} медицинска лаборатория`;
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=formatted_address,name,opening_hours,formatted_phone_number&key=${apiKey}`
  );
  return response.json();
}
```

**Комбинирай с Метод 1:**
- Google Places за адреси/часове
- Ръчно обаждане за цени

---

### 🤝 МЕТОД 4: Партньорства с лаборатории (BEST долгосрочно)

**Време:** 1-3 месеца преговори
**Разходи:** 0 лв (може и комисионна)
**Точност:** 100%

**Бизнес модел:**
1. **Affiliate програма:**
   - Свържи се с Synevo, Kandilarov, LINA
   - Предложи им: "Ще ви насочваме клиенти"
   - Те ти дават: Актуални данни + 5-10% комисионна

2. **API интеграция:**
   - Големите вериги (Synevo, Kandilarov) може да имат API
   - Real-time цени и наличност на часове

3. **Договор за данни:**
   - Месечен Excel/CSV export от тях
   - Ти импортираш в системата

**Предимства:**
- Винаги актуални данни
- Passive income от affiliate комисионни
- Partnership badge ("Официален партньор на Synevo")

**Недостатъци:**
- Дълъг процес на преговори
- Може да искат exclusive (само техни лаборатории)

---

## 📦 CSV IMPORT СИСТЕМА (за лесна актуализация)

Създай admin страница за import на CSV:

```csv
city,name,address,phone,price_total_t,price_free_t,price_package,hours,no_appointment,website
София,Synevo България,бул. България 102,02 9 863 864,24,35,48,Пон-Пет: 7:00-18:00,true,https://www.synevo.bg
```

**Admin UI:**
```typescript
// app/admin/labs/import/page.tsx
<input type="file" accept=".csv" onChange={handleCSVUpload} />

function handleCSVUpload(file) {
  const parsed = parseCSV(file);
  // Update labs-database.ts or database
}
```

---

## ✅ CHECKLIST ПРЕДИ PRODUCTION

- [ ] Обадени са се до ТОП 10 лаборатории и цените са верифицирани
- [ ] Проверени са работните часове
- [ ] Телефонните номера са валидни
- [ ] Уебсайтовете работят (не са 404)
- [ ] Добавен е disclaimer компонент
- [ ] LAST_UPDATED е актуален
- [ ] "Докладвай грешка" бутонът работи

---

## 📞 КОНТАКТИ НА ОСНОВНИ ВЕРИГИ

**Synevo България:**
- Телефон: 02 9 863 864
- Email: info@synevo.bg
- Locations: 40+ в цялата страна

**СМДЛ Кандиларов:**
- Телефон: 0700 70 117
- Email: office@kandilarov.com
- Locations: 15+ в цялата страна

**ЛИНА:**
- Телефон: варира по градове
- Website: https://www.lina-bg.com
- Locations: 20+ в цялата страна

---

## 🔄 ПРЕПОРЪЧАН ГРАФИК ЗА АКТУАЛИЗАЦИЯ

- **Месечно:** Провери цени на ТОП 5 вериги
- **На 3 месеца:** Пълна актуализация на всички данни
- **При оплаквания:** Моментална проверка на съответната лаборатория

---

## 💡 ИДЕИ ЗА ПОДОБРЕНИЕ

1. **User contributions:**
   - Позволи на потребители да предлагат корекции
   - Admin одобрява промените

2. **Crowdsourced reviews:**
   - След като потребител посети лаборатория → попитай за review
   - "Цената беше вярна? Да/Не"

3. **Price history:**
   - Запазвай исторически цени
   - Покажи "Цената се е повишила с 15% от миналата година"

4. **Notifications:**
   - Alert при промяна на цени
   - "Synevo намали цената на Total T с 10%!"

---

## 🎯 QUICK START (1 ден)

**Най-бързото решение:**

1. Обади се до **Synevo** (02 9 863 864) и попитай за ВСИЧКИ техни локации + цени
2. Обади се до **Kandilarov** (0700 70 117) - същото
3. Обади се до **LINA** - провери техния сайт за локации
4. Актуализирай 15-20 топ лаборатории в `labs-database.ts`
5. Обнови `LAST_UPDATED`
6. Deploy!

**Резултат:** 70% точност за 1 ден работа (достатъчно за MVP launch)

---

Успех! 🚀
