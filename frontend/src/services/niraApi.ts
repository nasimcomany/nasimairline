/**
 * NIRA API Service
 * Service for calling NIRA flight APIs
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface OriginCity {
  CITYNAME_FA: string;
  CITY: string;
  CITYNAME_EN: string;
  isDomestic: string;
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
      return data.data.NRSRoutesApp;
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
      return data.data.NRSRoutesApp;
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

