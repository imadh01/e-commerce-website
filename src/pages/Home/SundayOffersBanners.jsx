import { Carousel } from "react-bootstrap";

export default function SundayOffersBanners({
  banners,
  offerLabel,
  hasConfigs,
  onBannerClick,
}) {
  return (
    <section className="sunday-offers-section">
      <div className="so-header">
        <h2 className="so-title">
          <span className="so-icon">🔥</span>
          {offerLabel}
        </h2>
      </div>
      <Carousel
        interval={2500}
        indicators={true}
        controls={true}
        className="so-carousel"
      >
        {banners.map((offer, idx) => (
          <Carousel.Item
            key={idx}
            onClick={() => onBannerClick(idx)}
            style={{ cursor: hasConfigs ? "pointer" : "default" }}
          >
            <img
              src={offer.image}
              alt={`Offer ${idx + 1}`}
              className="so-carousel-img"
              loading="lazy"
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
}
