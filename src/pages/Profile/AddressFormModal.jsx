import { Row, Col, Form, Button, Alert, Spinner, Modal } from "react-bootstrap";

export default function AddressFormModal({
  show,
  onHide,
  editingAddress,
  addressForm,
  addressErrors,
  isSaving,
  locationsLoading,
  onAddressChange,
  onLocalitySelect,
  allLocalities,
  onSave,
  addresses,
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="profile-modal"
    >
      <Modal.Header closeButton className="profile-modal-header">
        <Modal.Title className="fw-bold">
          {editingAddress ? "Edit Address" : "Add New Address"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {locationsLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading...
          </div>
        ) : (
          <Row className="g-3">
            <Col xs={12}>
              <div className="address-type-selector">
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`address-type-btn ${addressForm.addressType === t ? "active" : ""}`}
                    onClick={() => onAddressChange("addressType", t)}
                  >
                    {t === "Home" ? "🏠" : t === "Work" ? "🏢" : "📍"} {t}
                  </button>
                ))}
              </div>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="profile-label">
                  Address Line 1 *
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="House/Flat No., Building, Street"
                  value={addressForm.addressLine1}
                  onChange={(e) =>
                    onAddressChange("addressLine1", e.target.value)
                  }
                  isInvalid={!!addressErrors.addressLine1}
                  className="profile-input"
                />
                <Form.Control.Feedback type="invalid">
                  {addressErrors.addressLine1}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="profile-label">
                  Address Line 2
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Floor, Wing (optional)"
                  value={addressForm.addressLine2}
                  onChange={(e) =>
                    onAddressChange("addressLine2", e.target.value)
                  }
                  className="profile-input"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="profile-label">Landmark</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Near bus stop, etc."
                  value={addressForm.landmark}
                  onChange={(e) => onAddressChange("landmark", e.target.value)}
                  className="profile-input"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Locality *</Form.Label>
                <Form.Select
                  value={addressForm.localityId}
                  onChange={(e) => onLocalitySelect(e.target.value)}
                  isInvalid={!!addressErrors.locality}
                  className="profile-input"
                >
                  <option value="">Select Locality</option>
                  {allLocalities.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {addressErrors.locality}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Taluk</Form.Label>
                <Form.Control
                  type="text"
                  value={addressForm.taluk}
                  readOnly
                  className="profile-input bg-light"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">District</Form.Label>
                <Form.Control
                  type="text"
                  value={addressForm.district}
                  readOnly
                  className="profile-input bg-light"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">State</Form.Label>
                <Form.Control
                  type="text"
                  value={addressForm.state}
                  readOnly
                  className="profile-input bg-light"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Country</Form.Label>
                <Form.Control
                  type="text"
                  value={addressForm.country}
                  readOnly
                  className="profile-input bg-light"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Postal Code</Form.Label>
                <Form.Control
                  type="text"
                  value={addressForm.postalCode}
                  readOnly
                  className="profile-input bg-light"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <div className="default-toggle">
                <span>Make this address default</span>
                <Form.Check
                  type="switch"
                  id="profile-default-switch"
                  checked={addressForm.isDefault}
                  disabled={
                    editingAddress?.IsDefault === 1 && addresses.length > 0
                  }
                  onChange={(e) =>
                    onAddressChange("isDefault", e.target.checked)
                  }
                />
              </div>
              {editingAddress?.IsDefault === 1 && addresses.length > 1 && (
                <p className="text-muted small mt-1 mb-0">
                  To change default, set another address as default first.
                </p>
              )}
            </Col>

            {addressErrors.submit && (
              <Col xs={12}>
                <Alert variant="danger" className="mb-0 small">
                  {addressErrors.submit}
                </Alert>
              </Col>
            )}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className="profile-modal-footer">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          className="profile-save-btn"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            "Save Address"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
