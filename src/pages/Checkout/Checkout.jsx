import { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { getDiscountPercent } from "../../utils/pricing";
import { getDeliverySlots, getTimeSlots } from "../../utils/deliverySlots";
import { placeOrder } from "../../utils/orderService";
import "./Checkout.css";

export default function Checkout() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const entries = Object.entries(cartItems);

  // Redirect if cart is empty
  if (entries.length === 0) {
    return (
      <Container className="checkout-page py-5">
        <div className="text-center py-5">
          <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
            Your cart is empty
          </h2>
          <p className="text-muted mt-2">Add some items before checking out.</p>
          <Button as={Link} to="/" variant="warning" size="lg" className="mt-3">
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  // ===== FORM STATE =====
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const deliveryDates = useMemo(() => getDeliverySlots(), []);
  const timeSlots = useMemo(() => getTimeSlots(), []);

  // ===== TOTALS =====
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
  const couponDiscount = couponApplied ? couponApplied.discount : 0;
  const finalTotal = totals.subtotal - couponDiscount;

  // ===== HANDLERS =====
  function handleAddressChange(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleApplyCoupon() {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    // Mock coupon validation — replace with API call later
    const mockCoupons = {
      SAVE10: { discount: totals.subtotal * 0.1, label: "10% off" },
      FLAT50: { discount: 50, label: "₹50 off" },
      WELCOME: { discount: totals.subtotal * 0.15, label: "15% off" },
    };

    if (mockCoupons[code]) {
      setCouponApplied({ code, ...mockCoupons[code] });
    } else {
      setCouponError("Invalid coupon code");
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  }

  function validate() {
    const errors = {};
    if (!address.fullName.trim()) errors.fullName = "Name is required";
    if (!address.phone.trim()) errors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(address.phone.trim()))
      errors.phone = "Enter a valid 10-digit phone number";
    if (!address.addressLine1.trim())
      errors.addressLine1 = "Address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(address.pincode.trim()))
      errors.pincode = "Enter a valid 6-digit pincode";
    if (!deliveryDate) errors.deliveryDate = "Select a delivery date";
    if (!deliveryTime) errors.deliveryTime = "Select a delivery time";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector(".is-invalid");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: entries.map(([id, item]) => ({
          productId: id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        address,
        deliveryInstructions,
        deliveryDate,
        deliveryTime,
        paymentMethod,
        coupon: couponApplied
          ? { code: couponApplied.code, discount: couponDiscount }
          : null,
        totals: {
          subtotal: totals.subtotal,
          savings,
          couponDiscount,
          finalTotal,
        },
      };

      const order = await placeOrder(orderPayload);
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      console.error("Order failed:", err);
      setFormErrors({
        submit: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="checkout-page py-4">
      <h1 className="checkout-title">Checkout</h1>

      <Row className="g-4">
        {/* ===== LEFT: FORMS ===== */}
        <Col lg={8}>
          {/* Delivery Address */}
          <Card className="checkout-card">
            <Card.Body>
              <h5 className="checkout-section-title">
                <span className="section-number">1</span>
                Delivery Address
              </h5>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Full Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="John Doe"
                      value={address.fullName}
                      onChange={(e) =>
                        handleAddressChange("fullName", e.target.value)
                      }
                      isInvalid={!!formErrors.fullName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.fullName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="9876543210"
                      value={address.phone}
                      onChange={(e) =>
                        handleAddressChange("phone", e.target.value)
                      }
                      isInvalid={!!formErrors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Address Line 1 *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="House/Flat No., Building, Street"
                      value={address.addressLine1}
                      onChange={(e) =>
                        handleAddressChange("addressLine1", e.target.value)
                      }
                      isInvalid={!!formErrors.addressLine1}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.addressLine1}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Address Line 2
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Landmark, Area (optional)"
                      value={address.addressLine2}
                      onChange={(e) =>
                        handleAddressChange("addressLine2", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="checkout-label">City *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Chennai"
                      value={address.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      isInvalid={!!formErrors.city}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.city}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="checkout-label">State *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Tamil Nadu"
                      value={address.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      isInvalid={!!formErrors.state}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.state}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Pincode *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="600001"
                      value={address.pincode}
                      onChange={(e) =>
                        handleAddressChange("pincode", e.target.value)
                      }
                      isInvalid={!!formErrors.pincode}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.pincode}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Delivery Instructions */}
          <Card className="checkout-card">
            <Card.Body>
              <h5 className="checkout-section-title">
                <span className="section-number">2</span>
                Delivery Instructions
              </h5>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="E.g. Ring the bell twice, leave at the door, call before delivery..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
            </Card.Body>
          </Card>

          {/* Scheduled Delivery */}
          <Card className="checkout-card">
            <Card.Body>
              <h5 className="checkout-section-title">
                <span className="section-number">3</span>
                Scheduled Delivery
              </h5>

              <Alert variant="info" className="checkout-schedule-note">
                🕖 Orders placed after 7 PM will be scheduled for the next day.
              </Alert>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Delivery Date *
                    </Form.Label>
                    <Form.Select
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      isInvalid={!!formErrors.deliveryDate}
                    >
                      <option value="">Select date</option>
                      {deliveryDates.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.deliveryDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Time Slot *
                    </Form.Label>
                    <Form.Select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      isInvalid={!!formErrors.deliveryTime}
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.deliveryTime}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Coupon Code */}
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
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={removeCoupon}
                  >
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
                    onClick={handleApplyCoupon}
                    className="coupon-apply-btn"
                  >
                    Apply
                  </Button>
                  {couponError && (
                    <div className="coupon-error">{couponError}</div>
                  )}
                </div>
              )}

              <p className="text-muted small mt-2 mb-0">
                Try: SAVE10, FLAT50, WELCOME
              </p>
            </Card.Body>
          </Card>

          {/* Payment Method */}
          <Card className="checkout-card">
            <Card.Body>
              <h5 className="checkout-section-title">
                <span className="section-number">5</span>
                Payment Method
              </h5>

              <div className="payment-options">
                {[
                  { value: "cod", label: "Cash on Delivery", icon: "💵" },
                  { value: "card", label: "Credit / Debit Card", icon: "💳" },
                  { value: "upi", label: "UPI", icon: "📱" },
                ].map((method) => (
                  <div
                    key={method.value}
                    className={`payment-option ${paymentMethod === method.value ? "active" : ""}`}
                    onClick={() => setPaymentMethod(method.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPaymentMethod(method.value);
                      }
                    }}
                  >
                    <span className="payment-icon">{method.icon}</span>
                    <span className="payment-label">{method.label}</span>
                    <div
                      className={`payment-radio ${paymentMethod === method.value ? "checked" : ""}`}
                    />
                  </div>
                ))}
              </div>

              {paymentMethod !== "cod" && (
                <Alert variant="warning" className="mt-3 mb-0 small">
                  ⚠️ Online payment gateway coming soon. For now, your order
                  will be placed as Cash on Delivery.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ===== RIGHT: BILLING SUMMARY ===== */}
        <Col lg={4}>
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
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>

            {formErrors.submit && (
              <Alert variant="danger" className="mt-3 mb-0 small">
                {formErrors.submit}
              </Alert>
            )}

            <Button
              variant="dark"
              size="lg"
              className="w-100 mt-3 checkout-place-btn"
              onClick={handlePlaceOrder}
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
        </Col>
      </Row>
    </Container>
  );
}
