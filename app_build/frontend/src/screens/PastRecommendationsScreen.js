import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import { mlAPI } from '../services/api';

export default function PastRecommendationsScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const farmerId = await AsyncStorage.getItem('farmer_id');
      if (farmerId) {
        const response = await mlAPI.getFeedbackHistory(farmerId);
        if (response.success && response.history) {
          setHistory(response.history);
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const date = item.chosen_at ? new Date(item.chosen_at).toLocaleDateString() : 'Unknown Date';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{date}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Selected: {item.chosen_crop}</Text>
          </View>
        </View>
        <Text style={styles.label}>Recommended Options:</Text>
        <Text style={styles.cropsText}>
          {Array.isArray(item.recommended_crops) 
            ? item.recommended_crops.join(', ') 
            : item.recommended_crops || 'None'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No past recommendations found.</Text>
          <Text style={styles.emptySubtext}>Your accepted crop recommendations will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: shared.screenContainer,
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  cropsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  emptyText: {
    ...shared.screenTitle,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...shared.screenSubtitle,
    textAlign: 'center',
  }
});
