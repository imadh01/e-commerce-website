import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { fetchCustomerOrders } from "../../api/orderApi";
import "./Orders.css";

const STATUS_CONFIG = {
  Delivered: {
    bg: "success",
    color: "#059669",
    bgLight: "#ecfdf5",
    icon: "✅",
  },
  Confirmed: { bg: "info", color: "#0284c7", bgLight: "#e0f2fe", icon: "📋" },
  Pending: { bg: "warning", color: "#d97706", bgLight: "#fef3c7", icon: "⏳" },
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

export default function Orders() {
  usePageTitle("My Orders");
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.UserID) return;
    async function loadOrders() {
      try {
        const data = await fetchCustomerOrders(user.UserID);
        setOrders(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  if (!isLoggedIn) {
    return (
      <div className="orders-page">
        <div className="orders-hero">
          <Container>
            <h1 className="orders-hero-title">My Orders</h1>
          </Container>
        </div>
        <Container className="py-5">
          <div className="text-center py-5">
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
            <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
              Please sign in
            </h2>
            <p className="text-muted mt-2">
              You need to be logged in to view your orders.
            </p>
            <Button as={Link} to="/login" className="orders-action-btn mt-3">
              Sign In
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-hero">
        <Container>
          <div className="orders-hero-content">
            <div>
              <h1 className="orders-hero-title">My Orders</h1>
              <p className="orders-hero-sub">Track and manage your purchases</p>
            </div>
            <Link to="/profile" className="orders-back-link">
              ← Back to Profile
            </Link>
          </div>
        </Container>
      </div>

      <Container className="orders-content py-4">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner
              animation="border"
              style={{ color: "var(--brand-orange)" }}
            />
            <p className="text-muted mt-3">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😕</div>
            <h3 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
              Something went wrong
            </h3>
            <p className="text-muted mt-2">{error}</p>
            <Button
              className="orders-action-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <Card className="orders-empty-card">
            <Card.Body className="text-center py-5">
              <div className="orders-empty-icon">🛒</div>
              <h3 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
                No orders yet
              </h3>
              <p className="text-muted">
                Start shopping to see your orders here.
              </p>
              <Button as={Link} to="/" className="orders-action-btn mt-3">
                Browse Products
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="orders-summary-bar">
              <span className="orders-count">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>

            <Row className="g-4">
              {orders.map((order) => {
                const sc = getStatusConfig(order.Status);
                const orderDate = new Date(order.OrderDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                );
                const orderTime = order.OrderTime
                  ? new Date(
                      `2000-01-01T${order.OrderTime}`,
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "";

                return (
                  <Col md={6} lg={4} key={order.SalesOrderID}>
                    <Card
                      className="order-card-v2"
                      style={{ borderTop: `4px solid ${sc.color}` }}
                    >
                      <Card.Body className="p-0">
                        <div
                          className="oc-header"
                          style={{ background: sc.bgLight }}
                        >
                          <div className="oc-header-left">
                            <span className="oc-icon">{sc.icon}</span>
                            <div>
                              <div className="oc-order-number">
                                {order.OrderNumber}
                              </div>
                              <div className="oc-order-date">
                                {orderDate}
                                {orderTime && ` · ${orderTime}`}
                              </div>
                            </div>
                          </div>
                          <Badge bg={sc.bg} className="oc-status-badge">
                            {order.Status}
                          </Badge>
                        </div>

                        <div className="oc-footer">
                          <div className="oc-total">
                            <span className="oc-total-label">Total</span>
                            <span className="oc-total-amount">
                              ₹{parseFloat(order.TotalAmount).toFixed(2)}
                            </span>
                          </div>
                          {order.PaymentMode && (
                            <span className="oc-payment">
                              {order.PaymentMode}
                            </span>
                          )}
                        </div>

                        <div className="oc-actions">
                          <Link
                            to={`/order-details/${order.SalesOrderID}`}
                            state={{ order }}
                            className="oc-view-btn"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/order-tracking/${order.SalesOrderID}`}
                            className="oc-track-btn"
                          >
                            🚚 Track
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}
