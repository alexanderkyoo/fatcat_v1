import fs from 'fs';
import path from 'path';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
}

export interface Cart {
  items: CartItem[];
  lastUpdated: string | null;
  sessionId: string | null;
}

const CART_FILE_PATH = path.join(process.cwd(), 'data', 'cart.json');

// In-memory cart storage for production (serverless environments)
let memoryCart: Cart = { items: [], lastUpdated: null, sessionId: null };

// Check if we're in a read-only environment (like Vercel)
function isReadOnlyEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.VERCEL === '1';
}

// Utility to read cart from file or memory
export function readCart(): Cart {
  try {
    // Use in-memory storage in read-only environments (Vercel)
    if (isReadOnlyEnvironment()) {
      return memoryCart;
    }
    
    // Use file storage in development
    if (!fs.existsSync(CART_FILE_PATH)) {
      return { items: [], lastUpdated: null, sessionId: null };
    }
    const cartData = fs.readFileSync(CART_FILE_PATH, 'utf8');
    return JSON.parse(cartData);
  } catch (error) {
    console.error('Error reading cart:', error);
    return { items: [], lastUpdated: null, sessionId: null };
  }
}

// Utility to write cart to file or memory
export function writeCart(cart: Cart): void {
  try {
    cart.lastUpdated = new Date().toISOString();
    
    // Use in-memory storage in read-only environments (Vercel)
    if (isReadOnlyEnvironment()) {
      memoryCart = { ...cart };
      console.log('Cart updated in memory (production mode)');
      return;
    }
    
    // Use file storage in development
    fs.writeFileSync(CART_FILE_PATH, JSON.stringify(cart, null, 2));
  } catch (error) {
    console.error('Error writing cart:', error);
  }
}

// Find item in cart by menuItemId
export function findCartItem(cart: Cart, menuItemId: string): CartItem | undefined {
  return cart.items.find(item => item.menuItemId === menuItemId);
}

// Add item to cart
export function addToCart(menuItemId: string, name: string, price: number, quantity: number, description?: string, _selectedOptions?: Record<string, string | string[]>, category?: string): CartItem {
  const cart = readCart();
  
  // Check if item already exists
  const existingItem = findCartItem(cart, menuItemId);
  
  if (existingItem) {
    // Update quantity of existing item
    existingItem.quantity += quantity;
    writeCart(cart);
    return existingItem;
  } else {
    // Add new item
    const newItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      menuItemId,
      name,
      price,
      quantity,
      description,
      category
    };
    
    cart.items.push(newItem);
    writeCart(cart);
    return newItem;
  }
}

// Remove item from cart
export function removeFromCart(itemId?: string, menuItemId?: string, quantity?: number): boolean {
  const cart = readCart();
  
  let itemIndex = -1;
  
  if (itemId) {
    itemIndex = cart.items.findIndex(item => item.id === itemId);
  } else if (menuItemId) {
    itemIndex = cart.items.findIndex(item => item.menuItemId === menuItemId);
  }
  
  if (itemIndex === -1) return false;
  
  const item = cart.items[itemIndex];
  
  if (quantity && quantity < item.quantity) {
    // Reduce quantity
    item.quantity -= quantity;
  } else {
    // Remove item completely
    cart.items.splice(itemIndex, 1);
  }
  
  writeCart(cart);
  return true;
}

// Update item quantity
export function updateCartItemQuantity(itemId: string, quantity: number): boolean {
  const cart = readCart();
  const item = cart.items.find(item => item.id === itemId);
  
  if (!item) return false;
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.items = cart.items.filter(item => item.id !== itemId);
  } else {
    item.quantity = quantity;
  }
  
  writeCart(cart);
  return true;
}

// Clear cart
export function clearCart(): void {
  const cart: Cart = {
    items: [],
    lastUpdated: new Date().toISOString(),
    sessionId: null
  };
  writeCart(cart);
}

// Calculate total price
export function calculateTotal(cart: Cart): number {
  return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate total items
export function calculateTotalItems(cart: Cart): number {
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}
