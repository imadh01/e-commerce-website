import { Row, Col, Card, Form, Alert } from "react-bootstrap";
import { getTimeSlots } from "../../utils/deliverySlots";

export default function DeliverySchedulePicker({
  deliveryDate,
  setDeliveryDate,
  deliveryTime,
  setDeliveryTime,
  deliveryDates,
  formErrors,
}) {
  return (
    <Card className="checkout-card">
      <Card.Body>
        <h5 className="checkout-section-title">
          <span className="section-number">3</span>
          Scheduled Delivery
        </h5>

        <Alert variant="info" className="checkout-schedule-note">
          🕖 Orders placed after 7 PM will be scheduled for the next day.
        </Alert>

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="checkout-label">
                Delivery Date *
              </Form.Label>
              <Form.Select
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                isInvalid={!!formErrors.deliveryDate}
              >
                <option value="">Select date</option>
                {deliveryDates.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.deliveryDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="checkout-label">Time Slot</Form.Label>
              <Form.Select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              >
                <option value="">Select time slot</option>
                {getTimeSlots(deliveryDate).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
