import { useState } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import "./Login.css";

export default function Login() {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isLoggedIn,
    isLoading,
    authStep,
    authPhone,
    sendOtp,
    verifyOtp,
    resetAuthFlow,
  } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/";

  if (isLoggedIn) {
    navigate(redirectTo, { replace: true });
    return null;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");

    const cleaned = phone.trim();
    if (!/^\d{10}$/.test(cleaned)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    try {
      await sendOtp(cleaned);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP");
      return;
    }

    try {
      await verifyOtp(otp.trim());
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleBack() {
    setError("");
    setOtp("");
    resetAuthFlow();
  }

  return (
    <div className="login-page">
      <Container>
        <div className="login-split">
          {/* ===== LEFT: ILLUSTRATION ===== */}
          <div className="login-left">
            <div className="login-left-content">
              <img
                src="/synergein-logo.jpg"
                alt="Mamluk"
                className="login-brand-logo"
              />
              <h2 className="login-left-title">
                Fresh Groceries,
                <br />
                Delivered to You
              </h2>
              <p className="login-left-text">
                Shop from thousands of quality products at the best prices. Fast
                delivery, easy returns.
              </p>
              <div className="login-features">
                <div className="login-feature">
                  <span className="feature-icon">🛒</span>
                  <span>1000+ Products</span>
                </div>
                <div className="login-feature">
                  <span className="feature-icon">🚚</span>
                  <span>Fast Delivery</span>
                </div>
                <div className="login-feature">
                  <span className="feature-icon">💰</span>
                  <span>Best Prices</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: FORM ===== */}
          <div className="login-right">
            {/* Step indicator */}
            <div className="login-steps">
              <div
                className={`login-step ${authStep === "phone" ? "active" : "done"}`}
              >
                <span className="step-dot">1</span>
                <span className="step-label">Phone</span>
              </div>
              <div className="step-line" />
              <div
                className={`login-step ${authStep === "otp" ? "active" : ""}`}
              >
                <span className="step-dot">2</span>
                <span className="step-label">Verify</span>
              </div>
            </div>

            {/* ===== PHONE STEP ===== */}
            {authStep === "phone" && (
              <>
                <div className="login-header">
                  <h1 className="login-title">Welcome</h1>
                  <p className="login-subtitle">
                    Enter your phone number to get started
                  </p>
                </div>

                <form onSubmit={handleSendOtp}>
                  <Form.Group className="mb-4">
                    <Form.Label className="login-label">
                      Phone Number
                    </Form.Label>
                    <div className="phone-input-wrap">
                      <span className="phone-prefix">+91</span>
                      <Form.Control
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          );
                          if (error) setError("");
                        }}
                        className="phone-input"
                        autoFocus
                        maxLength={10}
                      />
                    </div>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="small">
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-100 login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* ===== OTP STEP ===== */}
            {authStep === "otp" && (
              <>
                <div className="login-header">
                  <h1 className="login-title">Verify OTP</h1>
                  <p className="login-subtitle">
                    We've sent a 6-digit code to{" "}
                    <strong>+91 {authPhone}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <Form.Group className="mb-4">
                    <Form.Label className="login-label">Enter OTP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        if (error) setError("");
                      }}
                      className="otp-input"
                      autoFocus
                      maxLength={6}
                    />
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="small">
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-100 login-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>

                  <button
                    type="button"
                    className="login-back-btn"
                    onClick={handleBack}
                  >
                    ← Change phone number
                  </button>
                </form>
              </>
            )}

            <div id="recaptcha-container" />
          </div>
        </div>
      </Container>
    </div>
  );
}
