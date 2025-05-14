"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, Clock, ArrowLeftRight, AlertCircle } from "lucide-react";
import { debounce } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

interface Place {
  place_id: string;
  description: string;
  location?: google.maps.LatLng;
}

export default function BookingSection() {
  const router = useRouter();
  const [tripType, setTripType] = useState("OUTSTATION");
  const [fromCity, setFromCity] = useState<any>(null);
  const [toCity, setToCity] = useState<any>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [fromAutocomplete, setFromAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [toAutocomplete, setToAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [airportJourneyType, setAirportJourneyType] = useState<
    "pickup" | "drop"
  >("pickup");
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
    tollInfo?: string;
  } | null>(null);
  const [fromCoords, setFromCoords] = useState<google.maps.LatLngLiteral>();
  const [toCoords, setToCoords] = useState<google.maps.LatLngLiteral>();

  // Add error state
  const [errors, setErrors] = useState<{
    fromCity?: string
    toCity?: string
    pickupDate?: string
    returnDate?: string
    pickupTime?: string
    pickupAddress?: string
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Add route cache
  const routeCache = useRef<{[key: string]: {distance: string; duration: string}}>({});

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Add debounced input handlers
  const debouncedFromInput = useCallback(
    debounce((value: string) => {
      setFromCity(value);
      setErrors(prev => ({ ...prev, fromCity: '' }));
    }, 300),
    []
  );

  const debouncedToInput = useCallback(
    debounce((value: string) => {
      setToCity(value);
      setErrors(prev => ({ ...prev, toCity: '' }));
    }, 300),
    []
  );

  // Handle input changes with debouncing
  const handleFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedFromInput(value);
  };

  const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedToInput(value);
  };

  const generateTimeOptions = (selectedDate: Date | null) => {
    const times = [];
    const now = new Date();
    const isToday = selectedDate?.toDateString() === now.toDateString();

    let startHour = isToday ? now.getHours() + 1 : 0;
    let startMinute = isToday ? Math.ceil(now.getMinutes() / 30) * 30 : 0;

    if (startMinute === 60) {
      startHour++;
      startMinute = 0;
    }

    for (let hour = startHour; hour < 24; hour++) {
      for (
        let minute = hour === startHour ? startMinute : 0;
        minute < 60;
        minute += 30
      ) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }

    return times;
  };

  const handleFromAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    setFromAutocomplete(autocomplete);
  };

  const handleToAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    setToAutocomplete(autocomplete);
  };

  const handlePlaceSelect = async (type: "from" | "to") => {
    const autocomplete = type === "from" ? fromAutocomplete : toAutocomplete;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (place.name) {
      if (type === "from") {
        setFromCity(place.formatted_address);
        setFromCoords(place.geometry?.location ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() } : undefined);
      } else {
        setToCity(place.formatted_address);
        setToCoords(place.geometry?.location ? { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() } : undefined);
      }
    }
  };

  const calculateRouteDetails = useCallback(
    async () => {
      if (!fromCoords || !toCoords) return;

      const service = new google.maps.DistanceMatrixService();
      const response = await service.getDistanceMatrix({
        origins: [{ lat: fromCoords.lat, lng: fromCoords.lng }],
        destinations: [{ lat: toCoords.lat, lng: toCoords.lng }],
        travelMode: google.maps.TravelMode.DRIVING,
      });

      const distance = response.rows[0].elements[0].distance.value / 1000;
      const details = {
        distance: distance.toString(),
        duration: response.rows[0].elements[0].duration.text,
      };
      
      // Cache the result
      routeCache.current[`${fromCity}-${toCity}`] = details;
      setRouteDetails(details);
    },
    [fromCoords, toCoords, fromCity, toCity, setRouteDetails]
  );

  const getAutocompleteOptions = (
    inputType: 'from' | 'to',
    currentTripType: string,
    currentAirportJourneyType?: 'pickup' | 'drop'
  ): google.maps.places.AutocompleteOptions => {
    const options: google.maps.places.AutocompleteOptions = {
      fields: ["formatted_address", "geometry", "name", "place_id"],
      componentRestrictions: { country: "in" },
    };

    switch (currentTripType) {
      case "ONE_WAY":
      case "ROUND_TRIP":
        options.types = ["(cities)"];
        break;
      case "LOCAL":
        options.types = ["(cities)"];
        break;
      case "AIRPORT":
        if (!currentAirportJourneyType) break;

        if (inputType === 'from') {
          options.types = currentAirportJourneyType === 'pickup' ? ['airport'] : ['address'];
        } else {
          options.types = currentAirportJourneyType === 'pickup' ? ['address'] : ['airport'];
        }
        break;
    }
    return options;
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  // Validate single field
  const validateField = (field: string, value: any) => {
    switch (field) {
      case 'fromCity':
        return !value ? 'Pickup location is required' : ''
      case 'toCity':
        return !value ? 'Drop location is required' : ''
      case 'pickupDate':
        return !value ? 'Pickup date is required' : ''
      case 'returnDate':
        if (tripType === 'OUTSTATION') {
          if (!value) {
            return 'Return date is required for outstation trip'
          }
          if (value && pickupDate && new Date(value).getTime() < new Date(pickupDate).getTime()) {
            return 'Return date must be after pickup date'
          }
        }
        return ''
      case 'pickupTime':
        return !value ? 'Pickup time is required' : ''
      case 'pickupAddress':
        return !value ? 'Pickup address is required' : ''
      default:
        return ''
    }
  }

  // Validate all fields
  const validateForm = () => {
    if (tripType === 'LOCAL') {
      const newErrors = {
        fromCity: validateField('fromCity', fromCity),
        pickupDate: validateField('pickupDate', pickupDate),
        pickupTime: validateField('pickupTime', pickupTime),
        toCity: '',
        returnDate: '',
        pickupAddress: ''
      }
      setErrors(newErrors)
      return !newErrors.fromCity && !newErrors.pickupDate && !newErrors.pickupTime
    } else if (tripType === 'AIRPORT') {
      const newErrors = {
        pickupAddress: validateField('pickupAddress', fromCity),
        fromCity: validateField('fromCity', toCity),
        toCity: validateField('toCity', fromCity),
        pickupDate: validateField('pickupDate', pickupDate),
        pickupTime: validateField('pickupTime', pickupTime),
      }
      setErrors(newErrors)
      return !newErrors.pickupAddress && !newErrors.fromCity && !newErrors.toCity && 
             !newErrors.pickupDate && !newErrors.pickupTime
    }
    
    // Default validation for other trip types
    const newErrors = {
      fromCity: validateField('fromCity', fromCity),
      toCity: validateField('toCity', toCity),
      pickupDate: validateField('pickupDate', pickupDate),
      returnDate: validateField('returnDate', returnDate),
      pickupTime: validateField('pickupTime', pickupTime),
      pickupAddress: ''
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleExploreCabs = async () => {
    // Validate form based on trip type
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (tripType !== 'LOCAL') {
        await calculateRouteDetails();
      }

      // Create fresh cache key to access latest data
      const cacheKey = `${fromCity}-${toCity}`;
      const currentDetails = routeCache.current[cacheKey];

      // Set booking data in session storage
      const bookingData = {
        tripType: tripType as 'LOCAL' | 'OUTSTATION' | 'AIRPORT',
        source: fromCity!,
        destination: tripType === 'LOCAL' ? '' : toCity!,
        pickupDate: pickupDate!,
        pickupTime: pickupTime!,
        distance: tripType === 'LOCAL' ? 0 :parseFloat(currentDetails?.distance || "0"),
        duration: tripType === 'LOCAL' ? 0 : currentDetails?.duration || "0",
        returnDate: returnDate || undefined,
        returnTime: undefined
      }
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

      // Navigate to select-car page
      router.push("/select-car")
    } catch (error) {
      console.error("Error processing booking:", error)
      setErrors({ fromCity: "There was an error processing your request. Please try again." })
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for error message
  const ErrorMessage = ({ message }: { message: string }) => (
    message ? (
      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
        <AlertCircle size={14} />
        <span>{message}</span>
      </div>
    ) : null
  )

  return (
    <section className="relative py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6">
          <div className="flex gap-0 mb-6 bg-gray-100 rounded-lg p-1">
            {["OUTSTATION", "LOCAL", "AIRPORT"].map((type) => (
              <button
                key={type}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  tripType === type
                    ? "bg-[#FF3131] text-white"
                    : "bg-transparent text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTripType(type)}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {tripType === "LOCAL" ? (
              <>
                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CITY
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect("from")}
                      options={getAutocompleteOptions("from", tripType)}
                    >
                      <input
                        type="text"
                        defaultValue={fromCity}
                        onChange={handleFromInputChange}
                        placeholder="Enter City"
                        className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                          errors.fromCity ? 'border-red-500' : ''
                        }`}
                      />
                    </Autocomplete>
                  )}
                  <ErrorMessage message={errors.fromCity || ''} />
                </div>
                <div className="lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP DATE
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date: Date | null) => {
                        setPickupDate(date)
                        setErrors(prev => ({ ...prev, pickupDate: '' }))
                      }}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                        errors.pickupDate ? 'border-red-500' : ''
                      }`}
                      placeholderText="Select Date"
                      popperPlacement="bottom-start"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <ErrorMessage message={errors.pickupDate || ''} />
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP TIME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupTime}
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      readOnly
                      placeholder="Select Time"
                      className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer ${
                        errors.pickupTime ? 'border-red-500' : ''
                      }`}
                    />
                    <Clock
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    {showTimeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {generateTimeOptions(pickupDate).map((time) => (
                          <div
                            key={time}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setPickupTime(time)
                              setErrors(prev => ({ ...prev, pickupTime: '' }))
                              setShowTimeDropdown(false)
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                    <ErrorMessage message={errors.pickupTime || ''} />
                  </div>
                </div>
              </>
            ) : tripType === "AIRPORT" ? (
              <>
                <div className="lg:col-span-12 mb-4">
                  <div className="flex gap-4">
                    <button
                      className={`px-4 py-2 rounded ${
                        airportJourneyType === "pickup"
                          ? "bg-[#FF3131] text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() => setAirportJourneyType("pickup")}
                    >
                      Airport Pickup
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${
                        airportJourneyType === "drop"
                          ? "bg-[#FF3131] text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() => setAirportJourneyType("drop")}
                    >
                      Airport Drop
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {airportJourneyType === "pickup"
                      ? "AIRPORT PICKUP LOCATION"
                      : "PICKUP ADDRESS"}
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect("from")}
                      options={getAutocompleteOptions("from", tripType, airportJourneyType)}
                    >
                      <input
                        type="text"
                        defaultValue={fromCity}
                        onChange={handleFromInputChange}
                        placeholder={
                          airportJourneyType === "pickup"
                            ? "Enter airport name"
                            : "Enter pickup address"
                        }
                        className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                          errors.fromCity ? 'border-red-500' : ''
                        }`}
                      />
                    </Autocomplete>
                  )}
                  <ErrorMessage message={errors.fromCity || ''} />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {airportJourneyType === "pickup"
                      ? "DROP ADDRESS"
                      : "AIRPORT DROP LOCATION"}
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleToAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect("to")}
                      options={getAutocompleteOptions("to", tripType, airportJourneyType)}
                    >
                      <input
                        type="text"
                        defaultValue={toCity}
                        onChange={handleToInputChange}
                        placeholder={
                          airportJourneyType === "pickup"
                            ? "Enter drop address"
                            : "Enter airport name"
                        }
                        className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                          errors.toCity ? 'border-red-500' : ''
                        }`}
                      />
                    </Autocomplete>
                  )}
                  <ErrorMessage message={errors.toCity || ''} />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP DATE
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date: Date | null) => {
                        setPickupDate(date)
                        setErrors(prev => ({ ...prev, pickupDate: '' }))
                      }}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                        errors.pickupDate ? 'border-red-500' : ''
                      }`}
                      placeholderText="Select Date"
                      popperPlacement="bottom-start"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <ErrorMessage message={errors.pickupDate || ''} />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP TIME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupTime}
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      readOnly
                      placeholder="Select Time"
                      className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer ${
                        errors.pickupTime ? 'border-red-500' : ''
                      }`}
                    />
                    <Clock
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    {showTimeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {generateTimeOptions(pickupDate).map((time) => (
                          <div
                            key={time}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setPickupTime(time)
                              setErrors(prev => ({ ...prev, pickupTime: '' }))
                              setShowTimeDropdown(false)
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                    <ErrorMessage message={errors.pickupTime || ''} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FROM
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect("from")}
                      options={getAutocompleteOptions("from", tripType)}
                    >
                      <input
                        type="text"
                        defaultValue={fromCity}
                        onChange={handleFromInputChange}
                        placeholder="Enter Pickup City"
                        className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                          errors.fromCity ? 'border-red-500' : ''
                        }`}
                      />
                    </Autocomplete>
                  )}
                  <ErrorMessage message={errors.fromCity || ''} />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TO
                  </label>
                  <div className="relative">
                    {isLoaded && (
                      <Autocomplete
                        onLoad={handleToAutocompleteLoad}
                        onPlaceChanged={() => handlePlaceSelect("to")}
                        options={getAutocompleteOptions("to", tripType)}
                      >
                        <input
                          type="text"
                          defaultValue={toCity}
                          onChange={handleToInputChange}
                          placeholder="Enter Drop City"
                          className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                            errors.toCity ? 'border-red-500' : ''
                          }`}
                        />
                      </Autocomplete>
                    )}
                    <ErrorMessage message={errors.toCity || ''} />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP DATE
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date: Date | null) => {
                        setPickupDate(date)
                        setErrors(prev => ({ ...prev, pickupDate: '' }))
                      }}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                        errors.pickupDate ? 'border-red-500' : ''
                      }`}
                      placeholderText="Select Date"
                      popperPlacement="bottom-start"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <ErrorMessage message={errors.pickupDate || ''} />
                  </div>
                </div>

                {tripType === "OUTSTATION" && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RETURN DATE
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={returnDate}
                        onChange={(date: Date | null) => {
                          setReturnDate(date)
                          setErrors(prev => ({ ...prev, returnDate: '' }))
                        }}
                        minDate={pickupDate || new Date()}
                        dateFormat="dd-MM-yyyy"
                        className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent ${
                          errors.returnDate ? 'border-red-500' : ''
                        }`}
                        placeholderText="Select Date"
                        popperPlacement="bottom-start"
                      />
                      <Calendar
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <ErrorMessage message={errors.returnDate || ''} />
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    tripType === "OUTSTATION"
                      ? "lg:col-span-2"
                      : "lg:col-span-4"
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP TIME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickupTime}
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      readOnly
                      placeholder="Select Time"
                      className={`w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer ${
                        errors.pickupTime ? 'border-red-500' : ''
                      }`}
                    />
                    <Clock
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    {showTimeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {generateTimeOptions(pickupDate).map((time) => (
                          <div
                            key={time}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setPickupTime(time)
                              setErrors(prev => ({ ...prev, pickupTime: '' }))
                              setShowTimeDropdown(false)
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                    <ErrorMessage message={errors.pickupTime || ''} />
                  </div>
                </div>
              </>
            )}
          </div>


          <button
            onClick={handleExploreCabs}
            className="w-full mt-6 px-8 py-3 bg-[#FF3131] text-white font-medium rounded hover:bg-[#E02020] transition-colors text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (   
    
              <span>EXPLORE CABS</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
