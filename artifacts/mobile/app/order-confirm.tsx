import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOrders } from "@/contexts/OrderContext";
import { useColors } from "@/hooks/useColors";

export default function OrderConfirmScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === orderId);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 120,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const orderTypeLabel = order?.orderType === "delivery"
    ? "Delivery"
    : order?.orderType === "dinein"
    ? "Dine In"
    : "Takeaway";

  return (
    <LinearGradient
      colors={[colors.darkGreen, colors.primary]}
      style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 20 }]}
    >
      {/* Success Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Feather name="check" size={52} color={colors.primary} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your RFC order is confirmed and being processed.
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Order ID</Text>
            <Text style={[styles.detailValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              #{order?.id ?? orderId}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Branch</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              RFC {order?.branch.name}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Order Type</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{orderTypeLabel}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Estimated Time</Text>
            <Text style={[styles.detailValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
              ~{order?.estimatedMinutes ?? 20} min
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              Rs. {order?.total.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Status Info */}
        <View style={styles.statusInfo}>
          <Feather name="clock" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statusText}>
            Track your order in real time from the Orders tab
          </Text>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/orders")}
          style={styles.trackBtn}
        >
          <Feather name="map-pin" size={18} color={colors.primary} />
          <Text style={[styles.trackBtnText, { color: colors.primary }]}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/index")}
          style={[styles.homeBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
          <Feather name="arrow-right" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  statusText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  buttons: {
    width: "100%",
    gap: 12,
    marginTop: "auto",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
  },
  trackBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
  },
  homeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
