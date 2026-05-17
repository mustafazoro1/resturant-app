import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { useBranch } from "@/contexts/BranchContext";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}

function ProfileMenuItem({ icon, label, value, onPress, rightElement, isDestructive }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: isDestructive ? "#FFEBEE" : colors.lightGreen }]}>
        <Feather name={icon} size={18} color={isDestructive ? colors.accent : colors.primary} />
      </View>
      <View style={styles.menuItemInfo}>
        <Text style={[styles.menuLabel, { color: isDestructive ? colors.accent : colors.foreground }]}>
          {label}
        </Text>
        {value ? <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
      </View>
      {rightElement ?? <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedBranch } = useBranch();
  const [notifications, setNotifications] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={[colors.darkGreen, colors.primary]}
        style={styles.profileHeader}
      >
        <View style={styles.avatarCircle}>
          <Feather name="user" size={36} color={colors.primary} />
        </View>
        {isGuest ? (
          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>Guest User</Text>
            <Text style={styles.guestSubtitle}>Sign in to save your orders and preferences</Text>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => Alert.alert("Coming Soon", "Firebase authentication will be enabled in the next update.")}
            >
              <Text style={styles.signInText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Muhammad Ali</Text>
            <Text style={styles.userPhone}>+92 300 1234567</Text>
          </View>
        )}
      </LinearGradient>

      {/* Quick Stats */}
      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Orders</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Points</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Saved</Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileMenuItem
            icon="map-pin"
            label="Saved Addresses"
            value="No addresses saved"
            onPress={() => Alert.alert("Coming Soon", "Address management will be available soon.")}
          />
          <ProfileMenuItem
            icon="credit-card"
            label="Payment Methods"
            value="No cards saved"
            onPress={() => Alert.alert("Coming Soon", "Card management coming soon.")}
          />
          <ProfileMenuItem
            icon="star"
            label="Loyalty Points"
            value="0 points"
            onPress={() => Alert.alert("Loyalty Program", "Earn points with every order! Coming soon.")}
          />
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileMenuItem
            icon="bell"
            label="Push Notifications"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <ProfileMenuItem
            icon="map-pin"
            label="Current Branch"
            value={selectedBranch ? `RFC ${selectedBranch.name}` : "Not selected"}
            onPress={() => {}}
          />
          <ProfileMenuItem
            icon="globe"
            label="Language"
            value="English"
            onPress={() => Alert.alert("Language", "Only English is available currently.")}
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ProfileMenuItem
            icon="phone"
            label="Contact Us"
            value="0315-1111000"
            onPress={() => Alert.alert("Contact RFC", "Call us at: 0315-1111000\nEmail: info@rfcpk.com")}
          />
          <ProfileMenuItem
            icon="file-text"
            label="Terms & Conditions"
            onPress={() => Alert.alert("Terms", "Terms & Conditions available on our website.")}
          />
          <ProfileMenuItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => Alert.alert("Privacy", "Privacy policy available on our website.")}
          />
          <ProfileMenuItem
            icon="info"
            label="App Version"
            value="v1.0.0"
          />
        </View>
      </View>

      {/* RFC Branding */}
      <View style={styles.brandFooter}>
        <LinearGradient
          colors={[colors.darkGreen, colors.primary]}
          style={styles.brandCircle}
        >
          <Text style={styles.brandLogo}>RFC</Text>
        </LinearGradient>
        <Text style={[styles.brandName, { color: colors.foreground }]}>Real Farmers Chicken</Text>
        <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
          Fresh. Crispy. Delicious.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    padding: 24,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  guestInfo: {
    alignItems: "center",
  },
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
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  signInBtn: {
    backgroundColor: "#C8102E",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  userInfo: { alignItems: "center" },
  userName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  userPhone: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    backgroundColor: "#FFF",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemInfo: { flex: 1 },
  menuLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 1,
  },
  menuValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  brandFooter: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  brandCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  brandLogo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  brandTagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
