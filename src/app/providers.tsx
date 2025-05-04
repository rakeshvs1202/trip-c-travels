"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

type BookingContextType = {
  bookingData: any
  setBookingData: (data: Partial<any>) => void
  resetBookingData: () => void
}

const defaultBookingData: any = {
  tripType: "outstation",
  source: "",
  destination: "",
  pickupDate: new Date(),
  pickupTime: "10:00",
  distance: 0,
  duration: 0,
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function Providers({ children }: { children: ReactNode }) {
  const [bookingData, setBookingDataState] = useState<any>(defaultBookingData)

  const setBookingData = (data: Partial<any>) => {
    setBookingDataState((prev:any) => ({ ...prev, ...data }))
  }

  const resetBookingData = () => {
    setBookingDataState(defaultBookingData)
  }

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, resetBookingData }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
