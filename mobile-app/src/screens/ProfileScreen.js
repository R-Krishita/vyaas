// src/screens/ProfileScreen.js
// User profile with farm info and settings

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
import shared from '../styles/style';

const ProfileScreen = ({ navigation }) => {
  const farmer = {
    name: 'Rajesh Patil',
    phone: '9876543210',
    farmSize: '2.5 acres',
    location: 'Pune, Maharashtra',
    currentCrop: 'Tulsi',
    lastRecommendation: 'Nov 15, 2024',
  };

  const menuItems = [
    { icon: '🚜', title: 'My Farm Details', subtitle: farmer.location, screen: 'FarmDetails' },
    { icon: '📜', title: 'Past Recommendations', subtitle: `Last: ${farmer.lastRecommendation}`, screen: 'Recommendations' },
    { icon: '🌐', title: 'Change Language', subtitle: 'English', screen: null },
    { icon: '📞', title: 'Help & Support', subtitle: '1800-XXX-XXXX', screen: null },
    { icon: 'ℹ️', title: 'About App', subtitle: 'Version 1.0.0', screen: null },
  ];

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👨‍🌾</Text>
          </View>
          <Text style={styles.farmerName}>{farmer.name}</Text>
          <Text style={styles.farmerPhone}>📞 {farmer.phone}</Text>
        </View>

        {/* Farm Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmer.farmSize}</Text>
            <Text style={styles.statLabel}>Farm Size</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmer.currentCrop}</Text>
            <Text style={styles.statLabel}>Current Crop</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Pune</Text>
            <Text style={styles.statLabel}>District</Text>
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: shared.screenContainer,
  scrollView: shared.scrollView,
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatar: {
    fontSize: 40,
  },
  farmerName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  farmerPhone: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    ...shared.statsRow,
    marginBottom: SPACING.lg,
  },
  statItem: shared.statItem,
  statValue: shared.statValue,
  statLabel: shared.statLabel,
  statDivider: shared.statDivider,
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default ProfileScreen;
