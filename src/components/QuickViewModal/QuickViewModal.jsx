import { Modal, Button, Badge } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { getDiscountPercent } from "../../utils/pricing";
import "./QuickViewModal.css";
import { useAuth } from "../../context/AuthContext";

export default function QuickViewModal({
  show,
  onHide,
  product,
  categoryName,
  onDone,
}) {
  // The modal now reads AND writes cart state directly. There's no
  // local "quantity" — the source of truth is CartContext, so any
  // +/- click flows through to the Header's cart badge instantly.
  const { cartItems, addToCart, setQuantity } = useCart();

  if (!product) return null;

  const cartQty = cartItems[product.id]?.quantity || 0;
  const inCart = cartQty > 0;

  const price = parseFloat(product.price);
  const mrp = product.mrp ? parseFloat(product.mrp) : null;
  const discountPct = getDiscountPercent(product.price, product.mrp);
  const { isLoggedIn } = useAuth();

  // In handlePrimary:
  function handlePrimary() {
    if (!isLoggedIn) {
      onHide();
      // The parent will show the auth prompt
      onAuthRequired?.();
      return;
    }
    if (!inCart) addToCart(product, 1);
    onDone(product, inCart ? "updated" : "added");
  }

  function decrement() {
    // setQuantity handles qty=0 by removing the item from the cart.
    setQuantity(product.id, cartQty - 1);
  }

  function increment() {
    addToCart(product, 1);
  }

  function handlePrimary() {
    // If not yet in cart, add one. If already in cart, this is just
    // a "done" action — user already added via +.
    if (!inCart) addToCart(product, 1);
    onDone(product, inCart ? "updated" : "added");
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="quick-view-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="quick-view-title"> </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="quick-view-body">
          <div className="quick-view-image-wrap">
            {discountPct && (
              <Badge bg="danger" className="quick-view-discount-badge">
                {discountPct}% OFF
              </Badge>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="quick-view-image"
            />
          </div>

          <div className="quick-view-details">
            {categoryName && (
              <Badge bg="warning" text="dark" className="quick-view-category">
                {categoryName}
              </Badge>
            )}

            <h3 className="quick-view-name">{product.name}</h3>

            <div className="quick-view-price-row">
              <span className="quick-view-price">₹{price.toFixed(2)}</span>
              {mrp && mrp > price && (
                <span className="quick-view-mrp">₹{mrp.toFixed(2)}</span>
              )}
            </div>

            {product.code && (
              <p className="quick-view-code">
                <span className="text-muted">Product Code:</span> {product.code}
              </p>
            )}

            <div className="quick-view-qty-row">
              <label className="quick-view-qty-label">
                {inCart ? "In Cart" : "Quantity"}
              </label>
              <div className="quick-view-qty-control">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={cartQty === 0}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="quick-view-qty-value">{cartQty}</span>
                <button
                  type="button"
                  onClick={increment}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="quick-view-actions">
              <Button
                variant={inCart ? "success" : "dark"}
                size="lg"
                onClick={handlePrimary}
                className="quick-view-add-btn"
              >
                {inCart
                  ? `✓ Done · ${cartQty} in cart · ₹${(price * cartQty).toFixed(2)}`
                  : `Add to Cart · ₹${price.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
