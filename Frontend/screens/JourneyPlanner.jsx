import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getJourney } from "../services/api";
import { diffMinutesHHMMSS } from "../utils/timeUtils";

export default function JourneyPlanner() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSearch = async () => {
    if (!from || !to) {
      setError("Enter both From and To stops");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getJourney(from, to);
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to fetch journeys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const diff = diffMinutesHHMMSS(item.start_time, item.end_time);
    const duration = Number.isNaN(diff)
      ? (item.stops_in_between || 0) * 3
      : diff;
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="directions-bus" size={24} color="#007AFF" />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.routeNumber}>{item.route_number}</Text>
              <Text style={styles.headsign} numberOfLines={1}>
                {item.trip_headsign}
              </Text>
            </View>
            <Text style={styles.times}>
              {item.start_time} → {item.end_time} · {duration} mins
            </Text>
            <Text style={styles.times}>
              {item.stops_in_between} stops in between
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journey Planner</Text>
        <Text style={styles.subtitle}>Plan your trip between two stops</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputCard}>
          <MaterialIcons
            name="place"
            size={20}
            color="#007AFF"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="From stop"
            value={from}
            onChangeText={setFrom}
            placeholderTextColor="#999"
            returnKeyType="next"
          />
        </View>
        <View style={styles.inputCard}>
          <MaterialIcons
            name="flag"
            size={20}
            color="#007AFF"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="To stop"
            value={to}
            onChangeText={setTo}
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(_, idx) => String(idx)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (from.length > 0 || to.length > 0) ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No journeys found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 4 },
  inputRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
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
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  searchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  searchButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  listContent: { paddingBottom: 20 },
  center: { padding: 20, alignItems: "center" },
  errorText: { color: "red", fontSize: 16 },
  emptyText: { color: "#666", fontSize: 16 },
  card: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  routeNumber: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headsign: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  times: { fontSize: 14, color: "#666" },
});
