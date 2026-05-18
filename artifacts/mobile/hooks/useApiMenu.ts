import { useEffect, useState } from "react";

type ApiMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  spicy: boolean;
  popular: boolean;
  calories: number | null;
  imageUrl: string | null;
};

const API_BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`
  : "";

export function useApiMenu() {
  const [apiItems, setApiItems] = useState<ApiMenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setLoaded(true);
      return;
    }
    fetch(`${API_BASE}/api/mobile/menu`)
      .then((r) => r.json())
      .then((data: ApiMenuItem[]) => {
        if (Array.isArray(data)) setApiItems(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { apiItems, loaded };
}
