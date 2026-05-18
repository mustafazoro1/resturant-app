import { Router, type IRouter } from "express";
import {
  UpdateAdminMenuItemParams,
  UpdateAdminMenuItemBody,
  UpdateAdminMenuItemResponse,
  DeleteAdminMenuItemParams,
  UpdateAdminOrderStatusParams,
  UpdateAdminOrderStatusBody,
  UpdateAdminOrderStatusResponse,
  CreateAdminMenuItemBody,
  ListAdminMenuItemsResponseItem,
  ListAdminOrdersResponseItem,
  GetAdminAnalyticsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ---------- In-memory mock data ----------

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  spicy: boolean;
  popular: boolean;
  calories: number | null;
};

type OrderItem = { name: string; quantity: number; price: number };

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  branch: string;
  orderType: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
};

let menuItems: MenuItem[] = [
  { id: "m1", name: "Zinger Burger", description: "Crispy fried chicken fillet with spicy mayo and lettuce", price: 650, category: "Burgers", available: true, spicy: true, popular: true, calories: 520 },
  { id: "m2", name: "RFC Mighty Box", description: "2 pieces chicken, fries, coleslaw and a drink", price: 1200, category: "Deals", available: true, spicy: false, popular: true, calories: 1100 },
  { id: "m3", name: "Crispy Strips (3pc)", description: "Tender chicken strips with your choice of dipping sauce", price: 490, category: "Chicken", available: true, spicy: false, popular: true, calories: 380 },
  { id: "m4", name: "Spicy Wings (6pc)", description: "Hot and crispy chicken wings with RFC signature spice blend", price: 580, category: "Chicken", available: true, spicy: true, popular: false, calories: 460 },
  { id: "m5", name: "Chicken Wrap", description: "Grilled or crispy chicken in a soft tortilla with fresh veggies", price: 420, category: "Wraps", available: true, spicy: false, popular: false, calories: 340 },
  { id: "m6", name: "Spicy Wrap", description: "Crispy chicken, jalapeños, and hot sauce in a tortilla", price: 450, category: "Wraps", available: true, spicy: true, popular: false, calories: 360 },
  { id: "m7", name: "Loaded Fries", description: "Crispy fries topped with cheese sauce and jalapeños", price: 290, category: "Sides", available: true, spicy: false, popular: true, calories: 420 },
  { id: "m8", name: "Coleslaw", description: "Creamy house-made coleslaw", price: 120, category: "Sides", available: true, spicy: false, popular: false, calories: 130 },
  { id: "m9", name: "Pepsi (Large)", description: "Chilled Pepsi 500ml", price: 150, category: "Drinks", available: true, spicy: false, popular: false, calories: 210 },
  { id: "m10", name: "Chocolate Lava Cake", description: "Warm chocolate cake with a gooey molten center", price: 280, category: "Desserts", available: false, spicy: false, popular: false, calories: 380 },
  { id: "m11", name: "Family Feast", description: "8pc chicken, 2 large fries, 4 drinks, coleslaw", price: 3200, category: "Deals", available: true, spicy: false, popular: true, calories: null },
  { id: "m12", name: "Quarter Pounder", description: "Juicy beef patty with RFC special sauce", price: 720, category: "Burgers", available: true, spicy: false, popular: false, calories: 580 },
];

