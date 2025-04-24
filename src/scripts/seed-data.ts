export const carData = [
  {
    id: 1,
    category: "Sedan",
    name: "Sedan",
    image: "/cars/sedan.svg",
    seatingCapacity: 4,
    luggageCapacity: 2,
    features: ["AC", "Music System", "Comfortable Seating"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 290 },
        { duration: "4hrs", kms: 40, price: 1160 },
        { duration: "8hrs", kms: 80, price: 2320 },
      ],
    },
    outstationRates: {
      perKm: 17,
      minBillableKm: 250,
      driverAllowance: 350,
    },
  },
  {
    id: 2,
    category: "Sedan",
    name: "Ciaze / Honda City",
    image: "/cars/sedan.svg",
    seatingCapacity: 4,
    luggageCapacity: 3,
    features: ["AC", "Music System", "Comfortable Seating", "Extra Legroom"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 340 },
        { duration: "4hrs", kms: 40, price: 1360 },
        { duration: "8hrs", kms: 80, price: 2720 },
      ],
    },
    outstationRates: {
      perKm: 19,
      minBillableKm: 250,
      driverAllowance: 350,
    },
  },
  {
    id: 3,
    category: "SUV",
    name: "Ertiga / Similar",
    image: "/cars/suv.svg",
    seatingCapacity: 6,
    luggageCapacity: 3,
    features: ["AC", "Music System", "Spacious", "Family Friendly"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 378 },
        { duration: "4hrs", kms: 40, price: 1512 },
        { duration: "8hrs", kms: 80, price: 3024 },
      ],
    },
    outstationRates: {
      perKm: 22,
      minBillableKm: 250,
      driverAllowance: 400,
    },
  },
  {
    id: 4,
    category: "SUV",
    name: "Innova",
    image: "/cars/suv.svg",
    seatingCapacity: 7,
    luggageCapacity: 4,
    features: ["AC", "Music System", "Spacious", "Comfortable for Long Journeys"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 450 },
        { duration: "4hrs", kms: 40, price: 1800 },
        { duration: "8hrs", kms: 80, price: 3600 },
      ],
    },
    outstationRates: {
      perKm: 23,
      minBillableKm: 250,
      driverAllowance: 450,
    },
  },
  {
    id: 5,
    category: "SUV",
    name: "Innova Crysta",
    image: "/cars/suv.svg",
    seatingCapacity: 7,
    luggageCapacity: 4,
    features: ["AC", "Music System", "Premium Interior", "Extra Comfort"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 490 },
        { duration: "4hrs", kms: 40, price: 1960 },
        { duration: "8hrs", kms: 80, price: 3920 },
      ],
    },
    outstationRates: {
      perKm: 25,
      minBillableKm: 250,
      driverAllowance: 450,
    },
  },
  {
    id: 6,
    category: "Luxury",
    name: "Fortuner",
    image: "/cars/fortuner.jpg",
    seatingCapacity: 7,
    luggageCapacity: 4,
    features: ["AC", "Music System", "Luxury Interior", "Powerful Engine"],
    localRates: {
      hourly: [{ duration: "8hrs", kms: 80, price: 7488 }],
    },
    exHrsRates: {
      perMinute: 12,
      perKm: 70,
      perHour: 720,
    },
    outstationRates: {
      perKm: 70,
      minBillableKm: 300,
      driverAllowance: 750,
    },
  },
  {
    id: 7,
    category: "Luxury",
    name: "Mercedes E Class / BMW 5 Series",
    image: "/cars/mercedes-e.jpg",
    seatingCapacity: 4,
    luggageCapacity: 3,
    features: ["AC", "Premium Sound System", "Luxury Interior", "Executive Comfort"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 1950 },
        { duration: "8hrs", kms: 80, price: 15600 },
      ],
    },
    exHrsRates: {
      perMinute: 15.83,
      perKm: 100,
      perHour: 1200,
    },
    outstationRates: {
      perKm: 120,
      minBillableKm: 300,
      driverAllowance: 850,
    },
  },
  {
    id: 8,
    category: "Tempo Traveler",
    name: "Tempo Traveler (Non A/C)",
    image: "/cars/tempo-traveler.jpg",
    seatingCapacity: 12,
    luggageCapacity: 8,
    features: ["Spacious", "Group Travel", "Comfortable Seating"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 475 },
        { duration: "8hrs", kms: 80, price: 3800 },
      ],
    },
    exHrsRates: {
      perMinute: 3.75,
      perKm: 25,
      perHour: 300,
    },
    outstationRates: {
      perKm: 24,
      minBillableKm: 250,
      driverAllowance: 500,
    },
  },
  {
    id: 9,
    category: "Tempo Traveler",
    name: "Tempo Traveler (A/C)",
    image: "/cars/tempo-traveler-ac.jpg",
    seatingCapacity: 12,
    luggageCapacity: 8,
    features: ["AC", "Spacious", "Group Travel", "Comfortable Seating"],
    localRates: {
      hourly: [
        { duration: "1hrs", kms: 10, price: 580 },
        { duration: "8hrs", kms: 80, price: 4640 },
      ],
    },
    exHrsRates: {
      perMinute: 5,
      perKm: 28,
      perHour: 390,
    },
    outstationRates: {
      perKm: 26,
      minBillableKm: 250,
      driverAllowance: 500,
    },
  },
]
