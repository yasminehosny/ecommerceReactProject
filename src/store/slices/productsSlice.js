import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProductsAPI, getCategoriesAPI } from "../../services/api";

// ===== THUNKS =====
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (filters, { rejectWithValue }) => {
    try {
      const data = await getProductsAPI(filters);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCategoriesAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== SLICE =====
const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    categories: [],
    filters: {
      category: "",
      minPrice: "",
      maxPrice: "",
      size: "",
    },
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    totalPages: 1,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: "", minPrice: "", maxPrice: "", size: "" };
    },
  },
  extraReducers: (builder) => {
    // PRODUCTS
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || action.payload;
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // CATEGORIES
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
