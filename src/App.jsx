import { useState } from "react";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

export default function App() {
  const { token } = useSelector((state) => state.auth);
  const [page, setPage] = useState(token ? "home" : "login");

  const navigate = (target) => setPage(target);

  if (page === "login") return <Login onNavigate={navigate} />;
  if (page === "register") return <Register onNavigate={navigate} />;
  if (page === "home" && token) return <Home onNavigate={navigate} />;

  // fallback
  return <Login onNavigate={navigate} />;
}
