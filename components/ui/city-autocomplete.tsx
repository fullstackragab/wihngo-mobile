import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface City {
  name: string;
  country: string;
  displayName: string;
}

interface CityAutocompleteProps {
  value: string;
  onCitySelected: (city: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onCitySelected,
  onBlur,
  error,
  touched,
  placeholder = "Search for a city...",
  required = false,
}) => {
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<City[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSelectingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal query state with external value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search effect
  useEffect(() => {
    // Don't search if we're selecting an item
    if (isSelectingRef.current) {
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is too short
    if (query.length < 2) {
      setCities([]);
      setShowDropdown(false);
      return;
    }

    // Set new timer (500ms debounce for API calls)
    debounceTimerRef.current = setTimeout(() => {
      searchCities(query);
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const searchCities = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setCities([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=10&` +
          `featuretype=city&` +
          `accept-language=en`,
        {
          headers: {
            "User-Agent": "Wihngo-App", // Required by Nominatim
          },
        }
      );

      const data = await response.json();

      // Filter and format results to show cities
      const cityResults: City[] = data
        .filter(
          (item: any) =>
            item.address &&
            (item.address.city ||
              item.address.town ||
              item.address.village ||
              item.type === "city" ||
              item.type === "town")
        )
        .map((item: any) => {
          const cityName =
            item.address.city ||
            item.address.town ||
            item.address.village ||
            item.name;
          const country = item.address.country || "";
          const state = item.address.state || "";

          return {
            name: cityName,
            country: country,
            displayName: state
              ? `${cityName}, ${state}, ${country}`
              : `${cityName}, ${country}`,
          };
        })
        // Remove duplicates
        .filter(
          (city: City, index: number, self: City[]) =>
            index === self.findIndex((c) => c.displayName === city.displayName)
        )
        .slice(0, 10);

      setCities(cityResults);
      setShowDropdown(cityResults.length > 0);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    setQuery(text);
    onCitySelected(text); // Update parent with raw text
    // searchCities will be called by the debounced useEffect
  };

  const handleSelectCity = (city: City) => {
    // Prevent blur from closing dropdown
    isSelectingRef.current = true;

    // Update both local and parent state immediately
    setQuery(city.displayName);
    onCitySelected(city.displayName);

    // Close dropdown immediately
    setShowDropdown(false);
    setCities([]);

    // Reset selection flag after a delay to prevent useEffect from re-opening
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  };

  const handleBlur = () => {
    // Only close if not selecting
    if (!isSelectingRef.current) {
      setShowDropdown(false);
      onBlur?.();
    }
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <Pressable
      style={({ pressed }) => [
        styles.dropdownItem,
        pressed && styles.dropdownItemPressed,
      ]}
      onTouchStart={(e) => {
        e.stopPropagation();
        isSelectingRef.current = true;
      }}
      onPress={(e) => {
        e.stopPropagation();
        handleSelectCity(item);
      }}
    >
      <FontAwesome6 name="location-dot" size={16} color="#4ECDC4" />
      <View style={styles.cityInfo}>
        <Text style={styles.cityName}>{item.name}</Text>
        <Text style={styles.cityCountry}>{item.country}</Text>
      </View>
    </Pressable>
  );

  const showError = touched && error;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          Location (city){required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      <View style={[styles.inputWrapper, showError && styles.inputError]}>
        <FontAwesome6
          name="location-dot"
          size={16}
          color="#95A5A6"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#95A5A6"
          autoCapitalize="words"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#4ECDC4"
            style={styles.loader}
          />
        )}
      </View>

      {showError && <Text style={styles.errorText}>{error}</Text>}

      {showDropdown && cities.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={cities}
            renderItem={renderCityItem}
            keyExtractor={(item, index) => `${item.displayName}-${index}`}
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
    zIndex: 10,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  required: {
    color: "#E74C3C",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2C3E50",
  },
  loader: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#E74C3C",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemPressed: {
    backgroundColor: "#F0F0F0",
  },
  cityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  cityCountry: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
});

export default CityAutocomplete;
