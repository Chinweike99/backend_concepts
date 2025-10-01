import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";

const port = Number(process.env.EMAIL_SERVER_PORT || 465);
const secure = port === 465;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port,
  secure,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  logger: true,
  debug: true,
  // tls: { rejectUnauthorized: false } // uncomment only for debugging if TLS issues appear
});

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert([bookingData])
      .select("*, products(*)")
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Optional: verify SMTP connection (this will throw if auth/connection fails)
    try {
      await transporter.verify();
      console.log("SMTP connection verified ✅");
    } catch (verifyErr) {
      console.error("SMTP verify failed:", verifyErr);
      // continue — but you'll see the problem in logs
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    const productName = booking?.products?.name ?? "your product";
    const bookingDateStr = new Date(bookingData.booking_date).toLocaleString();

    const customerHtml = `
      <h1>Booking Confirmed</h1>
      <p>Hi ${bookingData.customer_name},</p>
      <p>Your booking for <strong>${productName}</strong> on <strong>${bookingDateStr}</strong> is received and pending confirmation.</p>
      <p>We will contact you soon with the Zoom meeting details.</p>
    `;

    const adminHtml = `
      <h1>New Booking Received</h1>
      <p><strong>Customer:</strong> ${bookingData.customer_name} (${bookingData.customer_email})</p>
      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>Booking date:</strong> ${bookingDateStr}</p>
      <p><strong>Notes:</strong> ${bookingData.notes || "—"}</p>
      <p>Booking ID: ${booking.id}</p>
    `;

    const adminMail = {
      from: process.env.FROM_EMAIL,
      to: adminEmail,
      subject: `New booking by ${bookingData.customer_name} — ${productName}`,
      html: adminHtml,
    };

    const customerMail = {
      from: process.env.FROM_EMAIL,
      to: bookingData.customer_email,
      subject: "Booking confirmation",
      html: customerHtml,
      replyTo: adminEmail
    };

    // Send both emails in parallel and collect results
    const results = await Promise.allSettled([
      transporter.sendMail(adminMail),
      transporter.sendMail(customerMail),
    ]);

    const mailResults = results.map((r) => {
      if (r.status === "fulfilled") {
        const info = r.value;
        return { status: "ok", messageId: info.messageId, response: info.response };
      } else {
        const err = r.reason;
        return { status: "failed", error: err?.message || String(err) };
      }
    });

    console.log("Mail results:", mailResults);

    // return booking plus mail status so you can inspect on frontend (optional)
    return NextResponse.json({ booking, mailResults }, { status: 201 });

  } catch (err) {
    console.error("Handler error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
