import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Deal } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface DealCardProps {
  deal: Deal;
  onPress: (deal: Deal) => void;
}

export function DealCard({ deal, onPress }: DealCardProps) {
  const colors = useColors();
  const discount = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

  return (
    <TouchableOpacity
      onPress={() => onPress(deal)}
      activeOpacity={0.9}
      style={styles.container}
    >
      <LinearGradient
        colors={[deal.gradientStart, deal.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          {deal.tag ? (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{deal.tag}</Text>
            </View>
          ) : <View />}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {deal.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {deal.subtitle}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>Rs. {deal.price.toLocaleString()}</Text>
              <Text style={styles.originalPrice}>
                Rs. {deal.originalPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.orderButton}>
              <Text style={styles.orderButtonText}>Order Now</Text>
            </View>
          </View>

          {deal.image ? (
            <Image source={deal.image} style={styles.dealImage} resizeMode="contain" />
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: "#C8102E",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
  },
  dealImage: {
    width: 72,
    height: 72,
    marginLeft: 6,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
    lineHeight: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  originalPrice: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  orderButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
