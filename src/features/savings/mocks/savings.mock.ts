export type SavingsCouponCategory =
  | 'all'
  | 'payment'
  | 'medicine'
  | 'diagnostic'
  | 'healthcare';

export type SavingsCoupon = {
  id: string;
  category: Exclude<SavingsCouponCategory, 'all'>;
  brandLabel: string;
  brandBg: string;
  brandTextColor: string;
  title: string;
  description: string;
  code: string;
};

export const SAVINGS_CATEGORY_CHIPS: { id: SavingsCouponCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'payment', label: 'Payment' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'diagnostic', label: 'Diagnostic' },
  { id: 'healthcare', label: 'Healthcare' },
];

export const SAVINGS_COUPONS: SavingsCoupon[] = [
  {
    id: '1',
    category: 'medicine',
    brandLabel: 'PE',
    brandBg: '#0E7490',
    brandTextColor: '#FFFFFF',
    title: 'Get 26%* OFF on orders above Rs.1500',
    description: 'On Medicine & Healthcare',
    code: 'AIDCURE26',
  },
  {
    id: '2',
    category: 'healthcare',
    brandLabel: '20%',
    brandBg: '#0D9488',
    brandTextColor: '#FFFFFF',
    title: 'Get FLAT 10% off on medicine & healthcare',
    description: 'For All Medicine & Health Care',
    code: 'HEALTH10',
  },
  {
    id: '3',
    category: 'payment',
    brandLabel: 'BHIM',
    brandBg: '#1E3A5F',
    brandTextColor: '#FFFFFF',
    title: 'Get 23% off on medicine with BHIM UPI',
    description: 'Get up to 23% off on medicine & healthcare products above Rs.1250',
    code: 'PE23PLAID',
  },
  {
    id: '4',
    category: 'diagnostic',
    brandLabel: 'LAB',
    brandBg: '#7C3AED',
    brandTextColor: '#FFFFFF',
    title: 'Flat 15% off on diagnostic tests',
    description: 'Valid on all lab tests above Rs.999',
    code: 'DIAG15',
  },
  {
    id: '5',
    category: 'medicine',
    brandLabel: 'MW',
    brandBg: '#2563EB',
    brandTextColor: '#FFFFFF',
    title: 'Get ₹150 cashback via Mobikwik',
    description: 'On medicine orders above Rs.799',
    code: 'MOBI150',
  },
];

export const SAVINGS_WALLET_BALANCE = '₹100';
export const SAVINGS_REFER_REWARD = 'Get ₹200';
