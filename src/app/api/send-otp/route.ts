import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes    

    // Prepare email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="color: #212529;">Trip-C Travels - OTP Verification</h3>
        <p>Your OTP for verification is:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; padding: 15px; background-color: #f3f4f6; display: inline-block; border-radius: 4px; border: 1px dashed #9ca3af;">
          ${otp}
        </div>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">This is an automated message, please do not reply.</p>
      </div>
    `;

    // Send email using Mailjet API
    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.MAILJET_API_KEY?.trim()}:${process.env.MAILJET_SECRET_KEY?.trim()}`
        ).toString('base64')
      },
      body: JSON.stringify({
        Messages: [{
          From: {
            Email: 'tripcbooking05@gmail.com',
            Name: 'Trip-C Travels'
          },
          To: [{
            Email: email,
            Name: email.split('@')[0]
          }],
          Subject: 'Your OTP for Trip-C Travels',
          HTMLPart: emailContent,
          Headers: {
            'X-Priority': '1 (Highest)',
            'List-Unsubscribe': '<mailto:unsubscribe@tripc.com?subject=Unsubscribe>',
            'Precedence': 'bulk'
          },
          TextPart: `Your OTP for Trip-C Travels is: ${otp}. This OTP is valid for 5 minutes.`
        }]
      })
    });

    if (!mailjetResponse.ok) {
      const errorData = await mailjetResponse.json().catch(() => ({}));
      console.error('Mailjet API Error:', {
        status: mailjetResponse.status,
        statusText: mailjetResponse.statusText,
        error: errorData
      });
      return NextResponse.json(
        { message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully',
      otp
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
