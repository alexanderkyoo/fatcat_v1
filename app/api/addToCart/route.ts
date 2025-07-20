import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("\n🛒 ========== ADD TO CART TOOL CALLED ==========");
  console.log("⏰ Timestamp:", new Date().toLocaleTimeString());
  
  const { parameters } = await request.json();
  console.log("📦 Raw parameters:", parameters);

  try {
    const args = JSON.parse(parameters) as {
      name: string;
      price: number;
      quantity: number;
      description?: string;
    };

    console.log("✅ Parsed arguments:", {
      name: args.name,
      price: `$${args.price}`,
      quantity: args.quantity,
      description: args.description || "No description"
    });

    // Validate the parameters
    if (!args.name || typeof args.price !== 'number' || typeof args.quantity !== 'number') {
      return NextResponse.json(
        { success: false, error: "Invalid parameters. Required: name (string), price (number), quantity (number)" },
        { status: 400 }
      );
    }

    if (args.price < 0 || args.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be non-negative and quantity must be positive" },
        { status: 400 }
      );
    }

    // Return success response with the item details
    const response = `Added ${args.quantity} ${args.name}${args.quantity > 1 ? 's' : ''} to your cart for $${(args.price * args.quantity).toFixed(2)}`;
    
    console.log("💬 Response to LLM:", response);
    console.log("🛒 ========== ADD TO CART COMPLETE ==========\n");
    
    return NextResponse.json({ 
      success: true, 
      data: response,
      item: args
    });
  } catch (error) {
    console.error("Error in addToCart API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
