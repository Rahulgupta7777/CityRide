import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function Recent({ navigation }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    loadRecent();
    const unsubscribe = navigation.addListener("focus", loadRecent);
    return unsubscribe;
  }, [navigation]);

  const loadRecent = async () => {
    const data = await AsyncStorage.getItem("recent");
    setRecent(data ? JSON.parse(data) : []);
  };

  const clearRecent = async () => {
    await AsyncStorage.removeItem("recent");
    setRecent([]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RouteDetails", { route_number: item.route_number })}
    >
      <Text style={styles.route}>{item.route_number}</Text>
      <Text style={styles.headsign}>{item.trip_headsign}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Searches</Text>

        {recent.length > 0 && (
          <TouchableOpacity onPress={clearRecent}>
            <MaterialIcons name="delete-sweep" size={26} color="#d9534f" />
          </TouchableOpacity>
        )}
      </View>

      {recent.length === 0 ? (
        <Text style={styles.empty}>No recent searches found</Text>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item, i) => String(i)}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 25, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  route: { fontSize: 18, fontWeight: "bold", color: "#007AFF" },
  headsign: { fontSize: 14, color: "#555" },
});
