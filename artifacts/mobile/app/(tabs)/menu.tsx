import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryPill } from "@/components/CategoryPill";
import { FoodCard } from "@/components/FoodCard";
import { CATEGORIES, MENU_ITEMS, MenuItem } from "@/constants/data";
import { useApiMenu } from "@/hooks/useApiMenu";
import { useColors } from "@/hooks/useColors";

export default function MenuScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ cat?: string }>();
  const { apiItems } = useApiMenu();

  const [selectedCategory, setSelectedCategory] = useState(params.cat ?? "deals");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (params.cat) {
      setSelectedCategory(params.cat);
    }
  }, [params.cat]);

  // Merge API imageUrls into local menu items (matched by id or name)
  const mergedItems = useMemo<MenuItem[]>(() => {
    if (!apiItems.length) return MENU_ITEMS;
    const apiById = new Map(apiItems.map((a) => [a.id, a]));
    const apiByName = new Map(apiItems.map((a) => [a.name.toLowerCase(), a]));
    return MENU_ITEMS.map((item) => {
      const apiItem = apiById.get(item.id) ?? apiByName.get(item.name.toLowerCase());
      if (apiItem?.imageUrl) {
        return { ...item, imageUrl: apiItem.imageUrl };
      }
      return item;
    });
  }, [apiItems]);

  const filteredItems = useMemo(() => {
    const byCategory = mergedItems.filter((i) => i.category === selectedCategory);
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter(
      (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }, [mergedItems, selectedCategory, search]);

  const handleItemPress = (item: MenuItem) => {
    router.push(`/item/${item.id}`);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.primary },
        ]}
      >
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.7)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search menu..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={[styles.searchInput, { color: "#FFFFFF" }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={14} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={[styles.categoryContainer, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              active={selectedCategory === cat.id}
              onPress={() => {
                setSelectedCategory(cat.id);
                setSearch("");
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodCard item={item} onPress={handleItemPress} horizontal={true} />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              Platform.OS === "web" ? 100 : 100 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filteredItems.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No items found
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Try a different search term
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  categoryContainer: {
    borderBottomWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
