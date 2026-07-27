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
  Modal,
} from "react-bootstrap";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useCart } from "../../context/CartContext";
import {
  fetchCatalog,
  fetchSundayOffers,
  fetchSundayOfferConfig,
} from "./homeApi";
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
  const { addToCart, cartItems, setQuantity, setOfferConfigs } = useCart();
  const { user, isLoggedIn } = useAuth();
  const {
    categories,
    subcategories,
    products: items,
    isLoading,
    error,
  } = useCatalog();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const itemsPerPage = 20;

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  // ===== SUNDAY OFFERS STATE =====
  const [sundayOffers, setSundayOffers] = useState(null);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offerConfigsLocal, setOfferConfigsLocal] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadOffers() {
      try {
        const data = await fetchSundayOffers();
        if (!cancelled) setSundayOffers(data);
      } catch (err) {
        console.error("Sunday offers fetch error:", err);
      } finally {
        if (!cancelled) setOffersLoading(false);
      }
    }
    loadOffers();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch offer configurations when user is logged in
  useEffect(() => {
    if (!user?.UserID) return;
    let cancelled = false;
    async function loadConfigs() {
      try {
        const data = await fetchSundayOfferConfig(user.UserID);
        if (!cancelled) {
          const configs = data.configurations || [];
          setOfferConfigsLocal(configs);
          setOfferConfigs(configs);
        }
      } catch (err) {
        console.error("Offer config fetch error:", err);
      }
    }
    loadConfigs();
    return () => {
      cancelled = true;
    };
  }, [user?.UserID]);

  function handleBannerClick(index) {
    if (offerConfigsLocal.length > 0) {
      // Match banner index to config, or show first config
      const config = offerConfigsLocal[index] || offerConfigsLocal[0];
      setActiveOffer(config);
    }
  }

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

  // Determine if we have offer data to show
  const hasOfferBanners = sundayOffers?.weekend_offers?.length > 0;
  const hasOfferProducts = sundayOffers?.offer_products?.length > 0;
  const showOffersSection =
    !offersLoading && (hasOfferBanners || hasOfferProducts);
  const offerLabel = sundayOffers?.offer_label || "Sunday Offers";

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

      {/* ===== SUNDAY OFFERS BANNERS ===== */}
      {showOffersSection && hasOfferBanners && (
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
                {sundayOffers.weekend_offers.map((offer, idx) => (
                  <div
                    className="so-banner-card"
                    key={idx}
                    onClick={() => handleBannerClick(idx)}
                    role="button"
                    style={{
                      cursor:
                        offerConfigsLocal.length > 0 ? "pointer" : "default",
                    }}
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
      )}

      {/* ===== FEATURES BAR ===== */}
      <section className="features-bar">
        <Container fluid className="px-4">
          <Row xs={1} sm={2} lg={4} className="g-3">
            <Col>
              <div className="feature-card">
                <div className="feature-icon feature-icon-orange">🏷️</div>
                <div>
                  <div className="feature-title">Best Prices & Offers</div>
                  <div className="feature-desc">
                    Affordable prices on all products
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              <div className="feature-card">
                <div className="feature-icon feature-icon-blue">🚚</div>
                <div>
                  <div className="feature-title">Fast Delivery</div>
                  <div className="feature-desc">
                    Quick delivery right to your door
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              <div className="feature-card">
                <div className="feature-icon feature-icon-green">✅</div>
                <div>
                  <div className="feature-title">Quality Assured</div>
                  <div className="feature-desc">
                    Genuine products, always fresh
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              <div className="feature-card">
                <div className="feature-icon feature-icon-purple">⭐</div>
                <div>
                  <div className="feature-title">Share & Earn</div>
                  <div className="feature-desc">
                    Refer friends & get rewards
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== OFFER PRODUCTS (horizontal scroll) ===== */}
      {showOffersSection && hasOfferProducts && (
        <section className="offer-products-section">
          <Container fluid className="px-4">
            <h2 className="op-heading">Offer Products</h2>
            <div className="op-track">
              {sundayOffers.offer_products.map((product) => {
                const discountNum =
                  product.mrp && product.mrp > product.price
                    ? Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100,
                      )
                    : null;

                return (
                  <div className="op-card" key={product.id}>
                    <div className="op-img-wrap">
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
                      />
                    </div>
                    <div className="op-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-price mb-1">
                        ₹{parseFloat(product.price).toFixed(2)}
                        {product.mrp &&
                          parseFloat(product.mrp) >
                            parseFloat(product.price) && (
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
                              setQuantity(
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
                              addToCart(
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
                            handleCardAddToCart({
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
          </Container>
        </section>
      )}

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

      {/* ===== OFFER DETAILS MODAL ===== */}
      <Modal
        show={!!activeOffer}
        onHide={() => setActiveOffer(null)}
        centered
        size="lg"
        className="offer-modal"
      >
        {activeOffer && (
          <>
            <Modal.Header closeButton className="offer-modal-header">
              <Modal.Title className="offer-modal-title">
                🎁 {activeOffer.title || "Offer Details"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="offer-modal-body">
              {activeOffer.description && (
                <p className="offer-modal-desc">{activeOffer.description}</p>
              )}
              {activeOffer.condition_type && (
                <div className="offer-condition-badge">
                  {activeOffer.condition_type === "MinOrderValue"
                    ? `🛒 Minimum order of ₹${activeOffer.condition_value}`
                    : `${activeOffer.condition_type}: ${activeOffer.condition_value}`}
                </div>
              )}

              {activeOffer.offeritems && activeOffer.offeritems.length > 0 && (
                <>
                  <h6 className="offer-items-heading">
                    Free items you'll receive
                  </h6>
                  <Row xs={2} md={3} lg={4} className="g-3">
                    {activeOffer.offeritems.map((item) => (
                      <Col key={item.id}>
                        <Card className="offer-item-card">
                          <div className="offer-item-img-wrap">
                            <Card.Img
                              variant="top"
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="offer-item-img"
                            />
                          </div>
                          <Card.Body className="p-2">
                            <div className="offer-item-name">{item.name}</div>
                            <div className="offer-item-pricing">
                              <span className="offer-item-free">FREE</span>
                              {item.mrp && (
                                <span className="offer-item-mrp">
                                  ₹{parseFloat(item.mrp).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => setActiveOffer(null)}
              >
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
      <ToastContainer
        position="top-center"
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
