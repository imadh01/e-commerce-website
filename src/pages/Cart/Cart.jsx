import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { getDiscountPercent } from "../../utils/pricing";
import "./Cart.css";

export default function Cart() {
  usePageTitle("Cart");
  const navigate = useNavigate();
  const { cartItems, setQuantity, removeFromCart, clearCart } = useCart();

  const entries = Object.entries(cartItems); // [ [id, {quantity, name, ...}], ... ]

  // Derive totals in one pass — reduce is the right tool here (single
  // traversal, no intermediate arrays).
  const totals = entries.reduce(
    (acc, [, item]) => {
      const price = parseFloat(item.price);
      const mrp = item.mrp ? parseFloat(item.mrp) : price;
      acc.itemCount += item.quantity;
      acc.subtotal += price * item.quantity;
      acc.mrpTotal += mrp * item.quantity;
      return acc;
    },
    { itemCount: 0, subtotal: 0, mrpTotal: 0 },
  );

  const savings = totals.mrpTotal - totals.subtotal;

  // Empty state — separate branch keeps the main return uncluttered.
  if (entries.length === 0) {
    return (
      <Container className="cart-page py-5">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p className="text-muted">
            Looks like you haven't added anything yet.
          </p>
          <Button as={Link} to="/" variant="warning" size="lg" className="mt-3">
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="cart-page py-4">
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => {
            if (window.confirm("Remove all items from your cart?")) {
              clearCart();
            }
          }}
        >
          Clear Cart
        </Button>
      </div>

      <Row className="g-4">
        {/* ===== ITEMS LIST ===== */}
        <Col lg={8}>
          <Card className="cart-items-card">
            <div className="cart-items-header ">
              <div className="col-product">Product</div>
              <div className="col-price">Price</div>
              <div className="col-qty">Quantity</div>
              <div className="col-total">Total</div>
              <div className="col-remove" />
            </div>

            {entries.map(([id, item]) => {
              const price = parseFloat(item.price);
              const mrp = item.mrp ? parseFloat(item.mrp) : null;
              const pct = getDiscountPercent(item.price, item.mrp);
              const lineTotal = price * item.quantity;

              return (
                <div key={id} className="cart-item-row">
                  <div className="col-product">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      {item.code && (
                        <div className="cart-item-code text-muted">
                          Code: {item.code}
                        </div>
                      )}
                      {pct && (
                        <span className="cart-item-discount">{pct}% OFF</span>
                      )}
                    </div>
                  </div>

                  <div className="col-price">
                    <div className="cart-price">₹{price.toFixed(2)}</div>
                    {mrp && mrp > price && (
                      <div className="cart-mrp">₹{mrp.toFixed(2)}</div>
                    )}
                  </div>

                  <div className="col-qty">
                    <div className="cart-qty-control">
                      <button
                        type="button"
                        onClick={() => setQuantity(id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-total">₹{lineTotal.toFixed(2)}</div>

                  <div className="col-remove">
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(id)}
                      aria-label={`Remove ${item.name}`}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>

          <div className="mt-3">
            <Link to="/" className="cart-continue-link">
              ← Continue Shopping
            </Link>
          </div>
        </Col>

        {/* ===== SUMMARY ===== */}
        <Col lg={4}>
          <Card className="cart-summary-card">
            <h5 className="cart-summary-title">Order Summary</h5>

            <div className="cart-summary-row">
              <span>Items ({totals.itemCount})</span>
              <span>₹{totals.mrpTotal.toFixed(2)}</span>
            </div>

            {savings > 0 && (
              <div className="cart-summary-row cart-summary-savings">
                <span>You save</span>
                <span>−₹{savings.toFixed(2)}</span>
              </div>
            )}

            <div className="cart-summary-row">
              <span>Delivery</span>
              <span className="text-muted">Calculated at checkout</span>
            </div>

            <div className="cart-summary-row">
              <span>Tax</span>
              <span className="text-muted">Calculated at checkout</span>
            </div>

            <hr />

            <div className="cart-summary-row cart-summary-total">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>

            <Button
              variant="dark"
              size="lg"
              className="w-100 mt-3 cart-checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </Button>

            {savings > 0 && (
              <Alert
                variant="success"
                className="mt-3 mb-0 py-2 text-center small"
              >
                🎉 You're saving ₹{savings.toFixed(2)} on this order!
              </Alert>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
