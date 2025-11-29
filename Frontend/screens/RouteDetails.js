import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRouteDetails } from "../services/api";
import { diffMinutesHHMMSS, calculateNextBusTime } from "../utils/timeUtils";
import { getRouteMeta } from "../data/routesMeta";

export default function RouteDetails({ route, navigation }) {
  const { tripId, route: routeInfo } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [tripId]);

  const fetchDetails = async () => {
    try {
      const data = await getRouteDetails(tripId);
      setDetails(data);
    } catch (err) {
      setError("Failed to load route details");
    } finally {
      setLoading(false);
    }
  };

  const meta = getRouteMeta(routeInfo.route_number);

  const renderStop = ({ item, index }) => {
    const next = details?.stops?.[index + 1];
    const leg = next ? diffMinutesHHMMSS(item.time, next.time) : null;
    return (
      <View style={styles.stopItem}>
        <View style={styles.timelineContainer}>
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>
        <View style={styles.stopContent}>
          <Text style={styles.stopName}>{item.stop_name}</Text>
          <Text style={styles.stopTime}>{item.time}</Text>
          {typeof leg === "number" && !Number.isNaN(leg) && (
            <Text style={styles.legText}>≈ {leg} mins to next stop</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Route {routeInfo.route_number}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {routeInfo.destination}
          </Text>
        </View>
      </View>

      {/* META INFO */}
      <View style={styles.metaRow}>
        {meta ? (
          <Text style={styles.metaText}>
            {calculateNextBusTime(
              meta.firstBus,
              meta.lastBus,
              meta.frequencyMins
            )}{" "}
            · Every {meta.frequencyMins} mins
          </Text>
        ) : (
          <Text style={styles.metaText}>Schedule info unavailable</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchDetails} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {details?.stops?.length || 0} stops ·
              {details?.stops?.length > 1
                ? diffMinutesHHMMSS(
                    details.stops[0].time,
                    details.stops[details.stops.length - 1].time
                  )
                : 0}{" "}
              mins total
            </Text>
          </View>
          <FlatList
            data={details?.stops}
            renderItem={renderStop}
            keyExtractor={(item, index) => `${item.sequence}-${index}`}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    maxWidth: 250,
  },
  metaRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  listContent: {
    padding: 20,
  },
  stopItem: {
    flexDirection: "row",
    marginBottom: 0,
    minHeight: 60,
  },
  timelineContainer: {
    alignItems: "center",
    marginRight: 16,
    width: 20,
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#e0e0e0",
    zIndex: -1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    marginTop: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  stopContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  stopTime: {
    fontSize: 14,
    color: "#666",
  },
  legText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  summaryRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
