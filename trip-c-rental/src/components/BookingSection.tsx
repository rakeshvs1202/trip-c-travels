"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, ArrowLeftRight } from "lucide-react"
import { debounce } from "lodash"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../styles/datepicker.css"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"

interface Place {
  place_id: string;
  description: string;
}

export default function BookingSection() {
  const [tripType, setTripType] = useState("ONE_WAY")
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [pickupDate, setPickupDate] = useState<Date | null>(null)
  const [returnDate, setReturnDate] = useState<Date | null>(null)
  const [pickupTime, setPickupTime] = useState("")
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [fromAutocomplete, setFromAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [toAutocomplete, setToAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  const generateTimeOptions = (selectedDate: Date | null) => {
    const times = []
    const now = new Date()
    const isToday = selectedDate?.toDateString() === now.toDateString()
    
    let startHour = isToday ? now.getHours() + 1 : 0
    let startMinute = isToday ? Math.ceil(now.getMinutes() / 30) * 30 : 0
    
    if (startMinute === 60) {
      startHour++
      startMinute = 0
    }

    for (let hour = startHour; hour < 24; hour++) {
      for (let minute = hour === startHour ? startMinute : 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }

    return times
  }

  const handleFromAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setFromAutocomplete(autocomplete)
  }

  const handleToAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setToAutocomplete(autocomplete)
  }

  const handlePlaceSelect = (type: 'from' | 'to') => {
    const autocomplete = type === 'from' ? fromAutocomplete : toAutocomplete
    if (!autocomplete) return

    const place = autocomplete.getPlace()
    if (place.formatted_address) {
    if (type === 'from') {
        setFromCity(place.formatted_address)
    } else {
        setToCity(place.formatted_address)
      }
    }
  }

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <section className="relative py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6">
          <div className="flex gap-0 mb-6 bg-gray-100 rounded-lg p-1">
            {['ONE_WAY', 'ROUND_TRIP', 'LOCAL', 'AIRPORT'].map((type) => (
              <button
                key={type}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  tripType === type
                    ? "bg-[#FF3131] text-white"
                    : "bg-transparent text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTripType(type)}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {tripType === 'LOCAL' ? (
              <>
                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CITY</label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect('from')}
                    >
                      <input
                        type="text"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder="Enter City"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      />
                    </Autocomplete>
                  )}
                </div>
                <div className="lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICK UP DATE</label>
                  <div className="relative">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date: Date | null) => setPickupDate(date)}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      placeholderText="Select Date"
                      popperPlacement="bottom-start"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICK UP TIME</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupTime}
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      readOnly
                      placeholder="Select Time"
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    {showTimeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {generateTimeOptions(pickupDate).map((time) => (
                          <div
                            key={time}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setPickupTime(time)
                              setShowTimeDropdown(false)
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : tripType === 'AIRPORT' ? (
              <>
                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICKUP ADDRESS</label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect('from')}
                    >
                      <input
                        type="text"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder="Start typing your address"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      />
                    </Autocomplete>
                  )}
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">DROP AIRPORT</label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleToAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect('to')}
                    >
                      <input
                        type="text"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        placeholder="Start typing airport name"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      />
                    </Autocomplete>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICK UP DATE</label>
                  <div className="relative">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date: Date | null) => setPickupDate(date)}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      placeholderText="Select Date"
                      popperPlacement="bottom-start"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICK UP TIME</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupTime}
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      readOnly
                      placeholder="Select Time"
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    {showTimeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {generateTimeOptions(pickupDate).map((time) => (
                          <div
                            key={time}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setPickupTime(time)
                              setShowTimeDropdown(false)
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">FROM</label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect('from')}
                    >
                      <input
                        type="text"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder="Enter Pickup City"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      />
                    </Autocomplete>
                  )}
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">TO</label>
                  <div className="relative">
                    {isLoaded && (
                      <Autocomplete
                        onLoad={handleToAutocompleteLoad}
                        onPlaceChanged={() => handlePlaceSelect('to')}
                      >
                        <input
                          type="text"
                          value={toCity}
                          onChange={(e) => setToCity(e.target.value)}
                          placeholder="Enter Drop City"
                          className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                        />
                      </Autocomplete>
                    )}
                    <button
                      onClick={swapCities}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ArrowLeftRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICK UP DATE</label>
                  <div className="relative">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date: Date | null) => setPickupDate(date)}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      placeholderText="Select Date"
                      popperPlacement="bottom-start"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                {tripType === 'ROUND_TRIP' && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">RETURN DATE</label>
                    <div className="relative">
                      <DatePicker
                        selected={returnDate}
                        onChange={(date: Date | null) => setReturnDate(date)}
                        minDate={pickupDate || new Date()}
                        dateFormat="dd-MM-yyyy"
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                        placeholderText="Select Date"
                        popperPlacement="bottom-start"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                )}

                <div className={`${tripType === 'ROUND_TRIP' ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PICK UP TIME</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupTime}
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      readOnly
                      placeholder="Select Time"
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer"
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    {showTimeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {generateTimeOptions(pickupDate).map((time) => (
                          <div
                            key={time}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setPickupTime(time)
                              setShowTimeDropdown(false)
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="w-full mt-6 px-8 py-3 bg-[#FF3131] text-white font-medium rounded hover:bg-[#E02020] transition-colors text-lg">
            EXPLORE CABS
          </button>
        </div>
      </div>
    </section>
  )
} 