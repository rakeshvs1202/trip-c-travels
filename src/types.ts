export interface CarData {
  id: number;
  category: string;
  name: string;
  image: string;
  seatingCapacity: number;
  luggageCapacity: number;
  features: string[];
  localRates: {
    hourly: Array<{ duration: string; kms: number }>;
    price: Array<{ perMinute?: number; perKm?: number; exMinRate?: number; exKmRate?: number }>;
  };
  outstationRates: {
    perKm: number;
    minBillableKm: number;
    driverAllowance: number;
  };
}
