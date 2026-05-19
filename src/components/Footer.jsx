export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Brand Information */}
        <div className="footer-brand">
          <h3><i className="fas fa-shopping-bag" style={{ marginRight: "8px" }}></i> ShopZone</h3>
          <p>
            Your ultimate destination for premium quality products. We deliver an exceptional, secure, and seamless online shopping experience curated to meet all your desires and expectations.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a onClick={() => onNavigate("home")}><i className="fas fa-home" style={{ marginRight: "8px" }}></i> Home</a>
            </li>
            <li>
              <a href="#"><i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i> About Us</a>
            </li>
            <li>
              <a href="#"><i className="fas fa-shield-alt" style={{ marginRight: "8px" }}></i> Privacy Policy</a>
            </li>
            <li>
              <a href="#"><i className="fas fa-file-contract" style={{ marginRight: "8px" }}></i> Terms of Service</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><i className="fas fa-map-marker-alt" style={{ marginRight: "8px", color: "var(--accent)" }}></i> Cairo, Egypt</p>
          <p><i className="fas fa-phone" style={{ marginRight: "8px", color: "var(--accent)" }}></i> +20 100 000 0000</p>
          <p><i className="fas fa-envelope" style={{ marginRight: "8px", color: "var(--accent)" }}></i> support@shopzone.com</p>
          <p><i className="fas fa-clock" style={{ marginRight: "8px", color: "var(--accent)" }}></i> Support: Mon - Sun (9 AM - 10 PM)</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 ShopZone. All rights reserved.</p>
        <p>Made with <i className="fas fa-heart" style={{ color: "var(--accent)", margin: "0 4px" }}></i> for the best shopping experience</p>
      </div>
    </footer>
  );
}
