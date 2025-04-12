import Link from "next/link"
import { ArrowRight, Car, RotateCw, MapPin, Plane } from "lucide-react"
import Image from "next/image"

export default function ServicesSection() {
  const services = [
    {
      title: "ROUNDTRIP CABS",
      description: "Our commitment to delivering a stress-free roundtrip experience will pamper you with absolutely comfortable travel from your doorstep to back. Our chauffeurs are not only courteous but are also expert travel companions that will make your road travel memorable.",
      image: "/roundTripImg.png",
      icon: <RotateCw className="w-6 h-6" />
    },
    {
      title: "ONEWAY DROPS",
      description: "Our network of over 15 lakh one way routes ensures that there is no corner of the country that you can't travel with us. Pay only one side charge at rock bottom rates. If you need to be somewhere, we'll get you there.",
      image: "/onewayTrip.png",
      icon: <Car className="w-6 h-6" />
    },
    {
      title: "LOCAL RENTALS",
      description: "Book our flexible, hourly rental cabs and chauffeur within the city for your business meetings or shopping chores. Our local rentals are available for 4, 8, hours or 12 hours, based on your needs. Explore your city like a local.",
      image: "/localCab.png",
      icon: <MapPin className="w-6 h-6" />
    },
    {
      title: "AIRPORT TRANSFERS",
      description: "We care about your flight departure and arrival pickups and drops with complete reliability. Book in advance and rest easy - we'll take care of the rest.",
      image: "/airportPickup.png",
      icon: <Plane className="w-6 h-6" />
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">OUR SERVICES</h2>
          <div className="w-24 h-1 bg-[#FF3131] mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#FF3131] flex items-center justify-center text-white">
                    {service.icon}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-12">WHY CHOOSE US</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              "Expert Chauffeurs",
              "Safety Certified",
              "Multiple Stops",
              "Flexible Packages",
              "Cab At Your Disposal",
              "Multiple Cars",
              "Reliability Guaranteed",
              "Lowest Fares",
              "All Inclusive Prices",
              "15 Lakh Routes",
              "Courteous Chauffeurs",
              "24/7 Support"
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 bg-white shadow-md rounded-full flex items-center justify-center mb-3 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF3131] group-hover:text-white">
                  <span className="text-[#FF3131] text-xl group-hover:text-white">✓</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
