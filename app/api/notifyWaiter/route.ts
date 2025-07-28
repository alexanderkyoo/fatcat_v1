import { NextResponse } from "next/server";
import twilio from 'twilio';

export async function POST(request: Request) {
  console.log("\n📱 ========== NOTIFY WAITER TOOL CALLED ==========");
  console.log("⏰ Timestamp:", new Date().toLocaleTimeString());
  
  const { parameters } = await request.json();
  console.log("📦 Raw parameters:", parameters);

  try {
    // Parse parameters properly - handle both JSON string and object formats
    let args: {
      message?: string;
      urgency?: 'low' | 'medium' | 'high';
      customerInfo?: string;
    };

    // If parameters is a string (from voice interface), parse it
    if (typeof parameters === 'string') {
      console.log("🔍 Parameters is a string, parsing JSON");
      args = JSON.parse(parameters);
    } else {
      console.log("🔍 Parameters is an object, using directly");
      args = parameters;
    }

    console.log("✅ Parsed arguments:", args);

    // Validate required environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const toNumber = process.env.DEMO_TO_NUMBER;

    if (!accountSid || !authToken || !messagingServiceSid || !toNumber) {
      console.log("❌ Missing Twilio configuration");
      return NextResponse.json({
        success: false,
        error: {
          error: "Twilio configuration missing",
          code: "twilio_config_error",
          level: "error" as const,
          content: "Twilio credentials are not properly configured. Please check environment variables."
        }
      });
    }

    // Default message if none provided
    const message = args.message || "Customer needs assistance at their table.";
    const urgency = args.urgency || 'medium';
    const customerInfo = args.customerInfo || '';

    // Create urgency prefix
    let urgencyPrefix = '';
    switch (urgency) {
      case 'high':
        urgencyPrefix = '🚨 URGENT: ';
        break;
      case 'medium':
        urgencyPrefix = '⚠️ ';
        break;
      case 'low':
        urgencyPrefix = 'ℹ️ ';
        break;
    }

    // Construct the full message
    let fullMessage = `${urgencyPrefix}${message}`;
    if (customerInfo) {
      fullMessage += `\n\nCustomer Info: ${customerInfo}`;
    }
    fullMessage += `\n\nTime: ${new Date().toLocaleTimeString()}`;

    console.log("📱 Sending SMS with message:", fullMessage);

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send SMS
    const messageResponse = await client.messages.create({
      body: fullMessage,
      messagingServiceSid: messagingServiceSid,
      to: toNumber
    });

    console.log("✅ SMS sent successfully:", messageResponse.sid);

    const response = `Waiter has been notified via SMS. Message sent with ${urgency} priority.`;
    
    console.log("💬 Response to LLM:", response);
    console.log("📱 ========== NOTIFY WAITER COMPLETE ==========\n");
    
    return NextResponse.json({ 
      success: true, 
      data: response,
      messageSid: messageResponse.sid,
      urgency: urgency
    });

  } catch (error) {
    console.error("Error in notifyWaiter API route:", error);
    
    // Handle specific Twilio errors
    let errorMessage = "Failed to notify waiter";
    let errorCode = "notification_error";
    
    if (error instanceof Error) {
      if (error.message.includes('phone number')) {
        errorMessage = "Invalid phone number configuration";
        errorCode = "invalid_phone_number";
      } else if (error.message.includes('credentials')) {
        errorMessage = "Invalid Twilio credentials";
        errorCode = "invalid_credentials";
      } else if (error.message.includes('messaging service')) {
        errorMessage = "Invalid messaging service configuration";
        errorCode = "invalid_messaging_service";
      }
    }
    
    return NextResponse.json({
      success: false,
      error: {
        error: errorMessage,
        code: errorCode,
        level: "error" as const,
        content: "Unable to send notification to waiter. Please try again or call for assistance."
      }
    });
  }
}
