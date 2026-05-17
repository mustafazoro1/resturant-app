import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBranch } from "@/contexts/BranchContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useColors } from "@/hooks/useColors";

const TAX_RATE = 0.17;
const DELIVERY_FEE = 99;

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "dollar-sign" },
  { id: "card", label: "Credit / Debit Card", icon: "credit-card" },
  { id: "easypaisa", label: "Easypaisa", icon: "smartphone" },
  { id: "jazzcash", label: "JazzCash", icon: "smartphone" },
] as const;

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { selectedBranch, orderType, setOrderType } = useBranch();
  const { placeOrder } = useOrders();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "easypaisa" | "jazzcash">("cod");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const tax = Math.round(total * TAX_RATE);
  const deliveryCharge = orderType === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = total + tax + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!selectedBranch) {
      Alert.alert("Select Branch", "Please select a branch before placing your order.");
      return;
    }
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      Alert.alert("Delivery Address", "Please enter your delivery address.");
      return;
    }

    setIsPlacing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      const order = placeOrder({
        items,
        branch: selectedBranch,
        total: grandTotal,
        orderType,
        deliveryAddress: deliveryAddress.trim() || undefined,
      });
      clearCart();
      setIsPlacing(false);
      router.replace({ pathname: "/order-confirm", params: { orderId: order.id } });
    }, 800);
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Order Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Type</Text>
          <View style={[styles.typeRow, { backgroundColor: colors.muted, borderRadius: 14 }]}>
            {(["dinein", "takeaway", "delivery"] as const).map((type) => {
              const labels = { dinein: "Dine In", takeaway: "Takeaway", delivery: "Delivery" };
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setOrderType(type)}
                  style={[
                    styles.typeBtn,
                    orderType === type && {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      { color: orderType === type ? "#FFFFFF" : colors.mutedForeground },
                    ]}
                  >
                    {labels[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Branch */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Branch</Text>
          <TouchableOpacity
            onPress={() => router.push("/branch-select")}
            style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="map-pin" size={18} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Collecting from</Text>
              <Text style={[styles.cardValue, { color: colors.foreground }]}>
                {selectedBranch ? `RFC ${selectedBranch.name}` : "Select Branch"}
              </Text>
              {selectedBranch && (
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                  {selectedBranch.address}
                </Text>
              )}
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Delivery Address */}
        {orderType === "delivery" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>
            <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="home" size={18} color={colors.primary} style={{ marginTop: 2 }} />
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter your full delivery address..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                style={[styles.addressInput, { color: colors.foreground }]}
              />
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {items.map((item) => (
              <View key={item.cartId} style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.summaryItemName, { color: colors.foreground }]}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={[styles.summaryItemPrice, { color: colors.foreground }]}>
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                <Text style={[styles.totalValue, { color: colors.foreground }]}>
                  Rs. {total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Tax (17%)</Text>
                <Text style={[styles.totalValue, { color: colors.foreground }]}>
                  Rs. {tax.toLocaleString()}
                </Text>
              </View>
              {orderType === "delivery" && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Delivery</Text>
                  <Text style={[styles.totalValue, { color: colors.foreground }]}>
                    Rs. {DELIVERY_FEE.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.grandTotalLabel, { color: colors.foreground }]}>Grand Total</Text>
                <Text style={[styles.grandTotalValue, { color: colors.primary }]}>
                  Rs. {grandTotal.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setPaymentMethod(pm.id)}
                style={[styles.paymentOption, { borderBottomColor: colors.border }]}
              >
                <View
                  style={[
                    styles.paymentIcon,
                    {
                      backgroundColor:
                        paymentMethod === pm.id ? colors.lightGreen : colors.muted,
                    },
                  ]}
                >
                  <Feather
                    name={pm.icon}
                    size={16}
                    color={paymentMethod === pm.id ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.paymentLabel, { color: colors.foreground }]}>
                  {pm.label}
                </Text>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        paymentMethod === pm.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {paymentMethod === pm.id && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Special Instructions</Text>
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Any special requests? (e.g. extra sauce, no onions)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[styles.instructionsInput, { color: colors.foreground }]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 12,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          style={[
            styles.placeOrderBtn,
            { backgroundColor: isPlacing ? colors.mutedForeground : colors.accent },
          ]}
        >
          {isPlacing ? (
            <Text style={styles.placeOrderText}>Placing Order...</Text>
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <View style={styles.orderTotal}>
                <Text style={styles.orderTotalText}>Rs. {grandTotal.toLocaleString()}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  inputCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    padding: 0,
  },
  instructionsInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    padding: 0,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  summaryItemName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  totalsSection: {
    padding: 14,
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  totalValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  grandTotalValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  paymentCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  orderTotal: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orderTotalText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
