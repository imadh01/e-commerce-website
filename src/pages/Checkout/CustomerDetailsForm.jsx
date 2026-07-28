import { Row, Col, Card, Form } from "react-bootstrap";

export default function CustomerDetailsForm({
  customerName,
  setCustomerName,
  familyName,
  setFamilyName,
  secondaryMobile,
  setSecondaryMobile,
  email,
  setEmail,
  formErrors,
  clearError,
}) {
  return (
    <Card className="checkout-card">
      <Card.Body>
        <h5 className="checkout-section-title">
          <span className="section-number">•</span>
          Your Details
        </h5>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="checkout-label">Full Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="John"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  clearError("customerName");
                }}
                isInvalid={!!formErrors.customerName}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.customerName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="checkout-label">Family Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Doe"
                value={familyName}
                onChange={(e) => {
                  setFamilyName(e.target.value);
                  clearError("familyName");
                }}
                isInvalid={!!formErrors.familyName}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.familyName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="checkout-label">
                Secondary Phone
              </Form.Label>
              <Form.Control
                type="tel"
                placeholder="Optional"
                value={secondaryMobile}
                onChange={(e) => setSecondaryMobile(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="checkout-label">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
