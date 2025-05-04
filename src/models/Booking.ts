// src/models/Booking.ts
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  contactInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  pickupDetails: {
    pickupAddress: { type: String, required: false },
    pickupDate: { type: String , required: false },
    pickupTime: { type: String, required: false }
  },
  bookingData: { 
    source: { type: String, required: true },
    destination: { type: String, required: false },
    tripType: { type: String, required: true },
    distance: { type: String, required: true },
    duration: { type: String, required: true },
    returnDate: { type: String, required: false },
    selectedPackage: { type: String, required: false },
    totalFare: { type: Number, required: true },
    selectedCar: { type: String, required: true },
   },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);