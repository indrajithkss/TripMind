import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Image, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { getMyTripPlans } from '@/services/plannerService';

const { width } = Dimensions.get('window');

interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

interface TripPlan {
  _id: string;
  location: {
    address: string;
    city?: string;
    country?: string;
  };
  travelDates: {
    fromDate: string;
    toDate: string;
  };
  tripPlan?: {
    overview?: string;
  };
  createdAt: string;
}

const SELECTED_LOCATION_KEY = '@selected_location';

const destinations = [
  { name: 'Taj Mahal', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh5AZi-tL7bieNpi_2MWNYE6G9hkoQQS4sRg&s' },
  { name: 'Goa Beaches', image: 'https://live.staticflickr.com/4152/5038176779_9535e90ea9_b.jpg' },
  { name: 'Kerala Backwaters', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0LZR0tdlphc9cwkzvYQZV-9jpXPNkRszmgg&s' },
  { name: 'Rajasthan', image: 'https://live.staticflickr.com/7004/6780623995_b9bcc4f29d_b.jpg' },
  { name: 'Sri Lanka', image: 'https://client-websites.blr1.cdn.digitaloceanspaces.com/frenzyholidays/wp-content/uploads/2025/02/20112347/Sigiriya-Rock-Fortress-srilanka.jpg' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Getting location...');
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    loadSelectedLocation();
    getCurrentLocation();
    loadTripPlans();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSelectedLocation();
      loadTripPlans();
    }, [])
  );

  const loadTripPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await getMyTripPlans();
      if (response.success && response.data) {
        // Ensure data is an array before calling slice
        const plansArray = Array.isArray(response.data) ? response.data : [response.data];
        setTripPlans(plansArray.slice(0, 3)); // Show only 3 most recent
      } else if (response.error) {
        // Silently handle errors - don't show alert for missing plans
        console.log('No trip plans found or error:', response.message);
        setTripPlans([]);
      }
    } catch (error) {
      console.error('Error loading trip plans:', error);
      setTripPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadSelectedLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_LOCATION_KEY);
      if (stored) {
        const location = JSON.parse(stored);
        setSelectedLocation(location);
        setAddress(location.address);
      } else {
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error('Error loading selected location:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      const stored = await AsyncStorage.getItem(SELECTED_LOCATION_KEY);
      if (stored) {
        setIsLoading(false);
        return;
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location.',
          [{ text: 'OK' }]
        );
        setAddress('Location permission denied');
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      setHasPermission(true);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
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
        
        if (!selectedLocation) {
          setAddress(fullAddress);
        }
      } else {
        if (!selectedLocation) {
          setAddress('Current Location');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (!selectedLocation) {
        Alert.alert('Error', 'Failed to get your location. Please try again.');
        setAddress('Unable to get location');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async () => {
    // Store the starting location before navigating
    const locationToStore = selectedLocation || {
      address: address,
      latitude: location?.coords.latitude || 0,
      longitude: location?.coords.longitude || 0,
    };
    
    // Store in AsyncStorage for later use
    try {
      await AsyncStorage.setItem('@starting_location', JSON.stringify(locationToStore));
    } catch (error) {
      console.error('Error storing starting location:', error);
    }
    
    router.push('/location-picker');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, Traveler! 👋</Text>
            <Text style={styles.subtitle}>Let's plan your next adventure</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/planner')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="event-note" size={28} color="#FFFFFF" />
              <Text style={styles.actionText}>Plan Trip</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={async () => {
              // Always fetch fresh data when button is clicked
              const response = await getMyTripPlans();
              if (response.success && response.data && response.data.length > 0) {
                router.push(`/(tabs)/trip-plan?id=${response.data[0]._id}`);
              } else {
                Alert.alert('No Plans', 'You haven\'t created any trip plans yet. Start planning your first trip!');
              }
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="flight" size={28} color="#FFFFFF" />
              <Text style={styles.actionText}>My Plans</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Location Selector */}
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={handleLocationSelect}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <View style={styles.locationContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#446CCF" />
            ) : (
              <MaterialIcons name="location-on" size={24} color="#446CCF" />
            )}
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>
                {selectedLocation ? 'Selected Location' : 'Current Location'}
              </Text>
              {isLoading ? (
                <Text style={styles.locationAddress}>Getting location...</Text>
              ) : (
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {address}
                </Text>
              )}
            </View>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={18} color="#666" />
        </TouchableOpacity>

        {/* Recent Trip Plans */}
        {tripPlans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Trip Plans</Text>
              <TouchableOpacity onPress={() => {
                router.push('/(tabs)/my-trips');
              }}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {loadingPlans ? (
              <ActivityIndicator size="small" color="#446CCF" style={styles.loader} />
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansContainer}
              >
                {tripPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan._id}
                    style={styles.planCard}
                    onPress={() => router.push(`/(tabs)/trip-plan?id=${plan._id}`)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.planCardContent}>
                      <MaterialIcons name="place" size={20} color="#446CCF" />
                      <Text style={styles.planLocation} numberOfLines={1}>
                        {plan.location?.city || plan.location?.address || 'Unknown'}
                      </Text>
                    </View>
                    <Text style={styles.planDates}>
                      {formatDate(plan.travelDates.fromDate)} - {formatDate(plan.travelDates.toDate)}
                    </Text>
                    {plan.tripPlan?.overview && (
                      <Text style={styles.planOverview} numberOfLines={2}>
                        {plan.tripPlan.overview}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{tripPlans.length}</Text>
            <Text style={styles.statLabel}>Trip Plans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{destinations.length}</Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.statLabel}>AI Powered</Text>
          </View>
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsContainer}
          >
            {destinations.map((destination, index) => (
              <TouchableOpacity
                key={index}
                style={styles.destinationCard}
                activeOpacity={0.9}
                onPress={() => {
                  router.push('/(tabs)/planner');
                }}
              >
                <Image 
                  source={{ uri: destination.image }} 
                  style={styles.destinationImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.destinationOverlay}
                >
                  <Text style={styles.destinationName}>{destination.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  locationSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.8,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: width * 0.75,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  planDates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  planOverview: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  loader: {
    marginVertical: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#446CCF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  destinationsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  destinationCard: {
    width: 180,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  destinationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
