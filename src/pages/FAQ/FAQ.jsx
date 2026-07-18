import { useState } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

// The questions live as data, not hardcoded JSX. Adding a 5th question
// later means adding one object here — no markup duplication needed.
const faqItems = [
  {
    question: "How to contact with Customer Service?",
    answer:
      "You can reach our Customer Service team through the Contact Us page, live chat, or by emailing support@synergein.com. Our team typically responds within 24 hours on business days.",
  },
  {
    question: "App installation failed, how to update system information?",
    answer:
      "If the app fails to install, first make sure your device's operating system is updated to the latest version. Go to your device Settings > System > Software Update, install any pending updates, restart your device, and try installing the app again.",
  },
  {
    question: "Website response taking time, how to improve?",
    answer:
      "Slow load times are usually caused by a weak internet connection or a browser cache buildup. Try clearing your browser cache, closing unused tabs, or switching to a stronger Wi-Fi connection. If the issue continues, let our support team know.",
  },
  {
    question: "How do I create an account?",
    answer:
      'Click "Sign In" at the top of the page, then select "Create Account." Fill in your name, email address, and a secure password, then verify your email to activate your new account.',
  },
];

export default function FAQ() {
  // Tracks which question is open by its index in the array.
  // null means "none open." Using a single value (not an array of
  // open items) naturally gives us the "only one open at a time"
  // accordion behavior — opening a new one automatically closes
  // whatever was open before, just by replacing this one value.
  const [openIndex, setOpenIndex] = useState(null);

  function toggleQuestion(index) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Frequently Asked Questions</h1>
          <div className="breadcrumb">
            <Link to="/">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 10.5L12 3L21 10.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 9.5V21H19V9.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Home
            </Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">FAQ</span>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className={`faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="faq-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
