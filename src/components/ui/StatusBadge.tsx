import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusOrcamento } from '../../types'; // <- Mantenha esta
import { colors, borderRadius, spacing } from '../../theme';

interface Props {
  status: StatusOrcamento;
}

// ... resto do código continua igual
export const StatusBadge = ({ status }: Props) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Rascunho': return colors.secondary;
      case 'Enviado': return colors.warning;
      case 'Aprovado': return colors.success;
      case 'Recusado': return colors.danger;
      default: return colors.secondary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() + '20' }]}>
      <Text style={[styles.text, { color: getStatusColor() }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});