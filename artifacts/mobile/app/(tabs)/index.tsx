import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DealCard } from "@/components/DealCard";
import { FoodCard } from "@/components/FoodCard";
import { DEALS, MENU_ITEMS, MenuItem } from "@/constants/data";
import { useBranch } from "@/contexts/BranchContext";
import { useColors } from "@/hooks/useColors";

const ORDER_TYPES = [
  { id: "dinein", label: "Dine In", icon: "users" },
  { id: "takeaway", label: "Takeaway", icon: "shopping-bag" },
  { id: "delivery", label: "Delivery", icon: "truck" },
] as const;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedBranch, orderType, setOrderType } = useBranch();

  const popularItems = MENU_ITEMS.filter((i) => i.popular).slice(0, 8);

  const handleItemPress = (item: MenuItem) => {
    router.push(`/item/${item.id}`);
  };

  const handleDealPress = () => {
    router.push("/(tabs)/menu");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerBg} />

      {/* Header */}
      <LinearGradient
        colors={[colors.darkGreen, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.rfcLogo}>RFC</Text>
            <Text style={styles.rfcTagline}>Real Farmers Chicken</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push("/(tabs)/cart")}>
            <Feather name="shopping-bag" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Branch Selector */}
        <TouchableOpacity
          style={styles.branchSelector}
          onPress={() => router.push("/branch-select")}
          activeOpacity={0.8}
        >
          <View style={styles.branchLeft}>
            <Feather name="map-pin" size={14} color="#4CAF50" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.branchLabel}>
                {orderType === "delivery" ? "Delivering to" : "Nearest Branch"}
              </Text>
              <Text style={styles.branchName}>
                {selectedBranch ? `RFC ${selectedBranch.name}` : "Select Branch"}
              </Text>
            </View>
          </View>
          <Feather name="chevron-down" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
        ]}
      >
        {/* Order Type Selector */}
        <View style={[styles.orderTypeRow, { borderBottomColor: colors.border }]}>
          {ORDER_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setOrderType(type.id)}
              style={[
                styles.orderTypeBtn,
                orderType === type.id && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
              ]}
            >
              <Feather
                name={type.icon}
                size={16}
                color={orderType === type.id ? colors.accent : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.orderTypeLabel,
                  { color: orderType === type.id ? colors.accent : colors.mutedForeground },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Deals</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: "deals" } })}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dealsScroll}
          >
            {DEALS.map((deal) => (
              <DealCard key={deal.id} deal={deal} onPress={handleDealPress} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Most Popular</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} onPress={handleItemPress} horizontal={false} />
            ))}
          </ScrollView>
        </View>

        {/* Promo Banner */}
        <TouchableOpacity
          style={styles.promoBanner}
          onPress={() => router.push("/(tabs)/menu")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#B71C1C", "#C8102E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <View>
              <Text style={styles.promoTitle}>Try Our Signature</Text>
              <Text style={styles.promoSubtitle}>RFC Zinger Burger</Text>
              <Text style={styles.promoPrice}>Starting at Rs. 750</Text>
            </View>
            <View style={[styles.promoCircle]}>
              <Feather name="arrow-right" size={20} color="#C8102E" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* All Menu CTA */}
        <TouchableOpacity
          style={[styles.menuCta, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/menu")}
        >
          <Feather name="grid" size={18} color="#FFF" />
          <Text style={styles.menuCtaText}>Browse Full Menu</Text>
          <Feather name="chevron-right" size={18} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  rfcLogo: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  rfcTagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  branchSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  branchLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  branchLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Inter_400Regular",
  },
  branchName: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  scrollContent: {
    paddingTop: 4,
  },
  orderTypeRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    backgroundColor: "#FFF",
  },
  orderTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  orderTypeLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  dealsScroll: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  popularScroll: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#C8102E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  promoGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  promoTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  promoSubtitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  promoPrice: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  promoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  menuCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
