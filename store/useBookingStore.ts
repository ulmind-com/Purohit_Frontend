import { create } from 'zustand';
import { BookingResponse } from '@/types';

interface BookingState {
  activeBooking: BookingResponse | null;
  bookingStatus: string | null;
  currentOtp: string | null;
  isVerifying: boolean;
  
  setActiveBooking: (booking: BookingResponse | null) => void;
  setBookingStatus: (status: string | null) => void;
  setCurrentOtp: (otp: string | null) => void;
  setIsVerifying: (isVerifying: boolean) => void;
  resetBookingState: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  activeBooking: null,
  bookingStatus: null,
  currentOtp: null,
  isVerifying: false,
  
  setActiveBooking: (booking) => set({ activeBooking: booking, bookingStatus: booking?.status ?? null }),
  setBookingStatus: (status) => set({ bookingStatus: status }),
  setCurrentOtp: (otp) => set({ currentOtp: otp }),
  setIsVerifying: (isVerifying) => set({ isVerifying }),
  resetBookingState: () => set({ activeBooking: null, bookingStatus: null, currentOtp: null, isVerifying: false }),
}));
