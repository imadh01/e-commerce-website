import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { CatalogProvider } from "./context/CatalogContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { Container, Spinner } from "react-bootstrap";

// Eagerly loaded — always needed on first paint
import Home from "./pages/Home/Home";

// Lazy loaded — only fetched when the user navigates to these routes
const About = lazy(() => import("./pages/About/About"));
const FAQ = lazy(() => import("./pages/FAQ/FAQ"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const Privacy = lazy(() => import("./pages/Privacy/Privacy"));
const Terms = lazy(() => import("./pages/Terms/Terms"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const Login = lazy(() => import("./pages/Login/Login"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess/OrderSuccess"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Orders = lazy(() => import("./pages/Orders/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails/OrderDetails"));
const OrderTracking = lazy(() => import("./pages/OrderTracking/OrderTracking"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

function PageLoader() {
  return (
    <Container className="text-center py-5">
      <Spinner animation="border" style={{ color: "var(--brand-orange)" }} />
      <p className="text-muted mt-3">Loading...</p>
    </Container>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <CatalogProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/order-success/:orderId"
                      element={<OrderSuccess />}
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-details/:orderId"
                      element={
                        <ProtectedRoute>
                          <OrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-tracking/:orderId"
                      element={
                        <ProtectedRoute>
                          <OrderTracking />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CatalogProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
