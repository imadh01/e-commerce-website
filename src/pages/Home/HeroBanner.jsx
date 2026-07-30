import { Button, Form, InputGroup } from "react-bootstrap";

export default function HeroBanner({ searchTerm, onSearchChange }) {
  return (
    <section className="hero-banner">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Thousands of best grocery items</h1>
        <p>Online Grocery Shopping at Low Price in Worldwide on Mamluk</p>
        <InputGroup
          className="hero-search-group mx-auto"
          style={{ maxWidth: 560 }}
        >
          <Form.Control
            type="text"
            placeholder="What are you looking..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="hero-search-input"
          />
          <Button
            variant="warning"
            className="hero-search-btn"
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "white" }}
            >
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
              <path
                d="M21 21L16.65 16.65"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </InputGroup>
      </div>
    </section>
  );
}
