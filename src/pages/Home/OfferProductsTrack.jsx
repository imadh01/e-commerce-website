import { Container, Button } from "react-bootstrap";
import { useRef } from "react";
import { getDiscountPercent } from "../../utils/pricing";
import { handleImgError } from "../../utils/imageFallback";

export default function OfferProductsTrack({
  products = [],
  cartItems,
  isLoggedIn,
  onAddToCart,
  onSetQuantity,
  onAddToCartUnauth,
  onQuickView,
}) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({
      left: dir === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <section className="offer-products-section">
      <Container fluid className="px-4">
        <h2 className="op-heading">Offer Products</h2>

        <div className="op-track-wrap">
          <button
            type="button"
            className="op-arrow op-arrow-left"
            onClick={() => scroll("left")}
          >
            &#8249;
          </button>

          <div className="op-track" ref={trackRef}>
            {products.map((product) => {
              const discountNum = getDiscountPercent(
                product.price,
                product.mrp,
              );

              return (
                <div className="op-card" key={product.id}>
                  <div
                    className="op-img-wrap"
                    onClick={() => onQuickView(product)}
                    style={{ cursor: "pointer" }}
                  >
                    {discountNum && (
                      <span className="product-discount-badge">
                        {discountNum}% OFF
                      </span>
                    )}

                    <img
                      src={product.image}
                      alt={product.name}
                      className="op-img"
                      loading="lazy"
                      onError={handleImgError}
                    />
                  </div>

                  <div className="op-info">
                    <div className="product-name">{product.name}</div>

                    <div className="product-price mb-1">
                      ₹{parseFloat(product.price).toFixed(2)}
                      {product.mrp &&
                        parseFloat(product.mrp) > parseFloat(product.price) && (
                          <span
                            className="text-muted text-decoration-line-through ms-2"
                            style={{ fontSize: "0.9rem" }}
                          >
                            ₹{parseFloat(product.mrp).toFixed(2)}
                          </span>
                        )}
                    </div>

                    {isLoggedIn && cartItems[product.id]?.quantity > 0 ? (
                      <div className="product-qty-control mt-auto">
                        <button
                          type="button"
                          onClick={() =>
                            onSetQuantity(
                              product.id,
                              cartItems[product.id].quantity - 1,
                            )
                          }
                        >
                          −
                        </button>

                        <span>{cartItems[product.id].quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            onAddToCart(
                              {
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                mrp: product.mrp,
                                image: product.image,
                              },
                              1,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="dark"
                        size="sm"
                        className="mt-auto add-to-cart-btn w-100"
                        onClick={() =>
                          onAddToCartUnauth({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            mrp: product.mrp,
                            image: product.image,
                          })
                        }
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="op-arrow op-arrow-right"
            onClick={() => scroll("right")}
          >
            &#8250;
          </button>
        </div>
      </Container>
    </section>
  );
}
