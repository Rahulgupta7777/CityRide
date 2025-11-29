import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRouteDetails } from "../services/api";
import { diffMinutesHHMMSS } from "../utils/timeUtils";
import StopSelect from "../components/stopselect";


export default function RouteDetails({ route, navigation }) {
  const { route_number, trip_headsign, tripId } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectType, setSelectType] = useState(null); 

  useEffect(() => {
    addToRecent({ route_number, trip_headsign });
    fetchDetails();
  }, [tripId]);

  const fetchDetails = async () => {
    try {
      const data = await getRouteDetails(tripId);
      setDetails(data);
      setFromStop(null);
      setToStop(null);
    } catch (err) {
      setError("Failed to load route details");
    } finally {
      setLoading(false);
    }
  };

  const addToRecent = async (routeObj) => {
    let list = JSON.parse(await AsyncStorage.getItem("recent")) || [];
    list = [
      routeObj,
      ...list.filter((i) => i.route_number !== routeObj.route_number),
    ].slice(0, 10);
    await AsyncStorage.setItem("recent", JSON.stringify(list));
  };

  const addToFavorites = async (routeObj) => {
    let list = JSON.parse(await AsyncStorage.getItem("favorites")) || [];
    if (!list.some((i) => i.route_number === routeObj.route_number)) {
      list.push(routeObj);
      await AsyncStorage.setItem("favorites", JSON.stringify(list));
    }
  };

  const stops = details?.stops || [];
  const fromIdx = stops.findIndex((s) => s.stop_name === fromStop?.stop_name);
  const toIdx = stops.findIndex((s) => s.stop_name === toStop?.stop_name);

  let numStops = null,
    timeDiff = null;
  if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
    numStops = Math.abs(toIdx - fromIdx);
    const idxA = Math.min(fromIdx, toIdx);
    const idxB = Math.max(fromIdx, toIdx);
    timeDiff = diffMinutesHHMMSS(stops[idxA].time, stops[idxB].time);
  }

  const renderStop = ({ item, index }) => {
    const next = stops[index + 1];
    const time = next ? diffMinutesHHMMSS(item.time, next.time) : null;
    return (
      <View style={styles.stopItem}>
        <View style={styles.timelineContainer}>
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>
        <View style={styles.stopContent}>
          <Text style={styles.stopName}>{item.stop_name}</Text>
          <Text style={styles.stopTime}>{item.time}</Text>
          {typeof time === "number" && !Number.isNaN(time) && (
            <Text style={styles.timeText}>{time} mins to next stop</Text>
          )}
        </View>
      </View>
    );
  };

  const openSelectModal = (type) => {
    setSelectType(type);
    setModalVisible(true);
  };

  const handleStopSelected = (stop) => {
    if (selectType === "from") setFromStop(stop);
    if (selectType === "to") setToStop(stop);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Route {route_number}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{trip_headsign}</Text>
        </View>

        <TouchableOpacity
          onPress={() => addToFavorites({ route_number, trip_headsign })}
          style={styles.favoriteButton}
        >
          <MaterialIcons name="favorite" size={26} color="#d9534f" />
        </TouchableOpacity>
      </View>

      {/* Search From and To stops */}
      {!loading && !error && stops.length > 1 && (
        <View style={styles.selectRow}>
          <TouchableOpacity style={styles.selectButton} onPress={() => openSelectModal("from")}>
            <Text style={styles.selectButtonLabel}>
              {fromStop ? `From: ${fromStop.stop_name}` : "Select Start Stop"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selectButton} onPress={() => openSelectModal("to")}>
            <Text style={styles.selectButtonLabel}>
              {toStop ? `To: ${toStop.stop_name}` : "Select Destination Stop"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#007AFF" />
            </TouchableOpacity>
            <Text style={{ marginLeft: 12, fontSize: 18 }}>
              Select {selectType === "from" ? "Start" : "Destination"} Stop
            </Text>
          </View>
          <StopSelect stops={stops} onSelect={handleStopSelected} />
        </SafeAreaView>
      </Modal>

      {fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>
            Stops in between: <Text style={{ fontWeight: "bold" }}>{numStops}</Text>
          </Text>
          <Text style={styles.resultText}>
            Estimated travel time:{" "}
            {typeof timeDiff === "number" ? `${timeDiff} min` : "N/A"}
          </Text>
        </View>
      )}

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
              {stops.length} stops ·
              {stops.length > 1
                ? diffMinutesHHMMSS(stops[0].time, stops[stops.length - 1].time)
                : 0}{" "}
              mins total
            </Text>
          </View>
          <FlatList
            data={stops}
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
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  backButton: { marginRight: 16 },
  favoriteButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666" },
  selectRow: { flexDirection: "row", justifyContent: "space-between", padding: 16, gap: 10 },
  selectButton: { flex: 1, backgroundColor: "#e3f2fd", borderRadius: 8, padding: 12, alignItems: "center" },
  selectButtonLabel: { fontSize: 15, color: "#007AFF", fontWeight: "500" },
  resultCard: { backgroundColor: "#e3f2fd", margin: 16, borderRadius: 8, padding: 12 },
  resultText: { fontSize: 16, color: "#333" },
  summaryRow: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#fafafa" },
  summaryText: { fontSize: 14, fontWeight: "500", color: "#444" },
  listContent: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16, marginBottom: 10 },
  retryButton: { padding: 10, backgroundColor: "#007AFF", borderRadius: 5 },
  retryText: { color: "#fff", fontWeight: "bold" },
  stopItem: { flexDirection: "row", marginBottom: 0, minHeight: 60 },
  timelineContainer: { alignItems: "center", marginRight: 16, width: 20 },
  line: { position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: "#e0e0e0" },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#007AFF", marginTop: 6, borderWidth: 2, borderColor: "#fff" },
  stopContent: { flex: 1, paddingBottom: 20 },
  stopName: { fontSize: 16, fontWeight: "500", color: "#333" },
  stopTime: { fontSize: 14, color: "#666" },
  timeText: { fontSize: 12, color: "#999", marginTop: 4 },
});
