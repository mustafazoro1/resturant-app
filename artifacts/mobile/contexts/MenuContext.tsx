import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { MENU_ITEMS, type MenuItem } from "@/constants/data";
import { apiToMenuItem, type ApiMenuItem } from "@/lib/menuUtils";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

type MenuContextValue = {
  menuItems: MenuItem[];
  loaded: boolean;
  getItemById: (id: string) => MenuItem | undefined;
  refresh: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [apiItems, setApiItems] = useState<ApiMenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    console.log("🔥 Initializing Firestore real-time menu listener...");
    
    // Subscribe to real-time changes in menuItems collection
    const menuCollection = collection(db, "menuItems");
    const unsubscribe = onSnapshot(
      menuCollection,
      (querySnapshot) => {
        const items: ApiMenuItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as ApiMenuItem);
        });
        console.log(`✅ Loaded ${items.length} menu items from Firestore`);
        setApiItems(items);
        setLoaded(true);
      },
      (error) => {
        console.error("❌ Firestore Menu Subscription failed:", error);
        // Set loaded true to fall back to static/bundled menu without freezing the UI
        setLoaded(true);
      }
    );

    return () => {
      console.log("🔌 Cleaning up Firestore menu listener...");
      unsubscribe();
    };
  }, [tick]);

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!apiItems.length) return MENU_ITEMS;
    return apiItems.filter((a) => a.available).map(apiToMenuItem);
  }, [apiItems]);

  const getItemById = (id: string) =>
    menuItems.find((i) => i.id === id) ?? MENU_ITEMS.find((i) => i.id === id);

  const value = useMemo(
    () => ({
      menuItems,
      loaded,
      getItemById,
      refresh: () => setTick((t) => t + 1),
    }),
    [menuItems, loaded],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return ctx;
}
