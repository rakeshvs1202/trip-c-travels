import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import Car from "@/models/Car"

// Correct Next.js App Router route handler signature for dynamic routes
export async function GET(request: NextRequest) {
  // Extract the booking id from the request URL path, e.g. /api/bookings/<id>
  const id = request.nextUrl.pathname.split("/").pop() ?? ""

  try {
    await dbConnect()

    const booking = await Booking.findOne({ bookingId: id })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Get car details
    const car = await Car.findOne({ id: booking.carId })

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        source: booking.source,
        destination: booking.destination,
        carName: car.name,
        totalAmount: booking.totalAmount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ message: "Failed to fetch booking" }, { status: 500 })
  }
}
