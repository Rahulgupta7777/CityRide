import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import SearchBar from '../components/SearchBar';
import RouteCard from '../components/RouteCard';
import { searchRoutes } from '../services/api';

export default function Home({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeout = React.useRef(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length === 0) {
      setRoutes([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchRoutes(query);
        setRoutes(results);
      } catch (err) {
        setError('Failed to fetch routes. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce for 500ms
  };

  const renderItem = ({ item }) => (
    <RouteCard
      route={item}
      onPress={() => navigation.navigate('RouteDetails', { tripId: item.example_trip_id, route: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CityRide</Text>
        <Text style={styles.subtitle}>Find your bus route</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onSubmit={() => handleSearch(searchQuery)}
      />

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
        data={routes}
        renderItem={renderItem}
        keyExtractor={(item) => item.route_id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && searchQuery.length > 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No routes found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  center: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});