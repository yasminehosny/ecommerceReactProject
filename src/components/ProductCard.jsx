export default function ProductCard({ product }) {
  const imageUrl =
    product.images?.[0] ||
    product.image ||
    "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="product-img" />
        {product.size && <span className="size-badge">{product.size}</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{product.price} EGP</span>
          {product.quantity !== undefined && (
            <span
              className={`stock-badge ${product.quantity > 0 ? "in-stock" : "out-stock"}`}
            >
              {product.quantity > 0 ? `${product.quantity} left` : "Out of stock"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
