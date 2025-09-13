import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import nodemailer from 'nodemailer'
// import { email } from "zod";


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '2525'),
    secure: false,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    }
});


export async function POST(req: NextRequest) {
    try {
        const bookingData = await req.json()
        const {data: booking, error} = await supabaseAdmin.from('bookings').insert([bookingData]).select(`*, products (*)`).single();

        if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    };

    try {
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: bookingData.customer_email,
            subject: 'Booking Confirmation',
             html: `
          <h1>Booking Confirmed!</h1>
          <p>Dear ${bookingData.customer_name},</p>
          <p>Your booking for ${booking.products?.name} on ${new Date(bookingData.booking_date).toLocaleString()} has been confirmed.</p>
          <p>We'll contact you shortly to schedule the Zoom meeting.</p>
        `,
        })
    } catch (err) {
        console.error("email Sending failed", err)
    }

    return NextResponse.json(booking, {status: 201})
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}




