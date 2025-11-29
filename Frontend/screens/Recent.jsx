import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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
      key={item.route_number}
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("RouteDetails", { route_number: item.route_number })
      }
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="history" size={22} color="#90A17D" />
        </View>

        <View>
          <Text style={styles.routeNumber}>{item.route_number}</Text>
          <Text style={styles.headsign} numberOfLines={1}>
            {item.trip_headsign}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Searches </Text>

        {recent.length > 0 && (
          <TouchableOpacity onPress={clearRecent}>
            <MaterialIcons name="delete-sweep" size={28} color="#D9534F" />
          </TouchableOpacity>
        )}
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyBlock}>
          <MaterialIcons name="history" size={58} color="#90A17D" />
          <Text style={styles.emptyText}>No recent searches yet</Text>
          <Text style={styles.emptySubText}>
            Your latest routes will be shown here automatically
          </Text>
        </View>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 26 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E2E2E",
  },

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

  card: {
    backgroundColor: "#F8FAF5",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
