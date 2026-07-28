import { Container } from "react-bootstrap";

export default function SundayOffersBanners({
  banners,
  offerLabel,
  hasConfigs,
  onBannerClick,
}) {
  return (
    <section className="sunday-offers-section">
      <Container fluid className="px-4">
        <div className="so-header">
          <h2 className="so-title">
            <span className="so-icon">🔥</span>
            {offerLabel}
          </h2>
        </div>
        <div className="so-banners-wrap">
          <div className="so-banners">
            <div className="so-banners-track">
              {[...banners, ...banners].map((offer, idx) => (
                <div
                  className="so-banner-card"
                  key={idx}
                  onClick={() => onBannerClick(idx % banners.length)}
                  role="button"
                  style={{ cursor: hasConfigs ? "pointer" : "default" }}
                >
                  <img
                    src={offer.image}
                    alt={`Offer ${(idx % banners.length) + 1}`}
                    className="so-banner-img"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
