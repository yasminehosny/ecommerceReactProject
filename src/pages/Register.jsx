import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../store/slices/authSlice";

export default function Register({ onNavigate }) {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (token) onNavigate("home");
    return () => dispatch(clearError());
  }, [token]);

  const handleChange = (e) => {
    setFormError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setFormError("Passwords don't match!");
      return;
    }
    dispatch(registerUser(form));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo"><i className="fas fa-shopping-bag"></i></div>
          <h1>Create Account</h1>
          <p>Join us and start shopping</p>
        </div>

        {(error || formError) && (
          <div className="error-banner">{formError || error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Yasmine Hosny"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="field-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
