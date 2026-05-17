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
  addresses: SavedAddress[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "name" | "phone" | "email">>) => Promise<void>;
  addAddress: (address: Omit<SavedAddress, "id">) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Omit<SavedAddress, "id">>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  defaultAddress: SavedAddress | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  addAddress: async () => {},
  updateAddress: async () => {},
  removeAddress: async () => {},
  setDefaultAddress: async () => {},
  defaultAddress: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("rfc_user").then((data) => {
      if (data) {
        try {
          setUser(JSON.parse(data));
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
    const newUser: User = { name, phone, addresses: [] };
    setUser(newUser);
    await persist(newUser);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await persist(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<User, "name" | "phone" | "email">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        persist(updated);
        return updated;
      });
    },
    []
  );

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

  const defaultAddress = user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0] ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        updateProfile,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        defaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
