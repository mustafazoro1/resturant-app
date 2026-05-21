import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import { CartProvider } from "@/contexts/CartContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontFamily: "Inter_700Bold",
          color: "#FFFFFF",
          fontSize: 18,
        },
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.background },
        animation: "ios_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="branch-select" options={{ title: "Select Branch", presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="add-address" options={{ title: "Add Address", presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="item/[id]" options={{ title: "Product", headerShown: true }} />
      <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
      <Stack.Screen name="order-confirm" options={{ headerShown: false, gestureEnabled: false, animation: "fade" }} />
      <Stack.Screen name="terms" options={{ title: "Terms & Conditions" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <MenuProvider>
                  <BranchProvider>
                    <OrderProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                          <KeyboardProvider>
                            <RootLayoutNav />
                          </KeyboardProvider>
                        </View>
                      </GestureHandlerRootView>
                    </OrderProvider>
                  </BranchProvider>
                </MenuProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
