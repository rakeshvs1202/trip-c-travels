export interface CarData {
  id: number
  category: string
  name: string
  image: string
  seatingCapacity: number
  luggageCapacity: number
  features: string[]
  localRates: {
    hourly: Array<{
      duration: string
      kms: number
    }>
    price: [{
      perMinute: number
      perKm: number
    },
    { exMinRate: number, exKmRate: number }]
  }
  // Optional extra hour/distance rates for local trips
  exHrsRates?: {
    perMinute: number
    perKm: number
    perHour: number
  }
  outstationRates: {
    perKm: number
    minBillableKm: number
    driverAllowance: number
  }
}

export interface BookingData {
  tripType: "outstation" | "airport" | "local"
  source: string
  destination: string
  pickupDate: Date
  pickupTime: string
  returnDate?: Date
  returnTime?: string
  distance: number
  duration: number
  selectedCar?: number
} 