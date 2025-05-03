"use client"

import { createContext, useState, useContext, type ReactNode } from "react"
import { BookingData } from "@/types"

type BookingContextType = {
  bookingData: BookingData
  setBookingData: (data: Partial<BookingData>) => void
  resetBookingData: () => void
}

const defaultBookingData: BookingData = {
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
  const [bookingData, setBookingDataState] = useState<BookingData>(defaultBookingData)

  const setBookingData = (data: Partial<BookingData>) => {
    setBookingDataState((prev) => ({ ...prev, ...data }))
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
