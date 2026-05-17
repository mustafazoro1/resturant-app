import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SavedAddress, useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useOrders } from "@/contexts/OrderContext";
import { useColors } from "@/hooks/useColors";

const LABEL_ICONS: Record<SavedAddress["label"], React.ComponentProps<typeof Feather>["name"]> = {
  Home: "home",
  Work: "briefcase",
  Other: "map-pin",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, removeAddress, setDefaultAddress } = useAuth();
  const { selectedBranch } = useBranch();
  const { orders } = useOrders();
  const [notifications, setNotifications] = useState(true);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const handleRemoveAddress = (id: string) => {
    Alert.alert("Remove Address", "Remove this saved address?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeAddress(id) },
    ]);
  };

  const totalSpend = orders.reduce((s, o) => s + o.total, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={[colors.darkGreen, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <View style={styles.avatarCircle}>
          {user ? (
            <Text style={[styles.avatarInitial, { color: colors.primary }]}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Feather name="user" size={34} color={colors.primary} />
          )}
        </View>
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutChip}
            >
              <Feather name="log-out" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>Guest</Text>
            <Text style={styles.guestSubtitle}>Sign in to save your orders</Text>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => router.push("/login")}
            >
              <Feather name="log-in" size={14} color="#C8102E" />
              <Text style={styles.signInText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{orders.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Orders</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {totalSpend > 0 ? `${Math.round(totalSpend / 1000)}k` : "0"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Spent (Rs.)</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {user?.addresses.length ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Addresses</Text>
        </View>
      </View>

      {/* Delivery Addresses */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DELIVERY ADDRESSES</Text>
          {user && (
            <TouchableOpacity
              onPress={() => router.push("/add-address")}
              style={[styles.addAddressBtn, { backgroundColor: colors.lightGreen }]}
            >
              <Feather name="plus" size={12} color={colors.primary} />
              <Text style={[styles.addAddressBtnText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {!user ? (
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={[styles.emptyAddressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="lock" size={20} color={colors.mutedForeground} />
            <Text style={[styles.emptyAddressText, { color: colors.mutedForeground }]}>
              Sign in to save delivery addresses
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : user.addresses.length === 0 ? (
          <TouchableOpacity
            onPress={() => router.push("/add-address")}
            style={[styles.emptyAddressCard, { backgroundColor: colors.card, borderColor: colors.border, borderStyle: "dashed" }]}
          >
            <Feather name="plus-circle" size={20} color={colors.primary} />
            <Text style={[styles.emptyAddressText, { color: colors.mutedForeground }]}>
              No saved addresses. Add one for quick delivery.
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.addressList, { borderColor: colors.border }]}>
            {user.addresses.map((addr, idx) => (
              <View
                key={addr.id}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: addr.isDefault ? colors.lightGreen : colors.card,
                    borderBottomColor: colors.border,
                    borderBottomWidth: idx < user.addresses.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.addressIconBox,
                    { backgroundColor: addr.isDefault ? colors.primary : colors.muted },
                  ]}
                >
                  <Feather
                    name={LABEL_ICONS[addr.label]}
                    size={16}
                    color={addr.isDefault ? "#FFF" : colors.mutedForeground}
                  />
                </View>
                <View style={styles.addressContent}>
                  <View style={styles.addressTopRow}>
                    <Text style={[styles.addressLabel, { color: colors.foreground }]}>
                      {addr.label}
                    </Text>
                    {addr.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addressText, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {addr.address}
                  </Text>
                </View>
                <View style={styles.addressActions}>
                  {!addr.isDefault && (
                    <TouchableOpacity
                      onPress={() => setDefaultAddress(addr.id)}
                      style={[styles.addressActionBtn, { borderColor: colors.border }]}
                    >
                      <Feather name="star" size={13} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/add-address", params: { editId: addr.id } })}
                    style={[styles.addressActionBtn, { borderColor: colors.border }]}
                  >
                    <Feather name="edit-2" size={13} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveAddress(addr.id)}
                    style={[styles.addressActionBtn, { borderColor: "#FECACA" }]}
                  >
                    <Feather name="trash-2" size={13} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>
        <View style={[styles.menuCard, { borderColor: colors.border }]}>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            colors={colors}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon="map-pin"
            label="Current Branch"
            value={selectedBranch ? `RFC ${selectedBranch.name}` : "Not selected"}
            colors={colors}
            onPress={() => router.push("/branch-select")}
          />
          <SettingRow
            icon="globe"
            label="Language"
            value="English"
            colors={colors}
            onPress={() => Alert.alert("Language", "Only English is available currently.")}
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT RFC</Text>
        <View style={[styles.menuCard, { borderColor: colors.border }]}>
          <SettingRow
            icon="phone"
            label="Contact Us"
            value="0315-1111000"
            colors={colors}
            onPress={() => Alert.alert("Contact RFC", "Call: 0315-1111000\nEmail: info@rfcpk.com")}
          />
          <SettingRow
            icon="file-text"
            label="Terms & Conditions"
            colors={colors}
            onPress={() => Alert.alert("Terms", "Available on our website.")}
          />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            colors={colors}
            onPress={() => Alert.alert("Privacy", "Available on our website.")}
          />
          <SettingRow icon="info" label="App Version" value="v1.0.0" colors={colors} />
        </View>
      </View>

      {/* Brand Footer */}
      <View style={styles.brandFooter}>
        <LinearGradient colors={[colors.darkGreen, colors.primary]} style={styles.brandCircle}>
          <Text style={styles.brandLogoText}>RFC</Text>
        </LinearGradient>
        <Text style={[styles.brandName, { color: colors.foreground }]}>Real Farmers Chicken</Text>
        <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
          Fresh. Crispy. Delicious.
        </Text>
      </View>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.lightGreen }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        {value ? (
          <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>
        ) : null}
      </View>
      {rightElement ?? (onPress && <Feather name="chevron-right" size={15} color={colors.mutedForeground} />)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: "center",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  userInfo: { alignItems: "center" },
  userName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 3,
  },
  userPhone: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  signOutChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  signOutText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  guestInfo: { alignItems: "center" },
  guestName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  guestSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  signInText: {
    color: "#C8102E",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  section: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.1,
  },
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addAddressBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  emptyAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyAddressText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  addressList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
  },
  addressIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  addressContent: {
    flex: 1,
  },
  addressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 3,
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  defaultBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  addressActions: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: 2,
  },
  addressActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  settingValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  brandFooter: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 7,
  },
  brandCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  brandLogoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  brandTagline: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
