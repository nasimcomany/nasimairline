/**
 * NIRA API Service
 * Service for calling NIRA flight APIs
 */
import { getApiBaseUrl } from '../utils/apiBase';

const API_BASE_URL = getApiBaseUrl();

export interface OriginCity {
  CITYNAME_FA: string;
  CITY: string;
  CITYNAME_EN: string;
  isDomestic: string;
}

/** Nira sandbox dummy cities — not real Nasim destinations */
function isNiraTestCity(city: OriginCity): boolean {
  const code = (city.CITY || '').trim().toUpperCase();
  if (code === 'UGT' || code === 'TTQ') return true;
  const blob = `${city.CITYNAME_EN || ''} ${city.CITYNAME_FA || ''}`.toLowerCase();
  return blob.includes('(test)') || (city.CITYNAME_FA || '').includes('تست');
}

function withoutTestCities(cities: OriginCity[]): OriginCity[] {
  return cities.filter((c) => !isNiraTestCity(c));
}

export interface FlightAvailability {
  Origin: string;
  Destination: string;
  DepartureDateTime: string;
  ArrivalDateTime: string;
  FlightNo: string;
  FlightStatus: string;
  FlightDurationTime: string;
  ClassStatus: Array<{
    CabinClass: string;
    Status: string;
    TotalPrice: number;
    CurrencyCode: string;
    ClassName: string;
    Refundable: boolean;
    AllowReservation: boolean;
    BaggageAllowanceWeight: number;
    BaggageAllowancePieces: number;
  }>;
  DepartureAirportName: string;
  ArrivalAirportName: string;
  AircarftType: string;
  AircarftTypeNameFA: string;
  AircarftTypeNameEN: string;
  Meal: string;
  DepartureTerminal: string;
  ArrivalTerminal: string;
  JourneyType: string;
  AirLineCode: string;
  // فیلدهای جدید برای اطلاعات لحظه‌ای (از API های خارجی)
  ActualDepartureDateTime?: string;  // زمان واقعی پرواز
  ActualArrivalDateTime?: string;     // زمان واقعی فرود
  DelayMinutes?: number;              // تأخیر به دقیقه
  DepartureGate?: string;             // گیت پرواز
  ArrivalGate?: string;               // گیت فرود
  Stops?: number;                     // تعداد توقف
}

/**
 * Same rule for map + search results:
 * list scheduled flights from Nira, except hard-cancelled rows.
 * Sale/bookability is decided separately via getFlightSaleState().
 */
export function isListedNiraFlight(flight: FlightAvailability | null | undefined): boolean {
  if (!flight) return false;
  const status = String(flight.FlightStatus || '').trim().toUpperCase();
  if (status === 'X' || status === 'CANCELLED' || status === 'CNL') return false;
  return Boolean(flight.FlightNo && flight.Origin && flight.Destination);
}

/** @deprecated use isListedNiraFlight — kept for older imports */
export function isDisplayableNiraFlight(flight: FlightAvailability | null | undefined): boolean {
  return isListedNiraFlight(flight);
}

export function filterListedNiraFlights(
  flights: FlightAvailability[] | null | undefined
): FlightAvailability[] {
  if (!Array.isArray(flights)) return [];
  return flights.filter(isListedNiraFlight);
}

/** @deprecated use filterListedNiraFlights */
export function filterDisplayableNiraFlights(
  flights: FlightAvailability[] | null | undefined
): FlightAvailability[] {
  return filterListedNiraFlights(flights);
}

export type FlightSaleState = 'bookable' | 'sale_closed' | 'schedule_only';

export type NiraClassRow = FlightAvailability['ClassStatus'][number];

/**
 * Airline-facing sale state from Nira inventory:
 * - bookable: online ticket can be sold
 * - sale_closed: flight exists / may have a class row, but sale is closed (price 0 / no reserve)
 * - schedule_only: only timetable — no class/seat inventory yet
 */
export function getFlightSaleState(
  flight: FlightAvailability,
  classRow?: NiraClassRow | null
): FlightSaleState {
  const classes = Array.isArray(flight.ClassStatus) ? flight.ClassStatus : [];
  if (classes.length === 0) return 'schedule_only';

  const row = classRow || classes[0];
  const allow = row?.AllowReservation === true;
  const price = Number(row?.TotalPrice ?? 0);
  if (allow && price > 0) return 'bookable';
  return 'sale_closed';
}

