import { Container } from "react-bootstrap";
import { useEffect, useRef } from "react";

export default function SundayOffersBanners({
  banners,
  offerLabel,
  hasConfigs,
  onBannerClick,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="so-banners" ref={scrollRef}>
            {banners.map((offer, idx) => (
              <div
                className="so-banner-card"
                key={idx}
                onClick={() => onBannerClick(idx)}
                role="button"
                style={{ cursor: hasConfigs ? "pointer" : "default" }}
              >
                <img
                  src={offer.image}
                  alt={`Offer ${idx + 1}`}
                  className="so-banner-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