let orders: Order[] = [
  {
    id: "o1001",
    customerName: "Ahmed Raza",
    customerPhone: "0300-1234567",
    branch: "DHA Branch",
    orderType: "Dine In",
    items: [{ name: "RFC Mighty Box", quantity: 2, price: 1200 }, { name: "Pepsi (Large)", quantity: 2, price: 150 }],
    total: 2700,
    status: "Preparing",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "o1002",
    customerName: "Sara Khan",
    customerPhone: "0321-9876543",
    branch: "Clifton Branch",
    orderType: "Delivery",
    items: [{ name: "Zinger Burger", quantity: 1, price: 650 }, { name: "Loaded Fries", quantity: 1, price: 290 }, { name: "Pepsi (Large)", quantity: 1, price: 150 }],
    total: 1090,
    status: "Received",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "o1003",
    customerName: "Bilal Akhtar",
    customerPhone: "0333-5550123",
    branch: "Naval Colony Branch",
    orderType: "Takeaway",
    items: [{ name: "Crispy Strips (3pc)", quantity: 2, price: 490 }, { name: "Coleslaw", quantity: 1, price: 120 }],
    total: 1100,
    status: "Ready",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "o1004",
    customerName: "Fatima Malik",
    customerPhone: "0312-7771234",
    branch: "DHA Branch",
    orderType: "Delivery",
    items: [{ name: "Family Feast", quantity: 1, price: 3200 }],
    total: 3200,
    status: "Delivered",
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "o1005",
    customerName: "Usman Tariq",
    customerPhone: "0345-2223344",
    branch: "Buns Road Branch",
    orderType: "Dine In",
    items: [{ name: "Spicy Wings (6pc)", quantity: 1, price: 580 }, { name: "Loaded Fries", quantity: 2, price: 290 }, { name: "Pepsi (Large)", quantity: 2, price: 150 }],
    total: 1460,
    status: "Preparing",
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
  },
  {
    id: "o1006",
    customerName: "Nadia Hussain",
    customerPhone: "0311-4445566",
    branch: "North Nazimabad Branch",
    orderType: "Takeaway",
    items: [{ name: "Chicken Wrap", quantity: 2, price: 420 }, { name: "Spicy Wrap", quantity: 1, price: 450 }],
    total: 1290,
    status: "Delivered",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

// ---------- Analytics helper ----------

function buildAnalytics() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ["Received", "Preparing", "Ready"].includes(o.status)).length;
  const outOfStockItems = menuItems.filter((m) => !m.available).length;

  const categoryMap: Record<string, { orders: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      const menuItem = menuItems.find((m) => m.name === item.name);
      const cat = menuItem?.category ?? "Other";
      if (!categoryMap[cat]) categoryMap[cat] = { orders: 0, revenue: 0 };
      categoryMap[cat].orders += item.quantity;
      categoryMap[cat].revenue += item.price * item.quantity;
    }
  }
  const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    orders: stats.orders,
    revenue: stats.revenue,
  }));

  // Build 7-day daily revenue trend
  const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
    const dayOrders = i === 0 ? orders : [];
    const revenue = i === 0 ? totalRevenue : Math.floor(Math.random() * 15000 + 8000);
    dailyRevenue.push({ date: label, revenue, orders: i === 0 ? totalOrders : Math.floor(revenue / 800) });
  }

  return { totalRevenue, totalOrders, activeOrders, outOfStockItems, categoryBreakdown, dailyRevenue };
}

// ---------- Analytics ----------

router.get("/admin/analytics", async (_req, res): Promise<void> => {
  const analytics = buildAnalytics();
  res.json(GetAdminAnalyticsResponse.parse(analytics));
});

// ---------- Menu ----------

router.get("/admin/menu", async (_req, res): Promise<void> => {
  res.json(menuItems.map((m) => ListAdminMenuItemsResponseItem.parse(m)));
});

router.post("/admin/menu", async (req, res): Promise<void> => {
  const parsed = CreateAdminMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const newItem: MenuItem = {
    id: `m${Date.now()}`,
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    category: parsed.data.category,
    available: true,
    spicy: parsed.data.spicy ?? false,
    popular: parsed.data.popular ?? false,
    calories: parsed.data.calories ?? null,
  };
  menuItems.push(newItem);
  res.status(201).json(ListAdminMenuItemsResponseItem.parse(newItem));
});

router.patch("/admin/menu/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateAdminMenuItemParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdminMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const idx = menuItems.findIndex((m) => m.id === params.data.id);
  if (idx === -1) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  menuItems[idx] = { ...menuItems[idx], ...parsed.data } as MenuItem;
  res.json(UpdateAdminMenuItemResponse.parse(menuItems[idx]));
});

router.delete("/admin/menu/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = DeleteAdminMenuItemParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const idx = menuItems.findIndex((m) => m.id === params.data.id);
  if (idx === -1) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  menuItems.splice(idx, 1);
  res.sendStatus(204);
});

// ---------- Orders ----------

router.get("/admin/orders", async (_req, res): Promise<void> => {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json(sorted.map((o) => ListAdminOrdersResponseItem.parse(o)));
});

router.patch("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateAdminOrderStatusParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdminOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const idx = orders.findIndex((o) => o.id === params.data.id);
  if (idx === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  orders[idx] = { ...orders[idx], status: parsed.data.status };
  res.json(UpdateAdminOrderStatusResponse.parse(orders[idx]));
});

export default router;
