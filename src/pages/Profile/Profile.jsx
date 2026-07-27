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
import { upsertCustomerAddress } from "../../api/authApi";
import "./Profile.css";

export default function Profile() {
  usePageTitle("My Profile");
  const { user, setUser, isLoggedIn, saveCustomerDetails } = useAuth();
  const {
    isLoading: locationsLoading,
    getCountries,
    getStates,
    getDistricts,
    getTaluks,
    getLocalities,
  } = useLocationMaster();

  const [isEditing, setIsEditing] = useState(!user?.CustomerName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [profile, setProfile] = useState({
    CustomerName: "",
    FamilyName: "",
    PrimaryMobile: "",
    SecondaryMobile: "",
    Email: "",
  });
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
      <div className="profile-page">
        <div className="profile-hero">
          <Container>
            <h1 className="profile-hero-title">My Profile</h1>
          </Container>
        </div>
        <Container className="py-5">
          <div className="text-center py-5">
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
            <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
              Please sign in
            </h2>
            <p className="text-muted mt-2">
              You need to be logged in to view your profile.
            </p>
            <Button as={Link} to="/login" className="profile-action-btn mt-3">
              Sign In
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const addresses = user?.Addresses || [];

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

  function handleAddressChange(field, value) {
    setAddressForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "countryId") {
        const c = getCountries().find((x) => String(x.id) === String(value));
        next.country = c?.name || "";
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
        const s = getStates(prev.countryId).find(
          (x) => String(x.id) === String(value),
        );
        next.state = s?.name || "";
        next.districtId = "";
        next.district = "";
        next.talukId = "";
        next.taluk = "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }
      if (field === "districtId") {
        const d = getDistricts(prev.stateId).find(
          (x) => String(x.id) === String(value),
        );
        next.district = d?.name || "";
        next.talukId = "";
        next.taluk = "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }
      if (field === "talukId") {
        const t = getTaluks(prev.districtId).find(
          (x) => String(x.id) === String(value),
        );
        next.taluk = t?.name || "";
        next.localityId = "";
        next.locality = "";
        next.postalCode = "";
      }
      if (field === "localityId") {
        const l = getLocalities(prev.talukId).find(
          (x) => String(x.id) === String(value),
        );
        next.locality = l?.name || "";
        next.postalCode = l?.postal_code || "";
      }
      return next;
    });
    if (addressErrors[field]) {
      setAddressErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
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
    const e = {};
    if (!addressForm.addressLine1.trim())
      e.addressLine1 = "Address is required";
    if (!addressForm.locality.trim() && !addressForm.localityId)
      e.locality = "Locality is required";
    if (!addressForm.district.trim() && !addressForm.districtId)
      e.district = "District is required";
    if (!addressForm.state.trim() && !addressForm.stateId)
      e.state = "State is required";
    setAddressErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSaveAddress() {
    if (!validateAddress()) return;
    setIsSaving(true);
    try {
      const updatedUser = await upsertCustomerAddress({
        UserID: user.UserID,
        AddressID: editingAddress?.AddressID || null,
        AddressType: addressForm.addressType,
        AddressLine1: addressForm.addressLine1,
        AddressLine2: addressForm.addressLine2,
        Landmark: addressForm.landmark,
        Locality: addressForm.locality,
        Taluk: addressForm.taluk,
        District: addressForm.district,
        State: addressForm.state,
        Country: addressForm.country,
        PostalCode: addressForm.postalCode,
        IsDefault: addressForm.isDefault ? 1 : 0,
      });

      // Update AuthContext with fresh data from backend
      setUser(updatedUser);
      setShowAddressModal(false);
      setSaveMessage({ type: "success", text: "Address saved successfully" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setAddressErrors({ submit: err.message || "Failed to save address" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <Container>
          <div className="profile-hero-content">
            <div className="profile-avatar">
              {(user.CustomerName || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="profile-hero-title">
                {user.CustomerName || "Welcome"}
              </h1>
              <p className="profile-hero-sub">+91 {user.PrimaryMobile}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="profile-content py-4">
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
          <Col lg={8}>
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
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
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
                        className="profile-save-btn"
                        size="sm"
                        onClick={handleSaveProfile}
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
                        <Form.Label className="profile-label">
                          Full Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.CustomerName}
                          onChange={(e) =>
                            handleProfileChange("CustomerName", e.target.value)
                          }
                          className="profile-input"
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
                        <Form.Text className="text-muted">
                          Cannot be changed
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
                            handleProfileChange(
                              "SecondaryMobile",
                              e.target.value,
                            )
                          }
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
                          onChange={(e) =>
                            handleProfileChange("Email", e.target.value)
                          }
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
                        <span className="profile-info-label">
                          Secondary Phone
                        </span>
                        <span className="profile-info-value">
                          +91 {user.SecondaryMobile}
                        </span>
                      </div>
                    )}
                    <div className="profile-info-item">
                      <span className="profile-info-label">Email</span>
                      <span className="profile-info-value">
                        {user.Email || "—"}
                      </span>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="profile-card mt-4">
              <Card.Body className="p-4">
                <div className="profile-card-header">
                  <div className="profile-card-title-wrap">
                    <span className="profile-card-icon">📍</span>
                    <h5 className="profile-section-title">
                      My Addresses
                      {addresses.length > 0 && (
                        <Badge className="address-count-badge">
                          {addresses.length}
                        </Badge>
                      )}
                    </h5>
                  </div>
                  <Button
                    className="profile-save-btn"
                    size="sm"
                    onClick={openAddAddress}
                  >
                    + Add Address
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <div className="profile-empty-state">
                    <span className="profile-empty-icon">🏠</span>
                    <p className="text-muted mb-2">No saved addresses yet.</p>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={openAddAddress}
                    >
                      Add your first address
                    </Button>
                  </div>
                ) : (
                  <div className="addresses-grid">
                    {addresses.map((addr) => (
                      <div key={addr.AddressID} className="address-card-v2">
                        <div className="address-card-v2-top">
                          <div className="d-flex align-items-center gap-2">
                            <span className="address-type-icon">
                              {addr.AddressType === "Home"
                                ? "🏠"
                                : addr.AddressType === "Work"
                                  ? "🏢"
                                  : "📍"}
                            </span>
                            <span className="address-type-label">
                              {addr.AddressType || "Address"}
                            </span>
                            {addr.IsDefault === 1 && (
                              <Badge
                                bg="warning"
                                text="dark"
                                className="address-default-badge"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="address-edit-link"
                            onClick={() => openEditAddress(addr)}
                          >
                            Edit
                          </Button>
                        </div>
                        <p className="address-line">
                          {addr.AddressLine1}
                          {addr.AddressLine2 && `, ${addr.AddressLine2}`}
                        </p>
                        {addr.Landmark && (
                          <p className="address-line address-landmark">
                            Near: {addr.Landmark}
                          </p>
                        )}
                        <p className="address-line address-location">
                          {[
                            addr.Locality,
                            addr.Taluk,
                            addr.District,
                            addr.State,
                          ]
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

          <Col lg={4}>
            <Card className="profile-card">
              <Card.Body className="p-4">
                <h5 className="profile-section-title mb-3"> </h5>
                <div className="profile-quick-links">
                  <Link to="/orders" className="profile-quick-link">
                    <div className="pql-icon-wrap pql-orders">
                      <span>📦</span>
                    </div>
                    <div className="pql-text">
                      <div className="pql-title">My Orders</div>
                      <div className="pql-desc">View order history</div>
                    </div>
                    <span className="pql-arrow">›</span>
                  </Link>
                  <Link to="/order-tracking/0" className="profile-quick-link">
                    <div className="pql-icon-wrap pql-tracking">
                      <span>🚚</span>
                    </div>
                    <div className="pql-text">
                      <div className="pql-title">Track Order</div>
                      <div className="pql-desc">Check delivery status</div>
                    </div>
                    <span className="pql-arrow">›</span>
                  </Link>
                  <Link to="/cart" className="profile-quick-link">
                    <div className="pql-icon-wrap pql-cart">
                      <span>🛒</span>
                    </div>
                    <div className="pql-text">
                      <div className="pql-title">My Cart</div>
                      <div className="pql-desc">View cart items</div>
                    </div>
                    <span className="pql-arrow">›</span>
                  </Link>
                  <Link to="/" className="profile-quick-link">
                    <div className="pql-icon-wrap pql-shop">
                      <span>🛍️</span>
                    </div>
                    <div className="pql-text">
                      <div className="pql-title">Continue Shopping</div>
                      <div className="pql-desc">Browse products</div>
                    </div>
                    <span className="pql-arrow">›</span>
                  </Link>
                </div>
              </Card.Body>
            </Card>

            <Card className="profile-card mt-4">
              <Card.Body className="p-4">
                <h5 className="profile-section-title mb-3">Account Info</h5>
                <div className="account-info-item">
                  <span className="text-muted">Signed in as</span>
                  <strong>{user.CustomerName || user.PrimaryMobile}</strong>
                </div>
                {user.CustomerType && (
                  <div className="account-info-item">
                    <span className="text-muted">Account Type</span>
                    <Badge bg="info">{user.CustomerType}</Badge>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
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
                      onClick={() => handleAddressChange("addressType", t)}
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
                      handleAddressChange("addressLine1", e.target.value)
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
                      handleAddressChange("addressLine2", e.target.value)
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
                    onChange={(e) =>
                      handleAddressChange("landmark", e.target.value)
                    }
                    className="profile-input"
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
                    onChange={(e) =>
                      handleAddressChange("stateId", e.target.value)
                    }
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
                      handleAddressChange("districtId", e.target.value)
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
                    onChange={(e) =>
                      handleAddressChange("talukId", e.target.value)
                    }
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
                      handleAddressChange("localityId", e.target.value)
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
                      handleAddressChange("postalCode", e.target.value)
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
                      handleAddressChange("isDefault", e.target.checked)
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
            onClick={() => setShowAddressModal(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="profile-save-btn"
            onClick={handleSaveAddress}
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
    </div>
  );
}
