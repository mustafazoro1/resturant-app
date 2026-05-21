import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
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
import { HeroBanner } from "@/components/HeroBanner";
import { DEALS, MENU_ITEMS, MenuItem } from "@/constants/data";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMenu } from "@/contexts/MenuContext";
import { useColors } from "@/hooks/useColors";
import { resolveMenuImageUrl } from "@/lib/menuUtils";

const ORDER_TYPES = [
  { id: "dinein", label: "dineIn", icon: "users" },
  { id: "takeaway", label: "takeaway", icon: "shopping-bag" },
  { id: "delivery", label: "delivery", icon: "truck" },
] as const;

const CATEGORIES = [
  { id: "chicken", labelKey: "chicken", icon: "feather", color: "#BF360C" },
  { id: "burgers", labelKey: "burgers", icon: "circle", color: "#880E4F" },
  { id: "wraps", labelKey: "wraps", icon: "package", color: "#00695C" },
  { id: "sides", labelKey: "sides", icon: "grid", color: "#E65100" },
  { id: "drinks", labelKey: "drinks", icon: "droplet", color: "#0D47A1" },
  { id: "desserts", labelKey: "desserts", icon: "heart", color: "#4A148C" },
] as const;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedBranch, orderType, setOrderType } = useBranch();
  const { user, availableTier } = useAuth();
  const { menuItems } = useMenu();
  const { t, language } = useLanguage();

  const popularItems = menuItems.filter((i) => i.popular).slice(0, 8);
  const zingerBurger = menuItems.find((i) => i.id === "bu1") ?? MENU_ITEMS.find((i) => i.id === "bu1");
  const promoImageSource = zingerBurger
    ? resolveMenuImageUrl(zingerBurger.imageUrl)
      ? { uri: resolveMenuImageUrl(zingerBurger.imageUrl) }
      : zingerBurger.image
    : undefined;

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const promoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
    ]).start();
    Animated.timing(contentFade, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }).start();

    // Subtle pulse on promo button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(promoPulse, { toValue: 1.025, duration: 1400, useNativeDriver: true }),
        Animated.timing(promoPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.headerBg} />

      <LinearGradient
        colors={[colors.darkGreen, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
          <View style={styles.headerTop}>
            <View style={styles.brandLogo}>
              <View style={styles.brandLogoMark}>
                <Text style={styles.brandLogoIcon}>🍗</Text>
              </View>
              <View>
                <Text style={styles.rfcTitle}>Real Farmers Chicken</Text>
                <View style={styles.greetRow}>
                  <View style={styles.openDot} />
                  <Text style={styles.greetText}>
                    {user ? `${language === "ur" ? "ہے" : "Hey,"} ${user.name.split(" ")[0]}${language === "ur" ? " صاحب!" : "!"}` : t("welcomeBack")}
                  </Text>
                </View>
              </View>
            </View> 
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => user ? router.push("/(tabs)/profile") : router.push("/login")}
            >
              {user ? (
                user.profilePicUrl ? (
                  <Image source={{ uri: user.profilePicUrl }} style={styles.profileAvatar} />
                ) : (
                  <Text style={styles.profileInitial}>{user.name.charAt(0).toUpperCase()}</Text>
                )
              ) : (
                <Feather name="user" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.branchSelector}
            onPress={() => router.push("/branch-select")}
            activeOpacity={0.8}
          >
            <View style={styles.branchLeft}>
              <View style={styles.pinBox}>
                <Feather name="map-pin" size={12} color="#4CAF50" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.branchLabel}>
                  {orderType === "delivery" ? (language === "ur" ? "ڈیلیوری بھیجیں" : "Delivering to") : (language === "ur" ? "برانچ" : "Branch")}
                </Text>
                <Text style={styles.branchName}>
                  {selectedBranch ? `RFC ${selectedBranch.name}` : (language === "ur" ? "برانچ منتخب کریں" : "Select a Branch")}
                </Text>
              </View>
            </View>
            <View style={styles.branchChevron}>
              <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: contentFade }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
        ]}
      >
        {/* Hero Banner Carousel */}
        <HeroBanner />

        {/* Loyalty Points Banner */}
        {user && availableTier && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={[styles.loyaltyBanner, { backgroundColor: colors.darkGreen }]}
            activeOpacity={0.8}
          >
            <Feather name="star" size={14} color="#FFD700" />
            <Text style={styles.loyaltyBannerText}>
              {language === "ur"
                ? `${user.loyaltyPoints} پوائنٹس • ${availableTier.label} کی چھوٹ دستیاب!`
                : `${user.loyaltyPoints} pts • ${availableTier.label} off available! Tap to use`}
            </Text>
            <Feather name="chevron-right" size={14} color="#FFD700" />
          </TouchableOpacity>
        )}

        {/* Order Type Selector */}
        <View style={[styles.orderTypeBar, { backgroundColor: "#FFFFFF", borderBottomColor: colors.border }]}>
          {ORDER_TYPES.map((type) => {
            const isActive = orderType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => setOrderType(type.id)}
                style={styles.orderTypeBtn}
              >
                <Feather name={type.icon} size={15} color={isActive ? colors.accent : colors.mutedForeground} />
                <Text style={[styles.orderTypeLabel, { color: isActive ? colors.accent : colors.mutedForeground }]}>
                  {t(type.label)}
                </Text>
                {isActive && <Animated.View style={[styles.activeUnderline, { backgroundColor: colors.accent }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("dealsBanner")}</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{t("dealsSubtitle")}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: "deals" } })}
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.seeAllText, { color: colors.accent }]}>{t("seeAll")}</Text>
              <Feather name="arrow-right" size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {DEALS.map((deal, idx) => (
              <Animated.View
                key={deal.id}
                style={{
                  opacity: contentFade,
                  transform: [{ translateX: contentFade.interpolate({ inputRange: [0, 1], outputRange: [30 + idx * 20, 0] }) }],
                }}
              >
                <DealCard
                  deal={deal}
                  onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: "deals" } })}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("mostPopular")}</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{t("popularSub")}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/menu")}
              style={[styles.seeAllBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.seeAllText, { color: colors.accent }]}>{t("seeAll")}</Text>
              <Feather name="arrow-right" size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} onPress={(i: MenuItem) => router.push(`/item/${i.id}`)} horizontal={false} />
            ))}
          </ScrollView>
        </View>

        {/* Signature Promo */}
        {zingerBurger && (
          <Animated.View style={[styles.promoBannerWrapper, { transform: [{ scale: promoPulse }] }]}>
            <TouchableOpacity
              style={styles.promoBanner}
              onPress={() => router.push(`/item/${zingerBurger.id}`)}
              activeOpacity={0.88}
            >
              <LinearGradient colors={["#7B1C1C", "#C8102E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoGradient}>
                <View style={styles.promoLeft}>
                  <Text style={styles.promoEyebrow}>
                    {language === "ur" ? "ہماری خاص پیشکش" : "Our Signature"}
                  </Text>
                  <Text style={styles.promoTitle}>RFC Zinger Burger</Text>
                  <Text style={styles.promoPrice}>Rs. {zingerBurger.price.toLocaleString()}</Text>
                  <View style={styles.promoOrderBtn}>
                    <Text style={styles.promoOrderBtnText}>{t("orderNow")}</Text>
                    <Feather name="arrow-right" size={12} color="#C8102E" />
                  </View>
                </View>
                <View style={styles.promoRight}>
                  {promoImageSource ? (
                    <Image source={promoImageSource} style={styles.promoImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.promoCircle}>
                      <Feather name="layers" size={36} color="rgba(255,255,255,0.55)" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, paddingHorizontal: 16, marginBottom: 14 }]}>
            {t("browseCategory")}
          </Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat, idx) => (
              <Animated.View
                key={cat.id}
                style={{
                  opacity: contentFade,
                  transform: [{ scale: contentFade.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
                  width: "30%",
                  flexGrow: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: cat.id } })}
                  style={[styles.catTile, { backgroundColor: "#FFFFFF", borderColor: cat.color + "25" }]}
                  activeOpacity={0.72}
                >
                  <View style={[styles.catIconBox, { backgroundColor: cat.color + "18" }]}>
                    <Feather name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <Text style={[styles.catLabel, { color: "#1A1A1A" }]}>{t(cat.labelKey as any)}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoChip: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  logoChipText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  brandLogo: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandLogoMark: {
    width: 46,
    height: 46,
    borderRadius: 22,
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C8102E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  brandLogoIcon: { fontSize: 24, color: "#FFD54F" },
  brandLogoText: { color: "#C8102E", fontFamily: "Inter_700Bold", letterSpacing: 1 },
  profileAvatar: { width: 36, height: 36, borderRadius: 18 },
  rfcTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  greetRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  greetText: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular" },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center", alignItems: "center",
  },
  profileInitial: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  branchSelector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  branchLeft: { flexDirection: "row", alignItems: "center" },
  pinBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  branchLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  branchName: { fontSize: 14, color: "#FFFFFF", fontFamily: "Inter_600SemiBold", marginTop: 1 },
  branchChevron: { width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingTop: 2 },
  loyaltyBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 0,
  },
  loyaltyBannerText: { flex: 1, color: "#FFD700", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  orderTypeBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 4 },
  orderTypeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, gap: 5, position: "relative" },
  activeUnderline: { position: "absolute", bottom: 0, left: 12, right: 12, height: 2.5, borderRadius: 2 },
  orderTypeLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { marginTop: 22 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 22 },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginTop: 2 },
  seeAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  hScroll: { paddingLeft: 16, paddingRight: 8 },
  promoBannerWrapper: { marginHorizontal: 16, marginTop: 22 },
  promoBanner: { borderRadius: 20, overflow: "hidden", shadowColor: "#C8102E", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  promoGradient: { flexDirection: "row", alignItems: "center", padding: 22, gap: 16 },
  promoLeft: { flex: 1 },
  promoEyebrow: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.8, marginBottom: 4, textTransform: "uppercase" },
  promoTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6, lineHeight: 26 },
  promoPrice: { color: "rgba(255,255,255,0.85)", fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  promoOrderBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start" },
  promoOrderBtnText: { color: "#C8102E", fontSize: 13, fontFamily: "Inter_700Bold" },
  promoRight: { alignItems: "center", justifyContent: "center" },
  promoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  promoImage: { width: 94, height: 94, borderRadius: 44, backgroundColor: "rgba(255,255,255,0.12)" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  catTile: { borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  catIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  catLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
});
