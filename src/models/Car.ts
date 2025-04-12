import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
  id: number;
  category: string;
  name: string;
  image: string;
  seatingCapacity: number;
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

const CarSchema: Schema = new Schema({
  id: { type: Number, required: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
  localRates: {
    hourly: [{ 
      duration: String,
      kms: Number,
      price: Number
    }]
  },
  exHrsRates: {
    perMinute: Number,
    perKm: Number,
    perHour: Number
  },
  outstationRates: {
    perKm: Number,
    minBillableKm: Number,
    driverAllowance: Number
  }
});

export default mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);
