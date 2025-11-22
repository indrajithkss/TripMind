import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { usePlanner } from '@/contexts/PlannerContext';
import { createTripPlan } from '@/services/plannerService';
import LoadingScreen from '@/components/LoadingScreen';

const PERSON_LABELS: { [key: string]: string } = {
  'single': 'Single',
  '2': '2 Person',
  '3-4': '3-4 Person',
  'more': 'More than 4 Person',
};

const BUDGET_LABELS: { [key: string]: string } = {
  'under-10000': 'Under ₹10,000',
  '10000-25000': '₹10,000 - ₹25,000',
  '25000-50000': '₹25,000 - ₹50,000',
  '50000-plus': '₹50,000+',
};

const ACCOMMODATION_LABELS: { [key: string]: string } = {
  'budget': 'Budget',
  'standard': 'Standard',
  'luxury': 'Luxury',
  'resort-villa': 'Resort/Villa',
};

const TRAVEL_STYLE_LABELS: { [key: string]: string } = {
  'adventure': 'Adventure',
  'culture': 'Culture',
  'nature': 'Nature',
  'relaxation': 'Relaxation',
  'food-dining': 'Food and Dining',
  'shopping': 'Shopping',
};

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { plannerData, resetPlannerData } = usePlanner();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Show loading screen when submitting
  if (isSubmitting) {
    return <LoadingScreen message="AI is setting your plan, chill out..." />;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not selected';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPersonLabel = (value: string) => {
    return PERSON_LABELS[value] || value;
  };

  const getBudgetLabel = (value: string) => {
    return BUDGET_LABELS[value] || value;
  };

  const getAccommodationLabel = (value: string) => {
    return ACCOMMODATION_LABELS[value] || value;
  };

  const getTravelStyleLabels = (styles: string[]) => {
    if (!styles || styles.length === 0) return 'None selected';
    return styles.map(style => TRAVEL_STYLE_LABELS[style] || style).join(', ');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingHorizontal: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Review your preferences</Text>
        </View>

        {/* Review Items */}
        <View style={styles.reviewSection}>
          {/* Destination */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <MaterialIcons name="location-on" size={24} color="#446CCF" />
              <Text style={styles.reviewItemLabel}>Destination</Text>
            </View>
            <Text style={styles.reviewItemValue}>
              {plannerData.location?.address || 'Not selected'}
            </Text>
          </View>

          {/* Travel Dates */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <MaterialIcons name="calendar-today" size={24} color="#446CCF" />
              <Text style={styles.reviewItemLabel}>Travel Dates</Text>
            </View>
            <Text style={styles.reviewItemValue}>
              {formatDate(plannerData.fromDate)} - {formatDate(plannerData.toDate)}
            </Text>
          </View>

          {/* Group Size */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <MaterialIcons name="people" size={24} color="#446CCF" />
              <Text style={styles.reviewItemLabel}>Group Size</Text>
            </View>
            <Text style={styles.reviewItemValue}>
              {getPersonLabel(plannerData.numberOfPersons || '')}
            </Text>
          </View>

          {/* Budget Range */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <MaterialIcons name="account-balance-wallet" size={24} color="#446CCF" />
              <Text style={styles.reviewItemLabel}>Budget Range</Text>
            </View>
            <Text style={styles.reviewItemValue}>
              {getBudgetLabel(plannerData.budgetRange || '')}
            </Text>
          </View>

          {/* Accommodation */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <MaterialIcons name="hotel" size={24} color="#446CCF" />
              <Text style={styles.reviewItemLabel}>Accommodation</Text>
            </View>
            <Text style={styles.reviewItemValue}>
              {getAccommodationLabel(plannerData.accommodationPreference || '')}
            </Text>
          </View>

          {/* Interests */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <MaterialIcons name="favorite" size={24} color="#446CCF" />
              <Text style={styles.reviewItemLabel}>Interests</Text>
            </View>
            <Text style={styles.reviewItemValue}>
              {getTravelStyleLabels(plannerData.travelStyles || [])}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.backButtonAction}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isSubmitting && styles.continueButtonDisabled
            ]}
            onPress={async () => {
              if (isSubmitting) return;

              // Prepare data for API
              const apiData = {
                startingLocation: plannerData.startingLocation ? {
                  address: plannerData.startingLocation.address || '',
                  latitude: plannerData.startingLocation.latitude || 0,
                  longitude: plannerData.startingLocation.longitude || 0,
                  city: plannerData.startingLocation.city || undefined,
                  region: plannerData.startingLocation.region || undefined,
                  country: plannerData.startingLocation.country || undefined,
                } : undefined,
                location: {
                  address: plannerData.location?.address || '',
                  latitude: plannerData.location?.latitude || 0,
                  longitude: plannerData.location?.longitude || 0,
                  city: plannerData.location?.city || undefined,
                  region: plannerData.location?.region || undefined,
                  country: plannerData.location?.country || undefined,
                },
                travelDates: {
                  fromDate: plannerData.fromDate ? plannerData.fromDate.toISOString() : '',
                  toDate: plannerData.toDate ? plannerData.toDate.toISOString() : '',
                },
                groupSize: plannerData.numberOfPersons || '',
                budgetRange: plannerData.budgetRange || '',
                accommodationPreference: plannerData.accommodationPreference || '',
                travelStyles: plannerData.travelStyles || [],
              };
              setIsSubmitting(true);

              try {
                console.log('Submitting trip plan...');
                const response = await createTripPlan(apiData);
                console.log('Trip plan response:', response);

                if (response.success) {
                  // Clear planner data from local cache (keeps sign-in token intact)
                  resetPlannerData();
                  console.log('Planner data cleared after successful trip plan creation');
                  
                  // Navigate to trip plan screen using the ID from the API response
                  // This ensures we fetch the correct, saved trip plan from the database
                  if (response.data?.id) {
                    setIsSubmitting(false); // Reset before navigation
                    router.push(`/(tabs)/trip-plan?id=${response.data.id}`);
                  } else if (response.tripPlan && response.aiSuccess) {
                    // Fallback: if no ID but we have trip plan data, use params (backward compatibility)
                    const location = plannerData.location?.address || 'Not specified';
                    const fromDate = plannerData.fromDate ? plannerData.fromDate.toLocaleDateString() : '';
                    const toDate = plannerData.toDate ? plannerData.toDate.toLocaleDateString() : '';
                    const dates = fromDate && toDate ? `${fromDate} - ${toDate}` : '';
                    
                    setIsSubmitting(false);
                    router.push({
                      pathname: '/(tabs)/trip-plan',
                      params: {
                        tripPlan: JSON.stringify(response.tripPlan),
                        location: location,
                        dates: dates,
                        budget: plannerData.budgetRange || '',
                      },
                    });
                  } else {
                    Alert.alert(
                      'Success',
                      response.aiSuccess 
                        ? 'Your trip plan has been generated successfully!'
                        : 'Your trip plan has been submitted successfully!',
                      [{ text: 'OK' }]
                    );
                    setIsSubmitting(false);
                  }
                } else {
                  console.error('Failed to submit trip plan:', response.error);
                  
                  // If authentication error, suggest signing in
                  if (response.error === 'Authentication required' || response.message?.includes('sign in')) {
                    Alert.alert(
                      'Authentication Required',
                      'Please sign in to create a trip plan. Would you like to sign in now?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Sign In', 
                          onPress: () => router.push('/sign-in')
                        }
                      ]
                    );
                  } else {
                    Alert.alert(
                      'Error',
                      response.message || 'Failed to submit trip plan. Please try again.',
                      [{ text: 'OK' }]
                    );
                  }
                  setIsSubmitting(false);
                }
              } catch (error) {
                console.error('Error submitting trip plan:', error);
                Alert.alert(
                  'Error',
                  'An error occurred while submitting your trip plan. Please try again.',
                  [{ text: 'OK' }]
                );
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  reviewSection: {
    marginBottom: 30,
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
  },
  reviewItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 36,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  backButtonAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#313178',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
});

