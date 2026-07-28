import { Card, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function BillingSummary({
  entries,
  freeEntries,
  totals,
  savings,
  couponApplied,
  couponDiscount,
  finalTotal,
  isSubmitting,
  submitError,
  onPlaceOrder,
}) {
  return (
    <Card className="checkout-summary-card">
      <h5 className="checkout-summary-title">Billing Summary</h5>

      {/* Items preview */}
      <div className="checkout-items-preview">
        {entries.map(([id, item]) => {
          const price = parseFloat(item.price);
          return (
            <div key={id} className="checkout-item-row">
              <img
                src={item.image}
                alt={item.name}
                className="checkout-item-img"
              />
              <div className="checkout-item-info">
                <div className="checkout-item-name">{item.name}</div>
                <div className="text-muted small">
                  {item.quantity} × ₹{price.toFixed(2)}
                </div>
              </div>
              <div className="checkout-item-total">
                ₹{(price * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}

        {/* Free offer items — display only */}
        {freeEntries.length > 0 && (
          <>
            <div className="checkout-free-divider">🎁 Free with this order</div>
            {freeEntries.map(([id, item]) => (
              <div key={id} className="checkout-item-row checkout-item-free">
                <img
                  src={item.image}
                  alt={item.name}
                  className="checkout-item-img"
                />
                <div className="checkout-item-info">
                  <div className="checkout-item-name">{item.name}</div>
                  <div
                    className="small"
                    style={{ color: "#059669", fontWeight: 700 }}
                  >
                    FREE
                  </div>
                </div>
                <div
                  className="checkout-item-total"
                  style={{ color: "#059669" }}
                >
                  ₹0.00
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <hr />

      <div className="checkout-summary-row">
        <span>MRP Total</span>
        <span>₹{totals.mrpTotal.toFixed(2)}</span>
      </div>

      {savings > 0 && (
        <div className="checkout-summary-row checkout-savings">
          <span>Product Discount</span>
          <span>−₹{savings.toFixed(2)}</span>
        </div>
      )}

      <div className="checkout-summary-row">
        <span>Subtotal</span>
        <span>₹{totals.subtotal.toFixed(2)}</span>
      </div>

      {couponApplied && (
        <div className="checkout-summary-row checkout-savings">
          <span>Coupon ({couponApplied.code})</span>
          <span>−₹{couponDiscount.toFixed(2)}</span>
        </div>
      )}

      <div className="checkout-summary-row">
        <span>Delivery</span>
        <span className="text-success fw-semibold">Free</span>
      </div>

      <hr />

      <div className="checkout-summary-row checkout-final-total">
        <span>Grand Total</span>
        <span>₹{finalTotal.toFixed(2)}</span>
      </div>

      {submitError && (
        <Alert variant="danger" className="mt-3 mb-0 small">
          {submitError}
        </Alert>
      )}

      <Button
        size="lg"
        className="w-100 mt-3 checkout-place-btn"
        onClick={onPlaceOrder}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Placing Order...
          </>
        ) : (
          `Place Order · ₹${finalTotal.toFixed(2)}`
        )}
      </Button>

      <div className="text-center mt-3">
        <Link to="/cart" className="text-muted small">
          ← Back to Cart
        </Link>
      </div>
    </Card>
  );
}
