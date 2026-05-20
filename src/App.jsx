import { useState } from "react";
import Order from "./pages/Order";
import Cart from "./pages/Cart";

export default function App() {
  const [page, setPage] = useState("cart");

  const navigate = (target) => {
    setPage(target);
  };

  if (page === "order") return <Order onNavigate={navigate} />;
  return <Cart onNavigate={navigate} />;
}
