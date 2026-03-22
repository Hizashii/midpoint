import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../lib/theme';
import { geocodingService, GeocodeResult } from '../services/geocodingService';

interface PlaceSearchBarProps {
  onPlaceSelect: (result: GeocodeResult) => void;
  placeholder?: string;
}

export const PlaceSearchBar = ({ onPlaceSelect, placeholder = "Search for a place or address" }: PlaceSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        const data = await geocodingService.searchPlaces(query);
        setResults(data || []);
        setIsLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GeocodeResult) => {
    setQuery(item.address);
    setShowResults(false);
    onPlaceSelect(item);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, showResults && styles.containerActive]}>
        <MaterialIcons name="search" size={24} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          value={query}
          onChangeText={setQuery}
          onFocus={() => {
            if (query.length > 2) setShowResults(true);
          }}
        />
        {isLoading && <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setShowResults(false); }}>
            <MaterialIcons name="close" size={20} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.resultsWrapper}>
          <FlatList
            data={results}
            keyExtractor={(item, index) => `loc-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <MaterialIcons name="location-on" size={20} color={colors.outline} style={styles.resultIcon} />
                <Text style={styles.resultText} numberOfLines={2}>{item.address}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 100,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors['surface-container-low'],
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerActive: {
    borderColor: colors.primary,
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: 16,
    color: colors['on-surface'],
  },
  loader: {
    marginRight: 8,
  },
  resultsWrapper: {
    backgroundColor: 'white',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: colors.primary,
    borderTopWidth: 0,
    ...shadows.md,
    overflow: 'hidden',
  },
  resultsList: {
    width: '100%',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors['surface-container-low'],
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
    color: colors['on-surface'],
  },
});
