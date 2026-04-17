import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusOrcamento } from '../types';

const STATUS_CONFIG: Record<StatusOrcamento, { label: string; bg: string; text: string }> = {
  Pendente:  { label: 'PENDENTE',  bg: '#FFF9DB', text: '#F08C00' },
  Aprovado:  { label: 'APROVADO',  bg: '#EBFBEE', text: '#2B8A3E' },
  Pago:      { label: 'PAGO',      bg: '#E7F5FF', text: '#007AFF' },
  Rejeitado: { label: 'REJEITADO', bg: '#FFF5F5', text: '#E03131' },
};

interface Props {
  status: StatusOrcamento;
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['Pendente'];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: { 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
});
