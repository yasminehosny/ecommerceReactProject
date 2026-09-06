import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createCategoryAPI, createProductAPI, getCategoriesAPI } from "../services/api";
import { fetchCategories } from "../store/slices/productsSlice";

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
  marginBottom: "18px",
};

const labelStyle = {
  fontSize: "0.78rem",
  fontWeight: "600",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "8px",
  padding: "13px 16px",
  color: "var(--text-primary)",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
  transition: "border-color 0.25s, box-shadow 0.25s",
  fontFamily: "var(--font-body)",
};

const focusHandlers = {
  onFocus: (e) => {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow = "0 0 0 3px rgba(201,169,110,0.15)";
  },
  onBlur: (e) => {
    e.target.style.borderColor = "var(--border-subtle)";
    e.target.style.boxShadow = "none";
  },
};

export function AdminForms({ type, onClose, onRefresh }) {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Category State
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImage, setCatImage] = useState(null);
  const [catFileName, setCatFileName] = useState("No file chosen");

  // Product State
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodQuantity, setProdQuantity] = useState("");
  const [prodDiscount, setProdDiscount] = useState("");
  const [prodImages, setProdImages] = useState([]);
  const [prodFilesName, setProdFilesName] = useState("No files chosen");

  useEffect(() => {
    // Always load categories: needed for the product form dropdown
    // and also pre-fetched when type=category so it's ready if user switches
    loadLocalCategories();
  }, [type]);

  // Local fetch for the product form dropdown (separate from Redux store)
  const loadLocalCategories = async () => {
    try {
      const data = await getCategoriesAPI();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleCatImageChange = (e) => {
    const file = e.target.files[0];
    setCatImage(file);
    setCatFileName(file ? file.name : "No file chosen");
  };

  const handleProdImagesChange = (e) => {
    const files = e.target.files;
    setProdImages(files);
    setProdFilesName(
      files && files.length > 0
        ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
        : "No files chosen"
    );
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", catName);
    formData.append("description", catDesc);
    if (catImage) formData.append("image", catImage);

    try {
      await createCategoryAPI(formData);
      // Update Redux store so FilterBar & product dropdown reflect the new category
      dispatch(fetchCategories());
      setSuccess(true);
      onRefresh();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setMessage(err.message);
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", prodName);
    formData.append("price", prodPrice);
    formData.append("description", prodDesc);
    formData.append("category", prodCategory);
    if (prodQuantity) formData.append("quantity", prodQuantity);
    if (prodDiscount) formData.append("discount", prodDiscount);
    Array.from(prodImages).forEach((file) => formData.append("images", file));

    try {
      await createProductAPI(formData);
      setSuccess(true);
      onRefresh();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setMessage(err.message);
      setLoading(false);
    }
  };

  const isProduct = type === "product";
  const title = isProduct ? "Add New Product" : "Add New Category";
  const icon = isProduct ? "fa-box-open" : "fa-folder-plus";

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #1a1820 0%, #18161d 100%)",
          border: "1px solid rgba(201,169,110,0.25)",
          borderRadius: "20px",
          padding: "36px 32px 28px",
          width: "100%",
          maxWidth: isProduct ? "520px" : "460px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          animation: "slideUpModal 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "18px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.2s",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(201,169,110,0.15)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "var(--accent-muted)",
              border: "1px solid rgba(201,169,110,0.3)",
              marginBottom: "14px",
            }}
          >
            <i className={`fas ${icon}`} style={{ fontSize: "22px", color: "var(--accent)" }}></i>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {isProduct ? "Fill in the details below to add a new product" : "Create a new category for your store"}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "24px" }} />

        {/* Success state */}
        {success && (
          <div
            style={{
              background: "rgba(91,191,142,0.1)",
              border: "1px solid rgba(91,191,142,0.3)",
              borderRadius: "10px",
              padding: "14px 18px",
              textAlign: "center",
              color: "var(--success)",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            <i className="fas fa-check-circle" style={{ marginRight: "8px" }}></i>
            {isProduct ? "Product created successfully!" : "Category created successfully!"}
          </div>
        )}

        {/* Error message */}
        {message && (
          <div
            style={{
              background: "rgba(224,86,86,0.1)",
              border: "1px solid rgba(224,86,86,0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              textAlign: "center",
              color: "#f08080",
              fontSize: "0.88rem",
              marginBottom: "16px",
            }}
          >
            <i className="fas fa-exclamation-triangle" style={{ marginRight: "7px" }}></i>
            {message}
          </div>
        )}

        {/* ── CATEGORY FORM ── */}
        {!isProduct && (
          <form onSubmit={handleCategorySubmit}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. T-Shirts"
                required
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Short description (optional)"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Category Image</label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "var(--bg-elevated)",
                  border: "1px dashed rgba(201,169,110,0.35)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)")}
              >
                <i className="fas fa-cloud-upload-alt" style={{ color: "var(--accent)", fontSize: "18px" }}></i>
                <span style={{ color: catImage ? "var(--text-primary)" : "var(--text-muted)", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {catFileName}
                </span>
                <input
                  type="file"
                  onChange={handleCatImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> Create Category
                </>
              )}
            </button>
          </form>
        )}

        {/* ── PRODUCT FORM ── */}
        {isProduct && (
          <form onSubmit={handleProductSubmit}>
            {/* Name + Price row */}
            <div style={{ display: "flex", gap: "14px" }}>
              <div style={{ ...fieldStyle, flex: 2 }}>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Product name"
                  required
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Price *</label>
                <input
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
            </div>

            {/* Description */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Describe the product..."
                required
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
                {...focusHandlers}
              />
            </div>

            {/* Category */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Category *</label>
              <div style={{ position: "relative" }}>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    paddingRight: "40px",
                    cursor: "pointer",
                  }}
                  {...focusHandlers}
                >
                  <option value="" style={{ background: "#211e28" }}>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} style={{ background: "#211e28" }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <i
                  className="fas fa-chevron-down"
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Quantity + Discount row */}
            <div style={{ display: "flex", gap: "14px" }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Quantity</label>
                <input
                  type="number"
                  value={prodQuantity}
                  onChange={(e) => setProdQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>
                  Discount{" "}
                  <span style={{ color: "var(--text-muted)", textTransform: "none", letterSpacing: 0, fontSize: "0.78rem" }}>
                    % (optional)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="1"
                    style={{ ...inputStyle, paddingRight: "36px" }}
                    {...focusHandlers}
                  />
                  <span style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)", color: "var(--accent)",
                    fontWeight: "700", fontSize: "0.95rem", pointerEvents: "none"
                  }}>%</span>
                </div>
                {prodDiscount > 0 && prodPrice > 0 && (
                  <span style={{ fontSize: "0.78rem", color: "var(--success)", marginTop: "4px" }}>
                    After discount: {(prodPrice * (1 - prodDiscount / 100)).toFixed(2)} EGP
                  </span>
                )}
              </div>
            </div>

            {/* Images upload */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Images <span style={{ color: "var(--text-muted)", textTransform: "none", letterSpacing: 0, fontSize: "0.78rem" }}>(up to 10)</span></label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "var(--bg-elevated)",
                  border: "1px dashed rgba(201,169,110,0.35)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,110,0.35)")}
              >
                <i className="fas fa-images" style={{ color: "var(--accent)", fontSize: "18px" }}></i>
                <span style={{ color: prodImages.length ? "var(--text-primary)" : "var(--text-muted)", fontSize: "0.9rem" }}>
                  {prodFilesName}
                </span>
                <input
                  type="file"
                  onChange={handleProdImagesChange}
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> Create Product
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
