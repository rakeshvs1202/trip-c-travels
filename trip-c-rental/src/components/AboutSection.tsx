import Image from "next/image"

export default function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">ABOUT US</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px]">
            <Image
              src="/info.png"
              alt="About Trip-C"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">India's Largest Intercity and Local Cab Services</h3>
            
            <p className="text-gray-600">
              We are Trip-C Car Rentals, an online cab booking aggregator, providing customers with reliable and premium 
              intercity and Local car rental services. Over the last decade, we are uniquely placed as the largest chauffeur 
              driven car rental company in India in terms of geographical reach.
            </p>
            
            <p className="text-gray-600">
              To us, a road trip is one of the most exhilarating ways to travel the length and breadth of India. There's 
              always something to look at, something to explore and to experience. Because we love travelling by road so much, 
              we've been striving to make sure you have a great experience too.
            </p>
            
            <p className="text-gray-600">
              We love that you're free to stop to breathe in clean air, learn about cultures and taste local food when you 
              travel by cabs. We love that these wholesome experiences make travelling better and enrich our lives. We live 
              for the surprises we find on road trips.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF3131] mb-2">2000+</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF3131] mb-2">15L+</div>
                <div className="text-sm text-gray-600">Routes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF3131] mb-2">10K+</div>
                <div className="text-sm text-gray-600">Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF3131] mb-2">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
