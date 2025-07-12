import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const bookingDetails = await request.json();
    const address = bookingDetails.pickupLocation;

    const emailContent = `
      <h2>Booking Confirmation - Trip-C</h2>
      <p>Dear ${bookingDetails.contactInfo.name || 'Valued Customer'},</p>
      <p>Your trip has been successfully confirmed with Trip-C.</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        <li><strong>From:</strong> ${address || 'N/A'}</li>
        <li><strong>${bookingDetails?.tripType === 'OUTSTATION' ? 'To:' : 'Trip Type:'}</strong> ${bookingDetails?.tripType === 'OUTSTATION' ? (bookingDetails.bookingData.destination || 'N/A') : (bookingDetails.bookingData.tripType || 'N/A')}</li>
        <li><strong>Booking Date:</strong> ${new Date(bookingDetails.pickupDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</li>
        <li><strong>Selected Car:</strong> ${bookingDetails.selectedCar?.name || 'N/A'}</li>
        <li><strong>Total Amount:</strong> ₹${bookingDetails.bookingData.totalFare}</li>
      </ul>
      <p>Thank you for choosing Trip-C for your travel needs. We wish you a safe and pleasant journey!</p>
      <p>For any assistance, please contact our customer support at +91 9740004166.</p>
    `;

    console.log('Sending email to:', bookingDetails.contactInfo.email);

    // Prepare SMS content
    const smsText = `Dear ${bookingDetails.contactInfo.name || 'Customer'}, your Trip-C booking #${bookingDetails.bookingId} is confirmed. ${bookingDetails.selectedCar?.name || 'Vehicle'} booked for ${new Date(bookingDetails.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}. Total Fare: ₹${bookingDetails.bookingData.totalFare}. Safe travels!`;
    
    // Send SMS if phone number is available
    let smsResponse = null;
    if (bookingDetails.contactInfo.phone) {
      const phoneNumber = `91${String(bookingDetails.contactInfo.phone).replace(/^\+?91?/, '')}`;
      const smsEndpoint = 'https://xkzw6g.api.infobip.com/sms/2/text/advanced';
      
      try {
        const smsPayload = {
          messages: [
            {
              destinations: [{ to: phoneNumber }],
              from: process.env.NEXT_PUBLIC_INFOBIP_SENDER_NUMBER,
              text: smsText
            }
          ]
        };

        const smsRequestOptions = {
          method: 'POST',
          headers: {
            'Authorization': `App ${process.env.NEXT_PUBLIC_INFOBIP_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(smsPayload)
        };

        console.log('Sending SMS to:', phoneNumber);
        console.log('SMS Payload:', JSON.stringify(smsPayload, null, 2));
        
        const startTime = Date.now();
        smsResponse = await fetch(smsEndpoint, smsRequestOptions);
        const responseTime = Date.now() - startTime;
        
        const smsResult = await smsResponse.json();
        
        if (!smsResponse.ok) {
          console.error('SMS API Error Response:', {
            status: smsResponse.status,
            statusText: smsResponse.statusText,
            responseTime: `${responseTime}ms`,
            url: smsEndpoint,
            requestId: smsResponse.headers.get('x-request-id'),
            errorDetails: smsResult
          });
          throw new Error(`SMS API responded with status ${smsResponse.status}: ${JSON.stringify(smsResult)}`);
        }
        
        console.log('SMS sent successfully:', {
          messageId: smsResult?.messages?.[0]?.messageId,
          status: smsResult?.messages?.[0]?.status?.groupName,
          responseTime: `${responseTime}ms`,
          destination: phoneNumber
        });
        
      } catch (error) {
        console.error('SMS Sending Failed:', {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error,
          phoneNumber,
          endpoint: smsEndpoint,
          requestDetails: {
            method: 'POST',
            headers: {
              'Authorization': 'App ***' + (process.env.NEXT_PUBLIC_INFOBIP_API_KEY?.slice(-4) || '')
            }
          },
          environment: {
            nodeEnv: process.env.NODE_ENV,
            senderNumber: process.env.NEXT_PUBLIC_INFOBIP_SENDER_NUMBER ? 'Configured' : 'Not Configured',
            apiKey: process.env.NEXT_PUBLIC_INFOBIP_API_KEY ? '***' + process.env.NEXT_PUBLIC_INFOBIP_API_KEY.slice(-4) : 'Not Found'
          }
        });
        // Continue with the flow even if SMS fails
      }
    }
    
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: 'tripcbooking05@gmail.com',
          Name: 'Trip-C Bookings'
        },
        To: [{
          Email: bookingDetails.contactInfo.email,
          Name: bookingDetails.contactInfo.name || 'Valued Customer'
        }],
        Cc: [{
          Email: 'tripcbooking05@gmail.com',
          Name: 'Trip-C Admin'
        }],
        Subject: `Booking Confirmation - ${bookingDetails.bookingId}`,
        HTMLPart: emailContent,
        Headers: {
          'X-Priority': '1 (Highest)',
          'List-Unsubscribe': '<mailto:unsubscribe@tripc.com?subject=Unsubscribe>',
          'Precedence': 'bulk'
        },
      }]
    };

    console.log('Mailjet Payload:', JSON.stringify(mailjetPayload, null, 2));

    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.MAILJET_API_KEY?.trim()}:${process.env.MAILJET_SECRET_KEY?.trim()}`
        ).toString('base64')
      },
      body: JSON.stringify(mailjetPayload)
    });

    const data = await mailjetResponse.json();
    console.log('Mailjet API Response Status:', mailjetResponse.status);
    console.log('Mailjet API Response Data:', JSON.stringify(data, null, 2));

    if (!mailjetResponse.ok) {
      console.error('Mailjet API error:', {
        status: mailjetResponse.status,
        statusText: mailjetResponse.statusText,
        data: data
      });
      
      // Check for common error cases
      if (mailjetResponse.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed', 
            message: 'Invalid Mailjet API Key or Secret',
            details: data 
          },
          { status: 401 }
        );
      }

      if (mailjetResponse.status === 400) {
        return NextResponse.json(
          { 
            error: 'Bad Request', 
            message: 'Invalid request parameters',
            details: data 
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to send confirmation email',
          status: mailjetResponse.status,
          details: data 
        },
        { status: mailjetResponse.status || 500 }
      );
    }

    const response = {
      message: 'Confirmation email sent successfully',
      smsSent: !!bookingDetails.contactInfo.phone,
      smsStatus: smsResponse?.status
    };

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(response, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in send-confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
