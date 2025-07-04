import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';


// Connect to MongoDB
await dbConnect();

export async function POST(request: Request) {
  try {
    const { email, otp, customerData ,storedOtp} = await request.json();

    // Validate input
    if (!email || !otp) {
      console.error('Missing email or OTP');
      return NextResponse.json(
        { 
          success: false,
          message: 'Email and OTP are required' 
        },
        { status: 400 }
      );
    }

    
    
    if (otp !== storedOtp) {
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
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
