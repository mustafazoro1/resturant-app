import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;
const SLIDE_HEIGHT = 190;
const AUTO_SCROLL_MS = 3500;

type Slide = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  gradStart: string;
  gradEnd: string;
  ctaLabel: string;
  ctaCat: string;
};

const SLIDES: Slide[] = [
  {
    id: "s1",
    image: require("../assets/images/hero-banner.png"),
    title: "Big Deals, Bigger Savings",
    subtitle: "Up to 30% off on every meal deal",
    tag: "DEALS",
    tagColor: "#FFD700",
    gradStart: "#1B5E20CC",
    gradEnd: "#2E7D32CC",
    ctaLabel: "View Deals",
    ctaCat: "deals",
  },
  {
    id: "s2",
    image: require("../assets/images/burger.png"),
    title: "RFC Zinger Burger",
    subtitle: "Pakistan's most loved crispy burger",
    tag: "BESTSELLER",
    tagColor: "#FF8F00",
    gradStart: "#7B1C1CCC",
    gradEnd: "#C8102ECC",
    ctaLabel: "Order Now",
    ctaCat: "burgers",
  },
  {
    id: "s3",
    image: require("../assets/images/chicken.png"),
    title: "Crispy Chicken",
    subtitle: "Fresh, golden & fried to perfection",
    tag: "HOT",
    tagColor: "#EF5350",
    gradStart: "#BF360CCC",
    gradEnd: "#E64A19CC",
    ctaLabel: "Explore Menu",
    ctaCat: "chicken",
  },
];

export function HeroBanner() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotAnim = useRef(SLIDES.map(() => new Animated.Value(0))).current;

  const animateDots = (index: number) => {
    SLIDES.forEach((_, i) => {
      Animated.timing(dotAnim[i]!, {
        toValue: i === index ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    animateDots(0);
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        animateDots(next);
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    if (idx !== activeIndex) {
      setActiveIndex(idx);
      animateDots(idx);
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.slide}
      onPress={() => router.push({ pathname: "/(tabs)/menu", params: { cat: item.ctaCat } })}
    >
      <Image source={item.image} style={styles.slideImage} resizeMode="cover" />
      <LinearGradient
        colors={[item.gradStart, item.gradEnd] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.overlay}
      >
        <View style={styles.slideContent}>
          <View style={[styles.tagPill, { backgroundColor: item.tagColor }]}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
          <Text style={styles.slideTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.slideSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{item.ctaLabel}</Text>
            <Feather name="arrow-right" size={12} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: SLIDE_WIDTH, offset: SLIDE_WIDTH * index, index })}
      />
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: dotAnim[i]!.interpolate({ inputRange: [0, 1], outputRange: [6, 20] }),
                opacity: dotAnim[i]!.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
                backgroundColor: "#FFFFFF",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SLIDE_HEIGHT,
    position: "relative",
  },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    overflow: "hidden",
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 18,
  },
  slideContent: {
    gap: 4,
  },
  tagPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  slideTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  slideSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ctaText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  dots: {
    position: "absolute",
    bottom: 10,
    right: 14,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
