import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useLocationMaster } from "../../hooks/useLocationMaster";
import "./Profile.css";

export default function Profile() {
  usePageTitle("My Profile");
  const { user, isLoggedIn, saveCustomerDetails } = useAuth();
  const {
    isLoading: locationsLoading,
    getCountries,
    getStates,
    getDistricts,
    getTaluks,
    getLocalities,
  } = useLocationMaster();

  // ===== PERSONAL DETAILS STATE =====
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [profile, setProfile] = useState({
    CustomerName: "",
    FamilyName: "",
    PrimaryMobile: "",
    SecondaryMobile: "",
    Email: "",
  });

  // ===== ADDRESS MODAL STATE =====
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    addressType: "Home",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    countryId: 1,
    stateId: "",
    districtId: "",
    talukId: "",
    localityId: "",
    country: "India",
    state: "",
    district: "",
    taluk: "",
    locality: "",
    postalCode: "",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Load user data into form
  useEffect(() => {
    if (user) {
      setProfile({
        CustomerName: user.CustomerName || "",
        FamilyName: user.FamilyName || "",
        PrimaryMobile: user.PrimaryMobile || "",
        SecondaryMobile: user.SecondaryMobile || "",
        Email: user.Email || "",
      });
    }
  }, [user]);

  if (!isLoggedIn) {
    return (
      <Container className="profile-page py-5">
        <div className="text-center py-5">
          <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
            Please sign in
          </h2>
          <p className="text-muted mt-2">
            You need to be logged in to view your profile.
          </p>
          <Button
            as={Link}
            to="/login"
            variant="dark"
            size="lg"
            className="mt-3"
          >
            Sign In
          </Button>
        </div>
      </Container>
    );
  }

  const addresses = user?.Addresses || [];

  // ===== PERSONAL DETAILS HANDLERS =====
  function handleProfileChange(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setProfile({
      CustomerName: user.CustomerName || "",
      FamilyName: user.FamilyName || "",
      PrimaryMobile: user.PrimaryMobile || "",
      SecondaryMobile: user.SecondaryMobile || "",
      Email: user.Email || "",
    });
    setSaveMessage(null);
  }

  async function handleSaveProfile() {
    if (!profile.CustomerName.trim()) {
      setSaveMessage({ type: "danger", text: "Name is required" });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveCustomerDetails({
        CustomerName: profile.CustomerName.trim(),
        FamilyName: profile.FamilyName.trim(),
        SecondaryMobile: profile.SecondaryMobile.trim(),
        Email: profile.Email.trim(),
      });
      setIsEditing(false);
      setSaveMessage({ type: "success", text: "Profile updated successfully" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({
        type: "danger",
        text: err.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // ===== ADDRESS HANDLERS =====
  function handleAddressChange(field, value) {
    setAddressForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "countryId") {
        const country = getCountries().find(
          (c) => String(c.id) === String(value),
        );
        next.country = country?.name || "";
        next.stateId = "";
        next.state = "";
        next.districtId = "";
        next.district = "";
        next.talukId = "";
        next.taluk = "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }

      if (field === "stateId") {
        const state = getStates(prev.countryId).find(
          (s) => String(s.id) === String(value),
        );
        next.state = state?.name || "";
        next.districtId = "";
        next.district = "";
        next.talukId = "";
        next.taluk = "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }

      if (field === "districtId") {
        const district = getDistricts(prev.stateId).find(
          (d) => String(d.id) === String(value),
        );
        next.district = district?.name || "";
        next.talukId = "";
        next.taluk = "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }

      if (field === "talukId") {
        const taluk = getTaluks(prev.districtId).find(
          (t) => String(t.id) === String(value),
        );
        next.taluk = taluk?.name || "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }

      if (field === "localityId") {
        const locality = getLocalities(prev.talukId).find(
          (l) => String(l.id) === String(value),
        );
        next.locality = locality?.name || "";
        next.postalCode = locality?.postal_code || "";
      }

      return next;
    });

    if (addressErrors[field]) {
      setAddressErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function openAddAddress() {
    setEditingAddress(null);
    setAddressForm({
      addressType: "Home",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      countryId: 1,
      stateId: "",
      districtId: "",
      talukId: "",
      localityId: "",
      country: "India",
      state: "",
      district: "",
      taluk: "",
      locality: "",
      postalCode: "",
      isDefault: addresses.length === 0,
    });
    setAddressErrors({});
    setShowAddressModal(true);
  }

  function openEditAddress(addr) {
    setEditingAddress(addr);
    setAddressForm({
      addressType: addr.AddressType || "Home",
      addressLine1: addr.AddressLine1 || "",
      addressLine2: addr.AddressLine2 || "",
      landmark: addr.Landmark || "",
      countryId: 1,
      stateId: "",
      districtId: "",
      talukId: "",
      localityId: "",
      country: addr.Country || "India",
      state: addr.State || "",
      district: addr.District || "",
      taluk: addr.Taluk || "",
      locality: addr.Locality || "",
      postalCode: addr.PostalCode || "",
      isDefault: addr.IsDefault === 1,
    });
    setAddressErrors({});
    setShowAddressModal(true);
  }

  function validateAddress() {
    const errors = {};
    if (!addressForm.addressLine1.trim())
      errors.addressLine1 = "Address is required";
    if (!addressForm.locality.trim() && !addressForm.localityId)
      errors.locality = "Locality is required";
    if (!addressForm.district.trim() && !addressForm.districtId)
      errors.district = "District is required";
    if (!addressForm.state.trim() && !addressForm.stateId)
      errors.state = "State is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveAddress() {
    if (!validateAddress()) return;

    setIsSaving(true);
    try {
      await saveCustomerDetails({
        CustomerName: user.CustomerName,
        AddressLine1: addressForm.addressLine1,
        AddressLine2: addressForm.addressLine2,
        Landmark: addressForm.landmark,
        Locality: addressForm.locality,
        Taluk: addressForm.taluk,
        District: addressForm.district,
        State: addressForm.state,
        Country: addressForm.country,
        PostalCode: addressForm.postalCode,
        AddressType: addressForm.addressType,
      });
      setShowAddressModal(false);
      setSaveMessage({ type: "success", text: "Address saved successfully" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setAddressErrors({
        submit: err.message || "Failed to save address",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Container className="profile-page py-4">
      <h1 className="profile-title">My Profile</h1>

      {saveMessage && (
        <Alert
          variant={saveMessage.type}
          dismissible
          onClose={() => setSaveMessage(null)}
          className="mb-4"
        >
          {saveMessage.text}
        </Alert>
      )}

      <Row className="g-4">
        {/* ===== LEFT: PERSONAL DETAILS ===== */}
        <Col lg={8}>
          <Card className="profile-card">
            <Card.Body>
              <div className="profile-card-header">
                <h5 className="profile-section-title">Personal Details</h5>
                {!isEditing ? (
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <Row className="g-3 mt-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="profile-label">
                        Full Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.CustomerName}
                        onChange={(e) =>
                          handleProfileChange("CustomerName", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="profile-label">
                        Family Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.FamilyName}
                        onChange={(e) =>
                          handleProfileChange("FamilyName", e.target.value)
                        }
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
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Phone number cannot be changed
                      </Form.Text>
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
                        onChange={(e) =>
                          handleProfileChange("SecondaryMobile", e.target.value)
                        }
                        placeholder="Optional"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="profile-label">Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.Email}
                        onChange={(e) =>
                          handleProfileChange("Email", e.target.value)
                        }
                        placeholder="john@example.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ) : (
                <div className="profile-details-grid">
                  <div className="profile-detail">
                    <span className="profile-detail-label">Name</span>
                    <span className="profile-detail-value">
                      {user.CustomerName || "—"}
                      {user.FamilyName ? ` ${user.FamilyName}` : ""}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="profile-detail-label">Phone</span>
                    <span className="profile-detail-value">
                      +91 {user.PrimaryMobile || "—"}
                    </span>
                  </div>
                  {user.SecondaryMobile && (
                    <div className="profile-detail">
                      <span className="profile-detail-label">
                        Secondary Phone
                      </span>
                      <span className="profile-detail-value">
                        +91 {user.SecondaryMobile}
                      </span>
                    </div>
                  )}
                  <div className="profile-detail">
                    <span className="profile-detail-label">Email</span>
                    <span className="profile-detail-value">
                      {user.Email || "—"}
                    </span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ===== ADDRESSES ===== */}
          <Card className="profile-card mt-4">
            <Card.Body>
              <div className="profile-card-header">
                <h5 className="profile-section-title">
                  My Addresses
                  {addresses.length > 0 && (
                    <span className="address-count">{addresses.length}</span>
                  )}
                </h5>
                <Button variant="dark" size="sm" onClick={openAddAddress}>
                  + Add Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="no-addresses">
                  <p className="text-muted">No saved addresses yet.</p>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={openAddAddress}
                  >
                    Add your first address
                  </Button>
                </div>
              ) : (
                <div className="addresses-list">
                  {addresses.map((addr) => (
                    <div key={addr.AddressID} className="address-card">
                      <div className="address-card-header">
                        <div className="d-flex align-items-center gap-2">
                          <Badge
                            bg={
                              addr.AddressType === "Home"
                                ? "primary"
                                : addr.AddressType === "Work"
                                  ? "info"
                                  : "secondary"
                            }
                          >
                            {addr.AddressType || "Address"}
                          </Badge>
                          {addr.IsDefault === 1 && (
                            <Badge bg="warning" text="dark">
                              Default
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => openEditAddress(addr)}
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="address-text">
                        {addr.AddressLine1}
                        {addr.AddressLine2 && `, ${addr.AddressLine2}`}
                      </p>
                      {addr.Landmark && (
                        <p className="address-text text-muted">
                          Landmark: {addr.Landmark}
                        </p>
                      )}
                      <p className="address-text text-muted">
                        {[addr.Locality, addr.Taluk, addr.District, addr.State]
                          .filter(Boolean)
                          .join(", ")}
                        {addr.PostalCode && ` - ${addr.PostalCode}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ===== RIGHT: QUICK LINKS ===== */}
        <Col lg={4}>
          <Card className="profile-card">
            <Card.Body>
              <h5 className="profile-section-title">Quick Links</h5>
              <div className="profile-links">
                <Link to="/orders" className="profile-link">
                  <span className="profile-link-icon">📦</span>
                  <div>
                    <div className="profile-link-title">My Orders</div>
                    <div className="profile-link-desc">View order history</div>
                  </div>
                </Link>
                <Link to="/order-tracking" className="profile-link">
                  <span className="profile-link-icon">🚚</span>
                  <div>
                    <div className="profile-link-title">Track Order</div>
                    <div className="profile-link-desc">
                      Check delivery status
                    </div>
                  </div>
                </Link>
                <Link to="/" className="profile-link">
                  <span className="profile-link-icon">🛒</span>
                  <div>
                    <div className="profile-link-title">Continue Shopping</div>
                    <div className="profile-link-desc">Browse products</div>
                  </div>
                </Link>
              </div>
            </Card.Body>
          </Card>

          <Card className="profile-card mt-4">
            <Card.Body>
              <h5 className="profile-section-title">Account</h5>
              <p className="text-muted small">
                Signed in as <strong>+91 {user.PrimaryMobile}</strong>
              </p>
              <p className="text-muted small mb-0">
                Member since{" "}
                {user.CreatedAt
                  ? new Date(user.CreatedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                    })
                  : "—"}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== ADDRESS MODAL ===== */}
      <Modal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="fw-bold"
            style={{ color: "var(--brand-blue)" }}
          >
            {editingAddress ? "Edit Address" : "Add New Address"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                        addressForm.addressType === type ? "active" : ""
                      }`}
                      onClick={() => handleAddressChange("addressType", type)}
                    >
                      {type}
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
                      handleAddressChange("addressLine1", e.target.value)
                    }
                    isInvalid={!!addressErrors.addressLine1}
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
                      handleAddressChange("addressLine2", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="profile-label">Landmark</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Near bus stop, temple, etc."
                    value={addressForm.landmark}
                    onChange={(e) =>
                      handleAddressChange("landmark", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="profile-label">Country</Form.Label>
                  <Form.Select
                    value={addressForm.countryId}
                    onChange={(e) =>
                      handleAddressChange("countryId", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleAddressChange("stateId", e.target.value)
                    }
                    isInvalid={!!addressErrors.state}
                    disabled={!addressForm.countryId}
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
                      handleAddressChange("districtId", e.target.value)
                    }
                    isInvalid={!!addressErrors.district}
                    disabled={!addressForm.stateId}
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
                    onChange={(e) =>
                      handleAddressChange("talukId", e.target.value)
                    }
                    disabled={!addressForm.districtId}
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
                      handleAddressChange("localityId", e.target.value)
                    }
                    isInvalid={!!addressErrors.locality}
                    disabled={!addressForm.talukId}
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
                      handleAddressChange("postalCode", e.target.value)
                    }
                    placeholder="Enter postal code"
                    maxLength={6}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <div className="default-address-toggle">
                  <span>Make this address default</span>
                  <Form.Check
                    type="switch"
                    id="profile-default-address-switch"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      handleAddressChange("isDefault", e.target.checked)
                    }
                  />
                </div>
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
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddressModal(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="dark"
            onClick={handleSaveAddress}
            disabled={isSaving}
            className="profile-save-btn"
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
    </Container>
  );
}
