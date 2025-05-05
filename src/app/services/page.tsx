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
    // Retrieve booking details from sessionStorage
    const storedBooking = sessionStorage.getItem("bookingData")
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  const debouncedFromInput = useCallback(
    debounce((value: string) => {
      setFormData({...formData, pickupAddress:  value });
    }, 300),
    []
  );
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedFromInput(value);
  };
  const handlePickupAddressAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    setPickupAddressAutocomplete(autocomplete);
  };
  const handlePlaceSelect = async (type: "pickup") => {
    const autocomplete = pickupAddressAutocomplete;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (place.formatted_address) {
        setFormData({...formData, pickupAddress:  place.formatted_address });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const bookingId = uuidv4();
      const bookingInfo: any = {
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

      if (!response.ok) throw new Error('Failed to save booking');
      router.push(`/payment/${bookingId}`);
    } catch (error) {
      console.error('Booking error:', error);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-light-gray">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
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
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                {isLoaded && (
                  <Autocomplete
                    onLoad={handlePickupAddressAutocompleteLoad}
                    onPlaceChanged={() => {
                      handlePlaceSelect("pickup")
                    }}
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
              <button
                type="submit"
                className="w-full bg-[#FF3131] text-white py-2 rounded-md hover:bg-primary-dark"
              >
                Proceed To Payment
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
