import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORY_COLORS, MENU_ITEMS } from "@/constants/data";
import { useCart } from "@/contexts/CartContext";
import { useColors } from "@/hooks/useColors";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, getItemQuantity, updateQuantity, items: cartItems } = useCart();

  const item = MENU_ITEMS.find((i) => i.id === id);
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, textAlign: "center", marginTop: 40 }}>
          Item not found
        </Text>
      </View>
    );
  }

  const gradColors = CATEGORY_COLORS[item.category] ?? ["#333", "#555"];
  const cartQuantity = getItemQuantity(item.id);
  const totalPrice = item.price * quantity;

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    for (let i = 0; i < quantity; i++) {
      addItem({ itemId: item.id, name: item.name, price: item.price, category: item.category });
    }
    router.back();
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Placeholder */}
        <LinearGradient
          colors={gradColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imagePlaceholder}
        >
          <Feather name="layers" size={72} color="rgba(255,255,255,0.5)" />
        </LinearGradient>

        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            {item.popular && (
              <View style={[styles.badge, { backgroundColor: colors.lightGreen }]}>
                <Feather name="trending-up" size={11} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>Popular</Text>
              </View>
            )}
            {item.spicy && (
              <View style={[styles.badge, { backgroundColor: "#FFEBEE" }]}>
                <Feather name="zap" size={11} color={colors.accent} />
                <Text style={[styles.badgeText, { color: colors.accent }]}>Spicy</Text>
              </View>
            )}
            {item.isNew && (
              <View style={[styles.badge, { backgroundColor: "#FFF8E1" }]}>
                <Feather name="star" size={11} color="#F57F17" />
                <Text style={[styles.badgeText, { color: "#F57F17" }]}>New</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>

          {/* Price */}
          <Text style={[styles.itemPrice, { color: colors.primary }]}>
            Rs. {item.price.toLocaleString()}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {item.description}
          </Text>

          {/* Calories */}
          {item.calories ? (
            <View style={[styles.calorieBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="activity" size={14} color={colors.mutedForeground} />
              <Text style={[styles.calorieText, { color: colors.mutedForeground }]}>
                {item.calories} kcal per serving
              </Text>
            </View>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.quantityTitle, { color: colors.foreground }]}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => {
                  if (quantity > 1) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuantity((q) => q - 1);
                  }
                }}
                style={[
                  styles.qBtn,
                  { backgroundColor: quantity === 1 ? colors.muted : colors.border },
                ]}
              >
                <Feather name="minus" size={16} color={quantity === 1 ? colors.mutedForeground : colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.qCount, { color: colors.foreground }]}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity((q) => q + 1);
                }}
                style={[styles.qBtn, { backgroundColor: colors.accent }]}
              >
                <Feather name="plus" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* In Cart Notice */}
          {cartQuantity > 0 && (
            <View style={[styles.inCartNotice, { backgroundColor: colors.lightGreen }]}>
              <Feather name="shopping-bag" size={14} color={colors.primary} />
              <Text style={[styles.inCartText, { color: colors.primary }]}>
                {cartQuantity} already in cart
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
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
          onPress={handleAddToCart}
          style={[styles.addToCartBtn, { backgroundColor: colors.accent }]}
        >
          <Feather name="shopping-bag" size={18} color="#FFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>Rs. {totalPrice.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imagePlaceholder: {
    width: "100%",
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  itemName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    lineHeight: 32,
  },
  itemPrice: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  calorieBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  calorieText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quantityTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  qBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  qCount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    minWidth: 30,
    textAlign: "center",
  },
  inCartNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  inCartText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
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
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    flex: 1,
    textAlign: "center",
  },
  priceTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceTagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