export function getFlightSaleCopy(
  state: FlightSaleState,
  language: string
): { badge: string; notice: string; cta: string; priceLabel?: string } {
  if (language === 'en') {
    if (state === 'bookable') {
      return { badge: 'Available to book', notice: '', cta: 'Select flight' };
    }
    if (state === 'sale_closed') {
      return {
        badge: 'Online sale closed',
        notice: 'This flight is on the schedule, but online tickets are not on sale right now.',
        cta: 'Not available to buy',
        priceLabel: 'Price not available',
      };
    }
    return {
      badge: 'Schedule only',
      notice: 'Departure time is published, but seats are not open for online booking yet.',
      cta: 'Not available to buy',
      priceLabel: 'Price not available',
    };
  }
  if (language === 'ar') {
    if (state === 'bookable') {
      return { badge: 'متاح للحجز', notice: '', cta: 'اختيار الرحلة' };
    }
    if (state === 'sale_closed') {
      return {
        badge: 'البيع الإلكتروني مغلق',
        notice: 'الرحلة موجودة في الجدول، لكن شراء التذكرة عبر الإنترنت غير متاح حالياً.',
        cta: 'غير متاح للشراء',
        priceLabel: 'السعر غير متوفر',
      };
    }
    return {
      badge: 'جدول فقط',
      notice: 'موعد الإقلاع معلن، لكن المقاعد غير مفتوحة للحجز عبر الإنترنت بعد.',
      cta: 'غير متاح للشراء',
      priceLabel: 'السعر غير متوفر',
    };
  }
  // fa (default)
  if (state === 'bookable') {
    return { badge: 'قابل رزرو', notice: '', cta: 'انتخاب پرواز' };
  }
  if (state === 'sale_closed') {
    return {
      badge: 'فروش آنلاین بسته است',
      notice: 'این پرواز تو برنامه هست، ولی فعلاً نمی‌شود از سایت بلیت خرید.',
      cta: 'فعلاً قابل خرید نیست',
      priceLabel: 'قیمت اعلام نشده',
    };
  }
  return {
    badge: 'فقط زمان‌بندی',
    notice: 'ساعت پرواز اعلام شده، ولی هنوز صندلی برای فروش آنلاین باز نشده.',
    cta: 'فعلاً قابل خرید نیست',
    priceLabel: 'قیمت اعلام نشده',
  };
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    AvailableFlights: FlightAvailability[];
  };
  status_code: number;
}

export interface OriginCitiesResponse {
  success: boolean;
  data: {
    NRSRoutesApp: OriginCity[];
  };
  status_code: number;
}

export interface DestinationsResponse {
  success: boolean;
  data: {
    NRSRoutesApp: OriginCity[];
  };
  status_code: number;
}

/**
 * Get list of origin cities
 */
export const getOriginCities = async (): Promise<OriginCity[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/nira/routes/origins/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: OriginCitiesResponse = await response.json();
    
    if (data.success && data.data?.NRSRoutesApp) {
      return withoutTestCities(data.data.NRSRoutesApp);
    }
    
    throw new Error('Failed to fetch origin cities');
  } catch (error) {
    console.error('Error fetching origin cities:', error);
    throw error;
  }
};

/**
 * Get list of destinations from a specific origin
 */
export const getDestinations = async (origin: string): Promise<OriginCity[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/nira/routes/destinations/?origin=${origin}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: DestinationsResponse = await response.json();
    
    if (data.success && data.data?.NRSRoutesApp) {
      return withoutTestCities(data.data.NRSRoutesApp);
    }
    
    throw new Error('Failed to fetch destinations');
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

/**
 * Check flight availability
 */
export const checkAvailability = async (params: {
  origin: string;
  destination: string;
  departure_date: string;
  round_trip?: boolean;
  return_date?: string;
  adult_qty?: number;
  child_qty?: number;
  infant_qty?: number;
}): Promise<FlightAvailability[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/nira/availability/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departure_date,
        round_trip: params.round_trip || false,
        return_date: params.return_date,
        adult_qty: params.adult_qty || 1,
        child_qty: params.child_qty || 0,
        infant_qty: params.infant_qty || 0,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AvailabilityResponse = await response.json();
    
    if (data.success && data.data?.AvailableFlights) {
      return data.data.AvailableFlights;
    }
    
    return [];
  } catch (error) {
    console.error('Error checking flight availability:', error);
    throw error;
  }
};

