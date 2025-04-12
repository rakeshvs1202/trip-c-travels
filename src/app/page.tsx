"use client"

import BookingSection from "@/components/BookingSection"
import ServicesSection from "@/components/ServicesSection"
import AboutSection from "@/components/AboutSection"
import ClientsSection from "@/components/ClientsSection"

export default function Home() {
  return (
    <main className="min-h-screen">
      <BookingSection />
      <section id="services">
        <ServicesSection />
      </section>
      <section id="about">
        <AboutSection />
      </section>
      <section id="clients">
        <ClientsSection />
      </section>
    </main>
  )
}
