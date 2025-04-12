import Image from "next/image"

export default function ClientsSection() {
  const clients = [
    { name: "Logic", logo: "/logicLogo.jpg" },
    { name: "Igus", logo: "/igusLogo.jpg" },
    { name: "Graphene", logo: "/grapheneLogo.jpg" },
    { name: "Goodyear", logo: "/goodyearLogo.jpg" },
    { name: "GBL", logo: "/gblLogo.jpg" }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Clients</h2>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {clients.map((client, index) => (
              <div 
                key={index} 
                className="relative h-24 w-full flex items-center justify-center p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg"
              >
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={150}
                  height={80}
                  className="object-contain max-h-full max-w-full"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
          <p className="text-gray-600 mb-8">
            We will be highly delightful to listen from you!<br />
            For business queries, collaborations, and corporate travel solutions
          </p>
          
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-2">Address</h4>
              <p className="text-gray-600">
                #157, 1st floor, Keerthi Complex, BEML layout, ITPL main road<br />
                Bangalore - 560 066
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <p className="text-gray-600">
                Email: Tripcbooking05@gmail.com<br />
                Website: www.tripc.in<br />
                Phone: +91 97400 04166 | 97437 73535
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
} 