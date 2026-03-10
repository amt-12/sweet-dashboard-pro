import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import productReducer from './slices/productSlice.ts';
import orderReducer from './slices/orderSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
