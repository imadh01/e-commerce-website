import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useLocationMaster } from "../../hooks/useLocationMaster";
import { upsertCustomerAddress } from "../../api/authApi";
import PersonalDetailsCard from "./PersonalDetailsCard";
import AddressListCard from "./AddressListCard";
import AddressFormModal from "./AddressFormModal";
import QuickLinksCard from "./QuickLinksCard";
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
  const [addressForm, setAddressForm] = useState(getEmptyAddressForm(false));
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

  // ===== NOT LOGGED IN =====
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

  // ===== PROFILE HANDLERS =====
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
        const c = getCountries().find((x) => String(x.id) === String(value));
        next.country = c?.name || "";
        Object.assign(next, {
          stateId: "",
          state: "",
          districtId: "",
          district: "",
          talukId: "",
          taluk: "",
          localityId: "",
          locality: "",
          postalCode: "",
        });
      }
      if (field === "stateId") {
        const s = getStates(prev.countryId).find(
          (x) => String(x.id) === String(value),
        );
        next.state = s?.name || "";
        Object.assign(next, {
          districtId: "",
          district: "",
          talukId: "",
          taluk: "",
          localityId: "",
          locality: "",
          postalCode: "",
        });
      }
      if (field === "districtId") {
        const d = getDistricts(prev.stateId).find(
          (x) => String(x.id) === String(value),
        );
        next.district = d?.name || "";
        Object.assign(next, {
          talukId: "",
          taluk: "",
          localityId: "",
          locality: "",
          postalCode: "",
        });
      }
      if (field === "talukId") {
        const t = getTaluks(prev.districtId).find(
          (x) => String(x.id) === String(value),
        );
        next.taluk = t?.name || "";
        Object.assign(next, { localityId: "", locality: "", postalCode: "" });
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
    setAddressForm(getEmptyAddressForm(addresses.length === 0));
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

  async function handleSaveAddress() {
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
    if (Object.keys(e).length > 0) return;

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

  // ===== RENDER =====
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
            <PersonalDetailsCard
              user={user}
              profile={profile}
              isEditing={isEditing}
              isSaving={isSaving}
              onStartEdit={() => setIsEditing(true)}
              onCancelEdit={handleCancelEdit}
              onSave={handleSaveProfile}
              onChange={(field, value) =>
                setProfile((prev) => ({ ...prev, [field]: value }))
              }
            />

            <AddressListCard
              addresses={addresses}
              onAddAddress={openAddAddress}
              onEditAddress={openEditAddress}
            />
          </Col>

          <Col lg={4}>
            <QuickLinksCard user={user} />
          </Col>
        </Row>
      </Container>

      <AddressFormModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        editingAddress={editingAddress}
        addressForm={addressForm}
        addressErrors={addressErrors}
        isSaving={isSaving}
        locationsLoading={locationsLoading}
        onAddressChange={handleAddressChange}
        onSave={handleSaveAddress}
        addresses={addresses}
        getCountries={getCountries}
        getStates={getStates}
        getDistricts={getDistricts}
        getTaluks={getTaluks}
        getLocalities={getLocalities}
      />
    </div>
  );
}

// ===== HELPERS =====
function getEmptyAddressForm(isDefault) {
  return {
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
    isDefault,
  };
}
