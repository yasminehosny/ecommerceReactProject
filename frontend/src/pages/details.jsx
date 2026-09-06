import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getProductAPI } from "../services/api";
import { addItemToCart } from "../store/slices/cartSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ProductDetails({ productId, onNavigate }) {
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductAPI(productId);
        setProduct(data.product);
      } catch (err) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItemToCart({ productId: product._id, quantity }));
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (img) => {
    if (!img || img === "default-product.jpg") {
      return "https://via.placeholder.com/600x500?text=No+Image";
    }
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const clean = img.startsWith("/") ? img.slice(1) : img;
    if (clean.startsWith("uploads/")) return `${API_BASE}/${clean}`;
    return `${API_BASE}/uploads/${clean}`;
  };

  const handleNextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setActiveImageIdx((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div className="details-page-wrapper d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <Navbar onNavigate={onNavigate} />
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-warning" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-muted fs-5">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="details-page-wrapper d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <Navbar onNavigate={onNavigate} />
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5 container text-center">
          <div className="alert border-0 p-5 rounded-4 shadow" style={{ backgroundColor: "rgba(224, 86, 86, 0.12)", color: "var(--danger)", maxWidth: "500px" }}>
            <span className="fs-1 d-block mb-3"><i className="fas fa-exclamation-triangle" style={{ color: "var(--danger)" }}></i></span>
            <h3>Failed to Load Product</h3>
            <p className="text-white-50 mt-2 mb-4">{error || "Product not found."}</p>
            <button className="btn fw-semibold px-4 py-2" onClick={() => onNavigate("home")} style={{ backgroundColor: "var(--accent)", color: "#0f0e11", borderRadius: "var(--radius-sm)" }}>
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImageUrl = getImageUrl(imagesList[activeImageIdx]);

  return (
    <div className="details-page-wrapper" style={{ 
      minHeight: "100vh", 
      background: "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(201, 169, 110, 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(201, 169, 110, 0.05) 0%, transparent 60%), var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)"
    }}>
      <Navbar onNavigate={onNavigate} />

      <div className="container py-5">
        {/* Back Button */}
        <button 
          onClick={() => onNavigate("home")} 
          className="btn btn-sm d-inline-flex align-items-center gap-2 mb-5"
          style={{ 
            backgroundColor: "transparent", 
            border: "1px solid var(--border)", 
            color: "var(--accent)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 18px",
            fontWeight: "600",
            transition: "var(--transition)"
          }}
        >
          <i className="fas fa-arrow-left" style={{ marginRight: "6px" }}></i> Back to Shop
        </button>

        <div className="row g-5">
          {/* Left Side: Product Image Carousel */}
          <div className="col-lg-6">
            <div className="p-3 shadow-lg" style={{ 
              backgroundColor: "var(--bg-card)", 
              border: "1px solid var(--border-subtle)", 
              borderRadius: "24px",
              boxShadow: "var(--shadow)"
            }}>
              {/* Main Image Viewport */}
              <div className="position-relative overflow-hidden" style={{ 
                borderRadius: "18px", 
                backgroundColor: "var(--bg-elevated)",
                aspectRatio: "1.2/1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img 
                  src={currentImageUrl} 
                  alt={product.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.4s ease" }}
                />

                {/* Carousel Controls */}
                {imagesList.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage} 
                      className="btn position-absolute start-0 top-50 translate-middle-y ms-3 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "44px", 
                        height: "44px", 
                        borderRadius: "50%", 
                        backgroundColor: "rgba(15, 14, 17, 0.7)", 
                        border: "1px solid var(--border)",
                        color: "var(--accent)"
                      }}
                    >
                      ❮
                    </button>
                    <button 
                      onClick={handleNextImage} 
                      className="btn position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "44px", 
                        height: "44px", 
                        borderRadius: "50%", 
                        backgroundColor: "rgba(15, 14, 17, 0.7)", 
                        border: "1px solid var(--border)",
                        color: "var(--accent)"
                      }}
                    >
                      ❯
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {imagesList.length > 1 && (
                <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
                  {imagesList.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIdx(index)}
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: activeImageIdx === index ? "2px solid var(--accent)" : "1px solid var(--border-subtle)",
                        padding: "0",
                        backgroundColor: "var(--bg-elevated)",
                        opacity: activeImageIdx === index ? 1 : 0.6,
                        transition: "var(--transition)"
                      }}
                    >
                      <img 
                        src={getImageUrl(img)} 
                        alt={`thumb-${index}`} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Product Details & Actions */}
          <div className="col-lg-6">
            <div className="ps-lg-3">
              <span className="small text-uppercase fw-semibold tracking-wider" style={{ color: "var(--accent)", letterSpacing: "0.1em" }}>
                {product.category?.name || "Premium Collection"}
              </span>
              
              <h1 className="mt-2 mb-3 fw-bold" style={{ 
                fontFamily: "var(--font-display)", 
                fontSize: "2.8rem", 
                color: "var(--text-primary)" 
              }}>
                {product.name}
              </h1>

              {/* Price & Stock status */}
              <div className="d-flex align-items-center gap-4 mb-4 flex-wrap">
                {product.discount > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{
                      color: "var(--text-muted)", fontSize: "1rem",
                      textDecoration: "line-through", fontWeight: "500"
                    }}>
                      {product.price} EGP
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="fs-3 fw-bold" style={{ color: "var(--accent)" }}>
                        {(product.price * (1 - product.discount / 100)).toFixed(2)} EGP
                      </span>
                      <span style={{
                        background: "rgba(224,86,86,0.15)", color: "#f08080",
                        fontSize: "0.85rem", fontWeight: "700", padding: "4px 12px",
                        borderRadius: "20px", border: "1px solid rgba(224,86,86,0.35)"
                      }}>
                        -{product.discount}% OFF
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="fs-3 fw-bold" style={{ color: "var(--accent)" }}>
                    {product.price} EGP
                  </span>
                )}
                
                <span className={`stock-badge px-3 py-1 fw-medium fs-6 rounded-pill ${product.quantity > 0 ? "in-stock" : "out-stock"}`}>
                  {product.quantity > 0 ? `In Stock – ${product.quantity} left` : "Out of stock"}
                </span>
              </div>


              {/* Description */}
              <div className="mb-5 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <span className="d-block small text-uppercase fw-semibold text-muted mb-3">Description</span>
                <p className="fs-5" style={{ 
                  color: "var(--text-secondary)", 
                  lineHeight: "1.7",
                  fontFamily: "var(--font-body)"
                }}>
                  {product.description || "No description available for this exquisite product. Handcrafted to perfection with absolute attention to details."}
                </p>
              </div>

              {/* Action Buttons */}
              {product.quantity > 0 ? (
                <div>
                  {addedMessage && (
                    <div className="alert border-0 text-center mb-4 py-2" style={{ backgroundColor: "rgba(91, 191, 142, 0.15)", color: "var(--success)", borderRadius: "var(--radius-sm)" }}>
                      ✅ Added to Cart Successfully!
                    </div>
                  )}

                  <div className="d-flex flex-column flex-sm-row gap-3">
                    {/* Quantity Selector */}
                    <div className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3 bg-dark" style={{ border: "1px solid var(--border-subtle)", minWidth: "130px" }}>
                      <button 
                        className="btn btn-sm text-white px-2 fs-5"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="fw-bold fs-5 px-3">{quantity}</span>
                      <button 
                        className="btn btn-sm text-white px-2 fs-5"
                        onClick={() => setQuantity((prev) => Math.min(product.quantity, prev + 1))}
                        disabled={quantity >= product.quantity}
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      onClick={handleAddToCart}
                      className="btn flex-grow-1 fw-bold py-3 shadow d-flex align-items-center justify-content-center gap-2"
                      style={{ 
                        backgroundColor: "var(--accent)", 
                        color: "#0f0e11",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "1.1rem",
                        border: "none",
                        transition: "var(--transition)"
                      }}
                    >
                      <i className="fas fa-shopping-cart" style={{ marginRight: "6px" }}></i> Add to Cart
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn w-100 fw-bold py-3" 
                  disabled 
                  style={{ 
                    backgroundColor: "rgba(224, 86, 86, 0.12)", 
                    color: "var(--danger)",
                    borderRadius: "var(--radius-sm)",
                    border: "none"
                  }}
                >
                  Sold Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
