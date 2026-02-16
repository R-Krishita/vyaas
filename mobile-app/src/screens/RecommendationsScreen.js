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

// Demo recommendations (used when API fails)
const demoRecommendations = [
  {
    rank: 1,
    crop_name: 'Tulsi',
    crop_name_hi: 'तुलसी',
    match_score: 92,
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
    profit_estimate: 38000,
    reasons: ['High demand', 'Drought tolerant'],
    icon: '🌱',
  },
  {
    rank: 3,
    crop_name: 'Turmeric',
    crop_name_hi: 'हल्दी',
    match_score: 78,
    profit_estimate: 32000,
    reasons: ['Traditional knowledge', 'Easy cultivation'],
    icon: '🟡',
  },
];

const medals = ['🥇', '🥈', '🥉'];

const RecommendationsScreen = ({ navigation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await recommendAPI.getCropRecommendations('FARM_001');
      setRecommendations(response.recommendations || demoRecommendations);
    } catch (error) {
      setRecommendations(demoRecommendations);
    }
    setLoading(false);
  };

  const handleViewPlan = (crop) => {
    navigation.navigate('CultivationPlan', { crop });
  };

  const handleViewMarket = (crop) => {
    navigation.navigate('MarketInsights', { crop: crop.crop_name });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing your farm data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🌾 Your Top 3 Ayurvedic Crops</Text>
        <Text style={styles.subtitle}>Based on your farm conditions</Text>

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

            {/* Match Score Bar */}
            <View style={styles.scoreSection}>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill, 
                    { width: `${crop.match_score}%` }
                  ]} 
                />
              </View>
              <Text style={styles.scoreText}>{crop.match_score}% Match</Text>
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
                style={styles.planButton}
                onPress={() => handleViewPlan(crop)}
              >
                <Text style={styles.planButtonText}>📋 View Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.marketButton}
                onPress={() => handleViewMarket(crop)}
              >
                <Text style={styles.marketButtonText}>📊 Prices</Text>
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
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.borderLight,
    borderRadius: 6,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.success,
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
  planButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  planButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  marketButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  marketButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RecommendationsScreen;
