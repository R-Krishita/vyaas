// src/components/StepperInput.js
// Reusable plus/minus numeric input with label

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const StepperInput = ({
  label,
  icon,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  style,
}) => {
  const currentVal = parseFloat(value) || min;

  const adjustValue = (delta) => {
    const newVal = Math.min(max, Math.max(min, currentVal + delta));
    const rounded = Math.round(newVal * 10) / 10;
    onChange(rounded.toString());
  };

  const handleTextChange = (text) => {
    if (text === '' || text === '-') {
      onChange(text);
      return;
    }
    if (text.endsWith('.')) {
      onChange(text);
      return;
    }
    const num = parseFloat(text);
    if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      onChange(clamped.toString());
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {icon} {label} ({min}–{max} {unit})
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustValue(-step)}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          keyboardType="decimal-pad"
          textAlign="center"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustValue(step)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  input: {
    width: 80,
    marginHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default StepperInput;
