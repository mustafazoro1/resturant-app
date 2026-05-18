import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, MenuItem } from "@/constants/data";
import { useCart } from "@/contexts/CartContext";
import { useColors } from "@/hooks/useColors";

interface FoodCardProps {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
  horizontal?: boolean;
}

const API_BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`
  : "";

export function FoodCard({ item, onPress, horizontal = false }: FoodCardProps) {
  const colors = useColors();
  const { addItem, getItemQuantity, updateQuantity, items } = useCart();
  const quantity = getItemQuantity(item.id);
  const gradColors = CATEGORY_COLORS[item.category] ?? ["#333", "#555"];

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem({ itemId: item.id, name: item.name, price: item.price, category: item.category });
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cartItem = items.find((i) => i.itemId === item.id);
    if (cartItem) {
      updateQuantity(cartItem.cartId, cartItem.quantity - 1);
    }
  };

  const resolvedImageUrl = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${API_BASE}${item.imageUrl}`
    : null;

  if (horizontal) {
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.85}
        style={[styles.hCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {resolvedImageUrl ? (
          <Image
            source={{ uri: resolvedImageUrl }}
            style={styles.hImageFull}
            resizeMode="cover"
          />
        ) : item.image ? (
          <LinearGradient colors={gradColors} style={styles.hImagePlaceholder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Image source={item.image} style={styles.hImage} resizeMode="contain" />
          </LinearGradient>
        ) : (
          <LinearGradient colors={gradColors} style={styles.hImagePlaceholder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="layers" size={28} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        )}
        <View style={styles.hInfo}>
          <View style={styles.badgeRow}>
            {item.popular && (
              <View style={[styles.badge, { backgroundColor: "#E8F5E9" }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Popular</Text>
              </View>
            )}
            {item.spicy && (
              <View style={[styles.badge, { backgroundColor: "#FFEBEE" }]}>
                <Text style={[styles.badgeText, { color: "#C8102E" }]}>Spicy</Text>
              </View>
            )}
            {item.isNew && (
              <View style={[styles.badge, { backgroundColor: "#FFF8E1" }]}>
                <Text style={[styles.badgeText, { color: "#F57F17" }]}>New</Text>
              </View>
            )}
          </View>
          <Text style={[styles.hName, { color: colors.foreground }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.hDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.hBottom}>
            <Text style={[styles.hPrice, { color: colors.primary }]}>
              Rs. {item.price.toLocaleString()}
            </Text>
            {quantity === 0 ? (
              <TouchableOpacity
                onPress={handleAdd}
                style={[styles.addBtn, { backgroundColor: colors.accent }]}
              >
                <Feather name="plus" size={16} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  onPress={handleDecrement}
                  style={[styles.qBtn, { backgroundColor: colors.border }]}
                >
                  <Feather name="minus" size={13} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.qCount, { color: colors.foreground }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={[styles.qBtn, { backgroundColor: colors.accent }]}
                >
                  <Feather name="plus" size={13} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.85}
      style={[styles.vCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {resolvedImageUrl ? (
        <Image
          source={{ uri: resolvedImageUrl }}
          style={styles.vImageFull}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient colors={gradColors} style={styles.vImagePlaceholder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {item.image ? (
            <Image source={item.image} style={styles.vImage} resizeMode="contain" />
          ) : (
            <Feather name="layers" size={24} color="rgba(255,255,255,0.7)" />
          )}
        </LinearGradient>
      )}
      <View style={styles.vInfo}>
        <Text style={[styles.vName, { color: colors.foreground }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.vPrice, { color: colors.primary }]}>
          Rs. {item.price.toLocaleString()}
        </Text>
        {quantity === 0 ? (
          <TouchableOpacity
            onPress={handleAdd}
            style={[styles.vAddBtn, { backgroundColor: colors.accent }]}
          >
            <Feather name="plus" size={14} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.vQuantityControl}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={[styles.qBtn, { backgroundColor: colors.border }]}
            >
              <Feather name="minus" size={12} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.qCount, { color: colors.foreground }]}>{quantity}</Text>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.qBtn, { backgroundColor: colors.accent }]}
            >
              <Feather name="plus" size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  hImagePlaceholder: {
    width: 90,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  hImageFull: {
    width: 90,
    height: 100,
  },
  hImage: {
    width: 80,
    height: 90,
  },
  hInfo: {
    flex: 1,
    padding: 10,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  hName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  hDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 15,
    marginBottom: 6,
  },
  hBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hPrice: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vQuantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  qBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  qCount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    minWidth: 18,
    textAlign: "center",
  },
  vCard: {
    width: 150,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  vImagePlaceholder: {
    width: "100%",
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  vImageFull: {
    width: "100%",
    height: 90,
  },
  vImage: {
    width: "90%",
    height: 80,
  },
  vInfo: {
    padding: 10,
  },
  vName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
    lineHeight: 16,
  },
  vPrice: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  vAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    alignSelf: "flex-start",
  },
});
