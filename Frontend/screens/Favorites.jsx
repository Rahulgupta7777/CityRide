import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function Favorites({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
    const unsubscribe = navigation.addListener("focus", loadFavorites);
    return unsubscribe;
  }, [navigation]);

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem("favorites");
    setFavorites(data ? JSON.parse(data) : []);
  };

  const removeFavorite = async (route_number) => {
    const updated = favorites.filter((i) => i.route_number !== route_number);
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RouteDetails", { route_number: item.route_number })}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.route}>{item.route_number}</Text>
          <Text style={styles.headsign}>{item.trip_headsign}</Text>
        </View>
        <TouchableOpacity onPress={() => removeFavorite(item.route_number)}>
          <MaterialIcons name="delete" size={24} color="#d9534f" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favourite Routes</Text>

      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favourites added yet</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.route_number}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 25, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  route: { fontSize: 18, fontWeight: "bold", color: "#007AFF" },
  headsign: { fontSize: 14, color: "#555" },
});
