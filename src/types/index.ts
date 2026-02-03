// ============================================
// LEGO Price Comparison - Type Definitions
// ============================================

// קטגוריות לגו
export type LegoCategory =
  | 'star-wars'
  | 'technic'
  | 'city'
  | 'creator'
  | 'friends'
  | 'ninjago'
  | 'harry-potter'
  | 'marvel'
  | 'dc'
  | 'disney'
  | 'architecture'
  | 'ideas'
  | 'speed-champions'
  | 'duplo'
  | 'minecraft'
  | 'icons'
  | 'botanicals'
  | 'other';

// מיפוי קטגוריות לשמות בעברית
export const categoryNames: Record<LegoCategory, string> = {
  'star-wars': 'מלחמת הכוכבים',
  'technic': 'טכניק',
  'city': 'סיטי',
  'creator': 'קריאייטור',
  'friends': 'פרנדס',
  'ninjago': "נינג'גו",
  'harry-potter': 'הארי פוטר',
  'marvel': 'מארוול',
  'dc': 'DC',
  'disney': 'דיסני',
  'architecture': 'אדריכלות',
  'ideas': 'איידיאס',
  'speed-champions': 'ספיד צ׳מפיונס',
  'duplo': 'דופלו',
  'minecraft': 'מיינקראפט',
  'icons': 'אייקונס',
  'botanicals': 'בוטניקלס',
  'other': 'אחר',
};

// חנויות בישראל
export type StoreName =
  | 'lego-official'
  | 'ksp'
  | 'bug'
  | 'ivory'
  | 'toys-r-us'
  | 'amazon'
  | 'aliexpress'
  | 'mega'
  | 'rami-levy'
  | 'other';

// מידע על חנות
export interface Store {
  id: StoreName;
  name: string;
  nameHe: string;
  logo: string;
  website: string;
  isOfficial: boolean;
}

// מאגר חנויות
export const stores: Record<StoreName, Store> = {
  'lego-official': {
    id: 'lego-official',
    name: 'LEGO Official',
    nameHe: 'לגו רשמי',
    logo: '/stores/lego.png',
    website: 'https://www.lego.com/he-il',
    isOfficial: true,
  },
  'ksp': {
    id: 'ksp',
    name: 'KSP',
    nameHe: 'KSP',
    logo: '/stores/ksp.png',
    website: 'https://ksp.co.il',
    isOfficial: false,
  },
  'bug': {
    id: 'bug',
    name: 'Bug',
    nameHe: 'באג',
    logo: '/stores/bug.png',
    website: 'https://www.bug.co.il',
    isOfficial: false,
  },
  'ivory': {
    id: 'ivory',
    name: 'Ivory',
    nameHe: 'אייבורי',
    logo: '/stores/ivory.png',
    website: 'https://www.ivory.co.il',
    isOfficial: false,
  },
  'toys-r-us': {
    id: 'toys-r-us',
    name: 'Toys R Us',
    nameHe: 'טויס אר אס',
    logo: '/stores/toysrus.png',
    website: 'https://www.toysrus.co.il',
    isOfficial: false,
  },
  'amazon': {
    id: 'amazon',
    name: 'Amazon',
    nameHe: 'אמזון',
    logo: '/stores/amazon.png',
    website: 'https://www.amazon.com',
    isOfficial: false,
  },
  'aliexpress': {
    id: 'aliexpress',
    name: 'AliExpress',
    nameHe: 'עלי אקספרס',
    logo: '/stores/aliexpress.png',
    website: 'https://www.aliexpress.com',
    isOfficial: false,
  },
  'mega': {
    id: 'mega',
    name: 'Mega',
    nameHe: 'מגה',
    logo: '/stores/mega.png',
    website: 'https://www.mega.co.il',
    isOfficial: false,
  },
  'rami-levy': {
    id: 'rami-levy',
    name: 'Rami Levy',
    nameHe: 'רמי לוי',
    logo: '/stores/rami-levy.png',
    website: 'https://www.rami-levy.co.il',
    isOfficial: false,
  },
  'other': {
    id: 'other',
    name: 'Other',
    nameHe: 'אחר',
    logo: '/stores/other.png',
    website: '',
    isOfficial: false,
  },
};

// מוצר לגו
export interface LegoProduct {
  id: string;
  sku: string; // מק"ט לגו (לדוגמה: 75192)
  name: string;
  nameHe: string;
  category: LegoCategory;
  description?: string;
  pieceCount?: number;
  minAge?: number;
  imageUrl: string;
  images?: string[];
  releaseYear?: number;
  isRetired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// מחיר מוצר בחנות ספציפית
export interface ProductPrice {
  id: string;
  productId: string;
  storeId: StoreName;
  price: number;
  originalPrice?: number; // מחיר לפני הנחה
  currency: 'ILS' | 'USD';
  inStock: boolean;
  url: string; // לינק ישיר לקניה
  lastUpdated: Date;
  isOnSale: boolean;
  discountPercentage?: number;
}

// מוצר עם כל המחירים שלו
export interface ProductWithPrices extends LegoProduct {
  prices: ProductPrice[];
  lowestPrice?: ProductPrice;
  officialPrice?: ProductPrice;
  savingsFromOfficial?: number;
}

// משתמש
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

// התרעת מחיר
export interface PriceAlert {
  id: string;
  userId: string;
  productId?: string; // התרעה למוצר ספציפי
  category?: LegoCategory; // או התרעה לקטגוריה
  targetPrice?: number; // מחיר יעד
  notifyOnAnyDiscount: boolean; // התראה על כל הנחה
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

// היסטוריית מחירים
export interface PriceHistory {
  id: string;
  productId: string;
  storeId: StoreName;
  price: number;
  recordedAt: Date;
}

// פילטרים לחיפוש
export interface SearchFilters {
  query?: string;
  sku?: string;
  categories?: LegoCategory[];
  minPrice?: number;
  maxPrice?: number;
  stores?: StoreName[];
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'discount' | 'newest';
}

// תוצאות חיפוש
export interface SearchResults {
  products: ProductWithPrices[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// נתוני סקרייפינג
export interface ScrapedProduct {
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  url: string;
  imageUrl?: string;
  store: StoreName;
  scrapedAt: Date;
}

// סטטוס סקרייפינג
export interface ScrapeStatus {
  store: StoreName;
  lastRun: Date;
  productsScraped: number;
  errors: number;
  status: 'success' | 'partial' | 'failed';
}

// מבצע/דיל חם
export interface HotDeal {
  product: ProductWithPrices;
  discountPercentage: number;
  savingsAmount: number;
  expiresAt?: Date;
}
