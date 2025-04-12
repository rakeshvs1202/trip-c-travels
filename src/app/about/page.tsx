import Image from "next/image"
import { Check } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-heading">About Trip-C</h1>
            <p className="text-xl">
              Your premier travel solution provider based in Bangalore, delivering exceptional car rental services with
              comfort, reliability, and customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Our Story</h2>
              <p className="mb-6 text-gray-700">
                Welcome to Trip-C, your premier travel solution provider based in Bangalore! Formerly known as Ambika
                Tours and Travels, we have been serving avid travelers like you for several years, creating
                unforgettable journeys and cherished memories.
              </p>
              <p className="mb-6 text-gray-700">
                At Trip-C, we understand that every traveler is unique, with different preferences and expectations.
                That's why we offer a wide range of solutions tailored to meet your specific needs. Whether you're
                looking for convenient office cab services, captivating intra-city travel packages, or exciting
                outstation adventures, we've got you covered.
              </p>
              <p className="mb-6 text-gray-700">
                One of our key strengths lies in our extensive fleet of vehicles. With a diverse range of options
                available, including sedans, SUVs, mini-vans, and busses, we ensure that you can travel in comfort and
                style, no matter the size of your group or the destination you choose.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary rounded-full opacity-20"></div>
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/about-image.jpg"
                  alt="Trip-C Services"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-16 bg-light-gray">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-6">
                At Trip-C, our mission is to provide safe, reliable, and comfortable transportation services that exceed
                customer expectations. We strive to make every journey memorable by delivering exceptional service,
                maintaining a well-kept fleet, and employing professional drivers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Ensuring customer satisfaction through reliable service</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Maintaining a diverse and well-maintained fleet</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Providing professional and courteous drivers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-700 mb-6">
                We aspire to be the leading car rental service in Bangalore, recognized for our commitment to
                excellence, innovation, and customer-centric approach. We aim to expand our services while maintaining
                the highest standards of quality and reliability.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Becoming the preferred choice for car rentals in Bangalore</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Continuously improving our services through innovation</span>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Expanding our reach while maintaining service quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Team</h2>
            <p className="section-subtitle mx-auto">
              Meet the dedicated professionals behind Trip-C who work tirelessly to ensure you have a seamless and
              enjoyable travel experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-light-gray rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64">
                <Image src="/team/ceo.jpg" alt="CEO" fill className="object-cover" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-1">Rajesh Kumar</h3>
                <p className="text-primary mb-4">CEO & Founder</p>
                <p className="text-gray-600">
                  With over 15 years of experience in the travel industry, Rajesh leads Trip-C with a vision to provide
                  exceptional travel services.
                </p>
              </div>
            </div>

            <div className="bg-light-gray rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64">
                <Image src="/team/operations.jpg" alt="Operations Manager" fill className="object-cover" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-1">Priya Sharma</h3>
                <p className="text-primary mb-4">Operations Manager</p>
                <p className="text-gray-600">
                  Priya ensures smooth day-to-day operations, coordinating with drivers and customers to provide a
                  seamless service experience.
                </p>
              </div>
            </div>

            <div className="bg-light-gray rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64">
                <Image src="/team/customer-service.jpg" alt="Customer Service Manager" fill className="object-cover" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-1">Amit Patel</h3>
                <p className="text-primary mb-4">Customer Service Manager</p>
                <p className="text-gray-600">
                  Amit leads our customer service team, ensuring that every customer query is addressed promptly and
                  effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Clients */}
      <section className="py-16 bg-light-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Clients</h2>
            <p className="section-subtitle mx-auto">
              We're proud to serve a diverse range of clients, from individuals to corporate organizations. Here are
              some of the companies that trust Trip-C for their travel needs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
              <div className="flex justify-center">
                <Image src="/clients/logic.png" alt="Logic" width={120} height={60} className="h-12 w-auto" />
              </div>
              <div className="flex justify-center">
                <Image src="/clients/igus.png" alt="Igus" width={120} height={60} className="h-12 w-auto" />
              </div>
              <div className="flex justify-center">
                <Image src="/clients/graphene.png" alt="Graphene" width={120} height={60} className="h-12 w-auto" />
              </div>
              <div className="flex justify-center">
                <Image src="/clients/goodyear.png" alt="Goodyear" width={120} height={60} className="h-12 w-auto" />
              </div>
              <div className="flex justify-center">
                <Image src="/clients/gbl.png" alt="GBL" width={120} height={60} className="h-12 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
