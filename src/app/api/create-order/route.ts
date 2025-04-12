import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const data = await request.json()
    const { bookingId, amount } = data

    // Validate booking
    const booking = await Booking.findOne({ bookingId })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    // Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: bookingId,
    })

    return NextResponse.json({ orderId: order.id }, { status: 200 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 })
  }
}
