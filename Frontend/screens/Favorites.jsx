import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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
      key={item.route_number}   // 🔥 fixes missing key warning
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("RouteDetails", { route_number: item.route_number })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="directions-bus" size={22} color="#90A17D" />
        </View>

        <View>
          <Text style={styles.routeNumber}>{item.route_number}</Text>
          <Text style={styles.headsign} numberOfLines={1}>
            {item.trip_headsign}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => removeFavorite(item.route_number)}>
        <MaterialIcons name="delete" size={26} color="#D9534F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Favourite Routes</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyBlock}>
          <MaterialIcons name="favorite-border" size={52} color="#90A17D" />
          <Text style={styles.emptyText}>No favourites added yet</Text>
          <Text style={styles.emptySubText}>Save routes to access them faster anytime</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.route_number}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E2E2E",
    marginBottom: 16,
    textAlign: "center",
  },

  /* Empty State */
  emptyBlock: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 4,
    color: "#7A7A7A",
  },

  /* Card */
  card: {
    backgroundColor: "#F8FAF5",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // smooth shadow modern
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8EFE2",
    marginRight: 14,
  },

  routeNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E2E2E",
  },

  headsign: {
    fontSize: 13,
    color: "#656565",
    marginTop: 2,
    maxWidth: 200,
  },
});
