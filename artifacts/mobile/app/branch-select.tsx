import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BRANCHES, Branch } from "@/constants/data";
import { useBranch } from "@/contexts/BranchContext";
import { useColors } from "@/hooks/useColors";

export default function BranchSelectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedBranch, selectBranch } = useBranch();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return BRANCHES;
    const q = search.toLowerCase();
    return BRANCHES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.area.toLowerCase().includes(q)
    );
  }, [search]);

  const cities = [...new Set(filtered.map((b) => b.city))];

  const handleSelect = (branch: Branch) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    selectBranch(branch);
    router.back();
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search branches..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={cities}
        keyExtractor={(c) => c}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
        renderItem={({ item: city }) => {
          const cityBranches = filtered.filter((b) => b.city === city);
          return (
            <View style={styles.citySection}>
              <Text style={[styles.cityTitle, { color: colors.mutedForeground }]}>{city.toUpperCase()}</Text>
              {cityBranches.map((branch) => {
                const isSelected = selectedBranch?.id === branch.id;
                return (
                  <TouchableOpacity
                    key={branch.id}
                    onPress={() => handleSelect(branch)}
                    activeOpacity={0.7}
                    style={[
                      styles.branchCard,
                      {
                        backgroundColor: isSelected ? colors.lightGreen : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.branchLeft}>
                      <View
                        style={[
                          styles.branchDot,
                          { backgroundColor: isSelected ? colors.primary : colors.border },
                        ]}
                      />
                      <View style={styles.branchInfo}>
                        <View style={styles.branchNameRow}>
                          <Text style={[styles.branchName, { color: colors.foreground }]}>
                            RFC {branch.name}
                          </Text>
                          {!branch.isOpen && (
                            <View style={[styles.closedBadge, { backgroundColor: "#FFEBEE" }]}>
                              <Text style={[styles.closedText, { color: colors.accent }]}>Closed</Text>
                            </View>
                          )}
                          {branch.isOpen && isSelected && (
                            <View style={[styles.selectedBadge, { backgroundColor: colors.secondary }]}>
                              <Text style={[styles.selectedText, { color: colors.primary }]}>Selected</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.branchAddress, { color: colors.mutedForeground }]}>
                          {branch.address}
                        </Text>
                        <View style={styles.branchMeta}>
                          <Feather name="clock" size={11} color={colors.mutedForeground} />
                          <Text style={[styles.branchHours, { color: colors.mutedForeground }]}>
                            {branch.hours}
                          </Text>
                          {branch.distance ? (
                            <>
                              <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>•</Text>
                              <Feather name="navigation" size={11} color={colors.mutedForeground} />
                              <Text style={[styles.branchHours, { color: colors.mutedForeground }]}>
                                {branch.distance}
                              </Text>
                            </>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    {isSelected ? (
                      <Feather name="check-circle" size={20} color={colors.primary} />
                    ) : branch.isOpen ? (
                      <View style={[styles.openDot, { backgroundColor: "#4CAF50" }]} />
                    ) : (
                      <View style={[styles.openDot, { backgroundColor: "#9E9E9E" }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  citySection: {
    marginTop: 4,
  },
  cityTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  branchCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  branchLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  branchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  branchInfo: { flex: 1 },
  branchNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 3,
  },
  branchName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  closedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  selectedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  branchAddress: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 5,
    lineHeight: 16,
  },
  branchMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  branchHours: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  metaDot: {
    fontSize: 11,
  },
  openDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});
