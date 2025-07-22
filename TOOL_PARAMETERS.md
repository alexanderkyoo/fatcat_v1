# Tool Parameters for LLM Configuration

This document provides the tool parameters that should be configured in your Hume EVI configuration to enable the cart functionality.

## Tool Definitions

### 1. Add to Cart Tool

**Tool Name:** `add_to_cart`

**Description:** Adds a menu item directly to the customer's cart. 

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "itemId": {
      "type": "string",
      "description": "The ID of the menu item (get from get_menu tool)"
    },
    "quantity": {
      "type": "number",
      "description": "The quantity of items to add (default: 1)"
    }
  },
  "required": ["itemId"]
}
```

**Example Usage:**
- Customer wants buffalo wings: `{"itemId": "wings", "quantity": 1}`
- Customer wants 2 burgers: `{"itemId": "burger", "quantity": 2}`
- Customer wants nachos: `{"itemId": "nachos"}`

### 3. Remove from Cart Tool

**Tool Name:** `remove_from_cart`

**Description:** Removes an item from the customer's cart using menu validation.

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "itemId": {
      "type": "string",
      "description": "The ID of the menu item to remove (preferred)"
    },
    "itemName": {
      "type": "string",
      "description": "The name of the menu item to remove (alternative to itemId)"
    },
    "quantity": {
      "type": "number",
      "description": "The quantity to remove (optional, defaults to 1)"
    }
  },
  "required": []
}
```

**Example Usage:**
- "Remove the buffalo wings from my cart"
- "Take out 1 burger from my order"

### 3. Get Menu Tool

**Tool Name:** `get_menu`

**Description:** Retrieves menu information from FatCat Bistro. Can get all menu items, items by category, or search for specific items.

**Parameters Schema:**
```json
{
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
```

**Example Usage:**
- "What's on the menu?" (returns full menu)
- "Show me the appetizers" (returns appetizers category)
- "Do you have buffalo wings?" (searches for specific item)
- "What desserts do you have?" (returns desserts category)

### 4. Get Current Weather Tool (Already Configured)

**Tool Name:** `get_current_weather`

**Description:** Gets the current weather for a specified location.

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "location": {
      "type": "string",
      "description": "The city and state, e.g. San Francisco, CA"
    },
    "format": {
      "type": "string",
      "enum": ["celsius", "fahrenheit"],
      "description": "The temperature unit to use"
    }
  },
  "required": ["location", "format"]
}
```

## Sample Menu Items for Testing

Here are some sample menu items the LLM can use when customers ask to add items:

### Appetizers
- **Awesome Blossom Petals** - $8.99 - "Crispy onion petals with ranch dipping sauce"
- **Mozzarella Sticks** - $7.49 - "Six golden fried mozzarella sticks with marinara sauce"
- **Buffalo Chicken Dip** - $9.99 - "Creamy buffalo chicken dip with tortilla chips"

### Burgers
- **Oldtimer Burger** - $12.99 - "Classic burger with lettuce, tomato, onion, and pickles"
- **Big Mouth Burger** - $14.99 - "Double patty burger with bacon and cheese"
- **Mushroom Swiss Burger** - $13.49 - "Burger topped with sautéed mushrooms and Swiss cheese"

### Chicken
- **Chicken Crispers** - $11.99 - "Hand-battered chicken tenders with honey mustard"
- **Buffalo Chicken Sandwich** - $10.99 - "Crispy chicken breast with buffalo sauce"
- **Grilled Chicken Salad** - $9.99 - "Fresh greens with grilled chicken breast"

### Sides
- **Awesome Fries** - $3.49 - "Seasoned french fries"
- **Onion Rings** - $4.99 - "Beer-battered onion rings"
- **Side Salad** - $3.99 - "Mixed greens with choice of dressing"

### Beverages
- **Soft Drink** - $2.99 - "Coca-Cola, Sprite, or other fountain drinks"
- **Iced Tea** - $2.49 - "Fresh brewed sweet or unsweet tea"
- **Coffee** - $2.29 - "Fresh brewed coffee"

## LLM Instructions

The LLM should be instructed to:

1. **Use the get_menu tool** to retrieve current menu information instead of relying on hardcoded items
2. **Proactively suggest menu items** when customers express interest in ordering
3. **Search for specific items** when customers ask about availability using the get_menu tool
4. **Show category options** when customers ask "what do you have" or similar questions
5. **Use exact prices and descriptions** from the menu.json file via the get_menu tool
6. **Confirm orders** by reading back what was added to the cart
7. **Handle modifications** by removing and re-adding items with new specifications
8. **Provide helpful descriptions** when adding items to enhance the customer experience

### Menu Tool Usage Guidelines

- **When customer asks "What's on the menu?"** → Use `get_menu` with no parameters to get full menu
- **When customer asks "What appetizers do you have?"** → Use `get_menu` with `{"category": "appetizers"}`
- **When customer asks "Do you have buffalo wings?"** → Use `get_menu` with `{"itemName": "buffalo wings"}`
- **When customer asks about a category** → Use `get_menu` with the appropriate category parameter
- **Always use the exact item names, prices, and descriptions** returned by the get_menu tool when adding items to cart

## Example Conversation Flow

**Customer:** "What's on the menu?"

**Assistant:** *Uses get_menu tool with no parameters*

**Assistant:** "Welcome to FatCat Bistro! We serve delicious comfort food with a modern twist. We have 8 items across 4 categories: appetizers, main courses, desserts, beverages. Our appetizers include Buffalo Wings, Loaded Nachos, and Mozzarella Sticks. For main courses, we have the FatCat Burger, Creamy Alfredo Pasta, and Ribeye Steak. What sounds good to you?"

**Customer:** "I'll take the buffalo wings"

**Assistant:** *Uses add_to_cart tool*
- Call: `{"itemId": "wings", "quantity": 1}`

**Assistant:** "Perfect! I've added Buffalo Wings for $12.99 to your cart. Would you like anything else?"

## Environment Variables Required

Make sure these environment variables are set:

```
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
GEOCODING_API_KEY=your_geocoding_api_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id
```

The cart functionality will automatically show when a call is active and will be cleared when the call ends.
