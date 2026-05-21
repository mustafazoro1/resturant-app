import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { MENU_ITEMS, type MenuItem } from "@/constants/data";
import { getApiBase } from "@/lib/apiBase";
import { apiToMenuItem, type ApiMenuItem } from "@/lib/menuUtils";

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

  const apiBase = getApiBase();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!apiBase) {
        setLoaded(true);
        return;
      }
      try {
        const res = await fetch(`${apiBase}/api/mobile/menu`);
        const data = (await res.json()) as ApiMenuItem[];
        if (!cancelled && Array.isArray(data)) {
          setApiItems(data);
        }
      } catch {
        // fall back to bundled menu
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    setLoaded(false);
    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, tick]);

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
