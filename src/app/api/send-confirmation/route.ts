import { NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// Constant WhatsApp recipient number (add country code without + or 00)
const CONSTANT_WHATSAPP_RECIPIENT = '919740004166'; // Replace with the actual number

export async function POST(request: Request) {
  try {
    const bookingDetails = await request.json();
    const address = bookingDetails.pickupLocation;

    const emailContent = `
      <h3>Booking Confirmation - Trip-C</h3>
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


    // Prepare WhatsApp message if phone number is available
    let whatsappResponse = null;
    const whatsappEndpoint = 'https://xkzw6g.api.infobip.com/whatsapp/1/message/template';
    
    // Array to store all recipient numbers
    const recipients = [];
    
    // Add booking user's number if available
    if (bookingDetails.contactInfo?.phone) {
      const phoneNumber = `91${String(bookingDetails.contactInfo.phone).replace(/^\+?91?/, '')}`;
      recipients.push(phoneNumber);
    }
    
    // Add constant recipient
    recipients.push(CONSTANT_WHATSAPP_RECIPIENT);
    
    // Send message to all recipients
    for (const phoneNumber of recipients) {
      try {

        const whatsappPayload = {
          messages: [
            {
              from: '15558038254',
              to: phoneNumber,
              content: {
                templateName: 'booking_confirmation_tripc', // match template name registered on Infobip
                templateData: {
                  body: {
                    placeholders: [
                        bookingDetails.contactInfo.name || 'Customer',                  // {{1}}
                        bookingDetails.bookingId,                                       // {{2}}
                        bookingDetails.pickupLocation || 'N/A',                         // {{3}}
                        bookingDetails?.tripType === 'OUTSTATION' ? 'To:' : 'Trip Type:', // {{4}}
                        bookingDetails?.tripType === 'OUTSTATION' 
                          ? bookingDetails.bookingData.destination || 'N/A' 
                          : bookingDetails.bookingData.tripType || 'N/A',               // {{5}}
                        new Date(bookingDetails.pickupDate).toLocaleString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }),                                                             // {{6}}
                        bookingDetails.selectedCar?.name || 'N/A',                      // {{7}}
                       `₹ ${bookingDetails.bookingData.totalFare}`   // {{8}}
                    ]
                  }
                },
                language: 'en'
              }
            }
          ]
        };

        const whatsappRequestOptions = {
          method: 'POST',
          headers: {
            'Authorization': `App ${process.env.NEXT_PUBLIC_INFOBIP_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(whatsappPayload)
        };

        
        whatsappResponse = await fetch(whatsappEndpoint, whatsappRequestOptions);
        const whatsappResult = await whatsappResponse.json();
  
        if (!whatsappResponse.ok) {
          throw new Error(`WhatsApp API error for ${phoneNumber}: ${whatsappResponse.status} - ${JSON.stringify(whatsappResult)}`);
        }
        
        
      } catch (whatsappError) {
        console.error(`Error sending WhatsApp message to ${phoneNumber}:`, {
          error: whatsappError instanceof Error ? whatsappError.message : 'Unknown error',
          nodeEnv: process.env.NODE_ENV,
          senderNumber: '15558038254',
          apiKeyConfigured: !!process.env.NEXT_PUBLIC_INFOBIP_API_KEY
        });
        // Continue with the flow even if WhatsApp message fails
      }
    }

    const mailjetPayload = {
      Messages: [{
        From: {
          Email: 'booking@trip-c.com',
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


// Check if API credentials are present
if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  console.warn('⚠️ Missing Mailjet API credentials in environment variables.');
}

const encodedAuth = Buffer.from(
  `${process.env.MAILJET_API_KEY?.trim()}:${process.env.MAILJET_SECRET_KEY?.trim()}`
).toString('base64');


const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + encodedAuth
  },
  body: JSON.stringify(mailjetPayload)
});

const data = await mailjetResponse.json();

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
          { 
            status: 401,
            headers: corsHeaders
          }
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
      whatsappSent: !!bookingDetails.contactInfo.phone,
      whatsappStatus: whatsappResponse?.status
    };

    return NextResponse.json(response, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error in send-confirmation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Allow': 'POST, OPTIONS'
    }
  });
}
