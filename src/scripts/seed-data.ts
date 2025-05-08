export const carData = [
    {
      id: 1,
      category: "Sedan",
      name: "Swift Dzire / Etios / Similar",
      image: "/cars/etios.png",
      seatingCapacity: 4,
      luggageCapacity: 2,
      features: ["AC", "Music System", "Comfortable Seating"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10 },
          { duration: "4hrs", kms: 40},
          { duration: "8hrs", kms: 80 },
        ],
        price:[
          {perMinute:2, perKm:17},
          {exMinRate:3, exKmRate:18 }
        ]
      },
      outstationRates: {
        perKm: 15,
        exKmRate:17,
        minBillableKm: 250,
        driverAllowance: 350,
      },
      airportRates: [
        {range: "25",perKmRate:50},
        {range: "30",perKmRate:46},
        {range: "35",perKmRate:42},
        {range: "40",perKmRate:39},
        {range: "45",perKmRate:37},
        {range: "50",perKmRate:36},
        {range: "55",perKmRate:36},
        {range: "60",perKmRate:36},
      ]
    },
    {
      id: 2,
      category: "Sedan",
      name: "Ciaze / Honda City",
      image: "/cars/hondacity.png",
      seatingCapacity: 4,
      luggageCapacity: 3,
      features: ["AC", "Music System", "Comfortable Seating", "Extra Legroom"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10},
          { duration: "4hrs", kms: 40 },
          { duration: "8hrs", kms: 80},
        ],
        price:[
          {perMinute:2.5, perKm:19},
          {exMinRate:3.5, exKmRate:20 }
        ]
      },
      outstationRates: {
        perKm: 17,
        exKmRate:19,
        minBillableKm: 250,
        driverAllowance: 350,
      },
    },
    {
      id: 3,
      category: "SUV",
      name: "Ertiga / Similar",
      image: "/cars/ertiga.png",
      seatingCapacity: 6,
      luggageCapacity: 3,
      features: ["AC", "Music System", "Spacious", "Family Friendly"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10 },
          { duration: "4hrs", kms: 40  },
          { duration: "8hrs", kms: 80 },
        ],
        price:[
          {perMinute:2.8, perKm:21},
          {exMinRate:3.5, exKmRate:22 }
        ]
      },
      outstationRates: {
        perKm: 20,
        exKmRate:22,
        minBillableKm: 250,
        driverAllowance: 400,
      },
      airportRates: [
        {range: "25",perKmRate:64},
        {range: "30",perKmRate:59},
        {range: "35",perKmRate:55},
        {range: "40",perKmRate:50},
        {range: "45",perKmRate:49},
        {range: "50",perKmRate:50},
        {range: "55",perKmRate:50},
        {range: "60",perKmRate:50},
      ]
    },
    {
      id: 4,
      category: "SUV",
      name: "Innova",
      image: "/cars/innova.png",
      seatingCapacity: 7,
      luggageCapacity: 4,
      features: ["AC", "Music System", "Spacious", "Comfortable for Long Journeys"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10},
          { duration: "4hrs", kms: 40},
          { duration: "8hrs", kms: 80 },
        ],
        price:[
          {perMinute:3.5, perKm:24},
          {exMinRate:4.5, exKmRate:28 }
        ]
      },
      outstationRates: {
        perKm: 21,
        exKmRate:23,
        minBillableKm: 250,
        driverAllowance: 450,
      },
      airportRates: [
        {range: "25",perKmRate:70},
        {range: "30",perKmRate:68},
        {range: "35",perKmRate:66},
        {range: "40",perKmRate:64},
        {range: "45",perKmRate:62},
        {range: "50",perKmRate:61},
        {range: "55",perKmRate:60},
        {range: "60",perKmRate:60},
      ]
    },
    {
      id: 5,
      category: "SUV",
      name: "Innova Crysta",
      image: "/cars/innova-crysta.png",
      seatingCapacity: 7,
      luggageCapacity: 4,
      features: ["AC", "Music System", "Premium Interior", "Extra Comfort"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10  },
          { duration: "4hrs", kms: 40  },
          { duration: "8hrs", kms: 80  },
        ],
        price:[
          {perMinute:3.6, perKm:27},
          {exMinRate:5.5, exKmRate:30}
        ]
      },
      outstationRates: {
        perKm: 23,
        exKmRate:25,
        minBillableKm: 250,
        driverAllowance: 450,
      },
      airportRates: [
        {range: "25",perKmRate:78},
        {range: "30",perKmRate:76},
        {range: "35",perKmRate:74},
        {range: "40",perKmRate:72},
        {range: "45",perKmRate:70},
        {range: "50",perKmRate:68},
        {range: "55",perKmRate:67},
        {range: "60",perKmRate:66},
      ]
    },
    {
      id: 6,
      category: "SUV",
      name: "Innova Hycroos",
      image: "/cars/innova-hycross.png",
      seatingCapacity: 7,
      luggageCapacity: 4,
      features: ["AC", "Music System", "Premium Interior", "Extra Comfort"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10  },
          { duration: "4hrs", kms: 40  },
          { duration: "8hrs", kms: 80  },
        ],
        price:[
          {perMinute:4.3, perKm:30},
          {exMinRate: 9, exKmRate:35}
        ]
      },
      outstationRates: {
        perKm: 25,
        exKmRate:27,
        minBillableKm: 250,
        driverAllowance: 450,
      },
    },
    {
      id: 7,
      category: "Luxury",
      name: "Fortuner",
      image: "/cars/fortuner.png",
      seatingCapacity: 7,
      luggageCapacity: 4,
      features: ["AC", "Music System", "Luxury Interior", "Powerful Engine"],
      localRates: {
        hourly: [{ duration: "8hrs", kms: 80}],
        price:[
          {perMinute:15.83, perKm:100},
          {exMinRate:12, exKmRate:70 }
        ]
      },
      outstationRates: {
        perKm: 70,
        minBillableKm: 300,
        driverAllowance: 750,
      },
    },
    {
      id: 8,
      category: "Luxury",
      name: "Mercedes E Class / BMW 5 Series",
      image: "/cars/benz-e-class.png",
      seatingCapacity: 4,
      luggageCapacity: 3,
      features: ["AC", "Premium Sound System", "Luxury Interior", "Executive Comfort"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10  },
          { duration: "8hrs", kms: 80  },
        ],
        price:[
          {perMinute:15.83, perKm:100},
          {exMinRate:20, exKmRate:120 }
        ]
      },
      outstationRates: {
        perKm: 120,
        minBillableKm: 300,
        driverAllowance: 850,
      },
    },
    {
      id: 9,
      category: "Luxury",
      name: "Mercedes S Class / BMW 7 Series",
      image: "/cars/mercedes-s-class.png",
      seatingCapacity: 4,
      luggageCapacity: 3,
      features: ["AC", "Premium Sound System", "Luxury Interior", "Executive Comfort"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10  },
          { duration: "8hrs", kms: 80  },
        ],
        price:[
          {perMinute:20, perKm:125},
          {exMinRate:30, exKmRate:180 }
        ]
      },
      outstationRates: {
        perKm: 180,
        minBillableKm: 300,
        driverAllowance: 850,
      },
    },
    {
      id: 10,
      category: "Tempo Traveler",
      name: "Tempo Traveler (Non A/C)",
      image: "/cars/tempo.png",
      seatingCapacity: 12,
      luggageCapacity: 8,
      features: ["Spacious", "Group Travel", "Comfortable Seating"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10  },
          { duration: "8hrs", kms: 80  },
        ],
        price:[
          {perMinute:3.75, perKm:25},
          {exMinRate:5, exKmRate:30 }
        ]
      },
      exHrsRates: {
        perMinute: 3.75,
        perKm: 25,
        perHour: 300,
      },
      outstationRates: {
        perKm: 24,
        exKmRate:26,
        minBillableKm: 250,
        driverAllowance: 500,
      },
    },
    {
      id: 11,
      category: "Tempo Traveler",
      name: "Tempo Traveler (A/C)",
      image: "/cars/tempo.png",
      seatingCapacity: 12,
      luggageCapacity: 8,
      features: ["AC", "Spacious", "Group Travel", "Comfortable Seating"],
      localRates: {
        hourly: [
          { duration: "1hrs", kms: 10  },
          { duration: "8hrs", kms: 80  },
        ],
        price:[
          {perMinute: 5, perKm:28},
          {exMinRate:6.5, exKmRate:35 }
        ]
      },
      exHrsRates: {
        perMinute: 5,
        perKm: 28,
        perHour: 390,
      },
      outstationRates: {
        perKm: 26,
        exKmRate:28,
        minBillableKm: 250,
        driverAllowance: 500,
      },
    },
  ]