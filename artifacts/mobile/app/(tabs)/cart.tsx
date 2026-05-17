import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { CartItem, useCart } from "@/contexts/CartContext";
import { useColors } from "@/hooks/useColors";

const TAX_RATE = 0.17;

function CartItemRow({ item }: { item: CartItem }) {
  const colors = useColors();
  const { updateQuantity, removeItem } = useCart();

  return (
    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.itemColorDot, { backgroundColor: colors.lightGreen }]}>
        <Feather name="layers" size={16} color={colors.primary} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>
          Rs. {item.price.toLocaleString()} each
        </Text>
      </View>
      <View style={styles.itemControls}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            updateQuantity(item.cartId, item.quantity - 1);
          }}
          style={[styles.qBtn, { backgroundColor: item.quantity === 1 ? "#FFEBEE" : colors.border }]}
        >
          <Feather
            name={item.quantity === 1 ? "trash-2" : "minus"}
            size={13}
            color={item.quantity === 1 ? colors.accent : colors.foreground}
          />
        </TouchableOpacity>
        <Text style={[styles.qCount, { color: colors.foreground }]}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            updateQuantity(item.cartId, item.quantity + 1);
          }}
          style={[styles.qBtn, { backgroundColor: colors.accent }]}
        >
          <Feather name="plus" size={13} color="#FFF" />
        </TouchableOpacity>
        <Text style={[styles.itemTotal, { color: colors.foreground }]}>
          Rs. {(item.price * item.quantity).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, itemCount, clearCart } = useCart();

  const tax = Math.round(total * TAX_RATE);
  const grandTotal = total + tax;

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="shopping-bag"
          title="Your cart is empty"
          description="Add some delicious items from our menu to get started!"
          actionLabel="Browse Menu"
          onAction={() => router.push("/(tabs)/menu")}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.cartId}
        renderItem={({ item }) => <CartItemRow item={item} />}
        ListHeaderComponent={
          <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemCountText, { color: colors.mutedForeground }]}>
              {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                clearCart();
              }}
            >
              <Text style={[styles.clearText, { color: colors.accent }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                Rs. {total.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Tax (17%)</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                Rs. {tax.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                Rs. {grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 160 : 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Checkout Button */}
      <View
        style={[
          styles.checkoutContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 12,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/checkout");
          }}
          style={[styles.checkoutBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.checkoutBtnText}>
            Proceed to Checkout
          </Text>
          <View style={styles.checkoutTotal}>
            <Text style={styles.checkoutTotalText}>Rs. {grandTotal.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  itemCountText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  clearText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  itemColorDot: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  itemControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  qCount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    minWidth: 22,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    minWidth: 70,
    textAlign: "right",
  },
  summaryCard: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  checkoutTotal: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  checkoutTotalText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
