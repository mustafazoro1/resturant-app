import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CartItem } from "@/contexts/CartContext";
import { Branch } from "@/constants/data";

export type OrderStatus = "received" | "preparing" | "ready" | "delivered";

export interface Order {
  id: string;
  items: CartItem[];
  branch: Branch;
  total: number;
  status: OrderStatus;
  orderType: "dinein" | "takeaway" | "delivery";
  timestamp: number;
  estimatedMinutes: number;
  deliveryAddress?: string;
  loyaltyDiscount?: number;
}

interface OrderContextType {
  orders: Order[];
  placeOrder: (params: {
    items: CartItem[];
    branch: Branch;
    total: number;
    orderType: "dinein" | "takeaway" | "delivery";
    deliveryAddress?: string;
    loyaltyDiscount?: number;
  }) => Order;
  activeOrder: Order | null;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  placeOrder: () => ({} as Order),
  activeOrder: null,
});

const STATUS_SEQUENCE: OrderStatus[] = ["received", "preparing", "ready", "delivered"];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    AsyncStorage.getItem("rfc_orders").then((data) => {
      if (data) {
        try {
          setOrders(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("rfc_orders", JSON.stringify(orders));
  }, [orders]);

  const advanceStatus = useCallback((orderId: string, currentStatus: OrderStatus) => {
    const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
    if (currentIndex >= STATUS_SEQUENCE.length - 1) return;
    const nextStatus = STATUS_SEQUENCE[currentIndex + 1];
    const delay = nextStatus === "preparing" ? 30000 : nextStatus === "ready" ? 90000 : 60000;

    timersRef.current[orderId] = setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      if (nextStatus !== "delivered") {
        advanceStatus(orderId, nextStatus);
      }
    }, delay);
  }, []);

  const placeOrder = useCallback(
    (params: {
      items: CartItem[];
      branch: Branch;
      total: number;
      orderType: "dinein" | "takeaway" | "delivery";
      deliveryAddress?: string;
    }): Order => {
      const orderId = "RFC" + Date.now().toString().slice(-6);
      const estimatedMinutes = params.orderType === "delivery" ? 45 : params.orderType === "takeaway" ? 20 : 15;
      const newOrder: Order = {
        id: orderId,
        items: params.items,
        branch: params.branch,
        total: params.total,
        status: "received",
        orderType: params.orderType,
        timestamp: Date.now(),
        estimatedMinutes,
        deliveryAddress: params.deliveryAddress,
        loyaltyDiscount: params.loyaltyDiscount,
      };
      setOrders((prev) => [newOrder, ...prev]);
      advanceStatus(orderId, "received");
      return newOrder;
    },
    [advanceStatus]
  );

  const activeOrder = orders.find(
    (o) => o.status !== "delivered"
  ) ?? null;

  return (
    <OrderContext.Provider value={{ orders, placeOrder, activeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
