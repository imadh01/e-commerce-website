import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./AuthPromptModal.css";

export default function AuthPromptModal({ show, onHide }) {
  const navigate = useNavigate();

  function handleSignIn() {
    onHide();
    navigate("/login", { state: { from: "/" } });
  }

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Body className="auth-prompt-body">
        <div className="auth-prompt-icon">🔒</div>
        <h5 className="auth-prompt-title">Sign in required</h5>
        <p className="text-muted small">
          Please sign in to add items to your cart and start shopping.
        </p>
        <div className="d-flex flex-column gap-2 mt-3">
          <Button variant="dark" onClick={handleSignIn} className="fw-bold">
            Sign In
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Continue Browsing
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
