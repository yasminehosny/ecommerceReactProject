import { useDispatch, useSelector } from "react-redux";
import { setFilters, clearFilters } from "../store/slices/productsSlice";
import { fetchProducts } from "../store/slices/productsSlice";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function FilterBar() {
  const dispatch = useDispatch();
  const { filters, categories } = useSelector((state) => state.products);

  const handleChange = (e) => {
    dispatch(setFilters({ [e.target.name]: e.target.value }));
  };

  const handleApply = () => {
    dispatch(fetchProducts(filters));
  };

  const handleClear = () => {
    dispatch(clearFilters());
    dispatch(fetchProducts({}));
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Category</label>
        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Min Price</label>
        <input
          type="number"
          name="minPrice"
          placeholder="0"
          value={filters.minPrice}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label>Max Price</label>
        <input
          type="number"
          name="maxPrice"
          placeholder="99999"
          value={filters.maxPrice}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label>Size</label>
        <select name="size" value={filters.size} onChange={handleChange}>
          <option value="">All Sizes</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn-apply" onClick={handleApply}>
          Apply Filters
        </button>
        <button className="btn-clear" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
