import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useColors } from "@/hooks/useColors";

const TAX_RATE = 0.17;
const DELIVERY_FEE = 99;

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "dollar-sign" as const, sub: "Pay when your order arrives" },
  { id: "card", label: "Credit / Debit Card", icon: "credit-card" as const, sub: "Visa, Mastercard, UnionPay" },
  { id: "easypaisa", label: "Easypaisa", icon: "smartphone" as const, sub: "Mobile wallet" },
  { id: "jazzcash", label: "JazzCash", icon: "smartphone" as const, sub: "Mobile wallet" },
] as const;

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { selectedBranch, orderType, setOrderType } = useBranch();
  const { placeOrder } = useOrders();
  const { user, defaultAddress } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "easypaisa" | "jazzcash">("cod");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [addressSource, setAddressSource] = useState<"saved" | "custom">("saved");

  useEffect(() => {
    if (defaultAddress) {
      setDeliveryAddress(defaultAddress.address);
      setAddressSource("saved");
    }
  }, [defaultAddress?.id]);

  const tax = Math.round(total * TAX_RATE);
  const deliveryCharge = orderType === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = total + tax + deliveryCharge;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const effectiveAddress =
    addressSource === "saved" && defaultAddress ? defaultAddress.address : deliveryAddress;

  const handlePlaceOrder = async () => {
    if (!selectedBranch) {
      return;
    }
    if (orderType === "delivery" && !effectiveAddress.trim()) {
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
        deliveryAddress: effectiveAddress.trim() || undefined,
      });
      clearCart();
      setIsPlacing(false);
      router.replace({ pathname: "/order-confirm", params: { orderId: order.id } });
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + bottomPad }}
      >
        {/* Greeting */}
        {user && (
          <View style={[styles.greetBanner, { backgroundColor: colors.lightGreen }]}>
            <Feather name="user" size={14} color={colors.primary} />
            <Text style={[styles.greetText, { color: colors.primary }]}>
              Ordering as <Text style={{ fontFamily: "Inter_700Bold" }}>{user.name}</Text>
            </Text>
          </View>
        )}

        {/* Order Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Type</Text>
          <View style={[styles.toggleRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            {(["dinein", "takeaway", "delivery"] as const).map((type) => {
              const labels = { dinein: "Dine In", takeaway: "Takeaway", delivery: "Delivery" };
              const icons = { dinein: "users", takeaway: "shopping-bag", delivery: "truck" } as const;
              const isActive = orderType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setOrderType(type)}
                  style={[
                    styles.toggleBtn,
                    isActive && {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4,
                    },
                  ]}
                >
                  <Feather
                    name={icons[type]}
                    size={13}
                    color={isActive ? "#FFF" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      { color: isActive ? "#FFF" : colors.mutedForeground },
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
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {orderType === "delivery" ? "Preparing at" : "Collecting from"}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/branch-select")}
            style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.cardIconBox, { backgroundColor: colors.lightGreen }]}>
              <Feather name="map-pin" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {selectedBranch ? `RFC ${selectedBranch.name}` : "Select Branch"}
              </Text>
              {selectedBranch && (
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {selectedBranch.address}
                </Text>
              )}
            </View>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Delivery Address */}
        {orderType === "delivery" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Address</Text>

            {/* Saved address option */}
            {defaultAddress && (
              <TouchableOpacity
                onPress={() => setAddressSource("saved")}
                style={[
                  styles.addressOption,
                  {
                    backgroundColor: addressSource === "saved" ? colors.lightGreen : colors.card,
                    borderColor: addressSource === "saved" ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.radioOuter2}>
                  <View
                    style={[
                      styles.radioInner2,
                      { backgroundColor: addressSource === "saved" ? colors.primary : "transparent" },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.addrLabelRow}>
                    <Feather
                      name={defaultAddress.label === "Home" ? "home" : defaultAddress.label === "Work" ? "briefcase" : "map-pin"}
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={[styles.addrLabel, { color: colors.primary }]}>
                      {defaultAddress.label} (Default)
                    </Text>
                  </View>
                  <Text style={[styles.addrText, { color: colors.foreground }]} numberOfLines={2}>
                    {defaultAddress.address}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/add-address")}>
                  <Text style={[styles.changeLink, { color: colors.accent }]}>Change</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Custom address option */}
            <TouchableOpacity
              onPress={() => setAddressSource("custom")}
              style={[
                styles.addressOption,
                {
                  backgroundColor: addressSource === "custom" ? colors.card : colors.card,
                  borderColor: addressSource === "custom" ? colors.primary : colors.border,
                  marginTop: defaultAddress ? 8 : 0,
                },
              ]}
            >
              <View style={styles.radioOuter2}>
                <View
                  style={[
                    styles.radioInner2,
                    { backgroundColor: addressSource === "custom" ? colors.primary : "transparent" },
                  ]}
                />
              </View>
              <Text style={[styles.addrLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                Enter a different address
              </Text>
            </TouchableOpacity>

            {addressSource === "custom" && (
              <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}>
                <Feather name="map-pin" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                <TextInput
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="Enter full delivery address..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  style={[styles.textArea, { color: colors.foreground }]}
                />
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Items</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {items.map((item) => (
              <View key={item.cartId} style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
                <View style={styles.summaryQtyBox}>
                  <Text style={[styles.summaryQty, { color: colors.primary }]}>{item.quantity}×</Text>
                </View>
                <Text style={[styles.summaryName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
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
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Delivery fee</Text>
                  <Text style={[styles.totalValue, { color: colors.foreground }]}>
                    Rs. {DELIVERY_FEE}
                  </Text>
                </View>
              )}
              <View style={[styles.grandRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.grandLabel, { color: colors.foreground }]}>Total</Text>
                <Text style={[styles.grandValue, { color: colors.primary }]}>
                  Rs. {grandTotal.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment</Text>
          <View style={[styles.paymentCard, { borderColor: colors.border }]}>
            {PAYMENT_METHODS.map((pm, idx) => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setPaymentMethod(pm.id)}
                style={[
                  styles.paymentRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx < PAYMENT_METHODS.length - 1 ? 1 : 0,
                    backgroundColor: paymentMethod === pm.id ? colors.lightGreen : colors.card,
                  },
                ]}
              >
                <View
                  style={[
                    styles.paymentIconBox,
                    { backgroundColor: paymentMethod === pm.id ? colors.primary : colors.muted },
                  ]}
                >
                  <Feather name={pm.icon} size={15} color={paymentMethod === pm.id ? "#FFF" : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{pm.label}</Text>
                  <Text style={[styles.paymentSub, { color: colors.mutedForeground }]}>{pm.sub}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: paymentMethod === pm.id ? colors.primary : colors.border },
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
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Note (optional)</Text>
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Special requests, allergies, extra sauce..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[styles.textArea, { color: colors.foreground }]}
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
          disabled={isPlacing || !selectedBranch || (orderType === "delivery" && !effectiveAddress.trim())}
          style={[
            styles.placeBtn,
            {
              backgroundColor:
                isPlacing || !selectedBranch || (orderType === "delivery" && !effectiveAddress.trim())
                  ? colors.mutedForeground
                  : colors.accent,
            },
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.placeBtnText}>
            {isPlacing ? "Placing Order..." : "Place Order"}
          </Text>
          {!isPlacing && (
            <View style={styles.placePriceChip}>
              <Text style={styles.placePriceText}>Rs. {grandTotal.toLocaleString()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greetBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  greetText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 5,
    borderRadius: 10,
  },
  toggleBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  addressOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  radioOuter2: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9E9E9E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  radioInner2: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addrLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  addrLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  addrText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  changeLink: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
  },
  inputCard: {
    flexDirection: "row",
    gap: 10,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  textArea: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    padding: 0,
    minHeight: 60,
    textAlignVertical: "top",
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 8,
  },
  summaryQtyBox: {
    width: 28,
    alignItems: "center",
  },
  summaryQty: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  summaryName: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  summaryPrice: {
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
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  grandLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  grandValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  paymentCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    gap: 12,
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 1,
  },
  paymentSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
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
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: "#C8102E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  placePriceChip: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  placePriceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
