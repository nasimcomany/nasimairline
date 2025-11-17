import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  availableSeats: number;
  aircraft: string;
  services: string[];
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class: 'economy' | 'business' | 'first';
}

interface FlightState {
  flights: Flight[];
  searchParams: FlightSearchParams | null;
  loading: boolean;
  error: string | null;
  selectedFlight: Flight | null;
}

const initialState: FlightState = {
  flights: [],
  searchParams: null,
  loading: false,
  error: null,
  selectedFlight: null,
};

export const searchFlights = createAsyncThunk(
  'flight/search',
  async (params: FlightSearchParams) => {
    const response = await fetch('/api/flights/search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Flight search failed');
    }
    
    return response.json();
  }
);

const flightSlice = createSlice({
  name: 'flight',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<FlightSearchParams>) => {
      state.searchParams = action.payload;
    },
    selectFlight: (state, action: PayloadAction<Flight>) => {
      state.selectedFlight = action.payload;
    },
    clearFlights: (state) => {
      state.flights = [];
      state.selectedFlight = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = action.payload.flights;
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Flight search failed';
      });
  },
});

export const { setSearchParams, selectFlight, clearFlights } = flightSlice.actions;
export default flightSlice.reducer;
