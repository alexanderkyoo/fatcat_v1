import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { parameters } = await request.json();
    
    // Read the menu data from the JSON file
    const menuPath = path.join(process.cwd(), 'data', 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    // If a specific category is requested, filter by category
    if (parameters?.category) {
      const category = parameters.category.toLowerCase();
      const categoryData = menuData.categories.find((cat: any) => 
        cat.id.toLowerCase() === category || cat.name.toLowerCase() === category
      );
      
      if (categoryData) {
        return NextResponse.json({
          success: true,
          data: {
            category: categoryData.name,
            items: categoryData.items,
            message: `Here are the ${categoryData.name} items available at FatCat Bistro`
          }
        });
      } else {
        return NextResponse.json({
          success: true,
          data: {
            message: `Sorry, I couldn't find that category. Our available categories are: ${menuData.categories.map((cat: any) => cat.name).join(', ')}`
          }
        });
      }
    }
    
    // If a specific item is requested, find it
    if (parameters?.itemName) {
      const itemName = parameters.itemName.toLowerCase();
      let foundItem = null;
      let foundCategory = null;
      
      // Search through all categories
      for (const category of menuData.categories) {
        const item = category.items.find((item: any) => 
          item.name.toLowerCase().includes(itemName) || 
          itemName.includes(item.name.toLowerCase())
        );
        if (item) {
          foundItem = item;
          foundCategory = category.name;
          break;
        }
      }
      
      if (foundItem) {
        return NextResponse.json({
          success: true,
          data: {
            item: foundItem,
            category: foundCategory,
            message: `Found ${foundItem.name} in our ${foundCategory} section. ${foundItem.description} - $${foundItem.price}`
          }
        });
      } else {
        return NextResponse.json({
          success: true,
          data: {
            message: `Sorry, I couldn't find "${parameters.itemName}" on our menu. Let me tell you about our available categories: ${menuData.categories.map((cat: any) => cat.name).join(', ')}`
          }
        });
      }
    }
    
    // Return all menu data with summary
    const summary = {
      restaurantName: menuData.restaurant.name,
      description: menuData.restaurant.description,
      categories: menuData.categories.map((cat: any) => cat.name),
      totalItems: menuData.categories.reduce((total: number, cat: any) => total + cat.items.length, 0)
    };
    
    return NextResponse.json({
      success: true,
      data: {
        summary,
        fullMenu: menuData,
        message: `Welcome to ${summary.restaurantName}! ${summary.description} We have ${summary.totalItems} items across ${summary.categories.length} categories: ${summary.categories.join(', ')}`
      }
    });
    
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        error: "Menu retrieval failed",
        code: "menu_error",
        level: "error" as const,
        content: "Unable to retrieve menu information"
      }
    });
  }
}
