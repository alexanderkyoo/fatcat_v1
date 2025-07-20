# Tool Parameters for LLM Configuration

This document provides the tool parameters that should be configured in your Hume EVI configuration to enable the cart functionality.

## Tool Definitions

### 1. Add to Cart Tool

**Tool Name:** `add_to_cart`

**Description:** Adds an item to the customer's cart with specified quantity and price.

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the menu item to add to cart"
    },
    "price": {
      "type": "number",
      "description": "The price of the item in USD (e.g., 12.99)"
    },
    "quantity": {
      "type": "number",
      "description": "The quantity of items to add (default: 1)"
    },
    "description": {
      "type": "string",
      "description": "Optional description or customization details for the item"
    }
  },
  "required": ["name", "price", "quantity"]
}
```

**Example Usage:**
- "Add 2 burgers to my cart for $12.99 each"
- "I'll take the chicken sandwich for $9.99"
- "Add a large fries with no salt for $3.49"

### 2. Remove from Cart Tool

**Tool Name:** `remove_from_cart`

**Description:** Removes an item or reduces quantity of an item from the customer's cart.

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the menu item to remove from cart"
    },
    "quantity": {
      "type": "number",
      "description": "The quantity to remove (optional, defaults to 1)"
    }
  },
  "required": ["name"]
}
```

**Example Usage:**
- "Remove the burger from my cart"
- "Take out 1 fries from my order"
- "Remove all the chicken sandwiches"

### 3. Get Current Weather Tool (Already Configured)

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

1. **Proactively suggest menu items** when customers express interest in ordering
2. **Use realistic prices** from the sample menu or similar restaurant pricing
3. **Confirm orders** by reading back what was added to the cart
4. **Handle modifications** by removing and re-adding items with new specifications
5. **Provide helpful descriptions** when adding items to enhance the customer experience

## Example Conversation Flow

**Customer:** "I'd like to order some food"

**Assistant:** "Great! I'd be happy to help you order. We have delicious burgers, chicken dishes, appetizers, and more. What sounds good to you today?"

**Customer:** "I'll take a burger and fries"

**Assistant:** *Uses add_to_cart tool twice*
- First call: `{"name": "Oldtimer Burger", "price": 12.99, "quantity": 1, "description": "Classic burger with lettuce, tomato, onion, and pickles"}`
- Second call: `{"name": "Awesome Fries", "price": 3.49, "quantity": 1, "description": "Seasoned french fries"}`

**Assistant:** "Perfect! I've added an Oldtimer Burger for $12.99 and Awesome Fries for $3.49 to your cart. Your current total is $16.48. Would you like anything else?"

## Environment Variables Required

Make sure these environment variables are set:

```
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
GEOCODING_API_KEY=your_geocoding_api_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id
```

The cart functionality will automatically show when a call is active and will be cleared when the call ends.
