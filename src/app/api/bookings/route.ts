import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import { generateBookingId } from "@/lib/utils"
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await dbConnect()

    const data = await request.json()

    // Generate a unique booking ID

    // Create new booking
    const booking = new Booking({
      bookingId: data.bookingId,
      contactInfo: data.contactInfo,
      pickupDetails: data.pickupDetails,
      bookingData: data.bookingData
    })

    await booking.save()

    return NextResponse.json({ bookingId:data.bookingId, message: "Booking created successfully" }, { status: 201 })
  } // In src/app/api/bookings/route.ts
  catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Database error",
        // Add validation errors if available
        validationErrors: error instanceof mongoose.Error.ValidationError
          ? Object.values(error.errors).map((err: mongoose.Error) => (err as mongoose.Error.ValidatorError).message)
          : error instanceof mongoose.Error.CastError
            ? [error.message]
            : null
      },
      { status: 500 }
    );
  }
}
