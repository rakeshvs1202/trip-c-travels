import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"

// Correct Next.js App Router route handler signature for dynamic routes
export async function GET(request: NextRequest) {
  // Extract the booking id from the request URL path, e.g. /api/bookings/<id>
  const id = request.nextUrl.pathname.split('/')[3];
  

  try {
    await dbConnect()

    const booking = await Booking.findOne({ bookingId: id })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }


    return NextResponse.json(
      {
        bookingDetails: booking
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ message: "Failed to fetch booking" }, { status: 500 })
  }
}
