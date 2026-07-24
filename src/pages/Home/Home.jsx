import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Pagination,
  ListGroup,
  Form,
  InputGroup,
} from "react-bootstrap";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useCart } from "../../context/CartContext";
import { fetchCatalog } from "./homeApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import { Toast, ToastContainer } from "react-bootstrap";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { getDiscountPercent } from "../../utils/pricing";
import { useCatalog } from "../../context/CatalogContext";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthPromptModal from "../../components/AuthPromptModal/AuthPromptModal";

export default function Home() {
  usePageTitle("Home");
  const { addToCart, cartItems, setQuantity } = useCart();
  const {
    categories,
    subcategories,
    products: items,
    isLoading,
    error,
  } = useCatalog();
  //   const [categories, setCategories] = useState([]);
  //   const [subcategories, setSubcategories] = useState([]);
  //   const [items, setItems] = useState([]);
  //   const [isLoading, setIsLoading] = useState(true);
  //   const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const itemsPerPage = 20;

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  //   useEffect(() => {
  //     let isCancelled = false;

  //     async function loadCatalog() {
  //       try {
  //         setIsLoading(true);
  //         setError(null);
  //         const data = await fetchCatalog();

  //         if (!isCancelled) {
  //           setCategories(data.categories || []);
  //           setSubcategories(data.subcategories || []);
  //           setItems(data.products || []);
  //         }
  //       } catch (err) {
  //         if (!isCancelled) {
  //           setError("Failed to load products. Please try again later.");
  //           console.error("Catalog fetch error:", err);
  //         }
  //       } finally {
  //         if (!isCancelled) {
  //           setIsLoading(false);
  //         }
  //       }
  //     }

  //     loadCatalog();
  //     return () => {
  //       isCancelled = true;
  //     };
  //   }, []);

  // Deduplicate + price filter
  const uniqueItems = items.reduce((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id)) {
      acc.push(item);
    }
    return acc;
  }, []);
  const availableItems = uniqueItems.filter(
    (item) => parseFloat(item.price) > 0,
  );

  // Category/subcategory filter
  let filteredItems = availableItems;
  if (activeSubcategory !== null) {
    filteredItems = availableItems.filter(
      (item) => item.subcategory_id === activeSubcategory,
    );
  } else if (activeCategory !== "all") {
    filteredItems = availableItems.filter(
      (item) => item.category_id === activeCategory,
    );
  }

  // Search filter
  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    filteredItems = filteredItems.filter((item) =>
      item.name.toLowerCase().includes(term),
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Shared reset helper
  function resetFilters() {
    setActiveCategory("all");
    setActiveSubcategory(null);
    setExpandedCategoryId(null);
    setCurrentPage(1);
    setSearchTerm("");
  }

  function handleCategoryClick(catId, isExpanded) {
    setActiveCategory(catId);
    setActiveSubcategory(null);
    setExpandedCategoryId(isExpanded ? null : catId);
    setCurrentPage(1);
  }

  function handleSubcategoryClick(e, catId, subId) {
    e.stopPropagation();
    setActiveCategory(catId);
    setActiveSubcategory(subId);
    setCurrentPage(1);
  }

  // Build pagination items
  function renderPagination() {
    if (totalPages <= 1) return null;

    const items = [];
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => changePage((p) => p - 1)}
      />,
    );

    const pagesToShow = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
        pagesToShow.push(i);
      }
    }

    pagesToShow.forEach((page, index) => {
      const prev = pagesToShow[index - 1];
      if (prev && page - prev > 1) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} disabled />);
      }
      items.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => changePage(page)}
        >
          {page}
        </Pagination.Item>,
      );
    });

    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => changePage((p) => p + 1)}
      />,
    );

    return items;
  }

  function handleQuickDone(product, action) {
    setQuickViewProduct(null);
    setToast({
      show: true,
      message:
        action === "added"
          ? `${product.name} added to cart`
          : `Cart updated for ${product.name}`,
    });
  }

  const { isLoggedIn } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  function handleCardAddToCart(item) {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return;
    }
    addToCart(item);
    setToast({ show: true, message: `${item.name} added to cart` });
  }

  // Resolve category name for the modal — the product only has category_id.
  const quickViewCategoryName = quickViewProduct
    ? categories.find((c) => c.id === quickViewProduct.category_id)?.name
    : null;

  function changePage(page) {
    setCurrentPage(page);
    document
      .querySelector(".shop-main")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }
  function setSearchTerm(value) {
    if (value) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  return (
    <div className="home-page">
      {/* ===== HERO BANNER ===== */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Thousand of best grocery items</h1>
          <p>Online Grocery Shopping at Low Price in Worldwide on Synergein</p>
          <InputGroup
            className="hero-search-group mx-auto"
            style={{ maxWidth: 560 }}
          >
            <Form.Control
              type="text"
              placeholder="What are you looking..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="hero-search-input"
            />
            <Button
              variant="warning"
              className="hero-search-btn"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
          </InputGroup>
        </div>
      </section>

      {/* ===== SHOP LAYOUT ===== */}
      <Container fluid className="shop-layout px-4">
        <Row className="g-4">
          {/* ===== SIDEBAR ===== */}
          <Col xs={12} md={3}>
            <ListGroup className="category-sidebar">
              <ListGroup.Item
                action
                active={activeCategory === "all"}
                onClick={resetFilters}
                className="d-flex align-items-center gap-2"
              >
                <span>🛒</span>
                <span className="fw-semibold">All Products</span>
              </ListGroup.Item>

              {categories.map((cat) => {
                const catSubs = subcategories.filter(
                  (s) => s.category_id === cat.id,
                );
                const isExpanded = expandedCategoryId === cat.id;
                const isActive =
                  activeCategory === cat.id && !activeSubcategory;

                return (
                  <div key={cat.id}>
                    <ListGroup.Item
                      action
                      active={isActive}
                      onClick={() => handleCategoryClick(cat.id, isExpanded)}
                      className="d-flex align-items-center gap-2"
                    >
                      <img
                        src={cat.image}
                        alt=""
                        width={22}
                        height={22}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                      />
                      <span className="fw-semibold flex-grow-1">
                        {cat.name}
                      </span>
                      {catSubs.length > 0 && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "none",
                            transition: "transform 0.25s ease",
                          }}
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </ListGroup.Item>

                    {isExpanded && catSubs.length > 0 && (
                      <ListGroup variant="flush" className="ms-4 border-0">
                        {catSubs.map((sub) => (
                          <ListGroup.Item
                            key={sub.id}
                            action
                            active={activeSubcategory === sub.id}
                            onClick={(e) =>
                              handleSubcategoryClick(e, cat.id, sub.id)
                            }
                            className="py-2 ps-3 border-0"
                            style={{ fontSize: "0.88rem" }}
                          >
                            {sub.name}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                );
              })}
            </ListGroup>
          </Col>

          {/* ===== MAIN PRODUCT AREA ===== */}
          <Col xs={12} md={9} className="shop-main">
            <h2 className="fw-bold mb-3">
              {activeSubcategory !== null
                ? subcategories.find((s) => s.id === activeSubcategory)?.name ||
                  "Products"
                : activeCategory === "all"
                  ? "All Products"
                  : categories.find((c) => c.id === activeCategory)?.name ||
                    "Products"}
            </h2>

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="warning" />
                <p className="text-muted mt-3">Loading products...</p>
              </div>
            )}

            {/* Error state */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Empty state */}
            {!isLoading && !error && filteredItems.length === 0 && (
              <Alert variant="info">No products found in this category.</Alert>
            )}

            {/* Product grid */}
            {!isLoading && !error && filteredItems.length > 0 && (
              <>
                <Row xs={2} md={3} lg={4} className="g-3">
                  {paginatedItems.map((item) => (
                    <Col key={item.id}>
                      <Card className="h-100 product-card">
                        <div
                          className="product-image-wrap"
                          onClick={() => setQuickViewProduct(item)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setQuickViewProduct(item);
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

                          {/* Cart-aware button: shows Add or +/- controls */}
                          {isLoggedIn && cartItems[item.id]?.quantity > 0 ? (
                            <div className="product-qty-control mt-auto">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(
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
                                onClick={() => addToCart(item, 1)}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <Button
                              variant="dark"
                              size="sm"
                              className="mt-auto add-to-cart-btn"
                              onClick={() => handleCardAddToCart(item)}
                            >
                              Add to Cart
                            </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4 pt-3 border-top">
                  <p className="text-muted small fw-semibold mb-0">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
                    of {filteredItems.length} products
                  </p>
                  <Pagination className="mb-0">{renderPagination()}</Pagination>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>

      <QuickViewModal
        show={!!quickViewProduct}
        onHide={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        categoryName={quickViewCategoryName}
        onDone={handleQuickDone}
        onAuthRequired={() => setShowAuthPrompt(true)}
      />
      <AuthPromptModal
        show={showAuthPrompt}
        onHide={() => setShowAuthPrompt(false)}
      />
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1100 }}
      >
        <Toast
          show={toast.show}
          onClose={() => setToast({ show: false, message: "" })}
          delay={2500}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white fw-semibold">
            ✓ {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
