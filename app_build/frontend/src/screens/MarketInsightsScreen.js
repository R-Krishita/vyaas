// src/screens/MarketInsightsScreen.js
// Enhanced Market Comparison Screen with Line Charts and Profit Prediction

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import { marketAPI, recommendAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MarketInsightsScreen = ({ route, navigation }) => {
  const initialCrop = route?.params?.crop;
  const [allRecommendedCrops, setAllRecommendedCrops] = useState(route?.params?.allCrops || []);
  const [selectedCrop, setSelectedCrop] = useState(initialCrop || null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [comparisonData, setComparisonData] = useState({});
  const [chartData, setChartData] = useState(null);
  const [chartWidth, setChartWidth] = useState(300);
  const [farmDistrict, setFarmDistrict] = useState(null);
  const [farmState, setFarmState] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const loadPersistedData = async () => {
        // Load farm location for local mandi pricing
        const [savedDistrict, savedState] = await Promise.all([
          AsyncStorage.getItem('farm_district').catch(() => null),
          AsyncStorage.getItem('farm_state').catch(() => null),
        ]);
        if (isActive && savedDistrict) setFarmDistrict(savedDistrict);
        if (isActive && savedState) setFarmState(savedState);

        if (route?.params?.allCrops && route.params.allCrops.length > 0) {
          if (isActive) {
            setAllRecommendedCrops(route.params.allCrops);
            if (!selectedCrop) setSelectedCrop(route.params.crop || route.params.allCrops[0]);
          }
          await AsyncStorage.setItem('last_recommendations', JSON.stringify(route.params.allCrops));
        } else {
          try {
            const savedStr = await AsyncStorage.getItem('last_recommendations');
            if (savedStr) {
              const savedCrops = JSON.parse(savedStr);
              if (savedCrops && savedCrops.length > 0 && isActive) {
                setAllRecommendedCrops(savedCrops);
                if (!selectedCrop) setSelectedCrop(savedCrops[0]);
              }
            }
          } catch (e) {
            console.log('Error reading storage', e);
          }
        }
      };
      loadPersistedData();
      return () => { isActive = false; };
    }, [route?.params])
  );

  useEffect(() => {
    if (allRecommendedCrops.length === 0) {
      setLoading(false);
      return;
    }
    fetchAllData();
  }, [allRecommendedCrops]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch details for all crops
      let detailsRes = null;
      try {
        detailsRes = await recommendAPI.getCropDetails(allRecommendedCrops);
      } catch (e) {
        console.error('Error fetching crop details:', e);
      }
      const cropDetailsMap = {};
      if (detailsRes && detailsRes.crops) {
        detailsRes.crops.forEach(c => {
          cropDetailsMap[c.crop_name] = c;
        });
      }

      // 2. Fetch market data for all crops
      const results = {};
      const historyPromises = allRecommendedCrops.map(c => marketAPI.getPriceHistory(c, 30).catch(() => ({ history: [] })));
      const pricePromises = allRecommendedCrops.map(c =>
        marketAPI.getMarketPrices(c, farmState, farmDistrict)
          .catch(() => ({ current_price_avg: 150, nearby_mandis: [] }))
      );
      
      const [histories, prices] = await Promise.all([
        Promise.all(historyPromises),
        Promise.all(pricePromises)
      ]);

      for (let i = 0; i < allRecommendedCrops.length; i++) {
        const c_name = allRecommendedCrops[i];
        const history = histories[i]?.history || [];
        const currentPrice = prices[i]?.current_price_avg || 150;
        
        // 3. Fetch harvest prediction
        const econ = cropDetailsMap[c_name] || {};
        const growthDays = econ.growth_days || 120;
        const prediction = await marketAPI.getHarvestPrediction(c_name, growthDays, currentPrice).catch(() => null);
        
        // 4. Calculate expected profit
        const yieldAvg = econ.yield_avg || 1000;
        const costAvg = econ.cost_avg || 30000;
        const predPrice = prediction?.predicted_price || currentPrice;
        const expectedProfit = (predPrice * yieldAvg) - costAvg;

        results[c_name] = {
          details: econ,
          current_price: currentPrice,
          history: history,
          prediction: prediction || { predicted_price: currentPrice, potential_change_pct: 0, harvest_days: growthDays },
          expected_profit: expectedProfit,
          mandi_data: prices[i] || { nearby_mandis: [] }
        };
      }

      setComparisonData(results);
      prepareChartData(results);
    } catch (error) {
      console.error('[VYAAS] Error fetching comparison data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const prepareChartData = (data) => {
    const datasets = [];
    const colors = [
      (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
    ];

    allRecommendedCrops.forEach((c_name, index) => {
      if (data[c_name] && data[c_name].history && data[c_name].history.length > 0) {
        const points = data[c_name].history.slice(-7).map(h => h.price);
        datasets.push({
          data: points,
          color: colors[index % colors.length],
          strokeWidth: 2
        });
      }
    });

    if (datasets.length > 0) {
      setChartData({
        labels: ['6d', '5d', '4d', '3d', '2d', '1d', 'Now'],
        datasets: datasets
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  if (allRecommendedCrops.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Market Data Found</Text>
          <Text style={styles.emptySubtitle}>
            Please generate crop recommendations first to view their real-time market prices and profitability.
          </Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => navigation.navigate('Crops')}
          >
            <Text style={styles.inputButtonText}>🌾 Go to Recommendations</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing market comparisons...</Text>
      </View>
    );
  }

  const currentSelection = comparisonData[selectedCrop];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>📊 Market Comparison</Text>
        <Text style={styles.subtitle}>Top 3 Recommended Crops</Text>

        <View 
          style={styles.chartContainer}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setChartWidth(width);
          }}
        >
          <Text style={styles.sectionTitle}>📈 Price Trends (Side-by-Side)</Text>
          {chartData ? (
            <>
              <LineChart
                data={chartData}
                width={chartWidth > 0 ? chartWidth : 300}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                formatYLabel={(y) => Math.round(Number(y)).toString()}
              />
              <View style={styles.customLegendContainer}>
                {allRecommendedCrops.map((crop, idx) => {
                  const colors = ['#4CAF50', '#2196F3', '#FF9800'];
                  return (
                    <View key={idx} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: colors[idx % colors.length] }]} />
                      <Text style={styles.legendText}>{crop}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.noDataChart}><Text>No trend data available yet</Text></View>
          )}
        </View>

        <View style={styles.comparisonDashboard}>
          <Text style={styles.sectionTitle}>💰Profit Comparison Dashboard</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {allRecommendedCrops.map((c_name, index) => {
              const data = comparisonData[c_name];
              if (!data) return null;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.miniCard, selectedCrop === c_name && styles.selectedMiniCard]}
                  onPress={() => setSelectedCrop(c_name)}
                >
                  <Text style={styles.miniCropName}>{c_name}</Text>
                  <Text style={styles.miniProfit}>₹{Math.round(data.expected_profit / 1000)}k</Text>
                  <Text style={styles.miniLabel}>Est. Profit</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {currentSelection && (
          <View style={styles.deepDiveContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.deepDiveTitle}>🔍 {selectedCrop} Analysis</Text>
            </View>

            <View style={styles.predictionCard}>
              <View style={styles.predictionRow}>
                <View style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>Current Price</Text>
                  <Text style={styles.predictionValue}>₹{currentSelection.current_price}/kg</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>Harvest Price (Est.)</Text>
                  <Text style={styles.predictionValue}>₹{currentSelection.prediction.predicted_price}/kg</Text>
                </View>
              </View>
              <Text style={styles.predictionNote}>
                *Estimated based on {currentSelection.prediction.harvest_days} days growth cycle.
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Expected Yield</Text>
                <Text style={styles.statValue}>{currentSelection.details.yield_avg || 'N/A'} kg/acre</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Cultivation Cost</Text>
                <Text style={styles.statValue}>₹{(currentSelection.details.cost_avg || 0).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.netProfitCard}>
              <Text style={styles.netProfitLabel}>Estimated Net Profit at Harvest</Text>
              <Text style={styles.netProfitValue}>₹{Math.round(currentSelection.expected_profit || 0).toLocaleString()}</Text>
              <Text style={styles.netProfitSub}>Per acre basis after all expenses</Text>
            </View>

            <Text style={styles.sectionTitle}>📍 Best Mandis for {selectedCrop}</Text>
            {currentSelection.mandi_data?.nearby_mandis?.length > 0 ? (
              currentSelection.mandi_data.nearby_mandis.map((mandi, i) => (
                <View key={i} style={styles.mandiItem}>
                  <Text style={styles.mandiName}>{mandi.name}</Text>
                  <Text style={styles.mandiPrice}>₹{mandi.price_modal}/kg</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No mandi data available for this region</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffa726' }
};

const styles = StyleSheet.create({
  container: shared.screenContainer,
  loadingContainer: shared.loadingContainer,
  loadingText: shared.loadingText,
  scrollView: shared.scrollView,
  title: {
    ...shared.screenTitle,
    fontSize: 22,
  },
  subtitle: shared.screenSubtitle,
  chartContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  chart: { marginVertical: 8, borderRadius: RADIUS.lg },
  customLegendContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  legendText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  noDataChart: { height: 200, justifyContent: 'center', alignItems: 'center' },
  noDataText: { color: COLORS.textMuted, textAlign: 'center', padding: SPACING.md },
  comparisonDashboard: { marginBottom: SPACING.lg },
  horizontalScroll: { flexDirection: 'row' },
  miniCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  selectedMiniCard: { borderColor: COLORS.primary, backgroundColor: '#E8F5E9' },
  miniCropName: { fontWeight: 'bold', fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  miniProfit: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.secondary, marginVertical: 4 },
  miniLabel: { fontSize: 10, color: COLORS.textSecondary },
  deepDiveContainer: { marginTop: SPACING.md, paddingBottom: SPACING.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  deepDiveTitle: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.primary },
  trendBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  trendText: { color: COLORS.info, fontWeight: '600', fontSize: 12 },
  predictionCard: { backgroundColor: '#F5F5F5', padding: SPACING.lg, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  predictionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  predictionItem: { alignItems: 'center' },
  predictionLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4 },
  predictionValue: { fontSize: FONTS.sizes.lg, fontWeight: 'bold', color: COLORS.textPrimary },
  arrow: { fontSize: 24, color: COLORS.textMuted },
  predictionNote: { fontSize: 9, color: COLORS.textMuted, marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  statsContainer: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  statBox: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
  netProfitCard: { backgroundColor: COLORS.secondary, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', marginBottom: SPACING.xl },
  netProfitLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 8 },
  netProfitValue: { color: '#ffffff', fontSize: 32, fontWeight: 'bold' },
  netProfitSub: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4 },
  mandiItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  mandiName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  mandiPrice: { fontWeight: 'bold', color: COLORS.success },
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

export default MarketInsightsScreen;
