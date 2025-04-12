import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, MapPin, Phone, Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Trip-C Logo"
                width={120}
                height={40}
                className=""
              />
            </Link>
            <p className="text-gray-400">
              Your trusted travel partner for comfortable and reliable cab services across India.
              We provide premium intercity and local car rental services with expert chauffeurs.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#FF3131] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#FF3131] transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Roundtrip Cabs
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Oneway Drops
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Local Rentals
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Airport Transfers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="text-[#FF3131] flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-400">
                  #157, 1st floor, Keerthi Complex,<br />
                  BEML layout, ITPL main road,<br />
                  Bangalore - 560 066
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-[#FF3131] flex-shrink-0" size={18} />
                <div className="text-gray-400">
                  <a href="tel:+919740004166" className="hover:text-white transition-colors block">
                    +91 97400 04166
                  </a>
                  <a href="tel:+919743773535" className="hover:text-white transition-colors block">
                    +91 97437 73535
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-[#FF3131] flex-shrink-0" size={18} />
                <a href="mailto:Tripcbooking05@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  Tripcbooking05@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-4">
              <li className="text-gray-400">
                <span className="font-medium block mb-1">Monday - Friday:</span>
                <time className="block">9:00 AM - 8:00 PM</time>
              </li>
              <li className="text-gray-400">
                <span className="font-medium block mb-1">Saturday - Sunday:</span>
                <time className="block">10:00 AM - 6:00 PM</time>
              </li>
              <li className="text-gray-400 pt-2">
                <span className="font-medium text-[#FF3131]">24/7 Support Available</span>
                <p className="text-sm mt-1">For emergency bookings and assistance</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex items-center">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Trip-C. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 