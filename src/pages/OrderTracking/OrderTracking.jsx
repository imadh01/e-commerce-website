import { Container, Card } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import "./OrderTracking.css";

export default function OrderTracking() {
  usePageTitle("Track Order");
  const { orderId } = useParams();

  // Placeholder — will integrate with real API later
  const steps = [
    { label: "Order Placed", done: true },
    { label: "Confirmed", done: true },
    { label: "Packed", done: false },
    { label: "Out for Delivery", done: false },
    { label: "Delivered", done: false },
  ];

  return (
    <Container className="tracking-page py-4">
      <h1 className="tracking-title">Track Order</h1>

      <Card className="tracking-card">
        <Card.Body>
          <div className="tracking-header">
            <div>
              <span className="tracking-order-id">Order #{orderId}</span>
            </div>
            <Link to="/orders" className="tracking-back">
              ← Back to Orders
            </Link>
          </div>

          <div className="tracking-timeline">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`tracking-step ${step.done ? "done" : ""}`}
              >
                <div className="tracking-dot" />
                {i < steps.length - 1 && <div className="tracking-line" />}
                <span className="tracking-label">{step.label}</span>
              </div>
            ))}
          </div>

          <p className="text-muted text-center mt-4">
            Detailed tracking will be available once integrated with the
            backend.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
