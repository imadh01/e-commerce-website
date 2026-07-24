import { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useLocationMaster } from "../../hooks/useLocationMaster";
import { getDiscountPercent } from "../../utils/pricing";
import { getDeliverySlots, getTimeSlots } from "../../utils/deliverySlots";
import { placeOrder } from "../../utils/orderService";
import "./Checkout.css";

export default function Checkout() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, isRegistered, saveCustomerDetails } = useAuth();
  const entries = Object.entries(cartItems);

  const {
    isLoading: locationsLoading,
    getCountries,
    getStates,
    getDistricts,
    getTaluks,
    getLocalities,
  } = useLocationMaster();

  // Redirect if cart is empty
  if (entries.length === 0) {
    return (
      <Container className="checkout-page py-5">
        <div className="text-center py-5">
          <h2 className="fw-bold" style={{ color: "var(--brand-blue)" }}>
            Your cart is empty
          </h2>
          <p className="text-muted mt-2">Add some items before checking out.</p>
          <Button as={Link} to="/" variant="warning" size="lg" className="mt-3">
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  const savedAddresses = user?.Addresses || [];
  const isNewUser = user?._isNew || !user?.UserID;

  // ===== FORM STATE =====
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.find((a) => a.IsDefault === 1)?.AddressID || null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    savedAddresses.length === 0,
  );

  const [customerName, setCustomerName] = useState(user?.CustomerName || "");

  const [address, setAddress] = useState({
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

  const [deliveryInstruction, setDeliveryInstruction] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const deliveryDates = useMemo(() => getDeliverySlots(), []);
  const timeSlots = useMemo(() => getTimeSlots(), []);

  // ===== TOTALS =====
  const totals = entries.reduce(
    (acc, [, item]) => {
      const price = parseFloat(item.price);
      const mrp = item.mrp ? parseFloat(item.mrp) : price;
      acc.itemCount += item.quantity;
      acc.subtotal += price * item.quantity;
      acc.mrpTotal += mrp * item.quantity;
      return acc;
    },
    { itemCount: 0, subtotal: 0, mrpTotal: 0 },
  );

  const savings = totals.mrpTotal - totals.subtotal;
  const couponDiscount = couponApplied ? couponApplied.discount : 0;
  const finalTotal = totals.subtotal - couponDiscount;

  // ===== ADDRESS CHANGE HANDLER (cascading resets) =====
  function handleAddressChange(field, value) {
    setAddress((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "countryId") {
        const country = getCountries().find((c) => c.id === parseInt(value));
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
          (s) => s.id === parseInt(value),
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
          (d) => d.id === parseInt(value),
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
          (l) => l.id === parseInt(value),
        );
        next.locality = locality?.name || "";
        next.postalCode = locality?.postal_code || "";
      }

      return next;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleSelectSavedAddress(addrId) {
    setSelectedAddressId(addrId);
    setShowNewAddressForm(false);
  }

  function handleAddNewAddress() {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
  }

  // ===== COUPON =====
  function handleApplyCoupon() {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    // Mock coupon validation — replace with API call later
    const mockCoupons = {
      SAVE10: { discount: totals.subtotal * 0.1, label: "10% off" },
      FLAT50: { discount: 50, label: "₹50 off" },
      WELCOME: { discount: totals.subtotal * 0.15, label: "15% off" },
    };

    if (mockCoupons[code]) {
      setCouponApplied({ code, ...mockCoupons[code] });
    } else {
      setCouponError("Invalid coupon code");
    }
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  }

  // ===== VALIDATION =====
  function validate() {
    const errors = {};

    if (isNewUser && !customerName.trim()) {
      errors.customerName = "Name is required";
    }

    if (showNewAddressForm || savedAddresses.length === 0) {
      if (!address.addressLine1.trim())
        errors.addressLine1 = "Address is required";
      if (!address.stateId) errors.state = "State is required";
      if (!address.districtId) errors.district = "District is required";
      if (!address.localityId) errors.locality = "Locality is required";
    } else if (!selectedAddressId) {
      errors.address = "Please select a delivery address";
    }

    if (!deliveryDate) errors.deliveryDate = "Select a delivery date";
    if (!deliveryTime) errors.deliveryTime = "Select a delivery time";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ===== PLACE ORDER =====
  async function handlePlaceOrder() {
    if (!validate()) {
      const firstErrorField = document.querySelector(".is-invalid");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      // If new user, save customer details first
      if (isNewUser) {
        await saveCustomerDetails({
          CustomerName: customerName.trim(),
          AddressLine1: address.addressLine1,
          AddressLine2: address.addressLine2,
          Landmark: address.landmark,
          Locality: address.locality,
          Taluk: address.taluk,
          District: address.district,
          State: address.state,
          Country: address.country,
          PostalCode: address.postalCode,
          AddressType: address.addressType,
        });
      }

      // Build the address for the order
      let orderAddress;
      if (showNewAddressForm || savedAddresses.length === 0) {
        orderAddress = {
          addressId: null,
          addressType: address.addressType,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landmark: address.landmark,
          locality: address.locality,
          taluk: address.taluk,
          district: address.district,
          state: address.state,
          country: address.country,
          postalCode: address.postalCode,
        };
      } else {
        const selected = savedAddresses.find(
          (a) => a.AddressID === selectedAddressId,
        );
        orderAddress = {
          addressId: selected.AddressID,
          addressType: selected.AddressType,
          addressLine1: selected.AddressLine1,
          addressLine2: selected.AddressLine2,
          landmark: selected.Landmark,
          locality: selected.Locality,
          taluk: selected.Taluk,
          district: selected.District,
          state: selected.State,
          country: selected.Country,
          postalCode: selected.PostalCode,
        };
      }

      const orderData = {
        ...orderAddress,
        items: entries.map(([id, item]) => ({
          productId: parseInt(id),
          price: item.price,
          mrp: item.mrp,
          discount: 0,
          quantity: item.quantity,
        })),
        paymentMode: paymentMode,
        deliveryDate,
        deliveryTime,
        deliveryInstruction,
        voucherDiscount: couponDiscount,
      };

      const order = await placeOrder(orderData);
      clearCart();
      navigate(`/order-success/${order.OrderNumber}`);
    } catch (err) {
      console.error("Order failed:", err);
      setFormErrors({
        submit: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ===== RENDER =====
  return (
    <Container className="checkout-page py-4">
      <h1 className="checkout-title">Checkout</h1>

      <Row className="g-4">
        {/* ===== LEFT: FORMS ===== */}
        <Col lg={8}>
          {/* Customer Name (new users only) */}
          {isNewUser && (
            <Card className="checkout-card">
              <Card.Body>
                <h5 className="checkout-section-title">
                  <span className="section-number">•</span>
                  Your Details
                </h5>
                <Form.Group>
                  <Form.Label className="checkout-label">
                    Full Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.customerName) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.customerName;
                          return next;
                        });
                      }
                    }}
                    isInvalid={!!formErrors.customerName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.customerName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>
          )}

          {/* ===== DELIVERY ADDRESS ===== */}
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
                          selectedAddressId === addr.AddressID &&
                          !showNewAddressForm
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleSelectSavedAddress(addr.AddressID)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectSavedAddress(addr.AddressID);
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
                    onClick={handleAddNewAddress}
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
                              onClick={() =>
                                handleAddressChange("addressType", type)
                              }
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
                              handleAddressChange(
                                "addressLine1",
                                e.target.value,
                              )
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
                              handleAddressChange(
                                "addressLine2",
                                e.target.value,
                              )
                            }
                          />
                        </Form.Group>
                      </Col>

                      {/* Landmark */}
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            Landmark
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Near bus stop, temple, etc."
                            value={address.landmark}
                            onChange={(e) =>
                              handleAddressChange("landmark", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>

                      {/* Country */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            Country
                          </Form.Label>
                          <Form.Select
                            value={address.countryId}
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

                      {/* State */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            State *
                          </Form.Label>
                          <Form.Select
                            value={address.stateId}
                            onChange={(e) =>
                              handleAddressChange("stateId", e.target.value)
                            }
                            isInvalid={!!formErrors.state}
                            disabled={!address.countryId}
                          >
                            <option value="">Select State</option>
                            {getStates(address.countryId).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.state}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      {/* District */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            District *
                          </Form.Label>
                          <Form.Select
                            value={address.districtId}
                            onChange={(e) =>
                              handleAddressChange("districtId", e.target.value)
                            }
                            isInvalid={!!formErrors.district}
                            disabled={!address.stateId}
                          >
                            <option value="">Select District</option>
                            {getDistricts(address.stateId).map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.district}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      {/* Taluk */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            Taluk
                          </Form.Label>
                          <Form.Select
                            value={address.talukId}
                            onChange={(e) => {
                              console.log("TALUK SELECTED:", e.target.value);
                              handleAddressChange("talukId", e.target.value);
                            }}
                            disabled={!address.districtId}
                          >
                            <option value="">Select Taluk</option>
                            {getTaluks(address.districtId).map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* Locality */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            Locality *
                          </Form.Label>
                          <Form.Select
                            value={address.localityId}
                            onChange={(e) =>
                              handleAddressChange("localityId", e.target.value)
                            }
                            isInvalid={!!formErrors.locality}
                            disabled={!address.talukId}
                          >
                            <option value="">Select Locality</option>
                            {getLocalities(address.talukId).map((l) => (
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

                      {/* Postal Code (auto-filled) */}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="checkout-label">
                            Postal Code
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={address.postalCode}
                            onChange={(e) =>
                              handleAddressChange("postalCode", e.target.value)
                            }
                            placeholder="Enter postal code"
                            maxLength={6}
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
                                handleAddressChange(
                                  "isDefault",
                                  e.target.checked,
                                )
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

          {/* ===== DELIVERY INSTRUCTIONS ===== */}
          <Card className="checkout-card">
            <Card.Body>
              <h5 className="checkout-section-title">
                <span className="section-number">2</span>
                Delivery Instructions
              </h5>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="E.g. Ring the bell twice, leave at the door..."
                value={deliveryInstruction}
                onChange={(e) => setDeliveryInstruction(e.target.value)}
              />
            </Card.Body>
          </Card>

          {/* ===== SCHEDULED DELIVERY ===== */}
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
                    <Form.Label className="checkout-label">
                      Time Slot *
                    </Form.Label>
                    <Form.Select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      isInvalid={!!formErrors.deliveryTime}
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.deliveryTime}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ===== COUPON CODE ===== */}
          <Card className="checkout-card">
            <Card.Body>
              <h5 className="checkout-section-title">
                <span className="section-number">4</span>
                Coupon Code
              </h5>

              {couponApplied ? (
                <div className="coupon-applied">
                  <div>
                    <Badge bg="success" className="me-2">
                      {couponApplied.code}
                    </Badge>
                    <span className="text-success fw-semibold">
                      {couponApplied.label} applied — you save ₹
                      {couponDiscount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={removeCoupon}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <Form.Control
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    isInvalid={!!couponError}
                    className="coupon-input"
                  />
                  <Button
                    variant="warning"
                    onClick={handleApplyCoupon}
                    className="coupon-apply-btn"
                  >
                    Apply
                  </Button>
                  {couponError && (
                    <div className="coupon-error">{couponError}</div>
                  )}
                </div>
              )}

              <p className="text-muted small mt-2 mb-0">
                Try: SAVE10, FLAT50, WELCOME
              </p>
            </Card.Body>
          </Card>

          {/* ===== PAYMENT METHOD ===== */}
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

              {paymentMode !== "Cash" && (
                <Alert variant="warning" className="mt-3 mb-0 small">
                  ⚠️ Online payment gateway coming soon. Your order will be
                  placed as Cash on Delivery for now.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ===== RIGHT: BILLING SUMMARY ===== */}
        <Col lg={4}>
          <Card className="checkout-summary-card">
            <h5 className="checkout-summary-title">Billing Summary</h5>

            {/* Items preview */}
            <div className="checkout-items-preview">
              {entries.map(([id, item]) => {
                const price = parseFloat(item.price);
                return (
                  <div key={id} className="checkout-item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="checkout-item-img"
                    />
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{item.name}</div>
                      <div className="text-muted small">
                        {item.quantity} × ₹{price.toFixed(2)}
                      </div>
                    </div>
                    <div className="checkout-item-total">
                      ₹{(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <hr />

            <div className="checkout-summary-row">
              <span>MRP Total</span>
              <span>₹{totals.mrpTotal.toFixed(2)}</span>
            </div>

            {savings > 0 && (
              <div className="checkout-summary-row checkout-savings">
                <span>Product Discount</span>
                <span>−₹{savings.toFixed(2)}</span>
              </div>
            )}

            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>

            {couponApplied && (
              <div className="checkout-summary-row checkout-savings">
                <span>Coupon ({couponApplied.code})</span>
                <span>−₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="checkout-summary-row">
              <span>Delivery</span>
              <span className="text-success fw-semibold">Free</span>
            </div>

            <hr />

            <div className="checkout-summary-row checkout-final-total">
              <span>Grand Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>

            {formErrors.submit && (
              <Alert variant="danger" className="mt-3 mb-0 small">
                {formErrors.submit}
              </Alert>
            )}

            <Button
              size="lg"
              className="w-100 mt-3 checkout-place-btn"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Placing Order...
                </>
              ) : (
                `Place Order · ₹${finalTotal.toFixed(2)}`
              )}
            </Button>

            <div className="text-center mt-3">
              <Link to="/cart" className="text-muted small">
                ← Back to Cart
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
