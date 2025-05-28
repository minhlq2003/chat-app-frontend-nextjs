import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "CHAT APP <no-reply@chatapp.com>",
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Optionally: Save OTP to Redis or DB with expiration
    return NextResponse.json({ message: "OTP sent", otp }); // In thực tế không nên trả OTP về client
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to send email", error: err },
      { status: 500 }
    );
  }
}
