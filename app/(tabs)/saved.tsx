import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../src/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SAVED_PLACES = [
  { id: '1', name: 'The Coffee Collective', category: 'Coffee Shop', neighborhood: 'Nørrebro', rating: 4.8, image: 'https://picsum.photos/seed/save1/400/300' },
  { id: '2', name: 'Mirabelle Bakery', category: 'Bakery', neighborhood: 'Nørrebro', rating: 4.6, image: 'https://picsum.photos/seed/save2/400/300' },
  { id: '3', name: 'Democratic Coffee', category: 'Coffee Shop', neighborhood: 'City Center', rating: 4.7, image: 'https://picsum.photos/seed/save3/400/300' },
  { id: '4', name: 'Lakeside Park', category: 'Park', neighborhood: 'Østerbro', rating: 4.5, image: 'https://picsum.photos/seed/save4/400/300' },
];

export default function SavedScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48 - 16) / 2;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Places</Text>
        <TouchableOpacity style={styles.searchButton}>
          <MaterialCommunityIcons name="magnify" size={24} color={colors['on-surface']} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SAVED_PLACES.map((place) => (
            <TouchableOpacity key={place.id} style={[styles.card, { width: cardWidth }]}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: place.image }} style={styles.cardImage} />
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={12} color="#FFB800" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                  <MaterialCommunityIcons name="bookmark" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.cardSubtitle}>{place.category} • {place.neighborhood}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.headlineExtraBold,
    fontSize: 32,
    color: colors['on-surface'],
    letterSpacing: -0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors['surface-container-low'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: radii['2xl'],
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 3,
  },
  ratingText: {
    fontFamily: typography.fontFamily.label,
    fontSize: 10,
    fontWeight: '700',
    color: colors['on-surface'],
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardInfo: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.headlineBold,
    fontSize: 15,
    color: colors['on-surface'],
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.outline,
  },
});
