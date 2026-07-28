import { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
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
import { fetchSundayOfferConfig } from "../../api/homeApi";
import CustomerDetailsForm from "./CustomerDetailsForm";
import AddressSection from "./AddressSection";
import DeliverySchedulePicker from "./DeliverySchedulePicker";
import CouponInput from "./CouponInput";
import PaymentMethodSelector from "./PaymentMethodSelector";
import BillingSummary from "./BillingSummary";
import { upsertCustomerAddress, fetchCustomerByPhone } from "../../api/authApi";
import "./Checkout.css";

export default function Checkout() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { cartItems, clearCart, setOfferConfigs } = useCart();
  const { user, isRegistered, saveCustomerDetails, setUser } = useAuth();
  const [addressSaving, setAddressSaving] = useState(false);

  const allEntries = Object.entries(cartItems);
  const entries = allEntries.filter(([, item]) => !item._isFreeOffer);
  const freeEntries = allEntries.filter(([, item]) => item._isFreeOffer);

  const [secondaryMobile, setSecondaryMobile] = useState(
    user?.SecondaryMobile || "",
  );
  const [email, setEmail] = useState(user?.Email || "");

  const {
    isLoading: locationsLoading,
    getCountries,
    getStates,
    getDistricts,
    getTaluks,
    getLocalities,
    getAllLocalities,
    findParents,
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
  const [detailsSaved, setDetailsSaved] = useState(false);

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
    setAddress((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  }

  // Locality-first: user picks locality, everything else auto-fills
  function handleLocalitySelect(localityId) {
    if (!localityId) {
      setAddress((prev) => ({
        ...prev,
        localityId: "",
        locality: "",
        talukId: "",
        taluk: "",
        districtId: "",
        district: "",
        stateId: "",
        state: "",
        countryId: "",
        country: "",
        postalCode: "",
      }));
      return;
    }

    const parents = findParents(localityId);
    if (!parents) return;

    setAddress((prev) => ({
      ...prev,
      localityId,
      locality: parents.locality?.name || "",
      talukId: parents.taluk?.id || "",
      taluk: parents.taluk?.name || "",
      districtId: parents.district?.id || "",
      district: parents.district?.name || "",
      stateId: parents.state?.id || "",
      state: parents.state?.name || "",
      countryId: parents.country?.id || 1,
      country: parents.country?.name || "India",
      postalCode: parents.postalCode || "",
    }));

    clearError("locality");
  }

  async function handleSaveNewAddress() {
    const errors = {};
    if (!address.addressLine1.trim())
      errors.addressLine1 = "Address is required";
    if (!address.localityId) errors.locality = "Locality is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setAddressSaving(true);
    try {
      await upsertCustomerAddress({
        UserID: user.UserID,
        AddressType: address.addressType,
        AddressLine1: address.addressLine1,
        AddressLine2: address.addressLine2,
        Landmark: address.landmark,
        Locality: address.locality,
        Taluk: address.taluk,
        District: address.district,
        State: address.state,
        Country: address.country,
        PostalCode: address.postalCode,
        IsDefault: address.isDefault ? 1 : 0,
      });

      // Re-fetch user to get updated addresses
      const refreshedUser = await fetchCustomerByPhone(user.PrimaryMobile);
      if (refreshedUser) {
        setUser(refreshedUser);
        // Select the newest address (last in list)
        const newAddresses = refreshedUser.Addresses || [];
        const newest = newAddresses[newAddresses.length - 1];
        if (newest) setSelectedAddressId(newest.AddressID);
      }

      // Switch back to saved addresses view
      setShowNewAddressForm(false);
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to save address" });
    } finally {
      setAddressSaving(false);
    }
  }

  // ===== SAVE DETAILS (new users) =====
  async function handleSaveDetails() {
    const errors = {};
    if (!customerName.trim()) errors.customerName = "Name is required";
    if (!familyName.trim()) errors.familyName = "Family name is required";
    if (!address.addressLine1.trim())
      errors.addressLine1 = "Address is required";
    if (!address.stateId) errors.state = "State is required";
    if (!address.districtId) errors.district = "District is required";
    if (!address.localityId) errors.locality = "Locality is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const newUser = await saveCustomerDetails({
        CustomerName: customerName.trim(),
        FamilyName: familyName.trim(),
        SecondaryMobile: secondaryMobile.trim(),
        Email: email.trim(),
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
      setDetailsSaved(true);

      // Fetch offers now that user has ID + address
      try {
        const configData = await fetchSundayOfferConfig(newUser.UserID);
        setOfferConfigs(configData.configurations || []);
      } catch {
        /* ignore — user may not qualify */
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to save details" });
    } finally {
      setIsSubmitting(false);
    }
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
    if (!isNewUser) {
      if (showNewAddressForm) {
        if (!address.addressLine1.trim())
          errors.addressLine1 = "Address is required";
        if (!address.stateId) errors.state = "State is required";
        if (!address.districtId) errors.district = "District is required";
        if (!address.localityId) errors.locality = "Locality is required";
      } else if (!selectedAddressId) {
        errors.address = "Please select a delivery address";
      }
    }
    if (!deliveryDate) errors.deliveryDate = "Delivery date is required";
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
      const currentUser = user;

      let orderAddress;
      if (isNewUser || (showNewAddressForm && savedAddresses.length === 0)) {
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
      } else if (showNewAddressForm) {
        const savedAddr = await upsertCustomerAddress({
          UserID: user.UserID,
          AddressType: address.addressType,
          AddressLine1: address.addressLine1,
          AddressLine2: address.addressLine2,
          Landmark: address.landmark,
          Locality: address.locality,
          Taluk: address.taluk,
          District: address.district,
          State: address.state,
          Country: address.country,
          PostalCode: address.postalCode,
          IsDefault: address.isDefault ? 1 : 0,
        });
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
        UserID: currentUser.UserID,
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
          {/* ===== NEW USER: Save details first ===== */}
          {isNewUser && !detailsSaved && (
            <>
              <CustomerDetailsForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                familyName={familyName}
                setFamilyName={setFamilyName}
                secondaryMobile={secondaryMobile}
                setSecondaryMobile={setSecondaryMobile}
                email={email}
                setEmail={setEmail}
                formErrors={formErrors}
                clearError={clearError}
              />

              <AddressSection
                savedAddresses={[]}
                selectedAddressId={null}
                showNewAddressForm={true}
                address={address}
                formErrors={formErrors}
                locationsLoading={locationsLoading}
                onSelectSavedAddress={() => {}}
                onAddNewAddress={() => {}}
                onAddressChange={handleAddressChange}
                onLocalitySelect={handleLocalitySelect}
                allLocalities={getAllLocalities()}
              />

              {formErrors.submit && (
                <Alert variant="danger" className="mt-3">
                  {formErrors.submit}
                </Alert>
              )}

              <Button
                size="lg"
                className="w-100 mt-3 checkout-place-btn"
                onClick={handleSaveDetails}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Details & Continue"}
              </Button>
            </>
          )}

          {/* ===== NEW USER: Details saved ===== */}
          {isNewUser && detailsSaved && (
            <Alert variant="success" className="mb-3">
              ✅ Your details have been saved! Complete your order below.
            </Alert>
          )}

          {/* ===== EXISTING USER OR SAVED NEW USER: Show order form ===== */}
          {!isNewUser && (
            <>
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
                  setAddress({
                    addressType: "Home",
                    addressLine1: "",
                    addressLine2: "",
                    landmark: "",
                    countryId: 1,
                    stateId: "",
                    districtId: "",
                    talukId: "",
                    localityId: "",
                    country: "",
                    state: "",
                    district: "",
                    taluk: "",
                    locality: "",
                    postalCode: "",
                    isDefault: false,
                  });
                }}
                onAddressChange={handleAddressChange}
                onLocalitySelect={handleLocalitySelect}
                allLocalities={getAllLocalities()}
              />
              {showNewAddressForm && (
                <Button
                  className="w-100 mt-2 checkout-place-btn"
                  onClick={handleSaveNewAddress}
                  disabled={addressSaving}
                >
                  {addressSaving ? "Saving..." : "Save Address & Continue"}
                </Button>
              )}
            </>
          )}
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
            showPlaceOrder={!isNewUser || detailsSaved}
          />
        </Col>
      </Row>
    </Container>
  );
}
