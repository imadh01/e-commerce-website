import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchCatalog } from "../api/homeApi";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCatalog();
      setCategories(data.categories || []);
      setSubcategories(data.subcategories || []);
      setProducts(data.products || []);
    } catch (err) {
      setError("Failed to load products. Please try again later.");
      console.error("Catalog fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch once on app startup — not on every page visit.
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const value = {
    categories,
    subcategories,
    products,
    isLoading,
    error,
    refreshCatalog: loadCatalog, // escape hatch: pull-to-refresh, admin update, etc.
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
