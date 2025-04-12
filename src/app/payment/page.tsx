"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface BookingDetails {
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: string
  pickupTime: string
  source: string
  destination: string
  carName: string
  totalAmount: number
}

export default function Payment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")

  useEffect(() => {
    if (!bookingId) {
      router.push("/")
      return
    }

    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    // Fetch booking details
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        const data = await response.json()

        if (response.ok) {
          setBookingDetails(data)
        } else {
          throw new Error(data.message || "Failed to fetch booking details")
        }
      } catch (error) {
        console.error("Error fetching booking details:", error)
        alert("Failed to fetch booking details. Redirecting to home page.")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()

    return () => {
      document.body.removeChild(script)
    }
  }, [bookingId, router])

  const handlePayment = async () => {
    if (!bookingDetails) return

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingDetails.bookingId,
          amount: bookingDetails.totalAmount,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order")
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: bookingDetails.totalAmount * 100, // Amount in paise
        currency: "INR",
        name: "Trip-C",
        description: `Booking ID: ${bookingDetails.bookingId}`,
        order_id: orderData.orderId,
        prefill: {
          name: bookingDetails.customerName,
          email: bookingDetails.customerEmail,
          contact: bookingDetails.customerPhone,
        },
        theme: {
          color: "#FF3131",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId: bookingDetails.bookingId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              setPaymentStatus("success")
            } else {
              throw new Error(verifyData.message || "Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            setPaymentStatus("failed")
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal closed")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment initialization error:", error)
      alert("Failed to initialize payment. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-light-gray">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {paymentStatus === "pending" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
                <p className="text-gray-600">Please complete the payment to confirm your booking.</p>
              </div>

              {bookingDetails && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Booking ID</p>
                        <p className="font-medium">{bookingDetails.bookingId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Car</p>
                        <p className="font-medium">{bookingDetails.carName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-medium">{bookingDetails.source}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-medium">{bookingDetails.destination}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-medium">
                          {new Date(bookingDetails.pickupDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          at {bookingDetails.pickupTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-primary">₹{bookingDetails.totalAmount.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle size={18} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        Your booking will be confirmed immediately after successful payment. You will receive a
                        confirmation email with all the details.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Methods</h3>
                    <div className="flex flex-wrap gap-4">
                      <Image src="/payment/razorpay.png" alt="Razorpay" width={80} height={30} />
                      <Image src="/payment/visa.png" alt="Visa" width={50} height={30} />
                      <Image src="/payment/mastercard.png" alt="Mastercard" width={50} height={30} />
                      <Image src="/payment/rupay.png" alt="RuPay" width={50} height={30} />
                      <Image src="/payment/upi.png" alt="UPI" width={50} height={30} />
                    </div>
                  </div>

                  <button className="btn-primary w-full" onClick={handlePayment}>
                    Pay ₹{bookingDetails.totalAmount.toFixed(0)}
                  </button>
                </div>
              )}
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your booking has been confirmed. A confirmation email has been sent to your email address.
              </p>
              <div className="mb-8 p-4 bg-gray-50 rounded-md inline-block">
                <p className="text-sm font-medium">
                  Booking ID: <span className="text-primary">{bookingDetails?.bookingId}</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary" onClick={() => router.push("/booking-confirmation")}>
                  View Booking Details
                </button>
                <button className="btn-outline" onClick={() => router.push("/")}>
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary" onClick={handlePayment}>
                  Try Again
                </button>
                <button className="btn-outline" onClick={() => router.push("/")}>
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
