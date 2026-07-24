import { useState, useEffect } from "react";
import { Container, Card, Spinner, Badge, Button } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import { fetchDeliveryTracking } from "../../api/orderApi";
import "./OrderTracking.css";

const STATUS_ICONS = {
  "Order Placed": "📋",
  Confirmed: "✅",
  Packed: "📦",
  "Out for Delivery": "🚚",
  Delivered: "🎉",
  Cancelled: "❌",
};

export default function OrderTracking() {
  usePageTitle("Track Order");
  const { orderId } = useParams();
  const [tracking, setTracking] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || orderId === "0") {
      setIsLoading(false);
      return;
    }

    async function loadTracking() {
      try {
        const data = await fetchDeliveryTracking(orderId);
        setTracking(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadTracking();
  }, [orderId]);

  return (
    <div className="tracking-page">
      <div className="tracking-hero">
        <Container>
          <div className="tracking-hero-content">
            <div>
              <h1 className="tracking-hero-title">Track Order</h1>
              <p className="tracking-hero-sub">Order #{orderId}</p>
            </div>
            <Link to="/orders" className="tracking-back-link">
              ← Back to Orders
            </Link>
          </div>
        </Container>
      </div>

      <Container className="tracking-content py-4">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner
              animation="border"
              style={{ color: "var(--brand-orange)" }}
            />
            <p className="text-muted mt-3">Loading tracking details...</p>
          </div>
        ) : error ? (
          <Card className="tracking-card">
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😕</div>
              <h3 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
                Something went wrong
              </h3>
              <p className="text-muted mt-2">{error}</p>
              <Button
                className="tracking-action-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Card.Body>
          </Card>
        ) : tracking.length === 0 ? (
          <Card className="tracking-card">
            <Card.Body className="text-center py-5">
              <div className="tracking-empty-icon">📡</div>
              <h3 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
                No tracking info available
              </h3>
              <p className="text-muted mt-2">
                Tracking details will appear once your order is processed.
              </p>
              <Link
                to="/orders"
                className="tracking-action-btn d-inline-block mt-3"
              >
                View My Orders
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <div className="tracking-layout">
            {/* Delivery Person Info */}
            {tracking[0]?.DeliveryPerson && (
              <Card className="tracking-card tracking-person-card">
                <Card.Body className="p-4">
                  <div className="tp-header">
                    <div className="tp-avatar">🧑‍💼</div>
                    <div className="tp-info">
                      <div className="tp-name">
                        {tracking[0].DeliveryPerson}
                      </div>
                      <div className="tp-role">Delivery Partner</div>
                    </div>
                    {tracking[0].MobileNumber && (
                      <a
                        href={`tel:${tracking[0].MobileNumber}`}
                        className="tp-call-btn"
                      >
                        📞 Call
                      </a>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Current Status */}
            <Card className="tracking-card tracking-status-card">
              <Card.Body className="p-4">
                <div className="ts-current">
                  <span className="ts-current-icon">
                    {STATUS_ICONS[tracking[0]?.Status] || "📋"}
                  </span>
                  <div>
                    <div className="ts-current-status">
                      {tracking[0]?.Status || "Processing"}
                    </div>
                    <div className="ts-current-message">
                      {tracking[0]?.StatusMessage || ""}
                    </div>
                  </div>
                </div>
                {tracking[0]?.Location && (
                  <div className="ts-location">
                    <span className="ts-location-icon">📍</span>
                    <span>{tracking[0].Location}</span>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Timeline */}
            <Card className="tracking-card">
              <Card.Body className="p-4">
                <h5 className="tracking-section-title">Tracking History</h5>
                <div className="tracking-timeline-v2">
                  {tracking.map((entry, i) => {
                    const isFirst = i === 0;
                    const time = new Date(entry.TrackingTime);
                    const dateStr = time.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    });
                    const timeStr = time.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <div
                        key={entry.DeliveryTrackingID}
                        className={`tl-entry ${isFirst ? "tl-active" : ""}`}
                      >
                        <div className="tl-dot-wrap">
                          <div className="tl-dot" />
                          {i < tracking.length - 1 && (
                            <div className="tl-connector" />
                          )}
                        </div>
                        <div className="tl-content">
                          <div className="tl-header">
                            <span className="tl-status">{entry.Status}</span>
                            <span className="tl-time">
                              {dateStr} · {timeStr}
                            </span>
                          </div>
                          {entry.StatusMessage && (
                            <p className="tl-message">{entry.StatusMessage}</p>
                          )}
                          {entry.Location && (
                            <p className="tl-location">📍 {entry.Location}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
