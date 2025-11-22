import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import * as Location from 'expo-location';

import { ThemedView } from '@/components/themed-view';
import { usePlanner, LocationData } from '@/contexts/PlannerContext';
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

const PERSON_OPTIONS = [
  { label: 'Single', value: 'single' },
  { label: '2 Person', value: '2' },
  { label: '3-4 Person', value: '3-4' },
  { label: 'More than 4 Person', value: 'more' },
];

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const { plannerData, updatePlannerData } = usePlanner();
  
  const [locationQuery, setLocationQuery] = useState(plannerData.location?.address || '');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    plannerData.location ? {
      id: 'selected',
      ...plannerData.location,
    } : null
  );
  const [locationResults, setLocationResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationResults, setShowLocationResults] = useState(false);
  
  const [fromDate, setFromDate] = useState<Date>(plannerData.fromDate || new Date());
  const [toDate, setToDate] = useState<Date>(plannerData.toDate || new Date(Date.now() + 86400000));
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  const [selectedPersons, setSelectedPersons] = useState<string>(plannerData.numberOfPersons || '');
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  
  // Date picker modal state
  const [tempFromDate, setTempFromDate] = useState<Date>(fromDate);
  const [tempToDate, setTempToDate] = useState<Date>(toDate);
  const [fromMonth, setFromMonth] = useState(fromDate.getMonth());
  const [fromYear, setFromYear] = useState(fromDate.getFullYear());
  const [toMonth, setToMonth] = useState(toDate.getMonth());
  const [toYear, setToYear] = useState(toDate.getFullYear());

  // Validation function
  const isFormValid = () => {
    return !!(
      selectedLocation &&
      fromDate &&
      toDate &&
      toDate > fromDate &&
      selectedPersons && selectedPersons.trim() !== '' // Ensure it's not empty string
    );
  };

  // Load starting location on mount
  useEffect(() => {
    const loadStartingLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem('@starting_location');
        if (stored) {
          const startingLoc = JSON.parse(stored);
          updatePlannerData({ startingLocation: startingLoc });
        }
      } catch (error) {
        console.error('Error loading starting location:', error);
      }
    };
    loadStartingLocation();
  }, []);

  useEffect(() => {
    if (locationQuery.trim().length > 2) {
      const debounceTimer = setTimeout(() => {
        searchLocations(locationQuery);
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setLocationResults([]);
      setShowLocationResults(false);
    }
  }, [locationQuery]);

  useEffect(() => {
    if (showFromDatePicker) {
      setTempFromDate(fromDate);
      setFromMonth(fromDate.getMonth());
      setFromYear(fromDate.getFullYear());
    }
  }, [showFromDatePicker]);

  useEffect(() => {
    if (showToDatePicker) {
      setTempToDate(toDate);
      setToMonth(toDate.getMonth());
      setToYear(toDate.getFullYear());
    }
  }, [showToDatePicker]);

  // Sync local state with plannerData when it changes (especially after reset)
  useFocusEffect(
    useCallback(() => {
      // Reset local state when plannerData is empty/reset
      if (!plannerData.location && !plannerData.fromDate && !plannerData.toDate && !plannerData.numberOfPersons) {
        setLocationQuery('');
        setSelectedLocation(null);
        setFromDate(new Date());
        setToDate(new Date(Date.now() + 86400000));
        setSelectedPersons(''); // Empty string to show placeholder
        setLocationResults([]);
        setShowLocationResults(false);
      } else {
        // Sync with plannerData if it exists
        if (plannerData.location) {
          setLocationQuery(plannerData.location.address);
          setSelectedLocation({
            id: 'selected',
            ...plannerData.location,
          });
        } else {
          setLocationQuery('');
          setSelectedLocation(null);
        }
        if (plannerData.fromDate) {
          setFromDate(plannerData.fromDate);
        } else {
          setFromDate(new Date());
        }
        if (plannerData.toDate) {
          setToDate(plannerData.toDate);
        } else {
          setToDate(new Date(Date.now() + 86400000));
        }
        if (plannerData.numberOfPersons) {
          setSelectedPersons(plannerData.numberOfPersons);
        } else {
          setSelectedPersons(''); // Reset to empty if cleared
        }
      }
    }, [plannerData])
  );

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setLocationResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      const geocodeResults = await Location.geocodeAsync(query);

      const locationPromises = geocodeResults.map(async (result, index) => {
        try {
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
            
            const fullAddress = addressParts.length > 0 
              ? addressParts.join(', ')
              : `${result.latitude}, ${result.longitude}`;

            return {
              id: `location-${index}`,
              address: fullAddress,
              latitude: result.latitude,
              longitude: result.longitude,
              city: locationData.city || undefined,
              region: locationData.region || undefined,
              country: locationData.country || undefined,
            };
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          return null;
        }
      });

      const locations = (await Promise.all(locationPromises)).filter(
        (loc) => loc !== null && loc !== undefined
      ) as LocationItem[];

      setLocationResults(locations);
      setShowLocationResults(locations.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: LocationItem) => {
    setSelectedLocation(location);
    setLocationQuery(location.address);
    setShowLocationResults(false);
    
    // Update context
    const locationData: LocationData = {
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
      region: location.region,
      country: location.country,
    };
    updatePlannerData({ location: locationData });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleFromDateChange = (selectedDate: Date) => {
    setFromDate(selectedDate);
    setShowFromDatePicker(false);
    // Ensure toDate is after fromDate
    if (selectedDate >= toDate) {
      const newToDate = new Date(selectedDate.getTime() + 86400000);
      setToDate(newToDate);
      updatePlannerData({ fromDate: selectedDate, toDate: newToDate });
    } else {
      updatePlannerData({ fromDate: selectedDate });
    }
  };

  const handleToDateChange = (selectedDate: Date) => {
    if (selectedDate > fromDate) {
      setToDate(selectedDate);
      setShowToDatePicker(false);
      updatePlannerData({ toDate: selectedDate });
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderDatePickerModal = (isFrom: boolean) => {
    const currentDate = isFrom ? fromDate : toDate;
    const tempDate = isFrom ? tempFromDate : tempToDate;
    const setTempDate = isFrom ? setTempFromDate : setTempToDate;
    const currentMonth = isFrom ? fromMonth : toMonth;
    const setCurrentMonth = isFrom ? setFromMonth : setToMonth;
    const currentYear = isFrom ? fromYear : toYear;
    const setCurrentYear = isFrom ? setFromYear : setToYear;

    const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth));
    const firstDay = getFirstDayOfMonth(new Date(currentYear, currentMonth));
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const handleDateSelect = (day: number) => {
      const selected = new Date(currentYear, currentMonth, day);
      setTempDate(selected);
    };

    const handleConfirm = () => {
      if (isFrom) {
        handleFromDateChange(tempDate);
      } else {
        handleToDateChange(tempDate);
      }
    };

    const changeMonth = (direction: number) => {
      let newMonth = currentMonth + direction;
      let newYear = currentYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    };

    const isDateSelected = (day: number) => {
      const checkDate = new Date(currentYear, currentMonth, day);
      return checkDate.toDateString() === tempDate.toDateString();
    };

    const isDateDisabled = (day: number) => {
      const checkDate = new Date(currentYear, currentMonth, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isFrom) {
        return checkDate < today;
      } else {
        return checkDate <= fromDate;
      }
    };

    return (
      <Modal
        visible={isFrom ? showFromDatePicker : showToDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (isFrom) setShowFromDatePicker(false);
          else setShowToDatePicker(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <MaterialIcons name="chevron-left" size={24} color="#446CCF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <MaterialIcons name="chevron-right" size={24} color="#446CCF" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} style={styles.calendarDayHeader}>
                  <Text style={styles.calendarDayHeaderText}>{day}</Text>
                </View>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calendarDay} />
              ))}
              {days.map((day) => {
                const disabled = isDateDisabled(day);
                const selected = isDateSelected(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.calendarDay,
                      selected && styles.calendarDaySelected,
                      disabled && styles.calendarDayDisabled,
                    ]}
                    onPress={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        selected && styles.calendarDayTextSelected,
                        disabled && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  if (isFrom) setShowFromDatePicker(false);
                  else setShowToDatePicker(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleConfirm}
              >
                <Text style={styles.modalButtonConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getPersonLabel = (value: string) => {
    if (!value) return 'Select number of persons';
    return PERSON_OPTIONS.find(opt => opt.value === value)?.label || 'Select number of persons';
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingHorizontal: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Where do you want to go?</Text>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={24} color="#446CCF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            placeholderTextColor="#999"
            value={locationQuery}
            onChangeText={(text) => {
              setLocationQuery(text);
              setSelectedLocation(null);
            }}
            onFocus={() => {
              if (locationResults.length > 0) {
                setShowLocationResults(true);
              }
            }}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#446CCF" style={styles.searchIndicator} />
          )}
        </View>

        {/* Location Results */}
        {showLocationResults && locationResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {locationResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultItem}
                onPress={() => handleLocationSelect(item)}
              >
                <MaterialIcons name="place" size={20} color="#666" />
                <Text style={styles.resultText}>{item.address}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowFromDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#446CCF" />
            <View style={styles.dateInputContent}>
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>{formatDate(fromDate)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowToDatePicker(true)}
          >
            <MaterialIcons name="event" size={20} color="#446CCF" />
            <View style={styles.dateInputContent}>
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>{formatDate(toDate)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Person Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowPersonDropdown(!showPersonDropdown)}
        >
          <MaterialIcons name="people" size={20} color="#446CCF" />
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownLabel}>Number of Persons</Text>
            <Text style={styles.dropdownValue}>{getPersonLabel(selectedPersons)}</Text>
          </View>
          <MaterialIcons 
            name={showPersonDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>

        {/* Person Dropdown Options */}
        {showPersonDropdown && (
          <View style={styles.dropdownOptions}>
            {PERSON_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  selectedPersons === option.value && styles.dropdownOptionSelected
                ]}
                onPress={() => {
                  setSelectedPersons(option.value);
                  setShowPersonDropdown(false);
                  updatePlannerData({ numberOfPersons: option.value });
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  selectedPersons === option.value && styles.dropdownOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {selectedPersons === option.value && (
                  <MaterialIcons name="check" size={20} color="#446CCF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date Pickers */}
        {renderDatePickerModal(true)}
        {renderDatePickerModal(false)}

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid() && styles.continueButtonDisabled
          ]}
          onPress={() => {
            if (isFormValid()) {
              // Ensure all data is saved before navigating
              updatePlannerData({
                location: selectedLocation ? {
                  address: selectedLocation.address,
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  city: selectedLocation.city,
                  region: selectedLocation.region,
                  country: selectedLocation.country,
                } : null,
                fromDate,
                toDate,
                numberOfPersons: selectedPersons,
              });
              router.push('/(tabs)/budget');
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
  title: {
    marginTop: 30,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchIndicator: {
    marginLeft: 8,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 20,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  dateInputContent: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownContent: {
    marginLeft: 12,
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#446CCF',
    borderRadius: 20,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDayTextDisabled: {
    color: '#999',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#446CCF',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#313178',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
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
