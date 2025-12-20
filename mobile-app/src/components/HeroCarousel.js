// src/components/HeroCarousel.js
// Auto-sliding hero carousel showing crop/farm health

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - (SPACING.lg * 2);

// Demo slides - would come from API in production
const demoSlides = [
  {
    id: 1,
    type: 'crop_health',
    title: 'Your Tulsi Field',
    healthScore: 80,
    status: 'healthy',
    statusColor: COLORS.success,
    message: 'Looking good! Next watering in 2 days.',
    icon: '🌱',
  },
  {
    id: 2,
    type: 'weather_alert',
    title: 'Weather Update',
    message: 'Sunny, 32°C - Good conditions for growth',
    icon: '☀️',
    statusColor: COLORS.accent,
  },
  {
    id: 3,
    type: 'action_reminder',
    title: 'Next Action',
    message: 'Apply neem spray tomorrow morning',
    icon: '💧',
    statusColor: COLORS.info,
  },
  {
    id: 4,
    type: 'market_update',
    title: 'Market Price',
    message: 'Tulsi price up 5% this week!',
    icon: '📈',
    statusColor: COLORS.success,
  },
];

const HeroCarousel = ({ slides = demoSlides }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CAROUSEL_WIDTH,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, slides.length]);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / CAROUSEL_WIDTH);
    setActiveIndex(index);
  };

  const renderHealthBar = (score) => (
    <View style={styles.healthBarContainer}>
      <View style={styles.healthBarBackground}>
        <View style={[styles.healthBarFill, { width: `${score}%` }]} />
      </View>
      <Text style={styles.healthScore}>{score}%</Text>
    </View>
  );

  const renderSlide = (slide) => (
    <View key={slide.id} style={styles.slide}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideIcon}>{slide.icon}</Text>
        <Text style={styles.slideTitle}>{slide.title}</Text>
      </View>
      
      {slide.type === 'crop_health' && (
        <>
          {renderHealthBar(slide.healthScore)}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: slide.statusColor }]} />
            <Text style={styles.statusText}>
              {slide.status.charAt(0).toUpperCase() + slide.status.slice(1)}
            </Text>
          </View>
        </>
      )}
      
      <Text style={styles.slideMessage}>{slide.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.carouselLabel}>
        <Text style={styles.labelIcon}>🌿</Text>
        <Text style={styles.labelText}>Farm Overview</Text>
      </View>
      
      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map(renderSlide)}
        </ScrollView>

        {/* Previous Button - positioned on top */}
        <TouchableOpacity 
          style={[styles.navButton, styles.prevButton]}
          onPress={() => {
            const prevIndex = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;
            setActiveIndex(prevIndex);
            scrollViewRef.current?.scrollTo({
              x: prevIndex * CAROUSEL_WIDTH,
              animated: true,
            });
          }}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        {/* Next Button - positioned on top */}
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton]}
          onPress={() => {
            const nextIndex = (activeIndex + 1) % slides.length;
            setActiveIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
              x: nextIndex * CAROUSEL_WIDTH,
              animated: true,
            });
          }}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setActiveIndex(index);
              scrollViewRef.current?.scrollTo({
                x: index * CAROUSEL_WIDTH,
                animated: true,
              });
            }}
          >
            <View
              style={[
                styles.dot,
                activeIndex === index && styles.dotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  carouselLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  labelText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollView: {
    borderRadius: RADIUS.lg,
  },
  slide: {
    width: CAROUSEL_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  slideIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  slideTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  healthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  healthBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.borderLight,
    borderRadius: 6,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 6,
  },
  healthScore: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  slideMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  carouselWrapper: {
    position: 'relative',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  prevButton: {
    left: 2,
  },
  nextButton: {
    right: 2,
  },
  navButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default HeroCarousel;
