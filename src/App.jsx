import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import FAQ from "./pages/FAQ/FAQ";
import Contact from "./pages/Contact/Contact";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Cart from "./pages/Cart/Cart";
import { CatalogProvider } from "./context/CatalogContext";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Orders from "./pages/Orders/Orders";
import OrderTracking from "./pages/OrderTracking/OrderTracking";
import OrderDetails from "./pages/OrderDetails/OrderDetails";

// Route map — every page lives inside <Layout /> so Header/Footer render
// once and only the matched page's content swaps out underneath them.
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <CatalogProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route element={<Layout />}>
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
                </Route>
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
              </Routes>
            </BrowserRouter>
          </CatalogProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
