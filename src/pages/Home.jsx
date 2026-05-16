import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories } from "../store/slices/productsSlice";
import Navbar from "../components/Navbar";
import FilterBar from "../components/FilterBar";
import ProductCard from "../components/ProductCard";

export default function Home({ onNavigate }) {
  const dispatch = useDispatch();
  const { items, loading, error, total, filters } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({}));
  }, [dispatch]);

  return (
    <div className="home-page">
      <Navbar onNavigate={onNavigate} />

      <div className="home-container">
        <div className="home-hero">
          <h1>Discover Our Collection</h1>
          <p>Find exactly what you're looking for</p>
        </div>

        <FilterBar />

        <div className="results-header">
          <span>{total > 0 ? `${total} products found` : "No results"}</span>
        </div>

        {loading && (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={() => dispatch(fetchProducts(filters))}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className="empty-state">
                <p>🔍 No products match your filters</p>
              </div>
            ) : (
              <div className="products-grid">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
