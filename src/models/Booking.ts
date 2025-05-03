import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress: string;
  pickupDate: Date;
  pickupTime: string;
  tripType: 'outstation' | 'local' | 'airport';
  source: string;
  destination: string;
  carId: number;
  distance: number;
  duration: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  bookingId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  tripType: { type: String, enum: ['outstation', 'local', 'airport'], required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  carId: { type: Number, required: true },
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
