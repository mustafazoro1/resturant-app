import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
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
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();

  const popularItems = MENU_ITEMS.filter((i) => i.popular).slice(0, 8);
  const zingerBurger = MENU_ITEMS.find((i) => i.id === "bu1");

  const handleItemPress = (item: MenuItem) => {
    router.push(`/item/${item.id}`);
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
          <View style={styles.headerBrand}>
            <View style={styles.logoChip}>
              <Text style={[styles.logoChipText, { color: colors.primary }]}>RFC</Text>
            </View>
            <View>
              <Text style={styles.rfcTitle}>Real Farmers Chicken</Text>
              <View style={styles.greetRow}>
                <View style={styles.openDot} />
                <Text style={styles.greetText}>
                  {user ? `Hey, ${user.name.split(" ")[0]}!` : "Welcome back!"}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => user ? router.push("/(tabs)/profile") : router.push("/login")}
          >
            {user ? (
              <Text style={styles.profileInitial}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Feather name="user" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Branch Selector */}
        <TouchableOpacity
          style={styles.branchSelector}
          onPress={() => router.push("/branch-select")}
          activeOpacity={0.8}
        >
          <View style={styles.branchLeft}>
            <View style={styles.pinDot}>
              <Feather name="map-pin" size={12} color="#4CAF50" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.branchLabel}>
                {orderType === "delivery" ? "Delivering to" : "Branch"}
              </Text>
              <Text style={styles.branchName}>
                {selectedBranch ? `RFC ${selectedBranch.name}` : "Select a Branch"}
              </Text>
            </View>
          </View>
          <View style={styles.branchChevron}>
            <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.7)" />
          </View>
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
        <View style={[styles.orderTypeBar, { backgroundColor: "#FFFFFF", borderBottomColor: colors.border }]}>
          {ORDER_TYPES.map((type) => {
            const isActive = orderType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => setOrderType(type.id)}
                style={[
                  styles.orderTypeBtn,
                  isActive && styles.orderTypeBtnActive,
                ]}
              >
                <Feather
                  name={type.icon}
                  size={15}
                  color={isActive ? colors.accent : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.orderTypeLabel,
                    { color: isActive ? colors.accent : colors.mutedForeground },
                  ]}
                >
                  {type.label}
                </Text>
                {isActive && (
                  <View style={[styles.activeUnderline, { backgroundColor: colors.accent }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Deals</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                Limited time offers
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: "deals" } })}
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.seeAllText, { color: colors.accent }]}>See All</Text>
              <Feather name="arrow-right" size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {DEALS.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: "deals" } })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Most Popular</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                Customer favourites
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/menu")}
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.seeAllText, { color: colors.accent }]}>See All</Text>
              <Feather name="arrow-right" size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} onPress={handleItemPress} horizontal={false} />
            ))}
          </ScrollView>
        </View>

        {/* Signature Promo — links to actual Zinger Burger */}
        {zingerBurger && (
          <TouchableOpacity
            style={styles.promoBanner}
            onPress={() => router.push(`/item/${zingerBurger.id}`)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#7B1C1C", "#C8102E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promoGradient}
            >
              <View style={styles.promoLeft}>
                <Text style={styles.promoEyebrow}>Our Signature</Text>
                <Text style={styles.promoTitle}>RFC Zinger Burger</Text>
                <Text style={styles.promoPrice}>
                  Rs. {zingerBurger.price.toLocaleString()}
                </Text>
                <View style={styles.promoOrderBtn}>
                  <Text style={styles.promoOrderBtnText}>Order Now</Text>
                  <Feather name="arrow-right" size={12} color="#C8102E" />
                </View>
              </View>
              <View style={styles.promoRight}>
                <View style={styles.promoCircle}>
                  <Feather name="layers" size={36} color="rgba(255,255,255,0.6)" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Categories Quick Access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, paddingHorizontal: 16 }]}>
            Browse by Category
          </Text>
          <View style={styles.categoriesGrid}>
            {[
              { id: "chicken", label: "Chicken", icon: "feather", color: "#BF360C" },
              { id: "burgers", label: "Burgers", icon: "circle", color: "#880E4F" },
              { id: "wraps", label: "Wraps", icon: "package", color: "#00695C" },
              { id: "sides", label: "Sides", icon: "grid", color: "#E65100" },
              { id: "drinks", label: "Drinks", icon: "droplet", color: "#0D47A1" },
              { id: "desserts", label: "Desserts", icon: "heart", color: "#4A148C" },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/menu", params: { cat: cat.id } })
                }
                style={[styles.categoryTile, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.75}
              >
                <View style={[styles.categoryIconBox, { backgroundColor: cat.color + "18" }]}>
                  <Feather name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={[styles.categoryTileLabel, { color: colors.foreground }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    alignItems: "center",
    marginBottom: 14,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoChip: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoChipText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  rfcTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  greetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  greetText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  branchSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  branchLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  branchLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  branchName: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    marginTop: 1,
  },
  branchChevron: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingTop: 2,
  },
  orderTypeBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  orderTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 5,
    position: "relative",
  },
  orderTypeBtnActive: {},
  activeUnderline: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 2,
  },
  orderTypeLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 22,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#C8102E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  promoGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 22,
    gap: 16,
  },
  promoLeft: {
    flex: 1,
  },
  promoEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  promoTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    lineHeight: 26,
  },
  promoPrice: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 14,
  },
  promoOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  promoOrderBtnText: {
    color: "#C8102E",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  promoRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  promoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  categoryTile: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    flexGrow: 1,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTileLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});
