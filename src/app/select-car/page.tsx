"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBooking } from "@/app/providers"
import { Check, Info, MapPin, Calendar, Users, Briefcase } from "lucide-react"
import { calculatePrice } from "@/lib/priceCalculator"

interface Car {
  id: number
  category: string
  name: string
  image: string
  seatingCapacity: number
  luggageCapacity: number
  features: string[]
  price: number
}

export default function SelectCar() {
  const router = useRouter()
  const { bookingData, setBookingData } = useBooking()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState<number | null>(null)

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData.source || !bookingData.destination) {
      router.push("/")
      return
    }

    // Fetch cars data
    const fetchCars = async () => {
      try {
        const response = await fetch("/api/cars")
        const data = await response.json()

        // Calculate price for each car based on trip type and distance
        const carsWithPrices = data.map((car: any) => ({
          ...car,
          price: calculatePrice(
            car,
            bookingData.tripType,
            bookingData.distance,
            bookingData.tripType === "local" ? bookingData.duration / 60 : undefined, // Convert minutes to hours
          ),
        }))

        setCars(carsWithPrices)
      } catch (error) {
        console.error("Error fetching cars:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [bookingData, router])

  const handleCarSelect = (carId: number) => {
    setSelectedCar(carId)
    setBookingData({ selectedCar: carId })
  }

  const handleContinue = () => {
    if (selectedCar) {
      router.push("/booking-details")
    } else {
      alert("Please select a car to continue")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-light-gray">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 font-heading">Select Your Car</h1>

        {/* Trip Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start">
              <MapPin className="text-primary mr-2 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Trip Type</p>
                <p className="font-medium">
                  {bookingData.tripType === "oneWay" && "One Way Trip"}
                  {bookingData.tripType === "roundTrip" && "Round Trip"}
                  {bookingData.tripType === "local" && "Local Package"}
                  {bookingData.tripType === "airport" && "Airport Transfer"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="text-primary mr-2 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-medium">{bookingData.source}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="text-primary mr-2 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">To</p>
                <p className="font-medium">{bookingData.destination}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="text-primary mr-2 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Pickup Date & Time</p>
                <p className="font-medium">
                  {bookingData.pickupDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at {bookingData.pickupTime}
                </p>
              </div>
            </div>
          </div>

          {bookingData.distance > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-medium">Estimated Distance:</span> {bookingData.distance.toFixed(1)} km
                </p>
                <p className="text-sm">
                  <span className="font-medium">Estimated Duration:</span> {Math.ceil(bookingData.duration / 60)} hr{" "}
                  {Math.ceil(bookingData.duration % 60)} min
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Car List */}
        <div className="space-y-6">
          {cars.map((car) => (
            <div
              key={car.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                selectedCar === car.id ? "ring-2 ring-primary" : "hover:shadow-lg"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {/* Car Image */}
                <div className="p-4 flex items-center justify-center md:border-r border-gray-200">
                  <Image
                    src={car.image || "/placeholder.svg"}
                    alt={car.name}
                    width={200}
                    height={120}
                    className="object-contain h-32"
                  />
                </div>

                {/* Car Details */}
                <div className="p-4 md:col-span-2 lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{car.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{car.category}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center">
                        <Users size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm">{car.seatingCapacity} Seater</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm">{car.luggageCapacity} Luggage</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Check size={14} className="text-green-500 mr-1" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and Select Button */}
                <div className="p-4 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">₹{car.price.toFixed(0)}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {bookingData.tripType === "local" ? "Package Price" : "Total Price"}
                    </p>

                    <div className="flex items-start mb-4">
                      <Info size={16} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500">
                        {bookingData.tripType === "local"
                          ? "Extra charges applicable beyond package limits"
                          : "Includes all taxes and toll charges"}
                      </p>
                    </div>
                  </div>

                  <button
                    className={`w-full py-2 rounded-md font-medium transition-colors ${
                      selectedCar === car.id
                        ? "bg-primary text-white"
                        : "bg-white border border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                    onClick={() => handleCarSelect(car.id)}
                  >
                    {selectedCar === car.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <button className="btn-primary" onClick={handleContinue} disabled={!selectedCar}>
            Continue to Booking
          </button>
        </div>
      </div>
    </div>
  )
}
