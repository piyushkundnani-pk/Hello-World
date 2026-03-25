import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RADIUS } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, color, bg, size = 'md' }) => (
  <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.small]}>
    <Text style={[styles.text, { color }, size === 'sm' && styles.smallText]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: { fontSize: 13, fontWeight: '600' },
  smallText: { fontSize: 11 },
});
