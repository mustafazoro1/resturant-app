import type { MenuItem } from "@/constants/data";
import { getApiBase } from "@/lib/apiBase";

export type ApiMenuItem = {
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

export function categoryNameToSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function apiToMenuItem(item: ApiMenuItem): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: categoryNameToSlug(item.category),
    popular: item.popular,
    spicy: item.spicy,
    calories: item.calories ?? undefined,
    imageUrl: item.imageUrl,
  };
}

export function resolveMenuImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  const base = getApiBase();
  return base ? `${base}${imageUrl}` : imageUrl;
}
