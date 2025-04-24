"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useBooking } from "@/app/providers"
import { Check, Info, MapPin, Calendar, Clock, ArrowRight } from "lucide-react"
import { calculatePrice } from "@/lib/priceCalculator"
import { CarData } from "@/types"
import { carData } from "@/scripts/seed-data"

interface Car {
  id: number;
  category: string;
  name: string;
  image: string;
  seatingCapacity: number;
  luggageCapacity: number;
  features: string[];
  localRates: {
    hourly: Array<{
      duration: string;
      kms: number;
      price: number;
    }>;
  };
  outstationRates: {
    perKm: number;
    minBillableKm: number;
    driverAllowance: number;
  };
}

export default function SelectCar() {
  const router = useRouter()
  const { bookingData, setBookingData } = useBooking()
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState<number | null>(null)

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData.source || !bookingData.destination) {
      router.push("/")
      return
    }

    // Use the car data from seed-data
    setCars(carData)
    setLoading(false)
  }, [bookingData, router])

  const handleCarSelect = (carId: number) => {
    setSelectedCar(carId)
    setBookingData({ ...bookingData, selectedCar: carId })
  }

  const handleContinue = () => {
    if (selectedCar) {
      router.push("/payment")
    } else {
      alert("Please select a car to continue")
    }
  }

  const calculatePrice = (car: CarData) => {
    if (!bookingData) return 0;

    const { distance, tripType } = bookingData;
    let totalPrice = 0;

    switch (tripType) {
      case "oneWay":
        // For one-way trips, use outstation rates
        totalPrice = Math.max(
          car.outstationRates.minBillableKm,
          distance
        ) * car.outstationRates.perKm + car.outstationRates.driverAllowance;
        break;

      case "roundTrip":
        // For round trips, double the distance and use outstation rates
        totalPrice = Math.max(
          car.outstationRates.minBillableKm,
          distance * 2
        ) * car.outstationRates.perKm + car.outstationRates.driverAllowance;
        break;

      case "airport":
        // For airport transfers, use outstation rates with minimum billable km
        totalPrice = Math.max(
          car.outstationRates.minBillableKm,
          distance
        ) * car.outstationRates.perKm + car.outstationRates.driverAllowance;
        break;

      case "local":
        // For local trips, use the 8-hour package as default
        const package8hrs = car.localRates.hourly.find(
          (rate) => rate.duration === "8hrs"
        );
        if (package8hrs) {
          totalPrice = package8hrs.price;
        }
        break;

      default:
        totalPrice = 0;
    }

    return Math.round(totalPrice);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF3131]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Journey Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Journey Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-600">From</p>
            <p className="font-medium">{bookingData?.source}</p>
          </div>
          <div>
            <p className="text-gray-600">To</p>
            <p className="font-medium">{bookingData?.destination}</p>
          </div>
          <div>
            <p className="text-gray-600">Pickup Date & Time</p>
            <p className="font-medium">
              {bookingData?.pickupDate?.toLocaleDateString()} at{" "}
              {bookingData?.pickupTime}
            </p>
          </div>
          {bookingData?.returnDate && (
            <div>
              <p className="text-gray-600">Return Date</p>
              <p className="font-medium">
                {bookingData.returnDate.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-full md:w-1/4">
              <Image
                src={car.image}
                alt={car.name}
                width={300}
                height={200}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Category</p>
                  <p className="font-medium">{car.category}</p>
                </div>
                <div>
                  <p className="text-gray-600">Seating Capacity</p>
                  <p className="font-medium">{car.seatingCapacity} Persons</p>
                </div>
                <div>
                  <p className="text-gray-600">Luggage Capacity</p>
                  <p className="font-medium">{car.luggageCapacity} Bags</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Features</p>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Total Fare</p>
                <p className="text-3xl font-bold text-[#FF3131]">
                  ₹{calculatePrice(car)}
                </p>
                <button
                  onClick={() => handleCarSelect(car.id)}
                  className="w-full mt-4 px-6 py-2 bg-[#FF3131] text-white font-medium rounded hover:bg-[#E02020] transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      {selectedCar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
          <div className="container mx-auto px-4">
            <button
              onClick={handleContinue}
              className="w-full md:w-auto float-right bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
