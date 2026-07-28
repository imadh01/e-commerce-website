import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";
import { getDiscountPercent } from "../../utils/pricing";

export default function ProductGrid({
  title,
  items,
  isLoading,
  error,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  cartItems,
  isLoggedIn,
  onAddToCart,
  onSetQuantity,
  onQuickView,
  onPageChange,
  renderPagination,
}) {
  return (
    <>
      <h2 className="fw-bold mb-3">{title}</h2>

      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="text-muted mt-3">Loading products...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!isLoading && !error && totalItems === 0 && (
        <Alert variant="info">No products found in this category.</Alert>
      )}

      {!isLoading && !error && totalItems > 0 && (
        <>
          <Row xs={2} md={3} lg={4} className="g-3">
            {items.map((item) => (
              <Col key={item.id}>
                <Card className="h-100 product-card">
                  <div
                    className="product-image-wrap"
                    onClick={() => onQuickView(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onQuickView(item);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {getDiscountPercent(item.price, item.mrp) && (
                      <span className="product-discount-badge">
                        {getDiscountPercent(item.price, item.mrp)}% OFF
                      </span>
                    )}
                    <Card.Img
                      variant="top"
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="product-img"
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="product-price mb-1">
                      ₹{parseFloat(item.price).toFixed(2)}
                      {item.mrp &&
                        parseFloat(item.mrp) > parseFloat(item.price) && (
                          <span
                            className="text-muted text-decoration-line-through ms-2"
                            style={{ fontSize: "0.9rem" }}
                          >
                            ₹{parseFloat(item.mrp).toFixed(2)}
                          </span>
                        )}
                    </div>
                    <Card.Title className="product-name">
                      {item.name}
                    </Card.Title>
                    <Card.Text className="text-muted small mb-3">
                      {item.code}
                    </Card.Text>

                    {isLoggedIn && cartItems[item.id]?.quantity > 0 ? (
                      <div className="product-qty-control mt-auto">
                        <button
                          type="button"
                          onClick={() =>
                            onSetQuantity(
                              item.id,
                              cartItems[item.id].quantity - 1,
                            )
                          }
                        >
                          −
                        </button>
                        <span>{cartItems[item.id].quantity}</span>
                        <button
                          type="button"
                          onClick={() => onAddToCart(item, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="dark"
                        size="sm"
                        className="mt-auto add-to-cart-btn"
                        onClick={() => onAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4 pt-3 border-top">
              <p className="text-muted small fw-semibold mb-0">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} products
              </p>
              <Pagination className="mb-0">{renderPagination()}</Pagination>
            </div>
          )}
        </>
      )}
    </>
  );
}
