import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import api from "../../api/axiosClient";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubscribe(e) {
    e.preventDefault();

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isValid) {
      setSubscribeMessage({
        text: "Please enter a valid email address.",
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/subscribe", { email: email.trim() });
      if (response.data.status) {
        setSubscribeMessage({
          text: "Thanks for subscribing! Check your inbox soon.",
          isError: false,
        });
        setEmail("");
      } else {
        setSubscribeMessage({
          text: response.data.message || "Already subscribed.",
          isError: true,
        });
      }
    } catch (err) {
      setSubscribeMessage({
        text: "Something went wrong. Please try again.",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubscribeMessage(null), 5000);
    }
  }

  const year = new Date().getFullYear();

  return (
    <>
      {/* ===== APP PROMO SECTION ===== */}
      <section className="app-promo">
        <div className="promo-inner">
          <div className="promo-text">
            <h2>Make your online shop easier with our mobile app</h2>
            <p>
              Mamluk makes online grocery shopping fast and easy. Get groceries
              delivered and order the best of seasonal farm fresh food.
            </p>
            <div className="store-badges">
              <a
                href="#"
                className="store-badge"
                aria-label="Download on the App Store"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.05 12.536c-.02-2.03 1.657-3.004 1.732-3.05-.943-1.378-2.41-1.566-2.932-1.588-1.25-.128-2.44.735-3.074.735-.635 0-1.613-.717-2.653-.697-1.365.02-2.626.795-3.328 2.018-1.42 2.464-.363 6.11 1.02 8.11.676.978 1.482 2.074 2.542 2.035 1.02-.04 1.404-.66 2.638-.66 1.234 0 1.58.66 2.658.638 1.098-.02 1.79-1 2.46-1.984.777-1.135 1.096-2.234 1.113-2.29-.024-.012-2.135-.82-2.156-3.267h-.02Z"
                    fill="white"
                  />
                  <path
                    d="M15.06 6.46c.562-.68.94-1.63.837-2.577-.808.033-1.79.539-2.372 1.218-.522.6-.978 1.573-.856 2.5.906.07 1.83-.46 2.39-1.14Z"
                    fill="white"
                  />
                </svg>
                <span>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </span>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.mamluk.app"
                className="store-badge"
                aria-label="Get it on Google Play"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3.6 2.6c-.35.36-.55.9-.55 1.6v15.6c0 .7.2 1.24.56 1.6l.08.07L12.9 12.7v-.2L3.68 2.53l-.08.07Z"
                    fill="white"
                  />
                  <path
                    d="M16 15.8l-3.1-3.1v-.2l3.1-3.1.07.04 3.67 2.08c1.05.6 1.05 1.56 0 2.16l-3.67 2.08-.07.04Z"
                    fill="white"
                  />
                  <path
                    d="M16.07 15.76 12.9 12.6 3.6 21.9c.35.37.92.42 1.57.05l10.9-6.19"
                    fill="white"
                  />
                  <path
                    d="M16.07 9.44 5.17 3.25c-.65-.37-1.22-.32-1.57.05l9.3 9.3 3.17-3.16Z"
                    fill="white"
                  />
                </svg>
                <span>
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </span>
              </a>
            </div>
          </div>
          <div className="promo-image">
            <img
              src="https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80"
              alt="Delivery person holding a bag of fresh groceries"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ===== SITE FOOTER ===== */}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-inner">
            <div className="footer-col brand-col">
              <Link to="/" className="footer-logo">
                <img
                  src="/synergein-logo.jpg"
                  alt="Synergein"
                  className="footer-logo-img"
                />
              </Link>
              <p className="footer-desc">
                We offer high-quality foods and the best delivery service, and
                the food market you can blindly trust
              </p>
              <div className="social-row">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 5.9c-.7.3-1.5.6-2.4.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.8A11.7 11.7 0 0 1 3.2 4.6a4.2 4.2 0 0 0 1.3 5.6c-.7 0-1.3-.2-1.9-.5v.1a4.2 4.2 0 0 0 3.3 4.1c-.6.2-1.3.2-1.9.1a4.2 4.2 0 0 0 3.9 2.9A8.3 8.3 0 0 1 2 18.6a11.7 11.7 0 0 0 6.3 1.9c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1v-.3Z" />
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                </a>
                <a href="#" className="social-icon" aria-label="YouTube">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="4" />
                    <path d="M10 9L15 12L10 15V9Z" fill="white" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>About Us</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
              <a href="#">About Team</a>
              <a href="#">Customer Support</a>
            </div>

            <div className="footer-col">
              <h4>Our Information</h4>
              <Link to="/privacy">Privacy Policy Update</Link>
              <Link to="/terms">Terms &amp; Conditions</Link>
              <a href="#">Return Policy</a>
              <a href="#">Site Map</a>
            </div>

            <div className="footer-col">
              <h4>Community</h4>
              <a href="#">Announcements</a>
              <Link to="/faq">Answer Center</Link>
              <a href="#">Discussion Boards</a>
              <a href="#">Giving Works</a>
            </div>

            <div className="footer-col subscribe-col">
              <h4>Subscribe Now</h4>
              <p className="footer-desc">
                Subscribe your email for newsletter and featured news based on
                your interest
              </p>
              <form className="subscribe-form" onSubmit={handleSubscribe}>
                <div className="subscribe-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 7L11.3 12.5C11.7 12.8 12.3 12.8 12.7 12.5L21 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <input
                    type="email"
                    placeholder="Write your email here"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                        ...
                      </span>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M4 12H20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 6L20 12L14 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {subscribeMessage && (
                  <p
                    className={`subscribe-msg ${subscribeMessage.isError ? "error" : ""}`}
                  >
                    {subscribeMessage.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <p>
              © Copyright {new Date().getFullYear()} Mamluk. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
