import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCartAPI, addToCartAPI, updateCartItemAPI, removeFromCartAPI } from "../../services/api";

// ===== THUNKS =====
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCartAPI();
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await addToCartAPI(productId, quantity);
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateItemQty = createAsyncThunk(
  "cart/updateQty",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await updateCartItemAPI(productId, quantity);
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const data = await removeFromCartAPI(productId);
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== SLICE =====
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH CART
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ADD ITEM
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE QTY
      .addCase(updateItemQty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemQty.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(updateItemQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REMOVE ITEM
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
