import { useState, useEffect } from "react";
import { Container, Row, Col, Pagination, Spinner } from "react-bootstrap";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useCart } from "../../context/CartContext";
import { fetchSundayOffers, fetchSundayOfferConfig } from "../../api/homeApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import { Toast, ToastContainer } from "react-bootstrap";
import QuickViewModal from "../../components/QuickViewModal/QuickViewModal";
import { useCatalog } from "../../context/CatalogContext";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthPromptModal from "../../components/AuthPromptModal/AuthPromptModal";
import HeroBanner from "./HeroBanner";
import SundayOffersBanners from "./SundayOffersBanners";
import FeaturesBar from "./FeaturesBar";
import OfferProductsTrack from "./OfferProductsTrack";
import CategorySidebar from "./CategorySideBar";
import ProductGrid from "./ProductGrid";
import OfferDetailsModal from "./OfferDetailsModal";

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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // ===== SUNDAY OFFERS =====
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

  // ===== FILTERING + PAGINATION =====
  const uniqueItems = items.reduce((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id)) acc.push(item);
    return acc;
  }, []);
  const availableItems = uniqueItems.filter(
    (item) => parseFloat(item.price) > 0,
  );

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

  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    filteredItems = filteredItems.filter((item) =>
      item.name.toLowerCase().includes(term),
    );
  }

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===== HANDLERS =====
  function setSearchTerm(value) {
    if (value) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

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

  function handleCardAddToCart(item) {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return;
    }
    addToCart(item);
    setToast({ show: true, message: `${item.name} added to cart` });
  }

  function handleBannerClick(index) {
    if (offerConfigsLocal.length > 0) {
      setActiveOffer(offerConfigsLocal[index] || offerConfigsLocal[0]);
    }
  }

  function changePage(page) {
    setCurrentPage(page);
    window.scrollTo({
      top: (document.querySelector(".shop-layout")?.offsetTop || 0) - 80,
      behavior: "smooth",
    });
  }

  // ===== PAGINATION ITEMS =====
  function renderPagination() {
    if (totalPages <= 1) return null;
    const pageItems = [];
    pageItems.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => changePage(currentPage - 1)}
      />,
    );
    const pagesToShow = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2)
        pagesToShow.push(i);
    }
    pagesToShow.forEach((page, index) => {
      if (index > 0 && page - pagesToShow[index - 1] > 1) {
        pageItems.push(<Pagination.Ellipsis key={`e-${page}`} disabled />);
      }
      pageItems.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => changePage(page)}
        >
          {page}
        </Pagination.Item>,
      );
    });
    pageItems.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => changePage(currentPage + 1)}
      />,
    );
    return pageItems;
  }

  // ===== DERIVED =====
  const hasOfferBanners = sundayOffers?.weekend_offers?.length > 0;
  const hasOfferProducts = sundayOffers?.offer_products?.length > 0;

  {
    offersLoading && (
      <div className="text-center py-4">
        <Spinner
          animation="border"
          size="sm"
          style={{ color: "var(--brand-orange)" }}
        />
      </div>
    );
  }
  const showOffersSection =
    !offersLoading && (hasOfferBanners || hasOfferProducts);
  const offerLabel = sundayOffers?.offer_label || "Sunday Offers";

  const quickViewCategoryName = quickViewProduct
    ? categories.find((c) => c.id === quickViewProduct.category_id)?.name
    : null;

  const gridTitle =
    activeSubcategory !== null
      ? subcategories.find((s) => s.id === activeSubcategory)?.name ||
        "Products"
      : activeCategory === "all"
        ? "All Products"
        : categories.find((c) => c.id === activeCategory)?.name || "Products";

  // ===== RENDER =====
  return (
    <div className="home-page">
      <HeroBanner
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
      />
      {!searchTerm && (
        <Container fluid className="offers-features px-4 py-3">
          <Row className="g-4">
            <Col xs={12} lg={8}>
              {showOffersSection && hasOfferBanners && (
                <SundayOffersBanners
                  banners={sundayOffers.weekend_offers}
                  offerLabel={offerLabel}
                  hasConfigs={offerConfigsLocal.length > 0}
                  onBannerClick={handleBannerClick}
                />
              )}
            </Col>
            <Col xs={12} lg={4}>
              <FeaturesBar />
            </Col>
          </Row>
        </Container>
      )}
      {!searchTerm && showOffersSection && hasOfferProducts && (
        <OfferProductsTrack
          products={sundayOffers.offer_products}
          cartItems={cartItems}
          isLoggedIn={isLoggedIn}
          onAddToCart={addToCart}
          onSetQuantity={setQuantity}
          onAddToCartUnauth={handleCardAddToCart}
          onQuickView={setQuickViewProduct}
        />
      )}
      <Container fluid className="shop-layout">
        <Row className="g-4">
          <Col xs={12} md={3}>
            <CategorySidebar
              categories={categories}
              subcategories={subcategories}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              expandedCategoryId={expandedCategoryId}
              onAllClick={resetFilters}
              onCategoryClick={handleCategoryClick}
              onSubcategoryClick={handleSubcategoryClick}
            />
          </Col>
          <Col xs={12} md={9} className="shop-main">
            <ProductGrid
              title={gridTitle}
              items={paginatedItems}
              isLoading={isLoading}
              error={error}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredItems.length}
              totalPages={totalPages}
              cartItems={cartItems}
              isLoggedIn={isLoggedIn}
              onAddToCart={handleCardAddToCart}
              onSetQuantity={setQuantity}
              onQuickView={setQuickViewProduct}
              onPageChange={changePage}
              renderPagination={renderPagination}
            />
          </Col>
        </Row>
      </Container>
      <QuickViewModal
        show={!!quickViewProduct}
        onHide={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        categoryName={quickViewCategoryName}
        onDone={(product, action) => {
          setQuickViewProduct(null);
          setToast({
            show: true,
            message:
              action === "added"
                ? `${product.name} added to cart`
                : `Cart updated for ${product.name}`,
          });
        }}
        onAuthRequired={() => setShowAuthPrompt(true)}
      />
      <AuthPromptModal
        show={showAuthPrompt}
        onHide={() => setShowAuthPrompt(false)}
      />
      <OfferDetailsModal
        offer={activeOffer}
        onHide={() => setActiveOffer(null)}
      />
      <ToastContainer
        position="top-center"
        className="p-3"
        style={{
          zIndex: 9999,
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
        }}
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
