export interface City {
  code: string;
  name: string;
  nameFa: string;
  country: string;
  countryFa: string;
}

export const cities: City[] = [
  // ایران
  { code: 'THR', name: 'Tehran', nameFa: 'تهران', country: 'Iran', countryFa: 'ایران' },
  { code: 'MHD', name: 'Mashhad', nameFa: 'مشهد', country: 'Iran', countryFa: 'ایران' },
  { code: 'IFN', name: 'Isfahan', nameFa: 'اصفهان', country: 'Iran', countryFa: 'ایران' },
  { code: 'SYZ', name: 'Shiraz', nameFa: 'شیراز', country: 'Iran', countryFa: 'ایران' },
  { code: 'TBZ', name: 'Tabriz', nameFa: 'تبریز', country: 'Iran', countryFa: 'ایران' },
  { code: 'KER', name: 'Kerman', nameFa: 'کرمان', country: 'Iran', countryFa: 'ایران' },
  { code: 'AWZ', name: 'Ahvaz', nameFa: 'اهواز', country: 'Iran', countryFa: 'ایران' },
  { code: 'KIH', name: 'Kish', nameFa: 'کیش', country: 'Iran', countryFa: 'ایران' },
  
  // امارات
  { code: 'DXB', name: 'Dubai', nameFa: 'دبی', country: 'UAE', countryFa: 'امارات' },
  { code: 'AUH', name: 'Abu Dhabi', nameFa: 'ابوظبی', country: 'UAE', countryFa: 'امارات' },
  { code: 'SHJ', name: 'Sharjah', nameFa: 'شارجه', country: 'UAE', countryFa: 'امارات' },
  
  // ترکیه
  { code: 'IST', name: 'Istanbul', nameFa: 'استانبول', country: 'Turkey', countryFa: 'ترکیه' },
  { code: 'AYT', name: 'Antalya', nameFa: 'آنتالیا', country: 'Turkey', countryFa: 'ترکیه' },
  { code: 'ESB', name: 'Ankara', nameFa: 'آنکارا', country: 'Turkey', countryFa: 'ترکیه' },
  
  // عربستان
  { code: 'JED', name: 'Jeddah', nameFa: 'جده', country: 'Saudi Arabia', countryFa: 'عربستان' },
  { code: 'RUH', name: 'Riyadh', nameFa: 'ریاض', country: 'Saudi Arabia', countryFa: 'عربستان' },
  { code: 'MED', name: 'Medina', nameFa: 'مدینه', country: 'Saudi Arabia', countryFa: 'عربستان' },
  
  // عراق
  { code: 'BGW', name: 'Baghdad', nameFa: 'بغداد', country: 'Iraq', countryFa: 'عراق' },
  { code: 'NJF', name: 'Najaf', nameFa: 'نجف', country: 'Iraq', countryFa: 'عراق' },
  { code: 'BSR', name: 'Basra', nameFa: 'بصره', country: 'Iraq', countryFa: 'عراق' },
  
  // اروپا
  { code: 'LHR', name: 'London', nameFa: 'لندن', country: 'UK', countryFa: 'انگلستان' },
  { code: 'CDG', name: 'Paris', nameFa: 'پاریس', country: 'France', countryFa: 'فرانسه' },
  { code: 'FRA', name: 'Frankfurt', nameFa: 'فرانکفورت', country: 'Germany', countryFa: 'آلمان' },
  { code: 'AMS', name: 'Amsterdam', nameFa: 'آمستردام', country: 'Netherlands', countryFa: 'هلند' },
  { code: 'FCO', name: 'Rome', nameFa: 'رم', country: 'Italy', countryFa: 'ایتالیا' },
  { code: 'VIE', name: 'Vienna', nameFa: 'وین', country: 'Austria', countryFa: 'اتریش' },
  
  // آسیا
  { code: 'BKK', name: 'Bangkok', nameFa: 'بانکوک', country: 'Thailand', countryFa: 'تایلند' },
  { code: 'KUL', name: 'Kuala Lumpur', nameFa: 'کوالالامپور', country: 'Malaysia', countryFa: 'مالزی' },
  { code: 'SIN', name: 'Singapore', nameFa: 'سنگاپور', country: 'Singapore', countryFa: 'سنگاپور' },
  { code: 'DEL', name: 'Delhi', nameFa: 'دهلی', country: 'India', countryFa: 'هند' },
  { code: 'BOM', name: 'Mumbai', nameFa: 'بمبئی', country: 'India', countryFa: 'هند' },
];

