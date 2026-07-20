import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { fetchCatalog } from "./homeApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";

export default function Home() {
  usePageTitle("Home");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCatalog() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCatalog();

        if (!isCancelled) {
          setCategories(data.categories || []);
          setSubcategories(data.subcategories || []);
          setItems(data.products || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Failed to load products. Please try again later.");
          console.error("Catalog fetch error:", err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Deduplicate by product ID — the backend currently returns some
  const uniqueItems = items.reduce((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id)) {
      acc.push(item);
    }
    return acc;
  }, []);

  const availableItems = uniqueItems.filter(
    (item) => parseFloat(item.price) > 0,
  );

  // Subcategory takes priority over category when both could apply —
  // clicking a subcategory is a more specific choice than the category
  // it belongs to.
  //   console.log(
  //     "Sample product subcategory_id:",
  //     availableItems[0]?.subcategory_id,
  //     typeof availableItems[0]?.subcategory_id,
  //   );
  //   console.log("Sample subcategory object:", subcategories[0]);
  //   console.log(
  //     "Active subcategory selected:",
  //     activeSubcategory,
  //     typeof activeSubcategory,
  //   );
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

  //   console.log("Filter debug:", {
  //     activeCategory,
  //     activeSubcategory,
  //     totalAvailable: availableItems.length,
  //     afterFilter: filteredItems.length,
  //     sampleFiltered: filteredItems.slice(0, 3).map((i) => ({
  //       name: i.name,
  //       category_id: i.category_id,
  //       subcategory_id: i.subcategory_id,
  //     })),
  //   });

  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Thousand of best grocery items</h1>
          <p>Online Grocery Shopping at Low Price in Worldwide on Synergein</p>
          <div className="hero-search">
            <input type="text" placeholder="What are you looking..." />
            <button type="button" aria-label="Search">
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
            </button>
          </div>
        </div>
      </section>

      <section className="shop-layout">
        <div className="container-fluid px-4">
          <div className="row g-4">
            <aside className="col-12 col-md-3 category-sidebar">
              <div className="cat-item">
                <button
                  type="button"
                  className={`cat-row ${activeCategory === "all" ? "active-cat" : ""}`}
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveSubcategory(null);
                    setExpandedCategoryId(null);
                  }}
                >
                  <span className="cat-icon">🛒</span>
                  <span className="cat-name">All Products</span>
                </button>
              </div>

              {categories.map((cat) => {
                const catSubcategories = subcategories.filter(
                  (sub) => sub.category_id === cat.id,
                );
                const isExpanded = expandedCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`cat-item ${isExpanded ? "expanded" : ""}`}
                  >
                    <button
                      type="button"
                      className={`cat-row ${activeCategory === cat.id && !activeSubcategory ? "active-cat" : ""}`}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setActiveSubcategory(null);
                        // Toggle: clicking an already-expanded category collapses it
                        setExpandedCategoryId(isExpanded ? null : cat.id);
                      }}
                    >
                      <span className="cat-icon">
                        <img
                          src={cat.image}
                          alt=""
                          style={{
                            width: 22,
                            height: 22,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      </span>
                      <span className="cat-name">{cat.name}</span>
                      {catSubcategories.length > 0 && (
                        <svg
                          className="cat-chevron"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
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
                    </button>

                    {isExpanded && catSubcategories.length > 0 && (
                      <div className="cat-subitems">
                        {catSubcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            className={`sub-link ${activeSubcategory === sub.id ? "active-sub" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "Subcategory clicked:",
                                sub.id,
                                sub.name,
                              );
                              setActiveCategory(cat.id);
                              setActiveSubcategory(sub.id);
                            }}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </aside>

            <div className="col-12 col-md-9 shop-main">
              <div className="products-header">
                <h2>
                  {activeSubcategory !== null
                    ? subcategories.find((s) => s.id === activeSubcategory)
                        ?.name || "Products"
                    : activeCategory === "all"
                      ? "All Products"
                      : categories.find((c) => c.id === activeCategory)?.name ||
                        "Products"}
                </h2>
              </div>

              {isLoading && <p className="no-products">Loading products...</p>}

              {error && <p className="no-products">{error}</p>}

              {!isLoading && !error && filteredItems.length === 0 && (
                <p className="no-products">
                  No products found in this category.
                </p>
              )}

              {!isLoading && !error && filteredItems.length > 0 && (
                <div className="row g-3">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="col-6 col-md-4 col-lg-3">
                      <div className="product-card h-100">
                        <div className="product-image-wrap">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                          />
                        </div>
                        <div className="product-price">
                          ₹{parseFloat(item.price).toFixed(2)}
                          {item.mrp &&
                            parseFloat(item.mrp) > parseFloat(item.price) && (
                              <span className="old-price">
                                ₹{parseFloat(item.mrp).toFixed(2)}
                              </span>
                            )}
                        </div>
                        <div className="product-name">{item.name}</div>
                        <div className="product-unit">{item.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
