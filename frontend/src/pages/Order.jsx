import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, resetOrderState } from "../store/slices/orderSlice";
import { getCartAPI } from "../services/api";

export default function Order({ onNavigate }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.order);

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    phone: "",
    date: "",
    period: "",
  });

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCartAPI();
        setCart(data.cart);
      } catch (err) {
        console.error("Failed to load cart", err);
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();

    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct payload according to Backend Schema
    const payload = {
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        phone: formData.phone,
        country: "Egypt", 
      },
      deliverySlot: {
        date: formData.date,
        period: formData.period, 
      }
    };
    
    dispatch(createOrder(payload));
  };

  return (
    <div className="order-page-wrapper" style={{ 
      minHeight: "100vh", 
      background: "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(201, 169, 110, 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(201, 169, 110, 0.05) 0%, transparent 60%), var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)"
    }}>
      
      <div className="container py-5">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            className="btn btn-sm d-inline-flex align-items-center gap-2" 
            onClick={() => onNavigate("cart")}
            style={{ 
              backgroundColor: "transparent", 
              border: "1px solid var(--border)", 
              color: "var(--accent)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              transition: "var(--transition)",
              fontWeight: "600"
            }}
          >
            ← Back to Cart
          </button>
        </div>

        <div className="row justify-content-center g-5">
          {/* Left Side: Order Form */}
          <div className="col-lg-7">
            <div className="shadow-lg p-4 p-md-5" style={{ 
              backgroundColor: "var(--bg-card)", 
              border: "1px solid var(--border)", 
              borderRadius: "24px",
              boxShadow: "var(--shadow)"
            }}>
              
              <h2 className="mb-2 fw-bold" style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--text-primary)",
                fontSize: "2rem"
              }}>
                Place Your Order
              </h2>
              <p className="mb-5" style={{ color: "var(--text-secondary)" }}>
                Fill in your shipping and delivery details to complete your order.
              </p>
              
              {success ? (
                <div className="alert text-center border-0 p-4" style={{ 
                  backgroundColor: "rgba(91, 191, 142, 0.15)", 
                  color: "var(--success)",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <h4 className="fw-bold mb-3">✅ Order Placed Successfully!</h4>
                  <p className="mb-4 text-white-50">Your order has been recorded in the system.</p>
                  <button className="btn fw-bold w-100 py-3" onClick={() => onNavigate("cart")} style={{ 
                    backgroundColor: "var(--accent)", 
                    color: "#0f0e11",
                    borderRadius: "var(--radius-sm)",
                    transition: "var(--transition)"
                  }}>
                    Back to Cart
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="needs-validation">
                  {error && (
                    <div className="alert border-0 text-center mb-4" style={{ 
                      backgroundColor: "rgba(224, 86, 86, 0.12)", 
                      color: "var(--danger)",
                      borderRadius: "var(--radius-sm)" 
                    }}>
                      ⚠️ {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-uppercase" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
                      Street Address
                    </label>
                    <textarea
                      name="street"
                      className="form-control shadow-none"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      rows="3"
                      placeholder="e.g. 123 Main St, Apartment 4B"
                      style={{ 
                        backgroundColor: "var(--bg-elevated)", 
                        color: "var(--text-primary)", 
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)"
                      }}
                    />
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6 mb-4 mb-md-0">
                      <label className="form-label fw-semibold small text-uppercase" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="form-control shadow-none"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Cairo"
                        style={{ 
                          backgroundColor: "var(--bg-elevated)", 
                          color: "var(--text-primary)", 
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "13px 16px"
                        }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-uppercase" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control shadow-none"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 01xxxxxxxxx"
                        style={{ 
                          backgroundColor: "var(--bg-elevated)", 
                          color: "var(--text-primary)", 
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "13px 16px"
                        }}
                      />
                    </div>
                  </div>

                  <div className="row mb-5">
                    <div className="col-md-6 mb-4 mb-md-0">
                      <label className="form-label fw-semibold small text-uppercase" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        className="form-control shadow-none"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={{ 
                          backgroundColor: "var(--bg-elevated)", 
                          color: "var(--text-primary)", 
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "13px 16px"
                        }}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-uppercase" style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
                        Delivery Period
                      </label>
                      <select 
                        name="period" 
                        className="form-select shadow-none" 
                        value={formData.period} 
                        onChange={handleChange}
                        required
                        style={{ 
                          backgroundColor: "var(--bg-elevated)", 
                          color: "var(--text-primary)", 
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "13px 16px"
                        }}
                      >
                        <option value="" style={{ background: "var(--bg-elevated)" }}>Select a time period...</option>
                        <option value="morning" style={{ background: "var(--bg-elevated)" }}>Morning (9 AM - 12 PM)</option>
                        <option value="afternoon" style={{ background: "var(--bg-elevated)" }}>Afternoon (12 PM - 5 PM)</option>
                        <option value="evening" style={{ background: "var(--bg-elevated)" }}>Evening (5 PM - 9 PM)</option>
                        <option value="night" style={{ background: "var(--bg-elevated)" }}>Night (9 PM - 12 AM)</option>
                      </select>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn w-100 fw-semibold py-3 shadow-sm btn-submit" disabled={loading || !cart || cart.items.length === 0} style={{ 
                    backgroundColor: "var(--accent)", 
                    color: "#0f0e11", 
                    borderRadius: "var(--radius-sm)", 
                    fontSize: "1.05rem",
                    transition: "var(--transition)",
                    border: "none"
                  }}>
                    {loading ? "Placing Order..." : "Submit Order"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="col-lg-5">
            <div className="shadow-lg p-4" style={{ 
              backgroundColor: "var(--bg-card)", 
              border: "1px solid var(--border)", 
              borderRadius: "24px",
              boxShadow: "var(--shadow)",
              position: "sticky",
              top: "90px"
            }}>
              <h3 className="mb-4 fw-bold" style={{ 
                fontFamily: "var(--font-display)", 
                color: "var(--accent)",
                fontSize: "1.5rem"
              }}>
                Order Summary
              </h3>

              {cartLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading your cart items...</p>
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="text-center py-5">
                  <p className="fs-3 mb-2">🛒</p>
                  <p className="text-muted mb-0">Your cart is empty.</p>
                  <p className="small text-warning mt-2">Please add items to your cart using Postman to preview the order.</p>
                </div>
              ) : (
                <>
                  <div className="cart-items-list mb-4" style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "10px" }}>
                    {cart.items.map((item) => {
                      console.log("Order Page Product Item:", item.product); // Log to help inspect the actual data structure in browser console
                      const getImageUrl = (img) => {
                        if (!img || img === "default-product.jpg") return "https://via.placeholder.com/100x100?text=No+Image";
                        if (img.startsWith("http://") || img.startsWith("https://")) return img;
                        const clean = img.startsWith("/") ? img.slice(1) : img;
                        if (clean.startsWith("uploads/")) return `${API_BASE}/${clean}`;
                        return `${API_BASE}/uploads/${clean}`;
                      };
                      const imageUrl = getImageUrl(item.product.images?.[0] || item.product.image);
                      return (
                        <div key={item.product._id} className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <div style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", backgroundColor: "var(--bg-elevated)", flexShrink: 0 }}>
                            <img 
                              src={imageUrl} 
                              alt={item.product.name} 
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            />
                          </div>
                          <div className="ms-3 flex-grow-1">
                            <h5 className="mb-1 fw-semibold" style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{item.product.name}</h5>
                            <p className="mb-0 small" style={{ color: "var(--text-secondary)" }}>
                              {item.quantity} x {item.price} EGP
                            </p>
                          </div>
                          <div className="text-end fw-semibold" style={{ color: "var(--accent)" }}>
                            {item.price * item.quantity} EGP
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: "2px solid var(--border)" }}>
                    <span className="fs-5 fw-bold" style={{ color: "var(--text-primary)" }}>Total Price</span>
                    <span className="fs-4 fw-bold" style={{ color: "var(--accent)" }}>
                      {cart.totalAmount} EGP
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
