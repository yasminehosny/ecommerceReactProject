export default function NotFound({ onNavigate }) {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-glow" />
        <div className="not-found-code">404</div>
        <h1>Oops! Page Not Found</h1>
        <p>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
        </p>
        <div className="not-found-actions">
          <button 
            onClick={() => onNavigate("home")} 
            className="btn-accent"
          >
            <i className="fas fa-home" style={{ marginRight: "8px" }}></i> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
