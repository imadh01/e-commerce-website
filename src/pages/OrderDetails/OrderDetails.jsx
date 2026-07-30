import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Spinner,
  Badge,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import { useParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { fetchCustomerOrders } from "../../api/orderApi";
import "./OrderDetails.css";

const STATUS_CONFIG = {
  Delivered: {
    bg: "success",
    color: "#059669",
    bgLight: "#ecfdf5",
    icon: "✅",
  },
  Confirmed: { bg: "info", color: "#0284c7", bgLight: "#e0f2fe", icon: "📋" },
  Pending: { bg: "warning", color: "#d97706", bgLight: "#fef3c7", icon: "⏳" },
  "Bill Prepared": {
    bg: "info",
    color: "#0284c7",
    bgLight: "#e0f2fe",
    icon: "🧾",
  },
  "Out for Delivery": {
    bg: "primary",
    color: "#2563eb",
    bgLight: "#dbeafe",
    icon: "🚚",
  },
  Packed: { bg: "secondary", color: "#6b7280", bgLight: "#f3f4f6", icon: "📦" },
  Cancelled: { bg: "danger", color: "#dc2626", bgLight: "#fef2f2", icon: "❌" },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      bg: "secondary",
      color: "#6b7280",
      bgLight: "#f3f4f6",
      icon: "📋",
    }
  );
}

