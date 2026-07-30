import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./CartFloatingBar.css";

export default function CartFloatingBar() {
  const { cartCount, paidSubtotal } = useCart();
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Don't show on cart page or checkout page
  if (!isLoggedIn || cartCount === 0) return null;
  if (location.pathname === "/cart" || location.pathname === "/checkout")
    return null;

  return (
    <div className="cart-float-bar">
      <div className="cart-float-left">
        <span className="cart-float-icon">🛒</span>
        <div>
          <div className="cart-float-sub">
            {cartCount} {cartCount === 1 ? "item" : "items"} • ₹
            {paidSubtotal.toFixed(2)}
          </div>
        </div>
      </div>
      <Link to="/cart" className="cart-float-link">
        View Cart ›
      </Link>
    </div>
  );
}
