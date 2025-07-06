import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(request: Request) {
  try {
    console.log('Verify OTP request received');
    
    // Connect to database first
    try {
      await dbConnect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, otp, customerData, storedOtp } = body;

    // Validate input
    if (!email || !otp) {
      console.error('Missing required fields:', { email: !!email, otp: !!otp });
      return NextResponse.json(
        { 
          success: false,
          message: 'Email and OTP are required' 
        },
        { status: 400 }
      );
    }

    if (!storedOtp) {
      console.error('Missing storedOtp in request');
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid request: Missing stored OTP' 
        },
        { status: 400 }
      );
    }

    if (otp !== storedOtp) {
      console.error('OTP mismatch', { receivedOtp: otp, storedOtp });
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid or expired OTP. Please request a new one.' 
        },
        { status: 400 }
      );
    }

    // Prepare customer data for response
    const customerResponse = {
      name: customerData?.name,
      email: email,
      phone: customerData?.phone,
      isVerified: true
    };

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      existingCustomer.name = customerData?.name;
      existingCustomer.phone = customerData?.phone;
      existingCustomer.isVerified = true;

      await existingCustomer.save();
    } else {
      const customer = new Customer({
        name: customerData?.name,
        email: email,
        phone: customerData?.phone,
        isVerified: true
      });

      await customer.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      customer: customerResponse
    });

  } catch (error) {
    console.error('Error in verify-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', { errorMessage, stack: error instanceof Error ? error.stack : 'No stack trace' });
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
