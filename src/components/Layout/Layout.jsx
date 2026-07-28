import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CartFloatingBar from "../CartFloatingBar/CartFloatingBar";

// Wraps every page with the shared Header and Footer, so individual
// page components (Home, About, etc.) only need to render their own
// content — they never import Header/Footer themselves.
//
// <Outlet /> is React Router's placeholder for "whichever page matched
// the current URL goes here."
export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartFloatingBar />
    </>
  );
}
