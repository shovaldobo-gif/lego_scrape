# 🧱 לגו ישראל - השוואת מחירים

אפליקציית ווב להשוואת מחירים של מוצרי לגו בישראל.

## ✨ תכונות

- **חיפוש מוצרים** - חפש לפי מק"ט או שם מוצר
- **השוואת מחירים** - צפה במחירים מכל החנויות במקום אחד
- **סינון מתקדם** - סנן לפי קטגוריה, מחיר, חנות ומלאי
- **מבצעים חמים** - צפה במוצרים עם ההנחות הגדולות ביותר
- **התרעות מחיר** - קבל התראה כשהמחיר יורד
- **לינק ישיר לקניה** - עבור ישירות לחנות הזולה ביותר

## 🏪 חנויות נתמכות

- LEGO Official (lego.com/he-il)
- KSP
- Bug
- Ivory
- Toys R Us Israel
- Amazon (בקרוב)
- AliExpress (בקרוב)

## 🛠️ טכנולוגיות

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** - עיצוב
- **Framer Motion** - אנימציות
- **React Query** - ניהול state וקריאות API
- **Zustand** - ניהול state גלובלי
- **React Router** - ניווט

### Backend
- **Supabase** - Database + Auth
- **PostgreSQL** - בסיס נתונים

### Scraping
- **Cheerio** - HTML parsing
- **Axios** - HTTP requests
- **Puppeteer** (אופציונלי) - לאתרים עם JavaScript כבד

## 📁 מבנה הפרויקט

```
lego_scrape/
├── src/
│   ├── components/       # קומפוננטות UI
│   ├── pages/           # דפים
│   ├── types/           # TypeScript types
│   ├── lib/             # utilities ו-Supabase client
│   ├── store/           # Zustand store
│   ├── services/        # API services
│   ├── hooks/           # React hooks
│   └── scraper/         # שירות הסקרייפינג
│       └── stores/      # scraper לכל חנות
├── supabase/
│   └── schema.sql       # Database schema
├── public/              # קבצים סטטיים
└── package.json
```

## 🚀 התקנה

### 1. Clone the repository
```bash
git clone https://github.com/your-username/lego-price-comparison.git
cd lego-price-comparison
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Supabase
1. צור פרויקט חדש ב-[Supabase](https://supabase.com)
2. הרץ את ה-schema מ-`supabase/schema.sql`
3. צור קובץ `.env`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run development server
```bash
npm run dev
```

### 5. Run scraper (optional)
```bash
npm run scrape
```

## 📱 שימוש ב-Lovable

הפרויקט מוכן לייבוא ל-Lovable:

1. צור פרויקט חדש ב-Lovable
2. העתק את תוכן התיקייה `src/` לפרויקט
3. הוסף את ה-dependencies מ-`package.json`
4. הגדר את משתני הסביבה של Supabase

## 🔧 הגדרות נוספות

### Email Notifications
להפעלת התרעות במייל, הגדר:
```env
EMAIL_API_KEY=your-sendgrid-api-key
```

### Scraping Schedule
הסקרייפינג יכול לרוץ:
- ידנית: `npm run scrape`
- כ-Cron job (מומלץ כל 6 שעות)
- כ-Supabase Edge Function

## 📊 Database Schema

### Tables
- `products` - מוצרי לגו
- `prices` - מחירים נוכחיים (מחיר אחד לכל מוצר לכל חנות)
- `price_history` - היסטוריית מחירים
- `users` - משתמשים רשומים
- `alerts` - התרעות מחיר
- `scrape_logs` - לוגים של סקרייפינג

### Views
- `products_with_prices` - מוצרים עם המחיר הנמוך ביותר
- `hot_deals` - מוצרים עם הנחות משמעותיות

## 🤝 תרומה

נשמח לקבל תרומות! אפשר:
- לדווח על באגים
- להציע תכונות חדשות
- להוסיף scrapers לחנויות נוספות

## ⚠️ הצהרה

אתר זה אינו קשור או מאושר על ידי LEGO Group.
LEGO הוא סימן מסחרי של LEGO Group.

## 📄 רישיון

MIT License
