import { Card, Button, Badge } from "react-bootstrap";

export default function AddressListCard({
  addresses,
  onAddAddress,
  onEditAddress,
}) {
  return (
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
          <Button className="profile-save-btn" size="sm" onClick={onAddAddress}>
            + Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="profile-empty-state">
            <span className="profile-empty-icon">🏠</span>
            <p className="text-muted mb-2">No saved addresses yet.</p>
            <Button variant="outline-dark" size="sm" onClick={onAddAddress}>
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
                    onClick={() => onEditAddress(addr)}
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
  );
}
