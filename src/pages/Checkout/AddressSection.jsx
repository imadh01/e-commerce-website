import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";

export default function AddressSection({
  savedAddresses,
  selectedAddressId,
  showNewAddressForm,
  address,
  formErrors,
  locationsLoading,
  onSelectSavedAddress,
  onAddNewAddress,
  onAddressChange,
  onLocalitySelect,
  allLocalities,
}) {
  return (
    <Card className="checkout-card">
      <Card.Body>
        <h5 className="checkout-section-title">
          <span className="section-number">1</span>
          Delivery Address
        </h5>

        {/* Saved addresses (existing users) */}
        {savedAddresses.length > 0 && (
          <>
            <div className="saved-addresses">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.AddressID}
                  className={`saved-address-card ${
                    selectedAddressId === addr.AddressID && !showNewAddressForm
                      ? "active"
                      : ""
                  }`}
                  onClick={() => onSelectSavedAddress(addr.AddressID)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectSavedAddress(addr.AddressID);
                    }
                  }}
                >
                  <div className="saved-address-header">
                    <Badge
                      bg={addr.IsDefault ? "warning" : "secondary"}
                      text="dark"
                    >
                      {addr.AddressType || "Address"}
                    </Badge>
                    {addr.IsDefault === 1 && (
                      <span className="default-tag">Default</span>
                    )}
                  </div>
                  <div className="saved-address-radio">
                    <div
                      className={`address-radio ${
                        selectedAddressId === addr.AddressID &&
                        !showNewAddressForm
                          ? "checked"
                          : ""
                      }`}
                    />
                  </div>
                  <p className="saved-address-text">
                    {addr.AddressLine1}
                    {addr.AddressLine2 && `, ${addr.AddressLine2}`}
                    {addr.Landmark && `, ${addr.Landmark}`}
                  </p>
                  <p className="saved-address-text text-muted">
                    {[addr.Locality, addr.District, addr.State]
                      .filter(Boolean)
                      .join(", ")}
                    {addr.PostalCode && ` - ${addr.PostalCode}`}
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant={showNewAddressForm ? "dark" : "outline-dark"}
              size="sm"
              className="mt-3"
              onClick={onAddNewAddress}
            >
              + Add New Address
            </Button>

            {formErrors.address && (
              <Alert variant="danger" className="mt-3 small mb-0">
                {formErrors.address}
              </Alert>
            )}
          </>
        )}

        {/* New address form */}
        {(showNewAddressForm || savedAddresses.length === 0) && (
          <div className={savedAddresses.length > 0 ? "mt-4" : ""}>
            {locationsLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading locations...
              </div>
            ) : (
              <Row className="g-3">
                {/* Address Type */}
                <Col xs={12}>
                  <div className="address-type-selector">
                    {["Home", "Work", "Other"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`address-type-btn ${
                          address.addressType === type ? "active" : ""
                        }`}
                        onClick={() => onAddressChange("addressType", type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Col>

                {/* Address Line 1 */}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Address Line 1 *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="House/Flat No., Building, Street"
                      value={address.addressLine1}
                      onChange={(e) =>
                        onAddressChange("addressLine1", e.target.value)
                      }
                      isInvalid={!!formErrors.addressLine1}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.addressLine1}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Address Line 2 */}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Address Line 2
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Floor, Wing (optional)"
                      value={address.addressLine2}
                      onChange={(e) =>
                        onAddressChange("addressLine2", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                {/* Landmark */}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="checkout-label">Landmark</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Near bus stop, temple, etc."
                      value={address.landmark}
                      onChange={(e) =>
                        onAddressChange("landmark", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                {/* Locality — user picks this, everything else auto-fills */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Locality *
                    </Form.Label>
                    <Form.Select
                      value={address.localityId}
                      onChange={(e) => onLocalitySelect(e.target.value)}
                      isInvalid={!!formErrors.locality}
                    >
                      <option value="">Select Locality</option>
                      {allLocalities.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.locality}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Taluk — auto-filled, read-only */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">Taluk</Form.Label>
                    <Form.Control
                      type="text"
                      value={address.taluk}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>

                {/* District — auto-filled, read-only */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">District</Form.Label>
                    <Form.Control
                      type="text"
                      value={address.district}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>

                {/* State — auto-filled, read-only */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">State</Form.Label>
                    <Form.Control
                      type="text"
                      value={address.state}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>

                {/* Country — auto-filled, read-only */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">Country</Form.Label>
                    <Form.Control
                      type="text"
                      value={address.country}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>

                {/* Postal Code — auto-filled, read-only */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="checkout-label">
                      Postal Code
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={address.postalCode}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>

                {/* Default address toggle */}
                {savedAddresses.length > 0 && (
                  <Col xs={12}>
                    <div className="default-address-toggle">
                      <span>Make this address default</span>
                      <Form.Check
                        type="switch"
                        id="default-address-switch"
                        checked={address.isDefault}
                        onChange={(e) =>
                          onAddressChange("isDefault", e.target.checked)
                        }
                      />
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
