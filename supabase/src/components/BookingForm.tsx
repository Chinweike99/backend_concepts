'use client';

import { Product } from "@/index";
import React, { useState } from "react";


interface BookingFormProps {
    product?: Product;
    onSuccess: () => void;
}


export default function BookingForm({product, onSuccess}: BookingFormProps) {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        booking_date: '',
        notes: ''
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    product_id: product?.id,
                    booking_date: new Date(formData.booking_date).toDateString(),
                })
        });

        if(response.ok){
            onSuccess?.()
            setFormData ({
                customer_name: '',
                customer_email: '',
                booking_date: '',
                notes: ''
            })
            alert('Booking successful!');
        }else{
            throw new Error('Booking failed');
        }

        }catch (error) {
            console.error('Error creating booking:', error)
            alert('Failed to create booking. Please try again.')
            } finally {
            setSubmitting(false)
            }
        }

        return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          required
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.customer_email}
          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Preferred Date & Time</label>
        <input
          type="datetime-local"
          required
          value={formData.booking_date}
          onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-green-300 text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50"
      >
        {submitting ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  )


    }

    

