import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateItemQty, removeItemFromCart } from "../store/slices/cartSlice";

export default function Cart({ onNavigate }) {
  const dispatch = useDispatch();
  const { items, totalAmount, loading, error } = useSelector((state) => state.cart);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    dispatch(fetchCart());
    
  }, [dispatch]);

  const handleQtyChange = (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty >= 1) {
      dispatch(updateItemQty({ productId, quantity: newQty }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeItemFromCart(productId));
  };

  const handleOrderSingle = (item) => {
    // Navigate to order page directly with this product context or just place the order
    // Since the order page automatically pulls from the Cart collection in the backend, 
    // we can temporarily clear everything else from the cart in backend or just let them checkout.
    // For direct ease, they can checkout the whole cart. But we will add a specific button that states "Checkout this item" or "Order Now".
    console.log(item.product);
    onNavigate("order");
  };

  const getImageUrl = (img) => {
    if (!img || img === "default-product.jpg") return "https://via.placeholder.com/100x100?text=No+Image";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const clean = img.startsWith("/") ? img.slice(1) : img;
    if (clean.startsWith("uploads/")) return `${API_BASE}/${clean}`;
    return `${API_BASE}/uploads/${clean}`;
  };

  return (
    <div className="cart-page-wrapper" style={{ 
      minHeight: "100vh", 
      background: "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(201, 169, 110, 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(201, 169, 110, 0.05) 0%, transparent 60%), var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)"
    }}>

      <div className="container py-5">
        <h2 className="mb-4 fw-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "2.2rem" }}>
          Shopping Cart 🛒
        </h2>

        {loading && items.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your cart items...</p>
          </div>
        ) : error ? (
          <div className="alert border-0 text-center" style={{ backgroundColor: "rgba(224, 86, 86, 0.12)", color: "var(--danger)" }}>
            ⚠️ {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 p-5 shadow" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px" }}>
            <p className="fs-1 mb-3">🛒</p>
            <h3 className="mb-3">Your cart is currently empty</h3>
            <p className="text-muted mb-4">Add products to your cart (e.g. using Postman) to get started!</p>
            <button className="btn fw-semibold px-4 py-2" onClick={() => window.history.back()} style={{ backgroundColor: "var(--accent)", color: "#0f0e11", borderRadius: "var(--radius-sm)" }}>
              Back 🔙
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Side: Cart Items */}
            <div className="col-lg-8">
              <div className="p-4 shadow" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px" }}>
                {items.map((item) => {
                  const imageUrl = getImageUrl(item.product.images?.[0] || item.product.image);
                  return (
                    <div key={item.product._id} className="row align-items-center mb-4 pb-4 g-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      {/* Product Image */}
                      <div className="col-md-2 col-4">
                        <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "14px", overflow: "hidden", backgroundColor: "var(--bg-elevated)" }}>
                          <img 
                            src={imageUrl} 
                            alt={item.product.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="col-md-4 col-8">
                        <h4 className="fw-semibold mb-1" style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>
                          {item.product.name}
                        </h4>
                        <p className="mb-0 text-muted small">{item.product.category?.name || "Product"}</p>
                        <h5 className="mt-2 fw-bold" style={{ color: "var(--accent)", fontSize: "1.05rem" }}>
                          {item.price} EGP
                        </h5>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-md-3 col-6 d-flex align-items-center justify-content-md-center">
                        <div className="d-flex align-items-center bg-dark p-1 rounded-3" style={{ border: "1px solid var(--border-subtle)" }}>
                          <button 
                            className="btn btn-sm text-white px-2 py-1"
                            onClick={() => handleQtyChange(item.product._id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="mx-3 fw-bold" style={{ fontSize: "1rem", minWidth: "20px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button 
                            className="btn btn-sm text-white px-2 py-1"
                            onClick={() => handleQtyChange(item.product._id, item.quantity, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Action */}
                      <div className="col-md-3 col-6 text-end">
                        <div className="d-flex flex-column gap-2 justify-content-end align-items-end">
                          <button 
                            className="btn btn-sm text-danger border-0 bg-transparent p-0 mt-1 d-flex align-items-center gap-1"
                            onClick={() => handleRemove(item.product._id)}
                            style={{ fontSize: "0.85rem" }}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Global Order Now button under the items list */}
                <div className="mt-3 d-flex justify-content-center">
                  <button 
                    className="btn fw-semibold"
                    onClick={() => onNavigate("order")}
                    style={{ 
                      backgroundColor: "var(--accent)", 
                      color: "#0f0e11", 
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.95rem",
                      border: "none",
                      width: "220px",
                      padding: "10px 18px"
                    }}
                  >
                    ⚡ Order Now
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Total Summary */}
            <div className="col-lg-4">
              <div className="p-4 shadow" style={{ 
                backgroundColor: "var(--bg-card)", 
                border: "1px solid var(--border)", 
                borderRadius: "24px",
                position: "sticky",
                top: "90px"
              }}>
                <h3 className="mb-4 fw-bold" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                  Summary
                </h3>
                <div className="d-flex justify-content-between mb-3" style={{ color: "var(--text-secondary)" }}>
                  <span>Subtotal</span>
                  <span>{totalAmount} EGP</span>
                </div>
                <div className="d-flex justify-content-between mb-4 pb-3" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span>Shipping</span>
                  <span className="text-success fw-semibold">Free</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-5 fw-bold">Total Price</span>
                  <span className="fs-4 fw-bold" style={{ color: "var(--accent)" }}>{totalAmount} EGP</span>
                </div>
                <button 
                  className="btn w-100 fw-bold py-3 shadow"
                  onClick={() => onNavigate("order")}
                  style={{ 
                    backgroundColor: "var(--accent)", 
                    color: "#0f0e11", 
                    borderRadius: "var(--radius-sm)",
                    fontSize: "1.1rem",
                    border: "none"
                  }}
                >
                  Proceed to Checkout ⚡
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
