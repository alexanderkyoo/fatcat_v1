import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("\n❌ ========== REMOVE FROM CART TOOL CALLED ==========");
  console.log("⏰ Timestamp:", new Date().toLocaleTimeString());
  
  const { parameters } = await request.json();
  console.log("📦 Raw parameters:", parameters);

  try {
    const args = JSON.parse(parameters) as {
      name: string;
      quantity?: number;
    };

    console.log("✅ Parsed arguments:", {
      name: args.name,
      quantity: args.quantity || 1,
    });

    // Validate the parameters
    if (!args.name) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters. Required: name (string)" },
        { status: 400 }
      );
    }

    const quantity = args.quantity || 1;

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity must be positive" },
        { status: 400 }
      );
    }

    // Return success response
    const response = `Removed ${quantity} ${args.name}${quantity > 1 ? 's' : ''} from your cart`;
    
    console.log("💬 Response to LLM:", response);
    console.log("❌ ========== REMOVE FROM CART COMPLETE ==========\n");
    
    return NextResponse.json({ 
      success: true, 
      data: response,
      item: { name: args.name, quantity }
    });
  } catch (error) {
    console.error("Error in removeFromCart API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
