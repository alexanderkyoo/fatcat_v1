import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { removeFromCart, readCart } from '@/utils/cartManager';

// Helper function to print cart contents
function printCartContents() {
  const cart = readCart();
  console.log("\n📋 ========== CURRENT CART CONTENTS ==========");
  if (cart.items.length === 0) {
    console.log("🛒 Cart is empty");
  } else {
    console.log(`🛒 Cart has ${cart.items.length} item(s):`);
    let total = 0;
    cart.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      Quantity: ${item.quantity}`);
      console.log(`      Price: $${item.price.toFixed(2)} each`);
      console.log(`      Subtotal: $${itemTotal.toFixed(2)}`);
      if (item.description) {
        console.log(`      Description: ${item.description}`);
      }
      console.log("");
    });
    console.log(`💰 TOTAL: $${total.toFixed(2)}`);
  }
  console.log("📋 ========================================\n");
}

export async function POST(request: Request) {
  console.log("\n❌ ========== REMOVE FROM CART TOOL CALLED ==========");
  console.log("⏰ Timestamp:", new Date().toLocaleTimeString());
  
  const { parameters } = await request.json();
  console.log("📦 Raw parameters:", parameters);

  try {
    const args = parameters as {
      itemId?: string;
      itemName?: string;
      quantity?: number;
    };

    console.log("✅ Parsed arguments:", args);

    // Validate that either itemId or itemName is provided
    if (!args.itemId && !args.itemName) {
      return NextResponse.json({
        success: false,
        error: {
          error: "Missing item identifier",
          code: "missing_item_id",
          level: "error" as const,
          content: "Please provide either itemId or itemName to remove from cart."
        }
      });
    }

    // Read current cart to find the item
    const cart = readCart();
    let cartItemToRemove = null;

    if (args.itemId) {
      // Try to find by cart item ID first
      cartItemToRemove = cart.items.find(item => item.id === args.itemId);
      
      // If not found, try by menu item ID
      if (!cartItemToRemove) {
        cartItemToRemove = cart.items.find(item => item.menuItemId === args.itemId);
      }
    } else if (args.itemName) {
      // Find by name
      cartItemToRemove = cart.items.find(item => 
        item.name.toLowerCase() === args.itemName!.toLowerCase() ||
        item.name.toLowerCase().includes(args.itemName!.toLowerCase()) ||
        args.itemName!.toLowerCase().includes(item.name.toLowerCase())
      );
    }

    if (!cartItemToRemove) {
      const identifier = args.itemId || args.itemName;
      return NextResponse.json({
        success: false,
        error: {
          error: "Item not found in cart",
          code: "item_not_found_in_cart",
          level: "error" as const,
          content: `Item "${identifier}" not found in cart.`
        }
      });
    }

    const quantity = args.quantity || 1;

    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: {
          error: "Invalid quantity",
          code: "invalid_quantity",
          level: "error" as const,
          content: "Quantity must be positive"
        }
      });
    }

    // Remove from centralized cart data structure
    const success = removeFromCart(cartItemToRemove.id, undefined, quantity);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: {
          error: "Failed to remove item",
          code: "remove_failed",
          level: "error" as const,
          content: "Failed to remove item from cart"
        }
      });
    }

    // Return success response
    const response = `Removed ${quantity} ${cartItemToRemove.name}${quantity > 1 ? 's' : ''} from your cart`;
    
    console.log("💬 Response to LLM:", response);
    console.log("🛒 Cart item removed:", cartItemToRemove.name);
    printCartContents();
    console.log("❌ ========== REMOVE FROM CART COMPLETE ==========\n");
    
    return NextResponse.json({ 
      success: true, 
      data: response,
      item: { 
        id: cartItemToRemove.menuItemId,
        name: cartItemToRemove.name, 
        quantity: quantity 
      }
    });

  } catch (error) {
    console.error("Error in removeFromCart API route:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Cart operation failed",
        code: "cart_error",
        level: "error" as const,
        content: "Failed to remove item from cart"
      }
    });
  }
}
