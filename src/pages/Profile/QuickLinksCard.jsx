import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const QUICK_LINKS = [
  {
    to: "/orders",
    icon: "📦",
    colorClass: "pql-orders",
    title: "My Orders",
    desc: "View order history",
  },
  {
    to: "/order-tracking/0",
    icon: "🚚",
    colorClass: "pql-tracking",
    title: "Track Order",
    desc: "Check delivery status",
  },
  {
    to: "/cart",
    icon: "🛒",
    colorClass: "pql-cart",
    title: "My Cart",
    desc: "View cart items",
  },
  {
    to: "/",
    icon: "🛍️",
    colorClass: "pql-shop",
    title: "Continue Shopping",
    desc: "Browse products",
  },
];

export default function QuickLinksCard({ user }) {
  return (
    <>
      <Card className="profile-card">
        <Card.Body className="p-4">
          <h5 className="profile-section-title mb-3"> </h5>
          <div className="profile-quick-links">
            {QUICK_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="profile-quick-link">
                <div className={`pql-icon-wrap ${link.colorClass}`}>
                  <span>{link.icon}</span>
                </div>
                <div className="pql-text">
                  <div className="pql-title">{link.title}</div>
                  <div className="pql-desc">{link.desc}</div>
                </div>
                <span className="pql-arrow">›</span>
              </Link>
            ))}
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
    </>
  );
}
