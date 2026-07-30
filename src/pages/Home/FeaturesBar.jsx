import { Row, Col } from "react-bootstrap";

const FEATURES = [
  {
    icon: "🏷️",
    color: "orange",
    title: "Best Prices & Offers",
    desc: "Affordable prices on all products",
  },
  {
    icon: "🚚",
    color: "blue",
    title: "Fast Delivery",
    desc: "Quick delivery right to your door",
  },
  {
    icon: "✅",
    color: "green",
    title: "Quality Assured",
    desc: "Genuine products, always fresh",
  },
  {
    icon: "⭐",
    color: "purple",
    title: "Share & Earn",
    desc: "Refer friends & get rewards",
  },
];

export default function FeaturesBar() {
  return (
    <section className="features-bar pt-5">
      <Row xs={1} className="g-4">
        {FEATURES.map((f) => (
          <Col key={f.title}>
            <div className="feature-card">
              <div className={`feature-icon feature-icon-${f.color}`}>
                {f.icon}
              </div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </section>
  );
}
