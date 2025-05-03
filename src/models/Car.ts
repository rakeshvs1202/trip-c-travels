import mongoose from 'mongoose';

const hourlyRateSchema = new mongoose.Schema({
  duration: String,
  kms: Number,
});

const localRatesSchema = new mongoose.Schema({
  hourly: [hourlyRateSchema],
});

const outstationRatesSchema = new mongoose.Schema({
  perKm: Number,
  minBillableKm: Number,
  driverAllowance: Number,
});

const carSchema = new mongoose.Schema({
  id: Number,
  category: String,
  name: String,
  image: String,
  seatingCapacity: Number,
  luggageCapacity: Number,
  features: [String],
  localRates: localRatesSchema,
  outstationRates: outstationRatesSchema,
});

// Check if the model is already defined to prevent the "Cannot overwrite model once compiled" error
export default mongoose.models.Car || mongoose.model('Car', carSchema);
