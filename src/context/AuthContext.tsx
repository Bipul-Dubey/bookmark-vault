// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { FirestoreService } from "@/lib/firestore";

const getAuthErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/configuration-not-found":
      return "Authentication service is not properly configured.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed. Please try again.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/requires-recent-login":
      return "For security reasons, please sign in again to delete your account.";
    default:
      return "An error occurred during authentication. Please try again.";
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  reauthenticateWithPassword: (password: string) => Promise<void>;
  reauthenticateWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  deleteAccount: async () => {},
  reauthenticateWithPassword: async () => {},
  reauthenticateWithGoogle: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed in!");
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error.code));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      // Create user with email and password
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user profile with display name
      await updateProfile(result.user, {
        displayName: name,
      });

      // Optional: Store additional user data in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        name: name,
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Account created successfully!");
      // Success toast will be shown by the context
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully signed in with Google!");
    } catch (error: any) {
      toast.error(getAuthErrorMessage(error.code));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully signed out!");
    } catch (error: any) {
      toast.error("Error signing out");
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      if (user) {
        await updateProfile(user, { displayName });
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error("Error updating profile");
      throw error;
    }
  };

  // Separate re-authentication methods
  const reauthenticateWithPassword = async (password: string) => {
    if (!user || !user.email) {
      throw new Error("No authenticated user or email found");
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      toast.success("Identity verified successfully");
    } catch (error: any) {
      console.error("Password re-authentication failed:", error);
      if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      }
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const reauthenticateWithGoogle = async () => {
    if (!user) {
      throw new Error("No authenticated user found");
    }

    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      toast.success("Identity verified successfully");
    } catch (error: any) {
      console.error("Google re-authentication failed:", error);
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in popup was closed. Please try again.");
      }
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  // Simplified delete account method
  const deleteAccount = async () => {
    if (!user) throw new Error("No user authenticated");

    try {
      console.log("Starting account deletion process...");

      // Step 1: Delete user data from Firestore
      console.log("Deleting user bookmarks...");
      await FirestoreService.deleteUserBookmarks(user.uid);
      console.log("User bookmarks deleted successfully");

      // Step 2: Delete the Firebase user account
      console.log("Deleting Firebase user account...");
      await deleteUser(user);

      toast.success("Account deleted successfully");
      console.log("Account deletion completed");
    } catch (error: any) {
      console.error("Delete account error:", error);

      // Let the UI component handle the requires-recent-login error
      // by showing the re-authentication modal
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    deleteAccount,
    reauthenticateWithPassword,
    reauthenticateWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
