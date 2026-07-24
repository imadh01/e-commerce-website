import { useState, useEffect } from "react";
import { Container, Card, Badge, Spinner, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { fetchCustomerOrders } from "../../api/orderApi";
import "./Orders.css";

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
      <Container className="orders-page py-5">
        <div className="text-center py-5">
          <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
            Please sign in
          </h2>
          <p className="text-muted mt-2">
            You need to be logged in to view your orders.
          </p>
          <Button
            as={Link}
            to="/login"
            variant="dark"
            size="lg"
            className="mt-3"
          >
            Sign In
          </Button>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="orders-page py-5">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="text-muted mt-3">Loading orders...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="orders-page py-5">
        <div className="text-center py-5">
          <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
            Something went wrong
          </h2>
          <p className="text-muted mt-2">{error}</p>
          <Button variant="dark" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="orders-page py-4">
      <h1 className="orders-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p className="text-muted">Start shopping to see your orders here.</p>
          <Button as={Link} to="/" variant="dark" size="lg" className="mt-3">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusColor =
              order.Status === "Delivered"
                ? "success"
                : order.Status === "Pending"
                  ? "warning"
                  : order.Status === "Cancelled"
                    ? "danger"
                    : order.Status === "Confirmed"
                      ? "info"
                      : "secondary";

            return (
              <Card key={order.SalesOrderID} className="order-card">
                <Card.Body>
                  <div className="order-card-header">
                    <div>
                      <span className="order-number">{order.OrderNumber}</span>
                      <span className="order-date">
                        {new Date(order.OrderDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge bg={statusColor} className="order-status-badge">
                      {order.Status}
                    </Badge>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-preview">
                      {order.Items &&
                        order.Items.slice(0, 3).map((item) => (
                          <div
                            key={item.SalesOrderItemID}
                            className="order-item-row"
                          >
                            <span className="order-item-name">
                              {item.ItemName}
                            </span>
                            <span className="order-item-qty">
                              x{item.Quantity}
                            </span>
                            <span className="order-item-price">
                              ₹{parseFloat(item.LineTotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      {order.Items && order.Items.length > 3 && (
                        <p className="text-muted small mb-0">
                          +{order.Items.length - 3} more item
                          {order.Items.length - 3 > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-total">
                        <span className="text-muted">Total</span>
                        <span className="order-total-amount">
                          ₹{parseFloat(order.TotalAmount).toFixed(2)}
                        </span>
                      </div>
                      <div className="order-actions">
                        <Link
                          to={`/order-tracking/${order.SalesOrderID}`}
                          className="order-track-btn"
                        >
                          Track Order
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
