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
  onSave,
  addresses,
  getCountries,
  getStates,
  getDistricts,
  getTaluks,
  getLocalities,
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
                <Form.Label className="profile-label">Country</Form.Label>
                <Form.Select
                  value={addressForm.countryId}
                  onChange={(e) => onAddressChange("countryId", e.target.value)}
                  className="profile-input"
                >
                  <option value="">Select Country</option>
                  {getCountries().map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">State *</Form.Label>
                <Form.Select
                  value={addressForm.stateId}
                  onChange={(e) => onAddressChange("stateId", e.target.value)}
                  isInvalid={!!addressErrors.state}
                  disabled={!addressForm.countryId}
                  className="profile-input"
                >
                  <option value="">Select State</option>
                  {getStates(addressForm.countryId).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {addressErrors.state}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">District *</Form.Label>
                <Form.Select
                  value={addressForm.districtId}
                  onChange={(e) =>
                    onAddressChange("districtId", e.target.value)
                  }
                  isInvalid={!!addressErrors.district}
                  disabled={!addressForm.stateId}
                  className="profile-input"
                >
                  <option value="">Select District</option>
                  {getDistricts(addressForm.stateId).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {addressErrors.district}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Taluk</Form.Label>
                <Form.Select
                  value={addressForm.talukId}
                  onChange={(e) => onAddressChange("talukId", e.target.value)}
                  disabled={!addressForm.districtId}
                  className="profile-input"
                >
                  <option value="">Select Taluk</option>
                  {getTaluks(addressForm.districtId).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="profile-label">Locality *</Form.Label>
                <Form.Select
                  value={addressForm.localityId}
                  onChange={(e) =>
                    onAddressChange("localityId", e.target.value)
                  }
                  isInvalid={!!addressErrors.locality}
                  disabled={!addressForm.talukId}
                  className="profile-input"
                >
                  <option value="">Select Locality</option>
                  {getLocalities(addressForm.talukId).map((l) => (
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
                <Form.Label className="profile-label">Postal Code</Form.Label>
                <Form.Control
                  type="text"
                  value={addressForm.postalCode}
                  onChange={(e) =>
                    onAddressChange("postalCode", e.target.value)
                  }
                  placeholder="Enter postal code"
                  maxLength={6}
                  className="profile-input"
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
