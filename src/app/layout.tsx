import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Providers } from "@/app/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Trip-C - Premium Car Rental & Cab Services in Bangalore | One Way, Round Trip & Airport Transfers",
    template: "%s | Trip-C - Your Trusted Travel Partner"
  },
  description:
    "Book reliable and affordable cab services in Bangalore and across India. Best rates for one-way, round trip, local, and airport transfers. 24/7 customer support and safe rides.",
  keywords: [
    "car rental Bangalore",
    "cab services Bangalore",
    "airport taxi Bangalore",
    "one way cab",
    "outstation cab",
    "local car rental",
    "best cab service in Bangalore",
    "car hire near me",
    "trip planner India",
    "intercity cab service"
  ],
  authors: [{ name: "Trip-C Travels" }],
  icons: {
    icon: '/favicon.ico',
  },
  creator: "Trip-C Travels",
  publisher: "Trip-C Travels",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: "Trip-C - Premium Car Rental & Cab Services in Bangalore",
    description: "Book reliable and affordable cab services in Bangalore and across India. Best rates for one-way, round trip, local, and airport transfers.",
    siteName: 'Trip-C Travels',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Trip-C - Your Trusted Travel Partner',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
