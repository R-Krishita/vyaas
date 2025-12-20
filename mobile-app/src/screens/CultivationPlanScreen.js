// src/screens/CultivationPlanScreen.js
// Step-by-step cultivation plan for selected crop

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

// Demo cultivation plan for Tulsi
const cultivationPlan = {
  crop: 'Tulsi',
  crop_hi: 'तुलसी',
  sections: [
    {
      id: 'field',
      title: '❖ Field Preparation',
      title_hi: 'खेत की तैयारी',
      icon: '🚜',
      steps: [
        '2-3 times ploughing',
        'Add farmyard manure: 10 ton/hectare',
        'Make raised beds: 1m wide',
      ],
    },
    {
      id: 'seed',
      title: '❖ Seed / Sowing',
      title_hi: 'बीज / रोपाई',
      icon: '🌱',
      steps: [
        'Seed rate: 300g/hectare',
        'Transplanting time: June-July',
        'Spacing: 40cm x 40cm',
      ],
    },
    {
      id: 'irrigation',
      title: '❖ Irrigation Schedule',
      title_hi: 'सिंचाई',
      icon: '💧',
      steps: [
        'First watering: Immediately after transplanting',
        'Then: Every 7-10 days (summer)',
        'In rainy season: As needed',
      ],
    },
    {
      id: 'fertilizer',
      title: '❖ Fertilizer Schedule',
      title_hi: 'खाद',
      icon: '🌿',
      steps: [
        'NPK 50:30:30 kg/hectare',
        'First dose: 15 days after transplanting',
        'Second dose: 45 days later',
      ],
    },
    {
      id: 'pest',
      title: '❖ Pest Protection',
      title_hi: 'कीट नियंत्रण',
      icon: '🛡️',
      steps: [
        'Neem oil spray: Every 15 days',
        'Install yellow sticky traps',
        'Use companion planting with marigolds',
      ],
    },
    {
      id: 'harvest',
      title: '❖ Harvesting',
      title_hi: 'कटाई',
      icon: '✂️',
      steps: [
        'First harvest: 90 days after transplanting',
        'Then: Every 75 days (3-4 times/year)',
        'Best time: Early morning',
      ],
    },
  ],
};

const CultivationPlanScreen = ({ route, navigation }) => {
  const crop = route?.params?.crop || cultivationPlan;

  const handleDownloadPDF = () => {
    // Would trigger PDF generation API
    alert('PDF download feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.cropIcon}>🌿</Text>
          <Text style={styles.title}>
            {cultivationPlan.crop} ({cultivationPlan.crop_hi})
          </Text>
          <Text style={styles.subtitle}>Cultivation Plan</Text>
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
          <Text style={styles.downloadIcon}>📥</Text>
          <Text style={styles.downloadText}>Download PDF</Text>
        </TouchableOpacity>

        {/* Plan Sections */}
        {cultivationPlan.sections.map((section, index) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionTitleHi}>{section.title_hi}</Text>
              </View>
            </View>
            
            <View style={styles.stepsContainer}>
              {section.steps.map((step, stepIndex) => (
                <View key={stepIndex} style={styles.stepRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tipText}>• Always test soil before planting</Text>
          <Text style={styles.tipText}>• Use organic methods for best quality</Text>
          <Text style={styles.tipText}>• Monitor weather for pest outbreaks</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cropIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  downloadIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  downloadText: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  sectionIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionTitleHi: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  stepsContainer: {
    paddingLeft: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  bullet: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    width: 16,
  },
  stepText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
});

export default CultivationPlanScreen;
