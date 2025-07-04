"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CarData } from "@/types"
import { carData } from "@/scripts/seed-data"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import CustomerInfoPopup from '@/components/CustomerInfoPopup';



export default function SelectCar() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [bookingPrice, setBookingPrice] = useState<number>(0);
  const [showDetailsForCar, setShowDetailsForCar] = useState<CarData | null>(null);
  const [activeTab, setActiveTab] = useState('inclusions');
  const [baseDistance, setBaseDistance] = useState<number>(250); // Default to 1-day base distance

  const localOptions = [
    { duration: "4hrs", kms: 40 },
    { duration: "8hrs", kms: 80 },
    { duration: "12hrs", kms: 120},
  ];

  // Show popup on component mount
  useEffect(() => {
    setShowCustomerPopup(true);
  }, []);

  const handleCustomerSuccess = (data: any) => {
    setCustomerData(data);
    setShowCustomerPopup(false);
    toast.success('Customer information saved successfully!');
  };

  useEffect(() => {
    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem('bookingData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Convert string dates back to Date objects
      if (parsedData.pickupDate) {
        parsedData.pickupDate = new Date(parsedData.pickupDate);
      }
      if (parsedData.returnDate) {
        parsedData.returnDate = new Date(parsedData.returnDate);
      }
      setBookingData(parsedData);

      // Set default selected option for LOCAL trips
      if (parsedData.tripType === 'LOCAL') {
        setSelectedOption('4hrs | 40kms');
      }
    } else {
      router.push('/');
    }

    // Use the car data from seed-data
    setCars(carData as CarData[]);
    setLoading(false);
  }, [router])



  // Calculate trip days and base distance using useMemo
  const { tripDays, calculatedBaseDistance } = useMemo(() => {
    let days = 1;
    let baseDist = 250;
    
    if (bookingData?.pickupDate && bookingData?.returnDate) {
      const pickupDate = new Date(bookingData.pickupDate);
      const returnDate = new Date(bookingData.returnDate);
      
      if (!isNaN(pickupDate.getTime()) && !isNaN(returnDate.getTime())) {
        const timeDiff = returnDate.getTime() - pickupDate.getTime();
        days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        baseDist = days === 1 ? 250 : 270 * days;
      }
    }
    
    // Sync baseDistance with the new calculated value
    sessionStorage.setItem('baseDistance', baseDist.toString());
    setBaseDistance(baseDist);
    
    return { tripDays: days, calculatedBaseDistance: baseDist };
  }, [bookingData?.pickupDate, bookingData?.returnDate]);

  const calculatePrice = useCallback((car: any) => {
    if (!bookingData) return 0;

    const { distance, tripType } = bookingData;
    let totalPrice = 0;

    switch (tripType.toUpperCase()) {
      case "OUTSTATION":
        const exKmRate = car.outstationRates.exKmRate || car.outstationRates.perKm;
        if (distance <= calculatedBaseDistance) {
          totalPrice = calculatedBaseDistance * car.outstationRates.perKm + 
                     (car.outstationRates.driverAllowance * tripDays);
        } else {
          totalPrice = calculatedBaseDistance * car.outstationRates.perKm +
                     (car.outstationRates.driverAllowance * tripDays) +
                     ((distance - calculatedBaseDistance) * exKmRate);
        }
        break;

      case "AIRPORT":
        totalPrice = calculateAirportFare(car, distance);
        break;

      case "LOCAL":
        if (!selectedOption || !selectedOption.includes('|')) {
          console.error('Invalid selectedOption format:', selectedOption);
          totalPrice = 0;
          break;
        }
        const [minutesPart, kmPart] = selectedOption.split('|');
        const minutes = parseInt(minutesPart?.trim(), 10);
        const km = parseInt(kmPart?.trim(), 10);
        if (isNaN(minutes) || isNaN(km)) {
          console.error('Invalid number conversion:', { minutes, km });
          totalPrice = 0;
          break;
        }
        totalPrice = car?.localRates?.price[0]?.perKm * km + car.localRates.price[0].perMinute * minutes * 60;
        break;

      default:
        totalPrice = 0;
    }
    return Math.round(totalPrice);
  }, [bookingData]);

  const calculateAirportFare = (car: CarData, distance: number) => {
    const rates = car.airportRates
      ?.map(rate => ({
        range: parseInt(rate.range),
        perKmRate: rate.perKmRate
      }))
      .sort((a, b) => a.range - b.range);

    if (!rates || rates.length === 0) return 0;

    // Find appropriate rate bracket
    const applicableRate = rates.find(r => r.range >= distance) || rates[rates.length - 1];
    return applicableRate.perKmRate * distance;
  };

  useEffect(() => {
    if (selectedCar) {
      const price = calculatePrice(selectedCar);
      setBookingPrice(price);
    }
  }, [selectedCar, bookingData, selectedOption]);

  const handleCarSelect = async (car: CarData) => {
    try {
      setIsLoading(true);
      setSelectedCar(car);
      const price = calculatePrice(car);
      const updatedData = {
        ...bookingData,
        selectedCar: car,
        totalFare: price,
        selectedPackage: bookingData?.tripType === 'LOCAL' ? selectedOption : null,
      };
      
      // Update state and storage
      setBookingData(updatedData);
      sessionStorage.setItem('bookingData', JSON.stringify(updatedData));
      sessionStorage.setItem("bookingFare", price.toString());
      
      // Navigate to services page
      router.push('/services');
      
      // Keep loading state true during navigation
      return;
      
    } catch (error) {
      console.error('Error selecting car:', error);
      alert('Failed to select car. Please try again.');
      setIsLoading(false);
      router.push('/');
    }
  };

  const filteredCars = bookingData?.tripType === 'LOCAL' && selectedOption
    ? cars.filter(car =>
      car.localRates.hourly.some(rate =>
        rate.duration === selectedOption.split('|')[0].trim() &&
        rate.kms === parseInt(selectedOption.split('|')[1].trim().replace('kms', ''))
      )
    )
    : bookingData?.tripType === 'AIRPORT'
      ? cars.filter(car => car.airportRates && car.airportRates.length > 0)
      : cars;

  const DetailsModal = ({ car }: { car: any }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Package Details</h3>
          <button
            onClick={() => setShowDetailsForCar(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex gap-6">
            {['inclusions', 'exclusions', 'terms'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 ${activeTab === tab
                    ? 'border-b-2 border-[#FF3131] font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="prose max-h-[60vh] overflow-y-auto">
          {activeTab === 'inclusions' && (
            <div className="space-y-3">
              <p className="text-green-600">✅ Base Fare</p>

              <p className="text-green-600">✅ Driver Allowance</p>
            </div>
          )}

          {(activeTab === 'exclusions' && bookingData?.tripType === 'LOCAL') && (
            <div className="space-y-3">
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Pay ₹{car.localRates.price[1].exKmRate}/km after {parseInt(selectedOption.split('|')[1].trim().replace('kms', ''))}km</p>
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Pay ₹{car.localRates?.price[1]?.exMinRate * 60}/hr after {parseInt(selectedOption.split('|')[0].trim().replace('hrs', ''))} hours</p>
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Toll / State tax</p>
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Parking charges</p>
            </div>
          )}
          {(activeTab === 'exclusions' && bookingData?.tripType === 'OUTSTATION') && (
            <div className="space-y-3">
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Pay ₹{car.outstationRates.exKmRate}/km after {baseDistance}km</p>
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Toll / State tax</p>
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Parking charges</p>
            </div>
          )}
          {(activeTab === 'exclusions' && bookingData?.tripType === 'AIRPORT') && (
            <div className="space-y-3">
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Toll / State tax</p>
              <p className="flex items-start gap-2"><Image src="/rejectionImg.png" alt="" width={20} height={20} className="w-5 h-5 mt-0.5 flex-shrink-0" /> Parking charges</p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2"><Image src="/tickMark.png" alt="" width={20} height={20} className="w-4 h-4 mt-0.5 flex-shrink-0" /> Your Trip has a KM limit as well as an Hours limit. Excess usage will be charged.</p>
              <p className="flex items-start gap-2"><Image src="/tickMark.png" alt="" width={16} height={16} className="w-4 h-4 mt-0.5 flex-shrink-0" /> KM and Hours calculated from pick-up to return.</p>
              <p className="flex items-start gap-2"><Image src="/tickMark.png" alt="" width={16} height={16} className="w-4 h-4 mt-0.5 flex-shrink-0" /> Airport entry charges (if applicable) are extra.</p>
              <p className="flex items-start gap-2"><Image src="/tickMark.png" alt="" width={16} height={16} className="w-4 h-4 mt-0.5 flex-shrink-0" /> All tolls, parking, and taxes are extra.</p>
              <p className="flex items-start gap-2"><Image src="/tickMark.png" alt="" width={16} height={16} className="w-4 h-4 mt-0.5 flex-shrink-0" /> Night driving (9:45 PM - 6:00 AM) incurs additional allowance.</p>
              <p className="flex items-start gap-2"><Image src="/tickMark.png" alt="" width={16} height={16} className="w-4 h-4 mt-0.5 flex-shrink-0" /> If your Trip has Hill climbs, cab AC may be switched off during such climbs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF3131]"></div>
      </div>
    )
  }

  return (
    <>
      <CustomerInfoPopup 
        isOpen={showCustomerPopup} 
        onClose={() => setShowCustomerPopup(false)} 
        onSuccess={handleCustomerSuccess}
      />
      <div className="container mx-auto px-4">
      {/* Journey Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Journey Details</h2>
        {bookingData?.tripType !== 'LOCAL' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center mx-auto w-full max-w-4xl">
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
        ) : (
          <div className="flex flex-row gap-6 justify-center">
            <div>
              <p className="font-medium">{bookingData?.source.split(',')[0]} <span className="text-gray-600 ml-2">Local</span></p>
            </div>
            <div>
              <p className="font-medium">Pickup Date & Time:- <span className="text-gray-600 ml-2">{bookingData?.pickupDate?.toLocaleDateString()} at{" "}{bookingData?.pickupTime}</span></p>
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
        )}
      </div>
      {bookingData?.tripType === 'LOCAL' && (
        <div className="flex gap-4 mb-6 justify-center">
          {localOptions.map((option) => (
            <button
              key={`${option.duration}|${option.kms}`}
              className={`px-4 py-2 rounded-md ${selectedOption === `${option.duration} | ${option.kms}kms`
                ? 'bg-[#FF3131] text-white'
                : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setSelectedOption(`${option.duration} | ${option.kms}kms`)}
            >
              {option.duration} | {option.kms}kms
            </button>
          ))}
        </div>
      )}
      {/* Cars Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCars.map((car) => (
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
                  {bookingData?.tripType ==='LOCAL'&& (<span className="text-gray-600 font-medium"> Includes {parseInt(selectedOption.split('|')[1].trim().replace('kms', ''))} kms and {parseInt(selectedOption.split('|')[0].trim().replace('hrs', ''))} hours</span>)}
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsForCar(car);
                  }}
                  className="text-[#FF3131] hover:underline text-base font-bold cursor-pointer px-2"
                >
                More Details
                </button>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/6 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Total Fare</p>
                <p className="text-3xl font-bold text-[#FF3131]">
                  ₹{calculatePrice(car)}
                </p>
                <button
                  onClick={() => handleCarSelect(car)}
                  disabled={isLoading}
                  className={`w-full mt-4 px-6 py-2 font-normal rounded transition-colors flex items-center justify-center gap-2 ${
                    isLoading 
                      ? 'bg-[#E02020] opacity-70 cursor-not-allowed' 
                      : 'bg-[#FF3131] hover:bg-[#E02020]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="text-white" />
                      <span>Selecting...</span>
                    </>
                  ) : (
                    'Select Car'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDetailsForCar && <DetailsModal car={showDetailsForCar} />}
    </div>
    </>
  )
}
