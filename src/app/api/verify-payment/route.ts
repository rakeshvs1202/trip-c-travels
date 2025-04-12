import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const data = await request.json()
    const { bookingId, paymentId, orderId, signature } = data

    // Verify signature
    const text = orderId + "|" + paymentId
    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(text).digest("hex")

    if (generatedSignature !== signature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
    }

    // Update booking status
    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      {
        paymentStatus: "completed",
        paymentId,
      },
      { new: true },
    )

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Payment verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ message: "Failed to verify payment" }, { status: 500 })
  }
}