export default function OrderDetails() {
  usePageTitle("Order Details");
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [order, setOrder] = useState(location.state?.order || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.UserID) {
      setIsLoading(false);
      return;
    }

    // Always fetch fresh from API to ensure Items array is populated
    async function loadOrder() {
      try {
        const orders = await fetchCustomerOrders(user.UserID);
        const match = (orders || []).find(
          (o) => String(o.SalesOrderID) === String(orderId),
        );
        if (match) {
          setOrder(match);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId, user?.UserID]);

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="od-page">
        <div className="od-hero">
          <Container>
            <h1 className="od-hero-title">Order Details</h1>
          </Container>
        </div>
        <Container className="py-5 text-center">
          <Spinner
            animation="border"
            style={{ color: "var(--brand-orange)" }}
          />
          <p className="text-muted mt-3">Loading order details...</p>
        </Container>
      </div>
    );
  }

  // ===== ERROR =====
  if (error) {
    return (
      <div className="od-page">
        <div className="od-hero">
          <Container>
            <div className="od-hero-content">
              <h1 className="od-hero-title">Order Details</h1>
              <Link to="/orders" className="od-back-link">
                ← Back to Orders
              </Link>
            </div>
          </Container>
        </div>
        <Container className="py-5">
          <Card className="od-card">
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😕</div>
              <h3 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
                Something went wrong
              </h3>
              <p className="text-muted mt-2">{error}</p>
              <Button
                className="od-action-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  // ===== NOT FOUND =====
  if (!order) {
    return (
      <div className="od-page">
        <div className="od-hero">
          <Container>
            <div className="od-hero-content">
              <h1 className="od-hero-title">Order Details</h1>
              <Link to="/orders" className="od-back-link">
                ← Back to Orders
              </Link>
            </div>
          </Container>
        </div>
        <Container className="py-5">
          <Card className="od-card">
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
              <h3 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
                Order not found
              </h3>
              <p className="text-muted mt-2">
                We couldn't find this order. It may have been removed.
              </p>
              <Button as={Link} to="/orders" className="od-action-btn mt-3">
                View All Orders
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  // ===== RENDER =====
  const sc = getStatusConfig(order.Status);
  const orderDate = new Date(order.OrderDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const orderTime = order.OrderTime
    ? new Date(`2000-01-01T${order.OrderTime}`).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const items = order.Items || [];
  const totalAmount = parseFloat(order.TotalAmount || 0);
  const subTotal = parseFloat(order.SubTotal || 0);
  const deliveryCharge = parseFloat(order.DeliveryCharge || 0);
  const discount = parseFloat(order.Discount || 0);
  const taxTotal = parseFloat(order.TaxTotal || 0);

  return (
    <div className="od-page">
      <div className="od-hero">
        <Container>
          <div className="od-hero-content">
            <div>
              <h1 className="od-hero-title">Order Details</h1>
              <p className="od-hero-sub">
                {order.OrderNumber} · {orderDate}
                {orderTime && ` · ${orderTime}`}
              </p>
            </div>
            <Link to="/orders" className="od-back-link">
              ← Back to Orders
            </Link>
          </div>
        </Container>
      </div>

      <Container className="od-content py-4">
        <Row className="g-4">
          <Col lg={8}>
            {/* Status card */}
            <Card className="od-card mb-4">
              <Card.Body
                className="od-status-bar"
                style={{ background: sc.bgLight }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: "1.6rem" }}>{sc.icon}</span>
                  <div>
                    <div className="od-status-label">Order Status</div>
                    <Badge bg={sc.bg} className="od-status-badge">
                      {order.Status}
                    </Badge>
                  </div>
                </div>
                <Link
                  to={`/order-tracking/${order.SalesOrderID}`}
                  className="od-track-link"
                >
                  🚚 Track Order
                </Link>
              </Card.Body>
            </Card>

            {/* Items list */}
            <Card className="od-card">
              <Card.Body className="p-0">
                <div className="od-section-header">
                  <h3 className="od-section-title">Order Items</h3>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No item details available for this order.
                  </div>
                ) : (
                  <div className="od-items-list">
                    {items.map((item, index) => {
                      const name = item.ItemName || "Item";
                      const code = item.ItemCode || "";
                      const unitPrice = parseFloat(item.UnitPrice || 0);
                      const mrp = parseFloat(item.MRP || 0);
                      const qty = parseInt(item.Quantity || 0, 10);
                      const lineTotal = parseFloat(
                        item.LineTotal || unitPrice * qty,
                      );
                      const itemDiscount = parseFloat(item.Discount || 0);

                      return (
                        <div
                          className="od-item"
                          key={item.SalesOrderItemID || index}
                        >
                          <div className="od-item-image-wrap">
                            <div className="od-item-image-placeholder">📦</div>
                          </div>
                          <div className="od-item-info">
                            <div className="od-item-name">{name}</div>
                            {code && <div className="od-item-code">{code}</div>}
                            <div className="od-item-pricing">
                              <span className="od-item-price">
                                ₹{unitPrice.toFixed(2)}
                              </span>
                              {mrp > 0 && mrp > unitPrice && (
                                <span className="od-item-mrp">
                                  ₹{mrp.toFixed(2)}
                                </span>
                              )}
                              <span className="od-item-qty">× {qty}</span>
                              {itemDiscount > 0 && (
                                <span className="od-item-discount-tag">
                                  −₹{itemDiscount.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {item.BatchNumber && (
                              <div className="od-item-batch">
                                Batch: {item.BatchNumber}
                              </div>
                            )}
                          </div>
                          <div className="od-item-total">
                            ₹{lineTotal.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Order summary */}
            <Card className="od-card mb-4">
              <Card.Body>
                <h3 className="od-section-title mb-3">Order Summary</h3>
                <div className="od-summary-rows">
                  {subTotal > 0 && (
                    <div className="od-summary-row">
                      <span>Subtotal</span>
                      <span>₹{subTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="od-summary-row od-discount-row">
                      <span>Discount</span>
                      <span>−₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxTotal > 0 && (
                    <div className="od-summary-row">
                      <span>Tax</span>
                      <span>₹{taxTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryCharge > 0 && (
                    <div className="od-summary-row">
                      <span>Delivery</span>
                      <span>₹{deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="od-summary-row od-total-row">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                {order.PaymentMode && (
                  <div className="od-payment-mode">
                    <span className="od-payment-label">Payment</span>
                    <span className="od-payment-value">
                      {order.PaymentMode}
                    </span>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Delivery schedule */}
            {(order.DeliveryDate || order.DeliveryTimeSlot) && (
              <Card className="od-card mb-4">
                <Card.Body>
                  <h3 className="od-section-title mb-3">Delivery Schedule</h3>
                  {order.DeliveryDate && (
                    <div className="od-info-row">
                      <span className="od-info-label">📅 Date</span>
                      <span className="od-info-value">
                        {new Date(order.DeliveryDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                  {order.DeliveryTimeSlot && (
                    <div className="od-info-row">
                      <span className="od-info-label">⏰ Time</span>
                      <span className="od-info-value">
                        {order.DeliveryTimeSlot}
                      </span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {order.DeliveryInstructions && (
              <Card className="od-card mb-4">
                <Card.Body>
                  <h3 className="od-section-title mb-2">Delivery Notes</h3>
                  <p className="od-delivery-note">
                    {order.DeliveryInstructions}
                  </p>
                </Card.Body>
              </Card>
            )}

            {order.Remarks && (
              <Card className="od-card">
                <Card.Body>
                  <h3 className="od-section-title mb-2">Remarks</h3>
                  <p className="od-delivery-note">{order.Remarks}</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
