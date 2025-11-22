import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { getMyTripPlans } from '@/services/plannerService';

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

export default function MyTripsScreen() {
  const insets = useSafeAreaInsets();
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTripPlans = async () => {
    try {
      const response = await getMyTripPlans();
      if (response.success && response.data) {
        setTripPlans(response.data);
      } else {
        setTripPlans([]);
      }
    } catch (error) {
      console.error('Error loading trip plans:', error);
      setTripPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTripPlans();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTripPlans();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTripPlans();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateRange = (fromDate: string, toDate: string) => {
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>My Trip Plans</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#446CCF" />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>My Trip Plans</Text>
      </View>

      {tripPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="flight-takeoff" size={64} color="#999" />
          <Text style={styles.emptyTitle}>No Trip Plans Yet</Text>
          <Text style={styles.emptyText}>
            Start planning your first adventure!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/planner')}
          >
            <Text style={styles.createButtonText}>Plan Your Trip</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        >
          <View style={styles.statsCard}>
            <Text style={styles.statsText}>
              {tripPlans.length} {tripPlans.length === 1 ? 'Trip Plan' : 'Trip Plans'}
            </Text>
          </View>

          {tripPlans.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={styles.planCard}
              onPress={() => router.push(`/(tabs)/trip-plan?id=${plan._id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <MaterialIcons name="place" size={24} color="#446CCF" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planLocation} numberOfLines={1}>
                    {plan.location?.city || plan.location?.address || 'Unknown Location'}
                  </Text>
                  <Text style={styles.planCountry} numberOfLines={1}>
                    {plan.location?.country || ''}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </View>

              <View style={styles.planDetails}>
                <View style={styles.planDetailRow}>
                  <MaterialIcons name="date-range" size={18} color="#666" />
                  <Text style={styles.planDetailText}>
                    {formatDateRange(plan.travelDates.fromDate, plan.travelDates.toDate)}
                  </Text>
                </View>
              </View>

              {plan.tripPlan?.overview && (
                <Text style={styles.planOverview} numberOfLines={2}>
                  {plan.tripPlan.overview}
                </Text>
              )}

              <View style={styles.planFooter}>
                <Text style={styles.planDate}>
                  Created {formatDate(plan.createdAt)}
                </Text>
                <View style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#446CCF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#446CCF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planCountry: {
    fontSize: 14,
    color: '#666',
  },
  planDetails: {
    marginBottom: 12,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  planOverview: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 12,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  planDate: {
    fontSize: 12,
    color: '#999',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#446CCF',
    fontWeight: '600',
    marginRight: 4,
  },
});

