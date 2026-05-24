// ============================================================================
// FIREBASE FIRESTORE API CLIENT - RFC Admin Dashboard
// ============================================================================
// This file replaces the mock stub with direct, live Firestore operations.
// It maps standard React Query hooks to Firebase SDK calls.
// ============================================================================

import { db } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";

// ============================================================================
// 1. Menu Items Hooks
// ============================================================================

export const getListAdminMenuItemsQueryKey = () => ["/api/admin/menu"];

export const useListAdminMenuItems = () => {
  return useQuery({
    queryKey: getListAdminMenuItemsQueryKey(),
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "menuItems"));
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    },
  });
};

export const useCreateAdminMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { data: any }) => {
      // Auto-generate document ID
      const docRef = doc(collection(db, "menuItems"));
      const id = docRef.id;
      const sanitizedData = {
        ...variables.data,
        id,
        price: Number(variables.data.price) || 0,
        calories: variables.data.calories ? Number(variables.data.calories) : null,
        available: variables.data.available !== undefined ? variables.data.available : true,
      };
      await setDoc(docRef, sanitizedData);
      return sanitizedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
  });
};

export const useUpdateAdminMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string; data: any }) => {
      const docRef = doc(db, "menuItems", variables.id);
      
      const updatedData: any = { ...variables.data };
      if (updatedData.price !== undefined) updatedData.price = Number(updatedData.price);
      if (updatedData.calories !== undefined) updatedData.calories = updatedData.calories ? Number(updatedData.calories) : null;

      await updateDoc(docRef, updatedData);
      return { id: variables.id, ...updatedData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
  });
};

export const useDeleteAdminMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string }) => {
      const docRef = doc(db, "menuItems", variables.id);
      await deleteDoc(docRef);
      return { id: variables.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
  });
};

// ============================================================================
// 2. Categories Hooks
// ============================================================================

export const getListAdminCategoriesQueryKey = () => ["/api/admin/categories"];

export const useListAdminCategories = () => {
  return useQuery({
    queryKey: getListAdminCategoriesQueryKey(),
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categories: any[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return categories;
    },
  });
};

export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { data: { name: string; slug?: string } }) => {
      const docRef = doc(collection(db, "categories"));
      const id = docRef.id;
      const slug =
        variables.data.slug ||
        variables.data.name.trim().toLowerCase().replace(/\s+/g, "-");
      
      const newCategory = { id, name: variables.data.name, slug };
      await setDoc(docRef, newCategory);
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() });
    },
  });
};

export const useDeleteAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string }) => {
      const docRef = doc(db, "categories", variables.id);
      await deleteDoc(docRef);
      return { id: variables.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() });
    },
  });
};

// ============================================================================
// 3. Orders Hooks
// ============================================================================

export const getListAdminOrdersQueryKey = () => ["/api/admin/orders"];

export const useListAdminOrders = () => {
  return useQuery({
    queryKey: getListAdminOrdersQueryKey(),
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      // Sort orders by id or createdAt descending
      return orders.sort((a, b) => b.id.localeCompare(a.id));
    },
  });
};

export const useUpdateAdminOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string; data: { status: string } }) => {
      const docRef = doc(db, "orders", variables.id);
      await updateDoc(docRef, { status: variables.data.status });
      return { id: variables.id, status: variables.data.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
  });
};

// ============================================================================
// 4. Analytics Hook (Dynamically calculated on-the-fly)
// ============================================================================

export const useGetAdminAnalytics = () => {
  return useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const itemsSnapshot = await getDocs(collection(db, "menuItems"));

      const orders: any[] = [];
      ordersSnapshot.forEach((doc) => orders.push(doc.data()));

      const menuItems: any[] = [];
      itemsSnapshot.forEach((doc) => menuItems.push(doc.data()));

      // 1. Total Revenue
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0,
      );

      // 2. Total Orders
      const totalOrders = orders.length;

      // 3. Active Orders (status not Delivered, Cancelled or Completed)
      const activeOrders = orders.filter(
        (order) =>
          order.status !== "Delivered" &&
          order.status !== "Cancelled" &&
          order.status !== "Completed",
      ).length;

      // 4. Out of Stock Items
      const outOfStockItems = menuItems.filter((item) => !item.available).length;

      // 5. Daily Revenue breakdown
      const dailyRevMap = new Map<string, number>();
      orders.forEach((order) => {
        const dateStr = order.createdAt
          ? order.createdAt.split("T")[0]
          : new Date().toISOString().split("T")[0];
        dailyRevMap.set(
          dateStr,
          (dailyRevMap.get(dateStr) || 0) + (Number(order.total) || 0),
        );
      });
      const dailyRevenue = Array.from(dailyRevMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 6. Category Breakdown
      const categoryMap = new Map<string, number>();
      menuItems.forEach((item) => {
        const cat = item.category || "Uncategorized";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
      const categoryBreakdown = Array.from(categoryMap.entries()).map(
        ([name, value]) => ({
          name,
          value,
        }),
      );

      return {
        totalRevenue,
        totalOrders,
        activeOrders,
        outOfStockItems,
        dailyRevenue,
        categoryBreakdown,
      };
    },
  });
};

// ============================================================================
// 5. Promotional Banners Hooks
// ============================================================================

export const useGetAdminBanners = () => {
  return useQuery({
    queryKey: ["/api/admin/banners"],
    queryFn: async () => {
      const docRef = doc(db, "banners", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().banners || [];
      }
      return [];
    },
  });
};

export const useUpdateAdminBanners = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { data: any[] }) => {
      const docRef = doc(db, "banners", "main");
      await setDoc(docRef, { banners: variables.data });
      return variables.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
    },
  });
};

// ============================================================================
// 6. Helpers / Standalone Stubs
// ============================================================================

export const useRequestUploadUrl = () => {
  return useMutation({
    mutationFn: async () => {
      // Bypassed: UI allows pasting direct URLs (ImgBB/Imgur) as recommended
      return { uploadURL: "", objectPath: "" };
    },
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["/api/health"],
    queryFn: () => ({ status: "ok" }),
  });
};
