"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Payment({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const bookingId = React.use(params).id

  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any | null>(null)
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

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
          setBookingDetails(data.bookingDetails)
          // Start payment process immediately
          handlePayment()
        } else {
          throw new Error(data.message || "Failed to fetch booking details")
        }
      } catch (error) {
        console.error("Error fetching booking details:", error)
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
          amount: bookingDetails.bookingData.totalFare,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order")
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: bookingDetails.bookingData.totalFare * 100, // Amount in paise
        currency: "INR",
        name: "Trip-C",
        description: `Booking ID: ${bookingDetails.bookingId}`,
        order_id: orderData.orderId,
        prefill: {
          name: bookingDetails.contactInfo.name,
          email: bookingDetails.contactInfo.email,
          contact: bookingDetails.contactInfo.phone,
        },
        theme: {
          color: "#FF3131",
        },
        handler: async (response: any) => {
          setPaymentMessage("Payment successful! Sending confirmation...")
          setShowMessage(true)

          try {
            const address = sessionStorage.getItem("pickupLocation");
            const bookingData = sessionStorage.getItem("bookingData");
            if(bookingData){
              const parsedBookingData = JSON.parse(bookingData);
              var pickupDate = parsedBookingData.pickupDate;
            }
            
            // Call our secure API route to send the confirmation email
            const emailResponse = await fetch('/api/send-confirmation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingId: bookingDetails.bookingId,
                pickupLocation: address,
                contactInfo: bookingDetails.contactInfo,
                bookingData: bookingDetails.bookingData,
                pickupDate: pickupDate,
                selectedCar: bookingDetails.selectedCar, 
                tripType: bookingDetails.bookingData?.tripType 
              })
            });

            const responseData = await emailResponse.json();
            console.log('Email API response:', responseData);

            if (!emailResponse.ok) {
              throw new Error(`Failed to send confirmation email: ${JSON.stringify(responseData)}`);
            }
          } catch (error) {
            console.error("Error sending email:", error);
          }
          setPaymentStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 7000);
        },
        modal: {
          ondismiss: async () => {
            setPaymentMessage("Payment cancelled. Redirecting to home page...")
            setShowMessage(true)
            setTimeout(() => {
              router.push("/")
            }, 3000)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error("Payment error:", error)
      setPaymentMessage("Payment failed. Please try again.")
      setShowMessage(true)
      setTimeout(() => {
        router.push("/")
      }, 3000)
    }
  }

  if (loading || !bookingDetails) return null

  return (
    <div className="min-h-screen pt-20 pb-16 bg-light-gray">
      <div className="container mx-auto px-4">
        {showMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="flex items-center justify-center mb-4">
                {paymentMessage?.includes("successful") ? (
                  <Check className="w-8 h-8 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
                )}
                <span className="text-xl font-medium">
                  {paymentMessage}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-primary">₹{bookingDetails?.bookingData?.totalFare}</p>
                <div className="flex items-start">
                  <AlertCircle size={18} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Please try again.Your booking will be confirmed only after successful payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!paymentStatus && (
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">Payment Methods</h3>
              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <Image src="/razorpay.png" alt="Razorpay" width={80} height={30} />
                <Image src="/visa.png" alt="Visa" width={50} height={30} />
                <Image src="/masterCard.png" alt="Mastercard" width={50} height={30} />
                <Image src="/rupay.png" alt="RuPay" width={50} height={30} />
                <Image src="/upiLogo.png" alt="UPI" width={50} height={30} />
              </div>
            </div>
            {bookingDetails && (
              <button className="btn-primary mt-6" onClick={handlePayment}>
                Pay ₹{bookingDetails?.bookingData.totalFare}
              </button>
            )}
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. A confirmation email has been sent to your email address.
            </p>
            <button 
              className="btn-primary w-full" 
              onClick={() => router.push('/')}
            >
              Go to Home
            </button>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              {paymentMessage || 'An error occurred during payment. Please try again.'}
            </p>
            <button 
              className="btn-primary w-full" 
              onClick={() => router.push('/')}
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
