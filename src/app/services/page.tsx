"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"
import { useBooking } from "@/app/providers"
import { v4 as uuidv4 } from 'uuid';
import { debounce } from "lodash"

export default function ContactDetails() {
  const router = useRouter()
  const { bookingData } = useBooking()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    pickupAddress:""
  })
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('inclusions');
  const [pickupAddressAutocomplete, setPickupAddressAutocomplete] = 
  useState<google.maps.places.Autocomplete | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [error, setError] = useState("")
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  })
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }
  useEffect(() => {
    const storedBooking = sessionStorage.getItem("bookingData")
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // Validate mobile number length
      if (numericValue.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
      }
      else{
        setError('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      setError('');
    }
  }

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: e.target.value
    }))
  }
  const handlePickupAddressAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    setPickupAddressAutocomplete(autocomplete);
  };
  const handlePlaceSelect = async (type: "pickup") => {
    const autocomplete = pickupAddressAutocomplete;
    if (!autocomplete) return;

    const place = autocomplete.getPlace()
    const address = place.formatted_address || ""
    setFormData(prev => ({
      ...prev,
      pickupAddress: address
    }))
  }
useEffect(()=>{
  if (formData.mobile.length === 10 && formData.name && formData.email && formData.mobile && formData.pickupAddress) {
    setError('');
  }
},[formData])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.pickupAddress) {
      setError('Please fill in all required fields');
      return;
    }
    setIsPaymentLoading(true)

    try {
      // Generate booking ID with format: TRIPC-YYYYMMDD-RANDOM
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 char random string
      const bookingId = `tripc-${dateStr}-${randomStr}`;
      const bookingInfo = {
        bookingId,
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.mobile
        },
        pickupDetails: {
          pickupAddress: formData.pickupAddress,
          pickupDate: bookingDetails.pickupDate,
          pickupTime: bookingDetails.pickupTime
        },
        bookingData: {
          source: bookingDetails.source,
          destination: bookingDetails?.destination,
          tripType: bookingDetails.tripType,
          distance: bookingDetails.distance,
          duration: bookingDetails.duration,
          returnDate: bookingDetails?.returnDate,
          selectedPackage: bookingDetails?.selectedPackage,
          totalFare: bookingDetails.totalFare,
          selectedCar: bookingDetails.selectedCar?.name,
        }
      };
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingInfo)
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create booking')
      }

      sessionStorage.setItem("bookingId", bookingId)
      sessionStorage.setItem("pickupLocation",formData.pickupAddress)
      router.push(`/payment/${bookingId}`)
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setIsPaymentLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-light-gray">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Contact & Pickup Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                   placeholder="Enter your name"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                {isLoaded && (
                  <Autocomplete
                    onLoad={handlePickupAddressAutocompleteLoad}
                    onPlaceChanged={() => handlePlaceSelect("pickup")}
                  >
                    <input
                      type="text"
                      name="pickupAddress"
                      defaultValue={formData.pickupAddress || ''}
                      onChange={handleAddressInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter pickup location"
                      required
                    />
                  </Autocomplete>
                )}
              </div>
              {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              <button
                onClick={handleSubmit}
                type="submit"
                className="w-full bg-[#FF3131] text-white py-2 rounded-md hover:bg-primary-dark"
                disabled={isPaymentLoading}
              >
                {isPaymentLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span >Processing Payment...</span>
                  </div>
                ) : (
                  <span>Proceed to Payment</span>
                )}
              </button>
            </form>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Booking Details</h2>
              {bookingDetails && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup City</span>
                    <span className="font-medium">{bookingDetails.source}</span>
                  </div>
                  {
                    (bookingDetails.destination && bookingDetails.tripType === "OUTSTATION") && (<div className="flex justify-between">
                      <span className="text-gray-600">Drop City</span>
                      <span className="font-medium">{bookingDetails.destination}</span>
                    </div>)
                  }
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Date</span>
                    <span className="font-medium">
                      {bookingDetails.pickupDate && (
                        new Date(bookingDetails.pickupDate).toLocaleDateString("en-IN", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }).replace(/(\d+)/, (_: any, day: any) => {
                          const numericDay = parseInt(day)
                          return `${numericDay}${getOrdinalSuffix(numericDay)}`
                        })
                      )} at {bookingDetails.pickupTime}
                    </span>
                  </div>
                  {bookingDetails?.returnDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Date</span>
                      <span className="font-medium">
                        {bookingDetails.returnDate && (
                          new Date(bookingDetails.returnDate).toLocaleDateString("en-IN", {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }).replace(/(\d+)/, (_: any, day: any) => {
                            const numericDay = parseInt(day)
                            return `${numericDay}${getOrdinalSuffix(numericDay)}`
                          })
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trip Type</span>
                    {bookingDetails?.tripType === "LOCAL" ? <span className="font-medium">{bookingDetails?.tripType.charAt(0).toUpperCase() + bookingDetails?.tripType.slice(1).toLowerCase() + "  ( " + bookingDetails?.selectedPackage + " )"}</span> : <span className="font-medium">{bookingDetails?.tripType.charAt(0).toUpperCase() + bookingDetails?.tripType.slice(1).toLowerCase()}</span>}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Car Type</span>
                    <span className="font-medium">{bookingDetails.selectedCar?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Fare</span>
                    <span className="font-medium">₹{bookingDetails.totalFare}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inclusions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="flex w-full">
                <button 
                  onClick={() => setActiveTab('inclusions')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'inclusions' 
                      ? 'bg-[#FF3131] text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Inclusions
                </button>
                <button 
                  onClick={() => setActiveTab('exclusions')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'exclusions' 
                      ? 'bg-[#FF3131] text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Exclusions
                </button>
                <button 
                  onClick={() => setActiveTab('terms')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'terms' 
                      ? 'bg-[#FF3131] text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  T&C
                </button>
              </div>

              {activeTab === 'inclusions' && (
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">🚗</span>
                      <span>Base Fare and Fuel Charges</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">👨‍✈️</span>
                      <span>Driver Allowance</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'exclusions' && (
                <div className="p-6">
                  <ul className="space-y-3">
                    {(bookingDetails?.tripType === 'LOCAL') && (<li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">💸</span>
                      <span>Pay ₹{bookingDetails?.selectedCar?.localRates?.price[1]?.exKmRate}/km after limits</span>
                    </li>)}
                    {(bookingDetails?.tripType === 'LOCAL') && (<li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">⏰</span>
                      <span>Pay ₹{bookingDetails?.selectedCar?.localRates?.price[1]?.exMinRate * 60}/hr after limits</span>
                    </li>)}
                    {(bookingDetails?.tripType === 'OUTSTATION') && (<li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">💸</span>
                      <span>Pay ₹{bookingDetails?.selectedCar?.outstationRates?.exKmRate}/km after {bookingDetails?.distance}km</span>
                    </li>)}
                    <li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">🛣️</span>
                      <span>Toll / State tax</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-600">🅿️</span>
                      <span>Parking</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'terms' && (
                <div className="p-6">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Your Trip has a KM limit as well as an Hours limit. If your usage exceeds these limits, you will be charged for the excess KM and/or hours used.</li>
                    <li>• The KM and Hour(s) usage will be calculated starting from your pick-up point and back to the pick-up point.</li>
                    <li>• The Airport entry charge, if applicable, is not included in the fare and will be charged extra.</li>
                    <li>• All road toll fees, parking charges, state taxes etc. if applicable will be charged extra and need to be paid to the concerned authorities as per actuals.</li>
                    <li>• For driving between 09:45 PM to 06:00 AM on any of the nights, an additional allowance will be applicable and is to be paid to the driver.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
