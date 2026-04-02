import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const payload = action.payload;
      const qty = payload.quantity && payload.quantity > 0 ? payload.quantity : 1;
      const existingItem = state.items.find(item => item.id === payload.product.id);

      // Do not add if product stock is zero
      if (typeof payload.product.stock === 'number' && payload.product.stock <= 0) return;

      if (existingItem) {
        const newQty = existingItem.quantity + qty;
        // cap at available stock if available
        if (typeof existingItem.stock === 'number' && existingItem.stock > 0) {
          existingItem.quantity = Math.min(newQty, existingItem.stock);
        } else {
          existingItem.quantity = newQty;
        }
      } else {
        const toAdd = { ...payload.product, quantity: Math.min(qty, (typeof payload.product.stock === 'number' && payload.product.stock > 0) ? payload.product.stock : qty) } as CartItem;
        state.items.push(toAdd);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        if (typeof item.stock === 'number' && item.stock > 0) {
          item.quantity = Math.min(action.payload.quantity, item.stock);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
