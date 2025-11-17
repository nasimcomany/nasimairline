import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  birthDate: string;
  gender: 'male' | 'female';
}

interface Booking {
  id: string;
  flightId: string;
  passengers: Passenger[];
  seatNumbers: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

interface BookingState {
  currentBooking: Booking | null;
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  bookings: [],
  loading: false,
  error: null,
};

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData: {
    flightId: string;
    passengers: Passenger[];
    seatNumbers: string[];
  }) => {
    const response = await fetch('/api/bookings/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      throw new Error('Booking creation failed');
    }
    
    return response.json();
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentBooking: (state, action: PayloadAction<Booking>) => {
      state.currentBooking = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.booking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Booking creation failed';
      });
  },
});

export const { setCurrentBooking, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
