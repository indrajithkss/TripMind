import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { getTripPlanById } from '@/services/plannerService';

interface Accommodation {
  name?: string;
  location?: string;
  type?: string;
  description?: string;
  estimatedPrice?: string;
}

interface TripPlanData {
  overview?: string;
  itinerary?: Array<{
    day: number;
    date: string;
    weather?: string;
    activities: string[];
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    accommodation?: string;
  }>;
  recommendations?: {
    accommodations?: Accommodation[] | string[]; // Support both old (string[]) and new (Accommodation[]) format
    restaurants?: string[];
    activities?: string[];
  };
  budgetBreakdown?: {
    flights?: string;
    accommodation?: string;
    food?: string;
    activities?: string;
    transportation?: string;
    total?: string;
  };
  budgetFeasible?: boolean;
  expectedBudget?: string | null;
  tips?: string[];
  weatherTips?: string[];
}

export default function TripPlanScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tripPlan?: string; id?: string; location?: string; dates?: string; budget?: string }>();
  
  const [tripPlan, setTripPlan] = useState<TripPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<string>(params.location || '');
  const [dates, setDates] = useState<string>(params.dates || '');
  const [startingLocation, setStartingLocation] = useState<string>('');

  useEffect(() => {
    const loadTripPlan = async () => {
      setIsLoading(true);
      
      // If ID is provided, fetch from API
      if (params.id) {
        try {
          const response = await getTripPlanById(params.id);
          if (response.success && response.tripPlan) {
            console.log('Trip plan loaded:', {
              budgetFeasible: response.tripPlan.budgetFeasible,
              expectedBudget: response.tripPlan.expectedBudget,
              hasBudgetBreakdown: !!response.tripPlan.budgetBreakdown
            });
            setTripPlan(response.tripPlan);
            if (response.data?.location?.address) {
              setLocation(response.data.location.address);
            }
            if (response.data?.startingLocation?.address) {
              setStartingLocation(response.data.startingLocation.address);
            }
            if (response.data?.travelDates) {
              const fromDate = new Date(response.data.travelDates.fromDate).toLocaleDateString();
              const toDate = new Date(response.data.travelDates.toDate).toLocaleDateString();
              setDates(`${fromDate} - ${toDate}`);
            }
          }
        } catch (error) {
          console.error('Error loading trip plan:', error);
        }
      } 
      // Otherwise, parse from params (for backward compatibility)
      else if (params.tripPlan) {
        try {
          const parsed = JSON.parse(params.tripPlan);
          console.log('Trip plan parsed from params:', {
            budgetFeasible: parsed.budgetFeasible,
            expectedBudget: parsed.expectedBudget,
            hasBudgetBreakdown: !!parsed.budgetBreakdown
          });
          setTripPlan(parsed);
        } catch (error) {
          console.error('Error parsing trip plan:', error);
        }
      }
      
      setIsLoading(false);
    };

    loadTripPlan();
  }, [params.id, params.tripPlan]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';
      
      // Check if date is already in a readable format (e.g., "Saturday, November 15, 2025")
      const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const isAlreadyFormatted = weekdayNames.some(day => dateString.includes(day));
      
      if (isAlreadyFormatted) {
        // Try to parse it - modern browsers can parse this format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          // Successfully parsed, format it nicely
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        // If parsing fails, extract and return just the date part (without weekday)
        const parts = dateString.split(',');
        if (parts.length >= 2) {
          return parts.slice(1).join(',').trim();
        }
        // Fallback: return as-is
        return dateString;
      }
      
      // Try to parse as ISO string or standard date format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Invalid date, return original string
        return dateString;
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      // If all parsing fails, return the original string
      console.warn('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#446CCF" />
          <Text style={styles.loadingText}>Loading trip plan...</Text>
        </View>
      </ThemedView>
    );
  }

  if (!tripPlan) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Trip Plan</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#999" />
          <Text style={styles.errorText}>No trip plan data available</Text>
          <TouchableOpacity
            style={styles.backButtonAction}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.title}>Trip Plan</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Location & Dates */}
        <View style={styles.infoCard}>
          {startingLocation && (
            <View style={styles.infoRow}>
              <MaterialIcons name="flight-takeoff" size={20} color="#446CCF" />
              <Text style={styles.infoLabel}>Starting From:</Text>
              <Text style={styles.infoValue}>{startingLocation}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#446CCF" />
            <Text style={styles.infoLabel}>Destination:</Text>
            <Text style={styles.infoValue}>{location || 'Not specified'}</Text>
          </View>
          {dates && (
            <View style={styles.infoRow}>
              <MaterialIcons name="date-range" size={20} color="#446CCF" />
              <Text style={styles.infoLabel}>Dates:</Text>
              <Text style={styles.infoValue}>{dates}</Text>
            </View>
          )}
        </View>

        {/* Budget Feasibility Warning */}
        {(tripPlan.budgetFeasible === false || (tripPlan.expectedBudget && tripPlan.budgetFeasible !== true)) && (
          <View style={styles.section}>
            <View style={styles.budgetWarningCard}>
              <MaterialIcons name="warning" size={24} color="#FF6B6B" />
              <View style={styles.budgetWarningContent}>
                <Text style={styles.budgetWarningTitle}>Budget Not Feasible</Text>
                <Text style={styles.budgetWarningText}>
                  The requested budget is not sufficient for this destination with your selected preferences.
                </Text>
                {tripPlan.expectedBudget && (
                  <Text style={styles.expectedBudgetText}>
                    Expected Budget: <Text style={styles.expectedBudgetValue}>{tripPlan.expectedBudget}</Text>
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Budget Breakdown */}
        {tripPlan.budgetBreakdown && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Breakdown</Text>
            <View style={styles.budgetCard}>
              {tripPlan.budgetBreakdown.flights && (
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Flights:</Text>
                  <View style={styles.budgetValueContainer}>
                    <Text style={styles.budgetValue}>{tripPlan.budgetBreakdown.flights}</Text>
                  </View>
                </View>
              )}
              {tripPlan.budgetBreakdown.accommodation && (
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Accommodation:</Text>
                  <View style={styles.budgetValueContainer}>
                    <Text style={styles.budgetValue}>{tripPlan.budgetBreakdown.accommodation}</Text>
                  </View>
                </View>
              )}
              {tripPlan.budgetBreakdown.food && (
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Food:</Text>
                  <View style={styles.budgetValueContainer}>
                    <Text style={styles.budgetValue}>{tripPlan.budgetBreakdown.food}</Text>
                  </View>
                </View>
              )}
              {tripPlan.budgetBreakdown.activities && (
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Activities:</Text>
                  <View style={styles.budgetValueContainer}>
                    <Text style={styles.budgetValue}>
                      {tripPlan.budgetBreakdown.activities}
                    </Text>
                  </View>
                </View>
              )}
              {tripPlan.budgetBreakdown.transportation && (
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Transportation:</Text>
                  <View style={styles.budgetValueContainer}>
                    <Text style={styles.budgetValue}>
                      {tripPlan.budgetBreakdown.transportation}
                    </Text>
                  </View>
                </View>
              )}
              {tripPlan.budgetBreakdown.total && (
                <View style={[styles.budgetRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <View style={styles.budgetValueContainer}>
                    <Text style={styles.totalValue}>{tripPlan.budgetBreakdown.total}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Overview */}
        {tripPlan.overview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overviewText}>{tripPlan.overview}</Text>
          </View>
        )}

        {/* Day-wise Itinerary */}
        {tripPlan.itinerary && tripPlan.itinerary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Day-wise Itinerary</Text>
            {tripPlan.itinerary.map((day, index) => (
              <View key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayHeaderLeft}>
                    <Text style={styles.dayNumber}>Day {day.day}</Text>
                    {day.date && (
                      <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                    )}
                  </View>
                </View>
                {day.weather && (
                  <View style={styles.weatherBadgeContainer}>
                    <View style={styles.weatherBadge}>
                      <MaterialIcons name="wb-sunny" size={16} color="#FFA500" />
                      <Text style={styles.weatherText} numberOfLines={2}>
                        {day.weather}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <View style={styles.daySection}>
                    <Text style={styles.daySectionTitle}>Activities:</Text>
                    {day.activities.map((activity, actIndex) => (
                      <View key={actIndex} style={styles.activityItem}>
                        <MaterialIcons name="check-circle" size={16} color="#446CCF" />
                        <Text style={styles.activityText}>{activity}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Meals */}
                {day.meals && (
                  <View style={styles.daySection}>
                    <Text style={styles.daySectionTitle}>Meals:</Text>
                    {day.meals.breakfast && (
                      <View style={styles.mealItem}>
                        <Text style={styles.mealLabel}>Breakfast:</Text>
                        <Text style={styles.mealValue}>{day.meals.breakfast}</Text>
                      </View>
                    )}
                    {day.meals.lunch && (
                      <View style={styles.mealItem}>
                        <Text style={styles.mealLabel}>Lunch:</Text>
                        <Text style={styles.mealValue}>{day.meals.lunch}</Text>
                      </View>
                    )}
                    {day.meals.dinner && (
                      <View style={styles.mealItem}>
                        <Text style={styles.mealLabel}>Dinner:</Text>
                        <Text style={styles.mealValue}>{day.meals.dinner}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Accommodation */}
                {day.accommodation && (
                  <View style={styles.daySection}>
                    <Text style={styles.daySectionTitle}>Accommodation:</Text>
                    <Text style={styles.accommodationText}>{day.accommodation}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Hotel Recommendations */}
        {tripPlan.recommendations?.accommodations && tripPlan.recommendations.accommodations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Hotels & Stays</Text>
            {tripPlan.recommendations.accommodations.map((accommodation, index) => {
              // Handle both old format (string) and new format (object)
              if (typeof accommodation === 'string') {
                return (
                  <View key={index} style={styles.hotelCard}>
                    <View style={styles.hotelHeader}>
                      <MaterialIcons name="hotel" size={24} color="#446CCF" />
                      <Text style={styles.hotelName}>{accommodation}</Text>
                    </View>
                  </View>
                );
              } else {
                return (
                  <View key={index} style={styles.hotelCard}>
                    <View style={styles.hotelHeader}>
                      <MaterialIcons name="hotel" size={24} color="#446CCF" />
                      <View style={styles.hotelInfo}>
                        <Text style={styles.hotelName}>{accommodation.name || 'Hotel'}</Text>
                        {accommodation.location && (
                          <View style={styles.hotelLocation}>
                            <MaterialIcons name="location-on" size={14} color="#666" />
                            <Text style={styles.hotelLocationText}>{accommodation.location}</Text>
                          </View>
                        )}
                        {accommodation.type && (
                          <View style={styles.hotelType}>
                            <Text style={styles.hotelTypeText}>{accommodation.type}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {accommodation.description && (
                      <Text style={styles.hotelDescription}>{accommodation.description}</Text>
                    )}
                    {accommodation.estimatedPrice && (
                      <View style={styles.hotelPrice}>
                        <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
                        <Text style={styles.hotelPriceText}>{accommodation.estimatedPrice}</Text>
                      </View>
                    )}
                  </View>
                );
              }
            })}
          </View>
        )}

        {/* Weather Tips */}
        {tripPlan.weatherTips && tripPlan.weatherTips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weather Tips</Text>
            <View style={styles.tipsCard}>
              {tripPlan.weatherTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <MaterialIcons name="wb-cloudy" size={20} color="#446CCF" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        {tripPlan.tips && tripPlan.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips & Recommendations</Text>
            <View style={styles.tipsCard}>
              {tripPlan.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <MaterialIcons name="lightbulb" size={20} color="#FFA500" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  budgetWarningCard: {
    backgroundColor: '#2A1F1F',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  budgetWarningContent: {
    flex: 1,
    marginLeft: 12,
  },
  budgetWarningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  budgetWarningText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  expectedBudgetText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expectedBudgetValue: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  budgetCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F4A',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#999',
    flexShrink: 0,
    marginRight: 12,
    minWidth: 100,
  },
  budgetValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  budgetValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#446CCF',
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flexShrink: 0,
    marginRight: 12,
    minWidth: 100,
  },
  totalValue: {
    fontSize: 18,
    color: '#446CCF',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  overviewText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
  },
  dayCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F4A',
  },
  dayHeaderLeft: {
    flex: 1,
  },
  weatherBadgeContainer: {
    marginBottom: 16,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2A2F4A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  weatherText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#446CCF',
  },
  dayDate: {
    fontSize: 12,
    color: '#999',
  },
  daySection: {
    marginBottom: 16,
  },
  daySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  mealItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  mealLabel: {
    fontSize: 14,
    color: '#999',
    width: 80,
  },
  mealValue: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  accommodationText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  backButtonAction: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#446CCF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  hotelCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  hotelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hotelLocationText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  hotelType: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2F4A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  hotelTypeText: {
    fontSize: 11,
    color: '#446CCF',
    fontWeight: '600',
  },
  hotelDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginTop: 8,
  },
  hotelPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  hotelPriceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
});

