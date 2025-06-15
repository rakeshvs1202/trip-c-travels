import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Trip C Travels',
  description: 'Learn about our cancellation and refund policies for Trip C Travels services.'
};

export default function CancellationRefund() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Cancellation & Refund Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Cancellation by Customer</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">For Airport Transfers:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>More than 24 hours before pickup: Full refund</li>
              <li>Between 4-24 hours before pickup: 50% of the total fare</li>
              <li>Less than 4 hours before pickup or no-show: No refund</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">For Local Rides:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>More than 2 hours before pickup: Full refund</li>
              <li>Less than 2 hours before pickup or no-show: No refund</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Cancellation by Trip C Travels</h2>
          <p>We reserve the right to cancel any booking under the following circumstances:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Vehicle breakdown or unavailability</li>
            <li>Unforeseen circumstances (natural disasters, political unrest, etc.)</li>
            <li>Safety concerns</li>
            <li>Suspected fraudulent activity</li>
          </ul>
          <p className="mt-2">In such cases, we will provide a full refund or offer alternative arrangements at our discretion.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Refund Process</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Refunds will be processed within 5-7 business days from the date of cancellation</li>
            <li>Refunds will be credited to the original payment method used during booking</li>
            <li>Processing times may vary depending on your bank or payment provider</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. No-Show Policy</h2>
          <p>If you fail to show up at the designated pickup location within 30 minutes of the scheduled time, it will be considered a no-show, and no refund will be provided.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Changes to Booking</h2>
          <p>Changes to your booking (date, time, or vehicle type) are subject to availability and may result in additional charges. Please contact our customer support at least 4 hours before your scheduled pickup for any changes.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p>For any questions or assistance regarding cancellations or refunds, please contact our customer support team:</p>
          <p className="mt-2">Email: tripcbooking05@gmail.com<br />
          Phone: +91 97400 04166<br />
          Operating Hours: 24/7</p>
        </section>
      </div>
    </main>
  );
}
