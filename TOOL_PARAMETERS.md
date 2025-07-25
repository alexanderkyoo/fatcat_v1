# Tool Parameters for Hume EVI Configuration

This document provides the technical tool definitions that should be configured in your Hume EVI setup to enable the ordering system.

## Tool Definitions

### 1. get_menu

**Description:** Retrieves menu information with optional filtering by category and allergies

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
    },
    "excludeAllergies": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Optional: Array of allergies to exclude from results. Common allergies include: meat, dairy, gluten, eggs, nuts, shellfish, soy, vegan (excludes all animal products)"
    }
  },
  "required": []
}
```

**Example Calls:**
- `{}` - Get full menu
- `{"category": "appetizers"}` - Get appetizers only
- `{"itemName": "buffalo wings"}` - Search for specific item
- `{"excludeAllergies": ["meat", "dairy"]}` - Get menu excluding items with meat or dairy
- `{"category": "mains", "excludeAllergies": ["gluten"]}` - Get main courses without gluten
- `{"excludeAllergies": ["vegan"]}` - Get menu excluding vegan items (shows only items with animal products)

### 2. get_cart

**Description:** Retrieves current cart contents and totals, or clears the cart

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "description": "Optional: Set to 'clear' to clear the cart instead of getting cart contents"
    }
  },
  "required": []
}
```

**Example Calls:**
- `{}` - Get cart contents
- `{"action": "clear"}` - Clear the cart

### 3. add_to_cart

**Description:** Adds a menu item to the customer's cart

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

**Example Calls:**
- `{"itemId": "wings", "quantity": 1}` - Add 1 buffalo wings
- `{"itemId": "burger", "quantity": 2}` - Add 2 burgers

### 4. remove_from_cart

**Description:** Removes an item from the customer's cart

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

**Example Calls:**
- `{"itemId": "wings", "quantity": 1}` - Remove 1 buffalo wings
- `{"itemName": "buffalo wings"}` - Remove buffalo wings by name

## Environment Variables Required

```
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id
```
