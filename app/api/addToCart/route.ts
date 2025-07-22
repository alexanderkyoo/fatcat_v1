import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { addToCart, readCart } from '@/utils/cartManager';

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
  console.log("\n🛒 ========== ADD TO CART TOOL CALLED ==========");
  console.log("⏰ Timestamp:", new Date().toLocaleTimeString());
  
  const { parameters } = await request.json();
  console.log("📦 Raw parameters:", parameters);

  try {
    // Parse parameters properly - handle both JSON string and object formats
    let args: {
      itemId?: string;
      name?: string;
      price?: number;
      quantity?: number;
      description?: string;
      customizations?: string;
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
    console.log("🔍 Checking itemId:", args.itemId);
    console.log("🔍 itemId type:", typeof args.itemId);

    // If using old format (name, price, description), convert to new format
    if (args.name && args.price !== undefined && !args.itemId) {
      console.log("🔄 Converting old format to new format");
      console.log("🔍 Old format detected - name:", args.name, "price:", args.price);
      
      // Try to find the menu item by name
      const menuPath = path.join(process.cwd(), 'data', 'menu.json');
      const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
      
      let foundItem = null;
      let foundCategory = null;

      for (const category of menuData.categories) {
        const item = category.items.find((item: any) => 
          item.name.toLowerCase() === args.name!.toLowerCase() ||
          item.name.toLowerCase().includes(args.name!.toLowerCase()) ||
          args.name!.toLowerCase().includes(item.name.toLowerCase())
        );
        if (item) {
          foundItem = item;
          foundCategory = category.name;
          break;
        }
      }

      if (foundItem) {
        // Use the found menu item
        const quantity = args.quantity || 1;
        const cartItem = addToCart(
          foundItem.id,
          foundItem.name,
          args.price,
          quantity,
          args.description || foundItem.description,
          {},
          foundCategory
        );

        const response = `Added ${quantity} ${foundItem.name}${quantity > 1 ? 's' : ''} to your cart for $${(args.price * quantity).toFixed(2)}`;
        
        console.log("💬 Response to LLM:", response);
        console.log("🛒 Cart item added:", cartItem);
        printCartContents();
        console.log("🛒 ========== ADD TO CART COMPLETE ==========\n");
        
        return NextResponse.json({ 
          success: true, 
          data: response,
          item: cartItem
        });
      } else {
        // Create a generic item if not found in menu
        const quantity = args.quantity || 1;
        const cartItem = addToCart(
          `generic_${Date.now()}`,
          args.name,
          args.price,
          quantity,
          args.description || args.name,
          {},
          "Other"
        );

        const response = `Added ${quantity} ${args.name}${quantity > 1 ? 's' : ''} to your cart for $${(args.price * quantity).toFixed(2)}`;
        
        console.log("💬 Response to LLM:", response);
        console.log("🛒 Cart item added:", cartItem);
        printCartContents();
        console.log("🛒 ========== ADD TO CART COMPLETE ==========\n");
        
        return NextResponse.json({ 
          success: true, 
          data: response,
          item: cartItem
        });
      }
    }

    // Continue with new format (itemId)
    console.log("🔍 Continuing with new format (itemId)");
    if (!args.itemId) {
      console.log("❌ Missing itemId, returning error");
      return NextResponse.json({
        success: false,
        error: {
          error: "Missing item identifier",
          code: "missing_item_id",
          level: "error" as const,
          content: "Please provide either itemId (new format) or name+price (old format)."
        }
      });
    }

    console.log("✅ itemId found, reading menu data");
    // Read menu data for validation
    const menuPath = path.join(process.cwd(), 'data', 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    console.log("✅ Menu data loaded");

    // Find the item in the menu
    let foundItem = null;
    let foundCategory = null;

    for (const category of menuData.categories) {
      const item = category.items.find((item: any) => item.id === args.itemId);
      if (item) {
        foundItem = item;
        foundCategory = category.name;
        break;
      }
    }

    if (!foundItem) {
      return NextResponse.json({
        success: false,
        error: {
          error: "Item not found",
          code: "item_not_found",
          level: "error" as const,
          content: `Item with ID "${args.itemId}" not found in menu. Please use get_menu tool to find valid items.`
        }
      });
    }

    const quantity = args.quantity || 1;
    const totalPrice = foundItem.price;

    // Create description
    let description = foundItem.description;
    if (args.customizations) {
      description += ` - ${args.customizations}`;
    }

    // Add to centralized cart data structure
    const cartItem = addToCart(
      foundItem.id,
      foundItem.name,
      totalPrice,
      quantity,
      description,
      {},
      foundCategory
    );

    const finalTotal = totalPrice * quantity;
    const response = `Added ${quantity} ${foundItem.name}${quantity > 1 ? 's' : ''} to your cart for $${finalTotal.toFixed(2)}`;
    
    console.log("💬 Response to LLM:", response);
    console.log("🛒 Cart item added:", cartItem);
    printCartContents();
    console.log("🛒 ========== ADD TO CART COMPLETE ==========\n");
    
    return NextResponse.json({ 
      success: true, 
      data: response,
      item: cartItem
    });

  } catch (error) {
    console.error("Error in addToCart API route:", error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Cart operation failed",
        code: "cart_error",
        level: "error" as const,
        content: "Failed to add item to cart"
      }
    });
  }
}
