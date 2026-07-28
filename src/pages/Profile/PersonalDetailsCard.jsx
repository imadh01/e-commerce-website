import { Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";

export default function PersonalDetailsCard({
  user,
  profile,
  isEditing,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onChange,
}) {
  return (
    <Card className="profile-card">
      <Card.Body className="p-4">
        <div className="profile-card-header">
          <div className="profile-card-title-wrap">
            <span className="profile-card-icon">👤</span>
            <h5 className="profile-section-title">Personal Details</h5>
          </div>
          {!isEditing ? (
            <Button
              variant="outline-dark"
              size="sm"
              className="profile-edit-btn"
              onClick={onStartEdit}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className="profile-save-btn"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <Row className="g-3 mt-1">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={profile.CustomerName}
                  onChange={(e) => onChange("CustomerName", e.target.value)}
                  className="profile-input"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Family Name</Form.Label>
                <Form.Control
                  type="text"
                  value={profile.FamilyName}
                  onChange={(e) => onChange("FamilyName", e.target.value)}
                  className="profile-input"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">
                  Phone (Primary)
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={profile.PrimaryMobile}
                  disabled
                  className="profile-input bg-light"
                />
                <Form.Text className="text-muted">Cannot be changed</Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">
                  Phone (Secondary)
                </Form.Label>
                <Form.Control
                  type="tel"
                  value={profile.SecondaryMobile}
                  onChange={(e) => onChange("SecondaryMobile", e.target.value)}
                  placeholder="Optional"
                  className="profile-input"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={profile.Email}
                  onChange={(e) => onChange("Email", e.target.value)}
                  placeholder="john@example.com"
                  className="profile-input"
                />
              </Form.Group>
            </Col>
          </Row>
        ) : (
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Full Name</span>
              <span className="profile-info-value">
                {user.CustomerName || "—"}
              </span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Family Name</span>
              <span className="profile-info-value">
                {user.FamilyName || "—"}
              </span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Phone</span>
              <span className="profile-info-value">
                +91 {user.PrimaryMobile || "—"}
              </span>
            </div>
            {user.SecondaryMobile && (
              <div className="profile-info-item">
                <span className="profile-info-label">Secondary Phone</span>
                <span className="profile-info-value">
                  +91 {user.SecondaryMobile}
                </span>
              </div>
            )}
            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{user.Email || "—"}</span>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
