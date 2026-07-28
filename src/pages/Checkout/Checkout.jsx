import { useState, useMemo } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useLocationMaster } from "../../hooks/useLocationMaster";
import {
  getDeliverySlots,
  getDefaultDeliveryDateTime,
} from "../../utils/deliverySlots";
import { placeOrder } from "../../utils/orderService";
import CustomerDetailsForm from "./CustomerDetailsForm";
import AddressSection from "./AddressSection";
import DeliverySchedulePicker from "./DeliverySchedulePicker";
import CouponInput from "./CouponInput";
import PaymentMethodSelector from "./PaymentMethodSelector";
import BillingSummary from "./BillingSummary";
import "./Checkout.css";

export default function Checkout() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, isRegistered, saveCustomerDetails } = useAuth();

  const allEntries = Object.entries(cartItems);
  const entries = allEntries.filter(([, item]) => !item._isFreeOffer);
  const freeEntries = allEntries.filter(([, item]) => item._isFreeOffer);

  const {
    isLoading: locationsLoading,
    getCountries,
    getStates,
    getDistricts,
    getTaluks,
    getLocalities,
  } = useLocationMaster();

  // ===== EMPTY CART =====
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
  const [customerName, setCustomerName] = useState(user?.CustomerName || "");
  const [familyName, setFamilyName] = useState(user?.FamilyName || "");
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.find((a) => a.IsDefault === 1)?.AddressID || null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    savedAddresses.length === 0,
  );
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
  const defaults = getDefaultDeliveryDateTime();
  const [deliveryDate, setDeliveryDate] = useState(defaults.date);
  const [deliveryTime, setDeliveryTime] = useState(defaults.time);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const deliveryDates = useMemo(() => getDeliverySlots(), []);

  // ===== TOTALS =====
  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, [, item]) => {
          const price = parseFloat(item.price);
          const mrp = item.mrp ? parseFloat(item.mrp) : price;
          acc.itemCount += item.quantity;
          acc.subtotal += price * item.quantity;
          acc.mrpTotal += mrp * item.quantity;
          return acc;
        },
        { itemCount: 0, subtotal: 0, mrpTotal: 0 },
      ),
    [entries],
  );

  const savings = totals.mrpTotal - totals.subtotal;
  const couponDiscount = couponApplied ? couponApplied.discount : 0;
  const finalTotal = totals.subtotal - couponDiscount;

  // ===== HELPERS =====
  function clearError(field) {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

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

    clearError(field);
  }

  // ===== COUPON =====
  function handleApplyCoupon() {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }
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
    if (isNewUser && !familyName.trim()) {
      errors.familyName = "Family name is required";
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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ===== PLACE ORDER =====
  async function handlePlaceOrder() {
    if (!validate()) {
      document
        .querySelector(".is-invalid")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isNewUser) {
        await saveCustomerDetails({
          CustomerName: customerName.trim(),
          FamilyName: familyName.trim(),
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
        Address: {
          AddressID: orderAddress.addressId,
          AddressType: orderAddress.addressType,
          AddressLine1: orderAddress.addressLine1,
          AddressLine2: orderAddress.addressLine2,
          Landmark: orderAddress.landmark,
          Locality: orderAddress.locality,
          Taluk: orderAddress.taluk,
          District: orderAddress.district,
          State: orderAddress.state,
          Country: orderAddress.country,
          PostalCode: orderAddress.postalCode,
          GeoLocation: null,
        },
        Product: entries.map(([id, item]) => ({
          product: {
            id: parseInt(id),
            price: item.price,
            mrp: item.mrp,
            discount: 0,
          },
          qty: item.quantity,
        })),
        PaymentMode: paymentMode,
        DateTime: `${deliveryDate} ${deliveryTime}`,
        DeliveryInstruction: deliveryInstruction,
        Voucher: couponDiscount,
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
        <Col lg={8}>
          {isNewUser && (
            <CustomerDetailsForm
              customerName={customerName}
              setCustomerName={setCustomerName}
              familyName={familyName}
              setFamilyName={setFamilyName}
              formErrors={formErrors}
              clearError={clearError}
            />
          )}

          <AddressSection
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            showNewAddressForm={showNewAddressForm}
            address={address}
            formErrors={formErrors}
            locationsLoading={locationsLoading}
            onSelectSavedAddress={(id) => {
              setSelectedAddressId(id);
              setShowNewAddressForm(false);
            }}
            onAddNewAddress={() => {
              setSelectedAddressId(null);
              setShowNewAddressForm(true);
            }}
            onAddressChange={handleAddressChange}
            getCountries={getCountries}
            getStates={getStates}
            getDistricts={getDistricts}
            getTaluks={getTaluks}
            getLocalities={getLocalities}
          />

          {/* Delivery Instructions — small enough to stay inline */}
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

          <DeliverySchedulePicker
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
            deliveryTime={deliveryTime}
            setDeliveryTime={setDeliveryTime}
            deliveryDates={deliveryDates}
            formErrors={formErrors}
          />

          <CouponInput
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            couponDiscount={couponDiscount}
            couponError={couponError}
            setCouponError={setCouponError}
            onApply={handleApplyCoupon}
            onRemove={removeCoupon}
          />

          <PaymentMethodSelector
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
          />
        </Col>

        <Col lg={4}>
          <BillingSummary
            entries={entries}
            freeEntries={freeEntries}
            totals={totals}
            savings={savings}
            couponApplied={couponApplied}
            couponDiscount={couponDiscount}
            finalTotal={finalTotal}
            isSubmitting={isSubmitting}
            submitError={formErrors.submit}
            onPlaceOrder={handlePlaceOrder}
          />
        </Col>
      </Row>
    </Container>
  );
}
