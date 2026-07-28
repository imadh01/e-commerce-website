import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container className="text-center py-5">
      <div style={{ fontSize: "5rem", marginBottom: "16px" }}>🛒</div>
      <h1 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
        Page Not Found
      </h1>
      <p className="text-muted mt-2">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button
        as={Link}
        to="/"
        size="lg"
        className="mt-3"
        style={{
          background: "var(--brand-orange)",
          border: "none",
          fontWeight: 700,
        }}
      >
        Back to Home
      </Button>
    </Container>
  );
}
