import { Row, Col, Card, Button, Modal } from "react-bootstrap";

export default function OfferDetailsModal({ offer, onHide }) {
  if (!offer) return null;

  return (
    <Modal
      show={!!offer}
      onHide={onHide}
      centered
      size="lg"
      className="offer-modal"
    >
      <Modal.Header closeButton className="offer-modal-header">
        <Modal.Title className="offer-modal-title">
          🎁 {offer.title || "Offer Details"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="offer-modal-body">
        {offer.description && (
          <p className="offer-modal-desc">{offer.description}</p>
        )}
        {offer.condition_type && (
          <div className="offer-condition-badge">
            {offer.condition_type === "MinOrderValue"
              ? `🛒 Minimum order of ₹${offer.condition_value}`
              : `${offer.condition_type}: ${offer.condition_value}`}
          </div>
        )}

        {offer.offeritems && offer.offeritems.length > 0 && (
          <>
            <h6 className="offer-items-heading">Free items you'll receive</h6>
            <Row xs={2} md={3} lg={4} className="g-3">
              {offer.offeritems.map((item) => (
                <Col key={item.id}>
                  <Card className="offer-item-card">
                    <div className="offer-item-img-wrap">
                      <Card.Img
                        variant="top"
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="offer-item-img"
                      />
                    </div>
                    <Card.Body className="p-2">
                      <div className="offer-item-name">{item.name}</div>
                      <div className="offer-item-pricing">
                        <span className="offer-item-free">FREE</span>
                        {item.mrp && (
                          <span className="offer-item-mrp">
                            ₹{parseFloat(item.mrp).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
