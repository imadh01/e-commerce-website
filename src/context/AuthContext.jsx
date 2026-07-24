import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { signInWithPhoneNumber, signOut } from "firebase/auth";
import { getFirebaseAuth } from "../config/firebase";
import { fetchCustomerByPhone, upsertCustomer } from "../api/authApi";

const AuthContext = createContext(null);
const AUTH_KEY = "synergein_auth_v1";

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authStep, setAuthStep] = useState("phone");
  const [authPhone, setAuthPhone] = useState("");

  const isLoggedIn = !!user;
  const isRegistered = !!user?.UserID;

  // Persist user to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  // Step 1: Send OTP — uses window.recaptchaVerifier created by Login.jsx
  const sendOtp = useCallback(async (phoneNumber) => {
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;

      if (!appVerifier) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page.");
      }

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const auth = getFirebaseAuth();
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier,
      );

      setConfirmationResult(result);
      setAuthPhone(phoneNumber);
      setAuthStep("otp");
      return { success: true };
    } catch (err) {
      console.error("OTP send failed:", err);
      console.error("Error code:", err.code);

      // Reset reCAPTCHA on failure
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.render().then((widgetId) => {
            if (window.grecaptcha) {
              window.grecaptcha.reset(widgetId);
            }
          });
        } catch {
          /* ignore */
        }
      }

      throw new Error(
        err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : err.code === "auth/invalid-phone-number"
            ? "Invalid phone number. Please check and try again."
            : "Failed to send OTP. Please check the number and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Step 2: Verify OTP
  const verifyOtp = useCallback(
    async (otp) => {
      if (!confirmationResult) {
        throw new Error("No OTP was sent. Please start over.");
      }

      setIsLoading(true);
      try {
        await confirmationResult.confirm(otp);

        const customer = await fetchCustomerByPhone(authPhone);

        if (customer) {
          setUser(customer);
        } else {
          setUser({
            PrimaryMobile: authPhone,
            CustomerName: "",
            Addresses: [],
            _isNew: true,
          });
        }

        resetAuthFlow();
        return { isNew: !customer };
      } catch (err) {
        console.error("OTP verify failed:", err);
        if (err.code === "auth/invalid-verification-code") {
          throw new Error("Invalid OTP. Please check and try again.");
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [confirmationResult, authPhone],
  );

  // Save customer details at checkout
  const saveCustomerDetails = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        const updatedCustomer = await upsertCustomer({
          UserID: user?.UserID || null,
          CustomerName: data.CustomerName,
          FamilyName: data.FamilyName || "",
          PrimaryMobile: user?.PrimaryMobile,
          SecondaryMobile: data.SecondaryMobile || "",
          Email: data.Email || "",
          CustomerType: data.CustomerType || "Retail",
          BranchID: user?.BranchID || 1,
          IsActive: 1,
          AddressLine1: data.AddressLine1,
          AddressLine2: data.AddressLine2 || "",
          Landmark: data.Landmark || "",
          Locality: data.Locality || "",
          Taluk: data.Taluk || "",
          District: data.District || "",
          State: data.State || "",
          Country: data.Country || "India",
          PostalCode: data.PostalCode || "",
          AddressType: data.AddressType || "Home",
        });

        setUser(updatedCustomer);
        return updatedCustomer;
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const logout = useCallback(async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch {
      /* ignore */
    }
    setUser(null);
    resetAuthFlow();
  }, []);

  function resetAuthFlow() {
    setConfirmationResult(null);
    setAuthStep("phone");
    setAuthPhone("");
  }

  const defaultAddress =
    user?.Addresses?.find((a) => a.IsDefault === 1) ||
    user?.Addresses?.[0] ||
    null;

  const value = {
    user,
    isLoggedIn,
    isRegistered,
    isLoading,
    authStep,
    authPhone,
    sendOtp,
    verifyOtp,
    saveCustomerDetails,
    logout,
    resetAuthFlow,
    defaultAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
