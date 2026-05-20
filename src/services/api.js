const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ===== AUTH =====
export const loginAPI = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

// ===== CART =====
export const getCartAPI = async () => {
  const res = await fetch(`${BASE_URL}/cart?_=${Date.now()}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch cart");
  return data;
};

export const addToCartAPI = async (productId, quantity = 1) => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add to cart");
  return data;
};

export const updateCartItemAPI = async (productId, quantity) => {
  const res = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update cart");
  return data;
};

export const removeFromCartAPI = async (productId) => {
  const res = await fetch(`${BASE_URL}/cart/${productId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to remove from cart");
  return data;
};

// ===== ORDERS =====
export const createOrderAPI = async (orderData) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create order");
  return data;
};
