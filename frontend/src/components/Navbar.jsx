import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { fetchCart } from "../store/slices/cartSlice";
import { fetchProducts } from "../store/slices/productsSlice";
import { AdminForms } from "./AdminForms";

export default function Navbar({ onNavigate }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  
  const [modalType, setModalType] = useState(null); // 'product' or 'category'

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    onNavigate("login");
  };

  const handleRefresh = () => {
    dispatch(fetchProducts({}));
  };

  const cartItemsCount = items ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" onClick={() => onNavigate("home")}>
          <i className="fas fa-shopping-bag" style={{ marginRight: "8px" }}></i> <span>ShopZone</span>
        </div>
        
        <div className="nav-user">
          {user && (
            <>
              <span className="user-greeting">
                <i className="fas fa-user-circle" style={{ marginRight: "6px", color: "var(--accent)" }}></i>
                Hello, {user.name?.split(" ")[0] || "User"}
              </span>
              
              {user.role === "admin" && (
                <>
                  <button className="btn-cart" onClick={() => setModalType("category")} title="Add Category" style={{ marginLeft: "10px" }}>
                    <i className="fas fa-folder-plus" style={{ marginRight: "6px" }}></i> Add Category
                  </button>
                  <button className="btn-cart" onClick={() => setModalType("product")} title="Add Product" style={{ marginLeft: "10px" }}>
                    <i className="fas fa-box-open" style={{ marginRight: "6px" }}></i> Add Product
                  </button>
                </>
              )}
              
              <button className="btn-cart" onClick={() => onNavigate("cart")} title="View Cart" style={{ marginLeft: "10px" }}>
                <i className="fa-solid fa-cart-shopping"></i>
                {cartItemsCount > 0 && (
                  <span className="cart-badge">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              
              <button className="btn-logout" onClick={handleLogout} style={{ marginLeft: "10px" }}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      
      {modalType && (
        <AdminForms 
          type={modalType} 
          onClose={() => setModalType(null)} 
          onRefresh={handleRefresh} 
        />
      )}
    </>
  );
}

