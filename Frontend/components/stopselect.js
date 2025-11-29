import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function StopSelect({ stops = [], onSelect }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stops;
    return stops.filter((s) => (s.stop_name || "").toLowerCase().includes(q));
  }, [query, stops]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => onSelect?.(item)}>
      <Text style={styles.itemText} numberOfLines={1}>
        {item.stop_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchCard}>
        <TextInput
          style={styles.input}
          placeholder="Search stops"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#999"
        />
      </View>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, idx) => `${item.sequence}-${idx}`}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  searchCard: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: { fontSize: 16, color: "#333" },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemText: { fontSize: 16, color: "#333" },
});
