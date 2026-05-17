import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(null);

  const isValid = name.trim().length >= 2 && phone.trim().length >= 10;

  const handleSignIn = async () => {
    if (!isValid) return;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signIn(name.trim(), phone.trim());
    setIsLoading(false);
    router.back();
  };

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[colors.darkGreen, colors.primary, "#2E7D32"]}
        style={[styles.topSection, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={[styles.logoText, { color: colors.primary }]}>RFC</Text>
          </View>
          <Text style={styles.brandName}>Real Farmers Chicken</Text>
          <Text style={styles.brandTagline}>Sign in to place your order</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.formContainer, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.formContent, { paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Welcome!</Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
          Enter your name and phone number to continue.
        </Text>

        {/* Name Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Full Name</Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: focusedField === "name" ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather name="user" size={18} color={focusedField === "name" ? colors.primary : colors.mutedForeground} />
            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Muhammad Ali"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              style={[styles.input, { color: colors.foreground }]}
            />
            {name.length >= 2 && (
              <Feather name="check-circle" size={16} color="#4CAF50" />
            )}
          </View>
        </View>

        {/* Phone Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Phone Number</Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: focusedField === "phone" ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.phonePrefix}>
              <Text style={[styles.phonePrefixText, { color: colors.foreground }]}>🇵🇰 +92</Text>
            </View>
            <View style={[styles.phoneDivider, { backgroundColor: colors.border }]} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              placeholder="300 1234567"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              maxLength={11}
              style={[styles.input, { color: colors.foreground }]}
            />
            {phone.trim().length >= 10 && (
              <Feather name="check-circle" size={16} color="#4CAF50" />
            )}
          </View>
        </View>

        {/* Info Note */}
        <View style={[styles.infoNote, { backgroundColor: colors.lightGreen, borderColor: colors.secondary }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Your info is saved locally on this device. No account creation needed.
          </Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={!isValid || isLoading}
          style={[
            styles.signInBtn,
            {
              backgroundColor: isValid ? colors.accent : colors.border,
              opacity: isValid ? 1 : 0.7,
            },
          ]}
        >
          {isLoading ? (
            <Text style={styles.signInBtnText}>Signing in...</Text>
          ) : (
            <>
              <Text style={styles.signInBtnText}>Continue</Text>
              <Feather name="arrow-right" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
            Continue as guest (browse only)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoArea: {
    alignItems: "center",
    paddingTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  brandTagline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  phonePrefix: {
    flexDirection: "row",
    alignItems: "center",
  },
  phonePrefixText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  phoneDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 16,
    shadowColor: "#C8102E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
});
