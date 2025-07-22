import { NextResponse } from "next/server";
import { readCart, calculateTotal, calculateTotalItems } from '@/utils/cartManager';

export async function GET() {
  try {
    const cart = readCart();
    const totalPrice = calculateTotal(cart);
    const totalItems = calculateTotalItems(cart);

    return NextResponse.json({
      success: true,
      data: {
        items: cart.items,
        totalPrice,
        totalItems,
        lastUpdated: cart.lastUpdated,
        sessionId: cart.sessionId
      }
    });
  } catch (error) {
    console.error("Error reading cart:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Failed to read cart",
        code: "cart_read_error",
        level: "error" as const,
        content: "Failed to retrieve cart data"
      }
    });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'clear') {
      const { clearCart } = await import('@/utils/cartManager');
      clearCart();
      
      return NextResponse.json({
        success: true,
        data: "Cart cleared successfully"
      });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        error: "Invalid action",
        code: "invalid_action",
        level: "error" as const,
        content: "Invalid cart action"
      }
    });
  } catch (error) {
    console.error("Error in cart operation:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Cart operation failed",
        code: "cart_operation_error",
        level: "error" as const,
        content: "Failed to perform cart operation"
      }
    });
  }
}
