import { useState } from "react";
import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

// The 6 real pages, matching our router paths in App.jsx.
const navItems = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "FAQ", path: "/faq" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms & Conditions", path: "/terms" },
];
// Separated because it uses useSearchParams, which only makes sense
// on the home page. Keeping it inline would mean Header always
// subscribes to URL param changes even on /about, /faq, etc.
function HeaderSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  function handleChange(e) {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Already filtering in real time via URL params — this just
    // prevents form submission / page reload if wrapped in a form.
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="What are you looking..."
        value={currentQuery}
        onChange={handleChange}
      />
      <button type="button" aria-label="Search" onClick={handleSubmit}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function Header() {
  // Tracks whether the mobile nav menu is open. Starts closed.
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  // Pulls the live cart count from CartContext — this is the connection
  // point: whatever the Home page's "Add to Cart" button does, this
  // number updates automatically, with no manual wiring needed.
  const { cartCount } = useCart();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
  }

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="header-top-inner">
          <Link to="/" className="logo">
            <img
              src="/synergein-logo.jpg"
              alt="Synergein"
              className="logo-img"
            />
          </Link>

          {isHomePage && <HeaderSearch />}

          <div className="header-actions">
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6H21L19 15H8L6 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L5 2H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
              </svg>
              <span className="cart-count">{cartCount}</span>
              <span className="action-label">Cart</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Dropdown align="end" className="profile-dropdown">
                  <Dropdown.Toggle
                    as="button"
                    className="profile-dropdown-toggle"
                  >
                    <div className="profile-dropdown-avatar">
                      {(user.CustomerName || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="profile-dropdown-name">
                      {user.CustomerName?.split(" ")[0] || "Profile"}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="profile-dropdown-menu">
                    <Dropdown.Item
                      as={Link}
                      to="/profile"
                      className="profile-dropdown-item"
                    >
                      👤 My Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/orders"
                      className="profile-dropdown-item"
                    >
                      📦 My Orders
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/order-tracking/0"
                      className="profile-dropdown-item"
                    >
                      🚚 Track Order
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => setShowLogoutConfirm(true)}
                      className="profile-dropdown-item profile-dropdown-logout"
                    >
                      🚪 Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Modal
                  show={showLogoutConfirm}
                  onHide={() => setShowLogoutConfirm(false)}
                  centered
                  size="sm"
                >
                  <Modal.Body className="text-center py-4">
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                      👋
                    </div>
                    <h5
                      className="fw-bold mb-2"
                      style={{ color: "var(--brand-blue)" }}
                    >
                      Sign out?
                    </h5>
                    <p className="text-muted small mb-4">
                      Are you sure you want to log out?
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          logout();
                          setShowLogoutConfirm(false);
                        }}
                      >
                        Yes, Logout
                      </Button>
                    </div>
                  </Modal.Body>
                </Modal>
              </>
            ) : (
              <Link to="/login" className="signin-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="action-label">Sign In</span>
              </Link>
            )}
          </div>

          <button
            type="button"
            className={`mobile-toggle ${isMobileMenuOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <nav className={`main-nav ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="main-nav-inner">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active-page" : ""}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <Modal
        show={showLogoutConfirm}
        onHide={() => setShowLogoutConfirm(false)}
        centered
        size="sm"
      >
        <Modal.Body className="text-center py-4">
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👋</div>
          <h5 className="fw-bold mb-2" style={{ color: "var(--brand-blue)" }}>
            Sign out?
          </h5>
          <p className="text-muted small mb-4">
            Are you sure you want to log out?
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                logout();
                setShowLogoutConfirm(false);
              }}
            >
              Yes, Logout
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </header>
  );
}
