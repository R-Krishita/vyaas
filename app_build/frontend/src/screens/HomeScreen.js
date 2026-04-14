// src/screens/HomeScreen.js
// Main home screen with hero carousel and navigation cards

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import HeroCarousel from '../components/HeroCarousel';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';

const actionCards = [
  {
    id: 'farm',
    icon: '🚜',
    title: 'Farm Details',
    subtitle: 'Enter your farm info',
    screen: 'FarmDetails',
  },
  {
    id: 'recommend',
    icon: '🌿',
    title: 'Crop Advice',
    subtitle: 'Get recommendations',
    screen: 'Recommendations',
  },
  {
    id: 'market',
    icon: '📊',
    title: 'Market Prices',
    subtitle: 'Live mandi rates',
    screen: 'MarketInsights',
  },
  {
    id: 'plan',
    icon: '📋',
    title: 'Cultivation Plan',
    subtitle: 'Step-by-step guide',
    screen: 'CultivationPlan',
  },
];

const HomeScreen = ({ navigation }) => {
  const farmerName = 'Farmer'; // Would come from auth/storage

  const handleCardPress = (screen) => {
    if (screen === 'Recommendations') {
      // Navigate to Crops tab
      navigation.navigate('Crops');
    } else {
      navigation.navigate(screen);
    }
  };



  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>🙏 Hello,</Text>
            <Text style={styles.farmerName}>{farmerName}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Action Cards */}
        <SectionHeader title="What would you like to do?" />
        <View style={styles.cardsGrid}>
          {actionCards.map((card) => (
            <Card
              key={card.id}
              style={styles.card}
              onPress={() => handleCardPress(card.screen)}
            >
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </Card>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2.5</Text>
            <Text style={styles.statLabel}>Acres</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Tulsi</Text>
            <Text style={styles.statLabel}>Current Crop</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹45K</Text>
            <Text style={styles.statLabel}>Est. Profit</Text>
          </View>
        </View>
      </ScrollView>

    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...shared.screenContainer,
    position: 'relative',
  },
  scrollView: shared.scrollView,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  farmerName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  profileIcon: {
    fontSize: 24,
  },
  sectionTitle: shared.sectionTitle,
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    ...shared.statsRow,
    marginBottom: SPACING.xxl,
  },
  statItem: shared.statItem,
  statValue: shared.statValue,
  statLabel: shared.statLabel,
  statDivider: {
    ...shared.statDivider,
    marginHorizontal: SPACING.sm,
  },
});

export default HomeScreen;
