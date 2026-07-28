import { Card, Form, Button, Badge } from "react-bootstrap";

export default function CouponInput({
  couponCode,
  setCouponCode,
  couponApplied,
  couponDiscount,
  couponError,
  setCouponError,
  onApply,
  onRemove,
}) {
  return (
    <Card className="checkout-card">
      <Card.Body>
        <h5 className="checkout-section-title">
          <span className="section-number">4</span>
          Coupon Code
        </h5>

        {couponApplied ? (
          <div className="coupon-applied">
            <div>
              <Badge bg="success" className="me-2">
                {couponApplied.code}
              </Badge>
              <span className="text-success fw-semibold">
                {couponApplied.label} applied — you save ₹
                {couponDiscount.toFixed(2)}
              </span>
            </div>
            <Button variant="outline-danger" size="sm" onClick={onRemove}>
              Remove
            </Button>
          </div>
        ) : (
          <div className="coupon-input-row">
            <Form.Control
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError("");
              }}
              isInvalid={!!couponError}
              className="coupon-input"
            />
            <Button
              variant="warning"
              onClick={onApply}
              className="coupon-apply-btn"
            >
              Apply
            </Button>
            {couponError && <div className="coupon-error">{couponError}</div>}
          </div>
        )}

        <p className="text-muted small mt-2 mb-0">
          Try: SAVE10, FLAT50, WELCOME
        </p>
      </Card.Body>
    </Card>
  );
}
