interface Car {
    id: number;
    category: string;
    name: string;
    localRates: {
      hourly: { duration: string; kms: number; price: number }[];
    };
    exHrsRates: {
      perMinute: number;
      perKm: number;
      perHour: number;
    };
    outstationRates: {
      perKm: number;
      minBillableKm: number;
      driverAllowance: number;
    };
  }
  
  type TripType = 'oneWay' | 'roundTrip' | 'local' | 'airport';
  
  export function calculatePrice(
    car: Car,
    tripType: TripType,
    distance: number,
    hours?: number
  ): number {
    switch (tripType) {
      case 'local':
        return calculateLocalPrice(car, hours || 4);
      
      case 'airport':
        return calculateOutstationPrice(car, distance);
      
      case 'oneWay':
        return calculateOutstationPrice(car, distance);
      
      case 'roundTrip':
        return calculateOutstationPrice(car, distance);
      
      default:
        return 0;
    }
  }
  
  function calculateLocalPrice(car: Car, hours: number): number {
    // Find the closest package
    let packagePrice = 0;
    
    if (hours <= 1) {
      // 1 hour package
      const package1Hr = car.localRates.hourly.find(p => p.duration === '1hrs');
      if (package1Hr) {
        packagePrice = package1Hr.price;
      }
    } else if (hours <= 4) {
      // 4 hour package
      const package4Hr = car.localRates.hourly.find(p => p.duration === '4hrs');
      if (package4Hr) {
        packagePrice = package4Hr.price;
      }
    } else {
      // 8 hour package
      const package8Hr = car.localRates.hourly.find(p => p.duration === '8hrs');
      if (package8Hr) {
        packagePrice = package8Hr.price;
      }
    }
    
    return packagePrice;
  }
  
  function calculateOutstationPrice(car: Car, distance: number): number {
    const { perKm, minBillableKm, driverAllowance } = car.outstationRates;
    
    // Apply minimum billable kilometers
    const billableDistance = Math.max(distance, minBillableKm);
    
    // Calculate base fare
    const baseFare = billableDistance * perKm;
    
    // Add driver allowance
    const totalFare = baseFare + driverAllowance;
    
    return totalFare;
  }
  