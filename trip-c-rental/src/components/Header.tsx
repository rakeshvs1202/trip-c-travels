"use client"

import Link from "next/link"
import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Trip-C Logo"
              width={120}
              height={40}
              className=""
            />
          </Link>

          <Link
            href="tel:+919740004166"
            className="bg-[#FF3131] text-white px-4 py-2 rounded-md font-medium hover:bg-[#E02020] transition-colors"
          >
            Call Now
          </Link>
        </div>
      </div>
    </header>
  )
}
