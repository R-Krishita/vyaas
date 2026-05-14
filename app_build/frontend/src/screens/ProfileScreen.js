// src/screens/ProfileScreen.js
// User profile with dynamic farmer info and settings

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import { authAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const farmerId = await AsyncStorage.getItem('farmer_id');
      if (farmerId) {
        const data = await authAPI.getProfile(farmerId);
        setFarmer(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpSupport = () => {
    Alert.alert(
      "Help & Support",
      "Need assistance? Contact us at:\n\n📞 Phone: 1800-123-4567\n📧 Email: support@vyaas.in"
    );
  };

  const handleAboutApp = () => {
    Alert.alert(
      "About Vyaas",
      "Vyaas is an AI-powered Smart Ayurvedic Crop Advisor. We empower farmers by recommending high-value medicinal and Ayurvedic crops suited for their land. By integrating real-time market prices, climate data, and soil conditions, Vyaas helps you maximize profits and promote sustainable farming."
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('farmer_id');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Fallback data if no user is logged in
  const profileName = farmer?.name || 'Guest User';
  const profilePhone = farmer?.phone || 'Not Registered';
  const farmSize = farmer?.total_farm_size_acres ? `${farmer.total_farm_size_acres} acres` : 'N/A';
  const currentCrop = farmer?.current_crop || 'None';
  const district = farmer?.district || 'Unknown';
  const state = farmer?.state || 'Unknown';

  const menuItems = [
    { icon: '🚜', title: 'My Farm Details', subtitle: `${district}, ${state}`, action: () => navigation.navigate('FarmDetails') },
    { icon: '📜', title: 'Past Recommendations', subtitle: 'View history', action: () => navigation.navigate('PastRecommendations') },
    { icon: '📞', title: 'Help & Support', subtitle: '1800-123-4567', action: handleHelpSupport },
    { icon: 'ℹ️', title: 'About App', subtitle: 'Version 1.0.0', action: handleAboutApp },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👨‍🌾</Text>
          </View>
          <Text style={styles.farmerName}>{profileName}</Text>
          <Text style={styles.farmerPhone}>📞 {profilePhone}</Text>
        </View>

        {/* Farm Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmSize}</Text>
            <Text style={styles.statLabel}>Farm Size</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentCrop}</Text>
            <Text style={styles.statLabel}>Current Crop</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{district}</Text>
            <Text style={styles.statLabel}>District</Text>
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.action}
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
