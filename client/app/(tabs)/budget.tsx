import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { usePlanner } from '@/contexts/PlannerContext';

const BUDGET_OPTIONS = [
  { label: 'Under ₹10,000', value: 'under-10000' },
  { label: '₹10,000 - ₹25,000', value: '10000-25000' },
  { label: '₹25,000 - ₹50,000', value: '25000-50000' },
  { label: '₹50,000+', value: '50000-plus' },
];

const ACCOMMODATION_OPTIONS = [
  { label: 'Budget', value: 'budget' },
  { label: 'Standard', value: 'standard' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Resort/Villa', value: 'resort-villa' },
];

const TRAVEL_STYLES = [
  { id: 'adventure', label: 'Adventure' },
  { id: 'culture', label: 'Culture' },
  { id: 'nature', label: 'Nature' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'food-dining', label: 'Food and Dining' },
  { id: 'shopping', label: 'Shopping' },
];

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { plannerData, updatePlannerData, savePlannerData } = usePlanner();
  
  const [selectedBudget, setSelectedBudget] = useState<string>(plannerData.budgetRange || '');
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>(plannerData.travelStyles || []);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>(plannerData.accommodationPreference || '');
  const [showAccommodationDropdown, setShowAccommodationDropdown] = useState(false);

  // Load data from context on mount
  useEffect(() => {
    setSelectedBudget(plannerData.budgetRange || '');
    setSelectedTravelStyles(plannerData.travelStyles || []);
    setSelectedAccommodation(plannerData.accommodationPreference || '');
  }, [plannerData]);

  // Validation function
  const isFormValid = () => {
    return !!(
      selectedBudget &&
      selectedAccommodation
    );
  };

  const toggleTravelStyle = (styleId: string) => {
    const newStyles = selectedTravelStyles.includes(styleId)
      ? selectedTravelStyles.filter((id) => id !== styleId)
      : [...selectedTravelStyles, styleId];
    setSelectedTravelStyles(newStyles);
    updatePlannerData({ travelStyles: newStyles });
  };

  const getBudgetLabel = (value: string) => {
    return BUDGET_OPTIONS.find(opt => opt.value === value)?.label || 'Select Budget Range';
  };

  const getAccommodationLabel = (value: string) => {
    return ACCOMMODATION_OPTIONS.find(opt => opt.value === value)?.label || 'Select Accommodation';
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
          <Text style={styles.title}>What is your budget?</Text>
        </View>

        {/* Budget Range Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget Range</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowBudgetDropdown(!showBudgetDropdown);
              setShowAccommodationDropdown(false);
            }}
          >
            <Text style={[
              styles.dropdownValue,
              !selectedBudget && styles.dropdownPlaceholder
            ]}>
              {getBudgetLabel(selectedBudget)}
            </Text>
            <MaterialIcons 
              name={showBudgetDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>

          {showBudgetDropdown && (
            <View style={styles.dropdownOptions}>
              {BUDGET_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    selectedBudget === option.value && styles.dropdownOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedBudget(option.value);
                    setShowBudgetDropdown(false);
                    updatePlannerData({ budgetRange: option.value });
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    selectedBudget === option.value && styles.dropdownOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {selectedBudget === option.value && (
                    <MaterialIcons name="check" size={20} color="#446CCF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Travel Style */}
        <View style={styles.section}>
          <Text style={styles.label}>Travel Style (select all that apply)</Text>
          <View style={styles.travelStyleGrid}>
            {TRAVEL_STYLES.map((style) => {
              const isSelected = selectedTravelStyles.includes(style.id);
              return (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.travelStyleBlock,
                    isSelected && styles.travelStyleBlockSelected
                  ]}
                  onPress={() => toggleTravelStyle(style.id)}
                >
                  <Text style={[
                    styles.travelStyleText,
                    isSelected && styles.travelStyleTextSelected
                  ]}>
                    {style.label}
                  </Text>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={20} color="#446CCF" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Accommodation Preference */}
        <View style={styles.section}>
          <Text style={styles.label}>Accommodation Preference</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowAccommodationDropdown(!showAccommodationDropdown);
              setShowBudgetDropdown(false);
            }}
          >
            <Text style={[
              styles.dropdownValue,
              !selectedAccommodation && styles.dropdownPlaceholder
            ]}>
              {getAccommodationLabel(selectedAccommodation)}
            </Text>
            <MaterialIcons 
              name={showAccommodationDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>

          {showAccommodationDropdown && (
            <View style={styles.dropdownOptions}>
              {ACCOMMODATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    selectedAccommodation === option.value && styles.dropdownOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedAccommodation(option.value);
                    setShowAccommodationDropdown(false);
                    updatePlannerData({ accommodationPreference: option.value });
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    selectedAccommodation === option.value && styles.dropdownOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {selectedAccommodation === option.value && (
                    <MaterialIcons name="check" size={20} color="#446CCF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
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
              !isFormValid() && styles.continueButtonDisabled
            ]}
            onPress={async () => {
              console.log('Continue button pressed');
              console.log('Form valid:', isFormValid());
              console.log('Selected budget:', selectedBudget);
              console.log('Selected accommodation:', selectedAccommodation);
              
              if (isFormValid()) {
                try {
                  // Save all data before navigating
                  updatePlannerData({
                    budgetRange: selectedBudget,
                    travelStyles: selectedTravelStyles,
                    accommodationPreference: selectedAccommodation,
                  });
                  await savePlannerData();
                  console.log('Data saved, navigating to review...');
                  // Navigate to review screen
                  router.push('/(tabs)/review');
                } catch (error) {
                  console.error('Error navigating to review:', error);
                }
              } else {
                console.log('Form validation failed:', {
                  selectedBudget,
                  selectedAccommodation,
                  isValid: isFormValid(),
                });
              }
            }}
            disabled={!isFormValid()}
          >
            <Text style={[
              styles.continueButtonText,
              !isFormValid() && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
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
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#999',
    fontWeight: '400',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionSelected: {
    backgroundColor: '#F5F7FF',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptionTextSelected: {
    color: '#446CCF',
    fontWeight: '600',
  },
  travelStyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  travelStyleBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  travelStyleBlockSelected: {
    borderColor: '#446CCF',
    backgroundColor: '#F5F7FF',
  },
  travelStyleText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  travelStyleTextSelected: {
    color: '#446CCF',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
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
  continueButtonTextDisabled: {
    color: '#666666',
  },
});

