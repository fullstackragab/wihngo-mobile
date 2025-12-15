/**
 * Species Autocomplete Input
 * Autocomplete text input for bird species selection
 */

import { BirdSpecies, searchBirdSpecies } from "@/lib/constants/bird-species";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

interface SpeciesAutocompleteProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSpeciesSelected?: (species: BirdSpecies) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  style?: ViewStyle;
  onBlur?: () => void;
}

export default function SpeciesAutocomplete({
  label = "Species",
  value,
  onChangeText,
  onSpeciesSelected,
  required = false,
  placeholder = "Search for a species...",
  error,
  touched,
  style,
  onBlur,
}: SpeciesAutocompleteProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<BirdSpecies[]>([]);
  const isSelectingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search for species
  useEffect(() => {
    // Don't search if we're selecting an item
    if (isSelectingRef.current) {
      return;
    }

    if (!showDropdown || !value) {
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (300ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      const results = searchBirdSpecies(value, t).slice(0, 10);
      setSuggestions(results);
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, showDropdown, t]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowDropdown(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Only close if not selecting
    if (!isSelectingRef.current) {
      setIsFocused(false);
      setShowDropdown(false);
      onBlur?.();
    }
  }, [onBlur]);

  const handleSelectSpecies = useCallback(
    (species: BirdSpecies) => {
      // Prevent blur from closing dropdown
      isSelectingRef.current = true;

      console.log("handleSelectSpecies called with:", species);

      // Get translated name
      const translationKey = `species.${species.species
        .toLowerCase()
        .replace(/['\s-]/g, "_")}`;
      const translatedName = t(translationKey);
      const displayName =
        translatedName !== translationKey ? translatedName : species.species;

      // Update the input value with translated name
      onChangeText(displayName);

      // Notify parent component about the selection
      if (onSpeciesSelected) {
        onSpeciesSelected(species);
      }

      // Hide dropdown and unfocus
      setShowDropdown(false);
      setIsFocused(false);

      // Reset selection flag after a delay to prevent useEffect from re-opening
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
    },
    [onChangeText, onSpeciesSelected, t]
  );

  const showError = touched && error;

  return (
    <View style={[styles.container, style]}>
      {/* Input */}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          showError && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCapitalize="words"
        autoComplete="off"
        autoCorrect={false}
      />

      {/* Error Message */}
      {showError && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown Suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item.species}-${index}`}
            renderItem={({ item }) => {
              const translationKey = `species.${item.species
                .toLowerCase()
                .replace(/['\s-]/g, "_")}`;
              const translatedName = t(translationKey);
              const displayName =
                translatedName !== translationKey
                  ? translatedName
                  : item.species;

              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    pressed && styles.suggestionItemPressed,
                  ]}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    isSelectingRef.current = true;
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleSelectSpecies(item);
                  }}
                >
                  <Text style={styles.speciesName}>{displayName}</Text>
                  <Text style={styles.commonName}>{item.commonName}</Text>
                  <Text style={styles.scientificName}>
                    {item.scientificName}
                  </Text>
                </Pressable>
              );
            }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={styles.suggestionList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  required: {
    color: "#E74C3C",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#2C3E50",
  },
  inputFocused: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    marginTop: 4,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 250,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  suggestionList: {
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionItemPressed: {
    backgroundColor: "#F0F0F0",
  },
  speciesName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  commonName: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 2,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#95A5A6",
  },
});
