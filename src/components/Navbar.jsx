import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar({ onNavigate }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    onNavigate("login");
  };

  return (
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
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
