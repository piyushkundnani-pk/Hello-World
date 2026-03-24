import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false, highlighted = false }) => (
  <View style={[styles.card, elevated && styles.elevated, highlighted && styles.highlighted, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    backgroundColor: COLORS.bgElevated,
  },
  highlighted: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
});
