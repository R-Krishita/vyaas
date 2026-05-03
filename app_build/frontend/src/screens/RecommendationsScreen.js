// src/screens/RecommendationsScreen.js
// Crop recommendations with cards showing match score and profit estimate

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import { recommendAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo recommendations (used when API fails)
const demoRecommendations = [
  {
    rank: 1,
    crop_name: 'Tulsi',
    crop_name_hi: 'तुलसी',
    match_score: 92,
    confidence_band: 'Strongly Suitable',
    profit_estimate: 45000,
    reasons: [
      'Suitable for your soil type',
      'Low water requirement',
      'Good market price',
    ],
    icon: '🌿',
  },
  {
    rank: 2,
    crop_name: 'Ashwagandha',
    crop_name_hi: 'अश्वगंधा',
    match_score: 85,
    confidence_band: 'Suitable',
    profit_estimate: 38000,
    reasons: ['High demand', 'Drought tolerant'],
    icon: '🌱',
  },
  {
    rank: 3,
    crop_name: 'Turmeric',
    crop_name_hi: 'हल्दी',
    match_score: 78,
    confidence_band: 'Moderately Suitable',
    profit_estimate: 32000,
    reasons: ['Traditional knowledge', 'Easy cultivation'],
    icon: '🟡',
  },
];

const medals = ['🥇', '🥈', '🥉'];

// Confidence band colors matching the farmer-friendly bands
const getBandColor = (band) => {
  switch (band) {
    case 'Strongly Suitable': return '#4CAF50';
    case 'Suitable': return '#FFC107';
    case 'Moderately Suitable': return '#FF9800';
    case 'Low Suitability': return '#F44336';
    default: return COLORS.textMuted;
  }
};

const RecommendationsScreen = ({ navigation, route }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    const farm_id = route?.params?.farm_id || 'FARM_001';
    try {
      const response = await recommendAPI.getCropRecommendations(farm_id);
      const recs = response.recommendations || [];
      if (recs.length > 0) {
        setRecommendations(recs);
        setIsDemo(false);
        try {
          await AsyncStorage.setItem('last_recommendations', JSON.stringify(recs.map(r => r.crop_name)));
        } catch (e) {
          console.log('Error saving recommendations', e);
        }
      } else {
        setRecommendations(demoRecommendations);
        setIsDemo(true);
        try {
          await AsyncStorage.setItem('last_recommendations', JSON.stringify(demoRecommendations.map(r => r.crop_name)));
        } catch (e) {
          console.log('Error saving demo recs', e);
        }
      }
    } catch (error) {
      setRecommendations(demoRecommendations);
      setIsDemo(true);
      try {
        await AsyncStorage.setItem('last_recommendations', JSON.stringify(demoRecommendations.map(r => r.crop_name)));
      } catch (e) {
        console.log('Error saving demo recs', e);
      }
    }
    setLoading(false);
  };

  const handleViewMarket = (crop) => {
    navigation.navigate('Market', { 
      screen: 'MarketMain',
      params: {
        crop: crop.crop_name,
        allCrops: recommendations.map(r => r.crop_name)
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing your farm data...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚜</Text>
          <Text style={styles.emptyTitle}>No Farm Details Found</Text>
          <Text style={styles.emptySubtitle}>
            Input your farm details to get the best Ayurvedic crop recommendations for your land.
          </Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => navigation.navigate('FarmDetails')}
          >
            <Text style={styles.inputButtonText}>🌱 Enter Farm Details</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🌾 Your Top 3 Ayurvedic Crops</Text>
        <Text style={styles.subtitle}>Based on your farm conditions</Text>

        {isDemo && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>
              ⚠️ Showing demo crops — connect to backend for live ML predictions
            </Text>
          </View>
        )}

        {recommendations.map((crop, index) => (
          <View key={crop.rank} style={styles.cropCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.medal}>{medals[index]}</Text>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>
                  {crop.crop_name}{crop.crop_name_hi && crop.crop_name_hi !== crop.crop_name ? ` (${crop.crop_name_hi})` : ''}
                </Text>
                <Text style={styles.cropIcon}>{crop.icon}</Text>
              </View>
            </View>

            {/* Confidence Band */}
            <View style={styles.bandRow}>
              <View style={[styles.bandDot, { backgroundColor: getBandColor(crop.confidence_band) }]} />
              <Text style={[styles.bandLabel, { color: getBandColor(crop.confidence_band) }]}>
                {crop.confidence_band || 'Suitable'}
              </Text>
            </View>

            {/* Profit Estimate */}
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>💰 Estimated Profit:</Text>
              <Text style={styles.profitValue}>
                ₹{crop.profit_estimate.toLocaleString()}/acre
              </Text>
            </View>

            {/* Reasons */}
            <View style={styles.reasonsSection}>
              <Text style={styles.reasonsTitle}>Why this crop?</Text>
              {crop.reasons.map((reason, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={styles.checkmark}>✅</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.marketButton}
                onPress={() => handleViewMarket(crop)}
              >
                <Text style={styles.marketButtonText}>📊 View Market Comparison</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: shared.screenContainer,
  loadingContainer: shared.loadingContainer,
  loadingText: shared.loadingText,
  scrollView: shared.scrollView,
  title: {
    ...shared.screenTitle,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...shared.screenSubtitle,
    marginBottom: SPACING.lg,
  },
  demoBanner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  demoBannerText: {
    fontSize: FONTS.sizes.sm,
    color: '#856404',
    fontWeight: '500',
  },
  cropCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  medal: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  cropInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cropIcon: {
    fontSize: 28,
  },

  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  bandLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  profitLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  profitValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  reasonsSection: {
    marginBottom: SPACING.md,
  },
  reasonsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkmark: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  reasonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  marketButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  marketButtonText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 24,
  },
  inputButton: {
    ...shared.primaryButton,
    width: '100%',
    padding: SPACING.lg,
  },
  inputButtonText: {
    ...shared.primaryButtonText,
  },
});

export default RecommendationsScreen;
