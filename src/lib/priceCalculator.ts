import { CarData } from "@/types"

export type TripType = "oneWay" | "roundTrip" | "airport" | "local"

export function calculatePrice(
  car: CarData,
  tripType: TripType,
  distance: number,
  hours?: number
): number {
  switch (tripType) {
    case "oneWay":
      return calculateOneWayPrice(car, distance)
    case "roundTrip":
      return calculateRoundTripPrice(car, distance)
    case "airport":
      return calculateAirportPrice(car, distance)
    case "local":
      return calculateLocalPrice(car, hours || 8, distance)
    default:
      return 0
  }
}

function calculateOneWayPrice(car: CarData, distance: number): number {
  const { outstationRates } = car
  const basePrice = distance * outstationRates.perKm
  const minPrice = outstationRates.minBillableKm * outstationRates.perKm
  const driverAllowance = outstationRates.driverAllowance

  return Math.max(basePrice, minPrice) + driverAllowance
}

function calculateRoundTripPrice(car: CarData, distance: number): number {
  // For round trip, we double the distance but only charge driver allowance once
  const oneWayPrice = calculateOneWayPrice(car, distance * 2)
  return oneWayPrice
}

function calculateAirportPrice(car: CarData, distance: number): number {
  // Airport transfers typically have a minimum charge plus per km rate
  const { outstationRates } = car
  const basePrice = distance * (outstationRates.perKm * 1.1) // 10% premium for airport transfers
  const minPrice = Math.min(distance, 50) * outstationRates.perKm // Minimum 50km charge
  return Math.max(basePrice, minPrice)
}

function calculateLocalPrice(car: CarData, hours: number, distance: number): number {
  const { localRates, exHrsRates = { perMinute: 0, perKm: 0, perHour: 0 } } = car
  
  // Find the closest package
  const package8hrs = localRates.hourly.find(rate => rate.duration === "8hrs")
  if (!package8hrs) return 0

  let totalPrice = package8hrs.price

  // Calculate extra hours if any
  if (hours > 8) {
    const extraHours = hours - 8
    totalPrice += extraHours * exHrsRates.perHour
  }

  // Calculate extra distance if any
  if (distance > package8hrs.kms) {
    const extraKms = distance - package8hrs.kms
    totalPrice += extraKms * exHrsRates.perKm
  }

  return totalPrice
}