"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowLeftRight } from "lucide-react";
import { debounce } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

interface Place {
  place_id: string;
  description: string;
  location?: google.maps.LatLng;
}

export default function BookingSection() {
  const [tripType, setTripType] = useState("ONE_WAY");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

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
    if (place.formatted_address) {
      if (type === "from") {
        setFromCity(place.formatted_address);
      } else {
        setToCity(place.formatted_address);
      }

      // If both locations and time are selected, calculate route details
      if (fromCity && toCity && pickupTime) {
        await calculateRouteDetails();
      }
    }
  };

  const calculateRouteDetails = async () => {
    if (!fromCity || !toCity || !pickupTime) return;

    try {
      const service = new google.maps.DistanceMatrixService();
      const result = await service.getDistanceMatrix({
        origins: [fromCity],
        destinations: [toCity],
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(
            pickupDate?.setHours(
              parseInt(pickupTime.split(":")[0]),
              parseInt(pickupTime.split(":")[1])
            ) || new Date()
          ),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      });

      if (result.rows[0]?.elements[0]) {
        const { distance, duration } = result.rows[0].elements[0];
        setRouteDetails({
          distance: distance.text,
          duration: duration.text,
          // Note: Toll information would require additional API integration
          tollInfo: "Calculating...",
        });
      }
    } catch (error) {
      console.error("Error calculating route details:", error);
    }
  };

  useEffect(() => {
    if (fromCity && toCity && pickupTime) {
      calculateRouteDetails();
    }
  }, [fromCity, toCity, pickupTime]);

  const getAutocompleteOptions = (type: "city" | "airport" | "address") => {
    const options: google.maps.places.AutocompleteOptions = {
      fields: ["formatted_address", "geometry", "name"],
    };

    switch (type) {
      case "city":
        options.types = ["(cities)"];
        break;
      case "airport":
        options.types = ["airport"];
        break;
      case "address":
        options.types = ["address"];
        break;
    }

    return options;
  };

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
            {["ONE_WAY", "ROUND_TRIP", "LOCAL", "AIRPORT"].map((type) => (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP DATE
                  </label>
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
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
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
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer"
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
                              setPickupTime(time);
                              setShowTimeDropdown(false);
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
                      options={getAutocompleteOptions(
                        airportJourneyType === "pickup" ? "airport" : "address"
                      )}
                    >
                      <input
                        type="text"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        placeholder={
                          airportJourneyType === "pickup"
                            ? "Enter airport name"
                            : "Enter pickup address"
                        }
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      />
                    </Autocomplete>
                  )}
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
                      options={getAutocompleteOptions(
                        airportJourneyType === "pickup" ? "address" : "airport"
                      )}
                    >
                      <input
                        type="text"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        placeholder={
                          airportJourneyType === "pickup"
                            ? "Enter drop address"
                            : "Enter airport name"
                        }
                        className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent"
                      />
                    </Autocomplete>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP DATE
                  </label>
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
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
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
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer"
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
                              setPickupTime(time);
                              setShowTimeDropdown(false);
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FROM
                  </label>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={handleFromAutocompleteLoad}
                      onPlaceChanged={() => handlePlaceSelect("from")}
                      options={getAutocompleteOptions("city")}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TO
                  </label>
                  <div className="relative">
                    {isLoaded && (
                      <Autocomplete
                        onLoad={handleToAutocompleteLoad}
                        onPlaceChanged={() => handlePlaceSelect("to")}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PICK UP DATE
                  </label>
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
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>

                {tripType === "ROUND_TRIP" && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RETURN DATE
                    </label>
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
                      <Calendar
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    tripType === "ROUND_TRIP"
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
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-[#FF3131] focus:border-transparent cursor-pointer"
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
                              setPickupTime(time);
                              setShowTimeDropdown(false);
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

          {/* Add route details display */}
          {routeDetails && (
            <div className="lg:col-span-12 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-medium">{routeDetails.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-medium">{routeDetails.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Estimated Toll Charges
                  </p>
                  <p className="text-lg font-medium">{routeDetails.tollInfo}</p>
                </div>
              </div>
            </div>
          )}

          <button className="w-full mt-6 px-8 py-3 bg-[#FF3131] text-white font-medium rounded hover:bg-[#E02020] transition-colors text-lg">
            EXPLORE CABS
          </button>
        </div>
      </div>
    </section>
  );
}
