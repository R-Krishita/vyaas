// src/screens/HomeScreen.js
// Main home screen with hero carousel and navigation cards

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import HeroCarousel from '../components/HeroCarousel';
import ChatbotFAB from '../components/ChatbotFAB';

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

  const handleChatbotPress = () => {
    navigation.navigate('Chatbot');
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        <View style={styles.cardsGrid}>
          {actionCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={() => handleCardPress(card.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
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

      {/* Chatbot FAB */}
      <ChatbotFAB onPress={handleChatbotPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
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
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
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
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
});

export default HomeScreen;
