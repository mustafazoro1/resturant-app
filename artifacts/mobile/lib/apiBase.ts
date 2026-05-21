import { Platform } from "react-native";

export function getApiBase(): string {
  const domain = process.env["EXPO_PUBLIC_DOMAIN"];
  if (domain) {
    const trimmed = domain.replace(/\/+$/, "");
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.includes("localhost") || trimmed.startsWith("127.")) {
      return `http://${trimmed}`;
    }
    return `https://${trimmed}`;
  }

  // Local dev: default API port when EXPO_PUBLIC_DOMAIN is not baked in
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const { protocol, hostname } = window.location;
      return `${protocol}//${hostname}:8080`;
    }
    return "http://localhost:8080";
  }

  return "";
}
