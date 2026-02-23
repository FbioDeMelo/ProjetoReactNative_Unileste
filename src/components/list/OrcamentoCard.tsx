import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Orcamento } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  orcamento: Orcamento;
  onPress: () => void;
}

export const OrcamentoCard = ({ orcamento, onPress }: Props) => {
  
  // Função auxiliar para formatar dinheiro
  const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calculando o valor total baseado nos itens (Soma de Qtd * Preço)
  const valorTotal = orcamento.itens.reduce((total, item) => {
    return total + (item.quantidade * item.precoUnitario);
  }, 0);

  return (
    <View style={styles.cardContainer}>
      {/* Cabeçalho: Título e Status */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{orcamento.titulo}</Text>
        <StatusBadge status={orcamento.status} />
      </View>
      
      {/* Corpo: Cliente e Valor */}
      <View style={styles.body}>
        <View style={styles.clientRow}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.clientName}>{orcamento.cliente}</Text>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>{formatMoney(valorTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    // Sombra suave (Elevation)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  body: {
    // Espaço entre cliente e valor
    justifyContent: 'space-between',
  },
  clientRow: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
});