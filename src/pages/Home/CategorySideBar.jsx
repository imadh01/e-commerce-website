import { ListGroup } from "react-bootstrap";

export default function CategorySidebar({
  categories,
  subcategories,
  activeCategory,
  activeSubcategory,
  expandedCategoryId,
  onAllClick,
  onCategoryClick,
  onSubcategoryClick,
}) {
  return (
    <ListGroup className="category-sidebar">
      <ListGroup.Item
        action
        active={activeCategory === "all"}
        onClick={onAllClick}
        className="d-flex align-items-center gap-2"
      >
        <span>🛒</span>
        <span className="fw-semibold">All Products</span>
      </ListGroup.Item>

      {categories.map((cat) => {
        const catSubs = subcategories.filter((s) => s.category_id === cat.id);
        const isExpanded = expandedCategoryId === cat.id;
        const isActive = activeCategory === cat.id && !activeSubcategory;

        return (
          <div key={cat.id}>
            <ListGroup.Item
              action
              active={isActive}
              onClick={() => onCategoryClick(cat.id, isExpanded)}
              className="d-flex align-items-center gap-2"
            >
              <img
                src={cat.image}
                alt=""
                width={22}
                height={22}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
              <span className="fw-semibold flex-grow-1">{cat.name}</span>
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
                    onClick={(e) => onSubcategoryClick(e, cat.id, sub.id)}
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
  );
}
