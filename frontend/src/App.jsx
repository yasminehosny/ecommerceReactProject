import { useState } from "react";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./pages/details";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import NotFound from "./pages/NotFound";

export default function App() {
  const { token } = useSelector((state) => state.auth);
  const [page, setPage] = useState(token ? "home" : "login");
  const [selectedProductId, setSelectedProductId] = useState(null);

  const navigate = (target, param = null) => {
    setPage(target);
    if (param) setSelectedProductId(param);
  };

  if (page === "login") return <Login onNavigate={navigate} />;
  if (page === "register") return <Register onNavigate={navigate} />;
  if (page === "not-found") return <NotFound onNavigate={navigate} />;

  if (token) {
    if (page === "home") return <Home onNavigate={navigate} />;
    if (page === "product-details")
      return (
        <ProductDetails
          productId={selectedProductId}
          onNavigate={navigate}
        />
      );
    if (page === "cart") return <Cart onNavigate={navigate} />;
    if (page === "order") return <Order onNavigate={navigate} />;
    return <NotFound onNavigate={navigate} />;
  }

  return <Login onNavigate={navigate} />;
}
