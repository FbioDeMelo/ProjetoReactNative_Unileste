import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Orcamento } from '../types';
import { StatusBadge } from './StatusBadge';

interface BudgetCardProps {
  orcamento: Orcamento;
  onPress: () => void;
  onLongPress?: () => void;
  onStatusPress?: () => void;
}

export function BudgetCard({ orcamento, onPress, onLongPress, onStatusPress }: BudgetCardProps) {
  // Format to BRL currency
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const data = new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{orcamento.titulo}</Text>
        <TouchableOpacity onPress={onStatusPress} activeOpacity={0.6}>
          <StatusBadge status={orcamento.status} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.body}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>CLIENTE</Text>
          <Text style={styles.infoValue}>{orcamento.cliente}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>DATA</Text>
          <Text style={styles.infoValue}>{data}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>{formatCurrency(orcamento.total)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoRow: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#adb5bd',
    marginBottom: 4,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#adb5bd',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2b8a3e',
  }
});
