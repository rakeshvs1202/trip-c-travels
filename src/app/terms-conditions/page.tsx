import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Trip C Travels',
  description: 'Read our terms and conditions for using Trip C Travels services.'
};

export default function TermsAndConditions() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Terms and Conditions</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>By using our services, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, you must not use our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
          <p>Trip C Travels provides airport transfer and local transportation services. All bookings are subject to vehicle availability and confirmation.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Booking and Payment</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full payment is required at the time of booking confirmation</li>
            <li>We accept various payment methods including credit/debit cards and digital wallets</li>
            <li>All prices are inclusive of applicable taxes unless stated otherwise</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cancellation Policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cancellations made 24 hours before the scheduled pickup time will receive a full refund</li>
            <li>No-shows or cancellations within 4 hours of pickup time will be charged 100% of the fare</li>
            <li>Refunds will be processed within 5-7 business days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Changes to Booking</h2>
          <p>Changes to booking details (pickup time, location, etc.) are subject to availability and may incur additional charges. Please contact our customer support for assistance.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Liability</h2>
          <p>Trip C Travels is not liable for any delays or failures in performance caused by circumstances beyond our reasonable control, including but not limited to weather conditions, traffic, or mechanical failures.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p>For any questions or concerns regarding these terms and conditions, please contact us at:</p>
          <p className="mt-2">Email: tripcbooking05@gmail.com<br />
          Phone: +91 97400 04166</p>
        </section>
      </div>
    </main>
  );
}
