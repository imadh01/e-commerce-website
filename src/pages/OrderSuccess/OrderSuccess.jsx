import { Container, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  usePageTitle("Order Confirmed");
  const { orderId } = useParams();

  return (
    <Container className="order-success-page py-5">
      <div className="order-success-content">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p className="text-muted">
          Thank you for your order. We'll start preparing it right away.
        </p>

        <div className="order-id-box">
          <span className="text-muted">Order Number</span>
          <strong>{orderId}</strong>
        </div>

        <div className="d-flex gap-3 justify-content-center mt-4">
          <Button as={Link} to="/" variant="dark" size="lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    </Container>
  );
}
