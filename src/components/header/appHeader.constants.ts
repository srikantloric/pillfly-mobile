export const HOME_HEADER_SCROLL = { collapseStart: 0, collapseEnd: 88 } as const;

export const DEFAULT_SEARCH_PLACEHOLDER = 'Search medicines & healthcare';

export const SEARCH_PLACEHOLDERS = {
  categories: 'Search categories',
  savings: 'Search savings & coupons',
} as const;

export const APP_HEADER_VARIANT_SURFACE = {
  home: 'bg-white border-b border-slate-200',
  category: 'bg-slate-50 border-b border-slate-200',
  offer: 'bg-amber-50 border-b border-amber-200',
  savings: 'bg-emerald-50 border-b border-emerald-200',
} as const;

export const APP_HEADER_VARIANT_ICON_COLOR = {
  home: '#0f172a',
  category: '#334155',
  offer: '#92400e',
  savings: '#065f46',
} as const;

export const HEADER_HIT_SLOP = 10;
export const HEADER_ICON_SLOT_CLASS = 'h-11 w-11';
