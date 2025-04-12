import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import { generateBookingId } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const data = await request.json()

    // Generate a unique booking ID
    const bookingId = generateBookingId()

    // Create new booking
    const booking = new Booking({
      bookingId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      pickupAddress: data.pickupAddress,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      tripType: data.tripType,
      source: data.source,
      destination: data.destination,
      carId: data.carId,
      distance: data.distance,
      duration: data.duration,
      totalAmount: data.totalAmount,
    })

    await booking.save()

    return NextResponse.json({ bookingId, message: "Booking created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ message: "Failed to create booking" }, { status: 500 })
  }
}
