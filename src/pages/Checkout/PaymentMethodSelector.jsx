import { Card, Form } from "react-bootstrap";

export default function PaymentMethodSelector({ paymentMode, setPaymentMode }) {
  return (
    <Card className="checkout-card">
      <Card.Body>
        <h5 className="checkout-section-title">
          <span className="section-number">5</span>
          Payment Method
        </h5>

        <Form.Group>
          <Form.Label className="checkout-label">
            Select Payment Method *
          </Form.Label>
          <Form.Select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
          </Form.Select>
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
