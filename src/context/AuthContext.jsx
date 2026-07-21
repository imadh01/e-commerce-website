import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
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
  const [authStep, setAuthStep] = useState("phone"); // "phone" | "otp"
  const [authPhone, setAuthPhone] = useState("");

  const isLoggedIn = !!user;
  // User exists in DB (has UserID from backend) vs just phone-verified
  const isRegistered = !!user?.UserID;

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

  // Step 1: Send OTP
  const sendOtp = useCallback(async (phoneNumber) => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();

      // Always clear previous reCAPTCHA before creating a new one
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          /* ignore */
        }
        window.recaptchaVerifier = null;
      }

      // Clear the container's innerHTML too — prevents "already rendered" error
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            // Reset on expiry
            window.recaptchaVerifier = null;
          },
        },
      );

      // Explicitly render before calling signInWithPhoneNumber
      await window.recaptchaVerifier.render();

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier,
      );

      setConfirmationResult(result);
      setAuthPhone(phoneNumber);
      setAuthStep("otp");
      return { success: true };
    } catch (err) {
      console.error("OTP send failed:", err);
      console.error("Error code:", err.code);

      // Clean up on failure
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          /* ignore */
        }
        window.recaptchaVerifier = null;
      }
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";

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

  // Step 2: Verify OTP → check if customer exists in DB
  const verifyOtp = useCallback(
    async (otp) => {
      if (!confirmationResult) {
        throw new Error("No OTP was sent. Please start over.");
      }

      setIsLoading(true);
      try {
        await confirmationResult.confirm(otp);

        // OTP verified — check Laravel DB
        const customer = await fetchCustomerByPhone(authPhone);

        if (customer) {
          // Existing customer — full user object
          setUser(customer);
        } else {
          // New user — phone-only session, no DB record yet.
          // They can browse and add to cart. Customer record is
          // created at checkout via /updateUserDetails.
          setUser({
            PrimaryMobile: authPhone,
            CustomerName: "",
            Addresses: [],
            _isNew: true, // flag so checkout knows to collect details
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

  // Called at checkout — creates or updates customer in DB
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
          // Address fields
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

        // Update local user with the full data from backend
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
    } catch {}
    setUser(null);
    resetAuthFlow();
  }, []);

  function resetAuthFlow() {
    setConfirmationResult(null);
    setAuthStep("phone");
    setAuthPhone("");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
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
