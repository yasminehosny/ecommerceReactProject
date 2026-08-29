import { useDispatch } from "react-redux";
import { addItemToCart } from "../store/slices/cartSlice";

export default function ProductCard({ product, onNavigate }) {
  const dispatch = useDispatch();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/300x200?text=No+Image";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const clean = img.startsWith("/") ? img.slice(1) : img;
    if (clean.startsWith("uploads/")) return `${API_BASE}/${clean}`;
    return `${API_BASE}/uploads/${clean}`;
  };

  const imageUrl = getImageUrl(product.images?.[0] || product.image);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }));
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onNavigate) onNavigate("product-details", product._id);
  };

  return (
    <div className="product-card" onClick={handleViewDetails} style={{ display: "flex", flexDirection: "column", height: "100%", cursor: "pointer" }}>
      <div className="product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="product-img" />
        {product.size && <span className="size-badge">{product.size}</span>}
      </div>
      <div className="product-info d-flex flex-column flex-grow-1">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        
        <div className="product-footer mt-auto pt-3">
          <span className="product-price" style={{ color: "var(--accent)" }}>{product.price} EGP</span>
          {product.quantity !== undefined && (
            <span
              className={`stock-badge ${product.quantity > 0 ? "in-stock" : "out-stock"}`}
            >
              {product.quantity > 0 ? `${product.quantity} left` : "Out of stock"}
            </span>
          )}
        </div>
        
        <div className="d-flex gap-2 mt-3 w-100">
          <button 
            onClick={handleAddToCart}
            className="btn btn-sm flex-grow-1 fw-semibold py-2"
            disabled={product.quantity <= 0}
            style={{ 
              border: "1px solid var(--border)", 
              color: "#0f0e11", 
              backgroundColor: "var(--accent)",
              borderRadius: "var(--radius-sm)"
            }}
          >
            🛒 Add to Cart
          </button>
          <button 
            onClick={handleViewDetails}
            className="btn btn-sm flex-grow-1 fw-semibold py-2"
            style={{ 
              border: "1px solid var(--border)", 
              color: "var(--accent)", 
              backgroundColor: "rgba(201, 169, 110, 0.05)",
              borderRadius: "var(--radius-sm)"
            }}
          >
            👁️ Details
          </button>
        </div>
      </div>
    </div>
  );
}
