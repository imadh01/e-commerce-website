import { useState } from "react";
import "./Contact.css";
import { usePageTitle } from "../../hooks/usePageTitle";
import { submitContactForm } from "../../api/contactApi";

const validators = {
  fullName: (value) =>
    value.trim().length >= 2 ? "" : "Please enter your full name.",
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? ""
      : "Please enter a valid email address.",
  phone: (value) => {
    if (value.trim() === "") return "";
    return /^[0-9+\-\s()]{6,}$/.test(value.trim())
      ? ""
      : "Please enter a valid phone number.";
  },
  message: (value) =>
    value.trim().length >= 10
      ? ""
      : "Message should be at least 10 characters.",
};

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
};

export default function Contact() {
  usePageTitle("Contact Us");
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    Object.keys(validators).forEach((field) => {
      const message = validators[field](formData[field]);
      newErrors[field] = message;
      if (message) hasError = true;
    });

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, phone: true, message: true });

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await submitContactForm({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setShowSuccess(true);
      setFormData(initialFormState);
      setTouched({});
      setErrors({});
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      setErrors({
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="hero-text">
          <h1>
            Do you need support?
            <br />
            Our team is ready to help
          </h1>
          <p>
            We are passionate about building carefully thought out products that
            will improve your shopping experience.
          </p>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1553775282-20af80779df7?auto=format&fit=crop&w=1000&q=80"
            alt="Two customer support agents wearing headsets, ready to help"
          />
        </div>
      </section>

      <section className="support-section">
        <div className="support-inner">
          <div className="support-text">
            <h2>Support is our main priority</h2>
            <p>
              Our team responds quickly and personally to every request. Whether
              it's a question about your order, your account, or anything else —
              we're here to help you get sorted, fast.
            </p>
          </div>

          <div className="contact-form-wrap">
            <form onSubmit={handleSubmit} noValidate>
              <div className={`field ${errors.fullName ? "has-error" : ""}`}>
                <label htmlFor="fullName">Full Name (required)</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter Your Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.fullName && (
                  <span className="error-msg">{errors.fullName}</span>
                )}
              </div>

              <div className={`field ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="email">Email Address (required)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.email && (
                  <span className="error-msg">{errors.email}</span>
                )}
              </div>

              <div className={`field ${errors.phone ? "has-error" : ""}`}>
                <label htmlFor="phone">Phone (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phone && (
                  <span className="error-msg">{errors.phone}</span>
                )}
              </div>

              <div className={`field ${errors.message ? "has-error" : ""}`}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Briefly describe.."
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.message && (
                  <span className="error-msg">{errors.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="send-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {showSuccess && (
                <div className="form-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#F06E25"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 12L11 15L16 9"
                      stroke="#F06E25"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    Thanks! Your message has been sent. We'll get back to you
                    soon.
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="info-strip">
        <div className="info-inner">
          <div className="info-item">
            <div className="info-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#F06E25"
                  strokeWidth="2"
                />
                <path
                  d="M12 2V5"
                  stroke="#F06E25"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 19V22"
                  stroke="#F06E25"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M2 12H5"
                  stroke="#F06E25"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M19 12H22"
                  stroke="#F06E25"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h3>Office Location</h3>
              <p>1317-D, EC Road, Manamelkudi – 614 620</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.9C11.5 20.35 3.65 12.5 3.1 3C3.08 2.45 3.53 2 4.08 2H7.08C7.6 2 8.03 2.4 8.08 2.92C8.19 4.05 8.45 5.16 8.85 6.21C9.02 6.64 8.92 7.13 8.58 7.47L7.09 8.96C8.51 11.55 10.45 13.49 13.04 14.91L14.53 13.42C14.87 13.08 15.36 12.98 15.79 13.15C16.84 13.55 17.95 13.81 19.08 13.92C19.6 13.97 20 14.41 20 14.92"
                  stroke="#F06E25"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3>Call Us Anytime</h3>
              <p>+91 9500 950006 &nbsp;&nbsp; +91 7200 737002</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8L10.89 13.26C11.55 13.7 12.45 13.7 13.11 13.26L21 8"
                  stroke="#F06E25"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="#F06E25"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <h3>Send Mail</h3>
              <p>mamluk@mamluk.in</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
