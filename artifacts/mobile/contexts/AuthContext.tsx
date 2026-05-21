import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface SavedAddress {
  id: string;
  label: "Home" | "Work" | "Other";
  address: string;
  isDefault: boolean;
}

export interface User {
  name: string;
  phone: string;
  email?: string;
  profilePicUrl?: string;
  addresses: SavedAddress[];
  loyaltyPoints: number;
}

export const LOYALTY_TIERS = [
  { points: 50, discount: 10, label: "10% off" },
  { points: 75, discount: 15, label: "15% off" },
  { points: 100, discount: 25, label: "25% off" },
] as const;

export const MAX_LOYALTY_POINTS = 100;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "name" | "phone" | "email" | "profilePicUrl">>) => Promise<void>;
  uploadProfilePic: (uri: string) => Promise<void>;
  addAddress: (address: Omit<SavedAddress, "id">) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Omit<SavedAddress, "id">>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  defaultAddress: SavedAddress | null;
  awardPoints: (orderTotal: number) => Promise<number>;
  redeemPoints: (points: number) => Promise<void>;
  availableTier: (typeof LOYALTY_TIERS)[number] | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  uploadProfilePic: async () => {},
  addAddress: async () => {},
  updateAddress: async () => {},
  removeAddress: async () => {},
  setDefaultAddress: async () => {},
  defaultAddress: null,
  awardPoints: async () => 0,
  redeemPoints: async () => {},
  availableTier: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("rfc_user").then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data) as User;
          if (typeof parsed.loyaltyPoints !== "number") {
            parsed.loyaltyPoints = 0;
          }
          setUser(parsed);
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persist = async (u: User | null) => {
    if (u) {
      await AsyncStorage.setItem("rfc_user", JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem("rfc_user");
    }
  };

  const signIn = useCallback(async (name: string, phone: string) => {
    const newUser: User = { name, phone, addresses: [], loyaltyPoints: 0 };
    setUser(newUser);
    await persist(newUser);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await persist(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<User, "name" | "phone" | "email" | "profilePicUrl">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        persist(updated);
        return updated;
      });
    },
    []
  );

  const uploadProfilePic = useCallback(async (uri: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, profilePicUrl: uri };
      persist(updated);
      return updated;
    });
  }, []);


  const addAddress = useCallback(async (address: Omit<SavedAddress, "id">) => {
    setUser((prev) => {
      if (!prev) return prev;
      const id = Date.now().toString();
      const newAddr: SavedAddress = { ...address, id };
      const addresses = address.isDefault
        ? [...prev.addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
        : [...prev.addresses, newAddr];
      const updated = { ...prev, addresses };
      persist(updated);
      return updated;
    });
  }, []);

  const updateAddress = useCallback(
    async (id: string, updates: Partial<Omit<SavedAddress, "id">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const addresses = prev.addresses.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        );
        const updated = { ...prev, addresses };
        persist(updated);
        return updated;
      });
    },
    []
  );

  const removeAddress = useCallback(async (id: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, addresses: prev.addresses.filter((a) => a.id !== id) };
      persist(updated);
      return updated;
    });
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const addresses = prev.addresses.map((a) => ({ ...a, isDefault: a.id === id }));
      const updated = { ...prev, addresses };
      persist(updated);
      return updated;
    });
  }, []);

  // Returns how many points were actually awarded
  const awardPoints = useCallback(async (orderTotal: number): Promise<number> => {
    const earned = Math.floor(orderTotal / 100);
    if (earned <= 0) return 0;
    let actualAwarded = 0;
    setUser((prev) => {
      if (!prev) return prev;
      const current = prev.loyaltyPoints;
      const newPoints = Math.min(current + earned, MAX_LOYALTY_POINTS);
      actualAwarded = newPoints - current;
      const updated = { ...prev, loyaltyPoints: newPoints };
      persist(updated);
      return updated;
    });
    return actualAwarded;
  }, []);

  const redeemPoints = useCallback(async (points: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newPoints = Math.max(0, prev.loyaltyPoints - points);
      const updated = { ...prev, loyaltyPoints: newPoints };
      persist(updated);
      return updated;
    });
  }, []);

  const defaultAddress = user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0] ?? null;

  const availableTier =
    user
      ? ([...LOYALTY_TIERS].reverse().find((t) => (user.loyaltyPoints ?? 0) >= t.points) ?? null)
      : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        updateProfile,
        uploadProfilePic,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        defaultAddress,
        awardPoints,
        redeemPoints,
        availableTier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
