import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationItem {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

const SELECTED_LOCATION_KEY = '@selected_location';

export default function LocationPickerScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationItem | null>(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const debounceTimer = setTimeout(() => {
        searchLocations(searchQuery);
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadCurrentLocation = async () => {
    try {
      setIsLoadingCurrent(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setIsLoadingCurrent(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const locationData = reverseGeocode[0];
        const addressParts = [];
        
        if (locationData.name) addressParts.push(locationData.name);
        if (locationData.street) addressParts.push(locationData.street);
        if (locationData.city) addressParts.push(locationData.city);
        if (locationData.region) addressParts.push(locationData.region);
        if (locationData.country) addressParts.push(locationData.country);
        
        const fullAddress = addressParts.length > 0 
          ? addressParts.join(', ')
          : 'Current Location';

        setCurrentLocation({
          id: 'current',
          address: fullAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          city: locationData.city || undefined,
          region: locationData.region || undefined,
          country: locationData.country || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading current location:', error);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // Geocode the search query
      const geocodeResults = await Location.geocodeAsync(query);

      // Reverse geocode each result to get proper address
      const locationPromises = geocodeResults.map(async (result, index) => {
        try {
          // Reverse geocode to get address details
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });

          if (reverseGeocode.length > 0) {
            const locationData = reverseGeocode[0];
            const addressParts = [];
            
            if (locationData.name) addressParts.push(locationData.name);
            if (locationData.street) addressParts.push(locationData.street);
            if (locationData.city) addressParts.push(locationData.city);
            if (locationData.region) addressParts.push(locationData.region);
            if (locationData.country) addressParts.push(locationData.country);
            
            const address = addressParts.length > 0 
              ? addressParts.join(', ')
              : query;

            return {
              id: `search-${index}`,
              address: address,
              latitude: result.latitude,
              longitude: result.longitude,
              city: locationData.city || undefined,
              region: locationData.region || undefined,
              country: locationData.country || undefined,
            };
          } else {
            // Fallback to query if reverse geocode fails
            return {
              id: `search-${index}`,
              address: query,
              latitude: result.latitude,
              longitude: result.longitude,
              city: undefined,
              region: undefined,
              country: undefined,
            };
          }
        } catch (error) {
          // Fallback if reverse geocode fails
          return {
            id: `search-${index}`,
            address: query,
            latitude: result.latitude,
            longitude: result.longitude,
            city: undefined,
            region: undefined,
            country: undefined,
          };
        }
      });

      const locations = await Promise.all(locationPromises);
      setSearchResults(locations);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Failed to search locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (location: LocationItem) => {
    try {
      // Save selected location to AsyncStorage
      await AsyncStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(location));
      
      // Navigate back to home screen
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      handleLocationSelect(currentLocation);
    } else {
      Alert.alert('Error', 'Current location not available');
    }
  };

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <MaterialIcons name="location-on" size={24} color="#446CCF" />
      <View style={styles.locationItemContent}>
        <Text style={styles.locationItemAddress}>{item.address}</Text>
        {item.city && (
          <Text style={styles.locationItemDetails}>
            {[item.city, item.region, item.country].filter(Boolean).join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {isSearching && (
          <ActivityIndicator size="small" color="#446CCF" style={styles.searchLoader} />
        )}
      </View>

      <FlatList
        data={searchQuery.trim().length > 2 ? searchResults : currentLocation ? [currentLocation] : []}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          currentLocation && searchQuery.trim().length <= 2 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              <TouchableOpacity
                style={styles.useCurrentButton}
                onPress={handleUseCurrentLocation}
                activeOpacity={0.7}
              >
                <MaterialIcons name="my-location" size={20} color="#446CCF" />
                <Text style={styles.useCurrentText}>Use Current Location</Text>
              </TouchableOpacity>
            </View>
          ) : searchQuery.trim().length > 2 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoadingCurrent && searchQuery.trim().length > 2 && !isSearching ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="location-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No locations found</Text>
              <Text style={styles.emptySubtext}>Try searching for a city or address</Text>
            </View>
          ) : isLoadingCurrent ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#446CCF" />
              <Text style={styles.emptyText}>Loading current location...</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchLoader: {
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  useCurrentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  useCurrentText: {
    fontSize: 16,
    color: '#446CCF',
    marginLeft: 8,
    fontWeight: '500',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  locationItemAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  locationItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

