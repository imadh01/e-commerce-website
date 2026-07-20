import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
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

export default function Header() {
  // Tracks whether the mobile nav menu is open. Starts closed.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          {isHomePage && (
            <div className="search-bar">
              <input type="text" placeholder="What are you looking..." />
              <button type="button" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

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

            <button type="button" className="signin-btn">
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
            </button>
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
    </header>
  );
}
