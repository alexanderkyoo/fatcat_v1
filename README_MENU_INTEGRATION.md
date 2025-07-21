# Menu Integration with Hume EVI

This document explains how the menu system integrates with the Hume EVI voice interface.

## Overview

The application now includes a complete menu system that allows the Hume EVI to:
- Retrieve menu information dynamically from `data/menu.json`
- Search for specific menu items
- Browse menu categories
- Add items to cart with exact pricing and descriptions

## API Endpoints

### `/api/getMenu` - Menu Information Retrieval

**Purpose:** Allows the LLM to access current menu data

**Parameters:**
- `category` (optional): Filter by category ("appetizers", "main courses", "desserts", "beverages")
- `itemName` (optional): Search for specific item by name

**Example Requests:**

1. **Get Full Menu:**
```bash
curl -X POST http://localhost:3001/api/getMenu \
  -H "Content-Type: application/json" \
  -d '{"parameters": {}}'
```

2. **Get Category Items:**
```bash
curl -X POST http://localhost:3001/api/getMenu \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"category": "appetizers"}}'
```

3. **Search for Item:**
```bash
curl -X POST http://localhost:3001/api/getMenu \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"itemName": "buffalo wings"}}'
```

## Hume EVI Configuration

Add this tool to your Hume EVI configuration:

```json
{
  "name": "get_menu",
  "description": "Retrieves menu information from FatCat Bistro. Can get all menu items, items by category, or search for specific items.",
  "parameters": {
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "description": "Optional: Filter by menu category (appetizers, main courses, desserts, beverages)"
      },
      "itemName": {
        "type": "string", 
        "description": "Optional: Search for a specific menu item by name"
      }
    },
    "required": []
  }
}
```

## LLM Behavior

The LLM should:

1. **Use `get_menu` first** when customers ask about menu items
2. **Reference exact prices and descriptions** from the API response
3. **Use exact item names** when calling `add_to_cart`
4. **Provide helpful category suggestions** when items aren't found

## Example Conversation Flow

**Customer:** "What appetizers do you have?"

**LLM:** *Calls `get_menu` with `{"category": "appetizers"}`*

**LLM Response:** "We have several delicious appetizers! Buffalo Wings for $12.99 - crispy chicken wings tossed in our signature buffalo sauce, Loaded Nachos for $9.99 - crispy tortilla chips topped with cheese, jalapeños, and sour cream, and Mozzarella Sticks for $8.99 - golden fried mozzarella sticks served with marinara sauce. Which one sounds good to you?"

**Customer:** "I'll take the buffalo wings"

**LLM:** *Calls `add_to_cart` with exact data from menu API*

## Menu Data Structure

The menu is stored in `data/menu.json` with this structure:

```json
{
  "restaurant": {
    "name": "FatCat Bistro",
    "description": "Delicious comfort food with a modern twist"
  },
  "categories": [
    {
      "id": "appetizers",
      "name": "Appetizers", 
      "items": [
        {
          "id": "wings",
          "name": "Buffalo Wings",
          "description": "Crispy chicken wings tossed in our signature buffalo sauce",
          "price": 12.99,
          "options": [...]
        }
      ]
    }
  ]
}
```

## Testing the Integration

1. **Start the development server:**
```bash
cd fatcat_v1
npm run dev
```

2. **Test the menu API:**
```bash
# Get full menu
curl -X POST http://localhost:3001/api/getMenu -H "Content-Type: application/json" -d '{"parameters": {}}'

# Get appetizers
curl -X POST http://localhost:3001/api/getMenu -H "Content-Type: application/json" -d '{"parameters": {"category": "appetizers"}}'

# Search for item
curl -X POST http://localhost:3001/api/getMenu -H "Content-Type: application/json" -d '{"parameters": {"itemName": "burger"}}'
```

3. **Test the voice interface:**
   - Start a call in the application
   - Ask "What's on the menu?"
   - Ask "Do you have buffalo wings?"
   - Ask "What appetizers do you have?"

## Benefits

- **Dynamic menu updates:** Change `menu.json` and the LLM immediately has access to new items
- **Accurate pricing:** No hardcoded prices that can become outdated
- **Rich item details:** Full descriptions and customization options available
- **Consistent experience:** Menu interface and voice interface use the same data source

## Files Modified

- `app/api/getMenu/route.ts` - New API endpoint
- `components/ChatWithCart.tsx` - Added menu tool to tools configuration
- `TOOL_PARAMETERS.md` - Updated with menu tool configuration
- `data/menu.json` - Menu data source (already existed)

The menu system is now fully integrated and ready for voice-based ordering!
