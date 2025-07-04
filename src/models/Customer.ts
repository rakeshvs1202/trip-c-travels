import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create index for OTP expiry to auto-delete expired OTPs
CustomerSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
