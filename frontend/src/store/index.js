import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import orderReducer from "./slices/orderSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
    products: productsReducer,
    cart: cartReducer,
  },
});

export default store;
