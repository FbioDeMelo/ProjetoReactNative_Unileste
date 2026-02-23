import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, borderRadius, globalStyles } from '../theme';
import { Button } from '../components/ui/Button';

export const FormScreen = () => {
  return (
    <View style={globalStyles.container}>
      <Text style={styles.screenTitle}>Novo Orçamento</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Seção 1: Dados Principais */}
        <View style={globalStyles.card}>
          <Text style={styles.label}>Título do Orçamento</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Serviços de TI"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.label}>Cliente</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nome do cliente"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Seção 2: Lista de Itens (Visual) */}
        <View style={globalStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Itens do Serviço</Text>
            <Button title="+ Item" variant="outline" onPress={() => {}} style={{ height: 36 }} />
          </View>
          
          {/* Exemplo visual de um item */}
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>Serviço Exemplo</Text>
              <Text style={styles.itemDetails}>1x R$ 150,00</Text>
            </View>
            <Text style={styles.itemTotal}>R$ 150,00</Text>
          </View>
        </View>

        {/* Seção 3: Resumo Financeiro */}
        <View style={globalStyles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>R$ 0,00</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto:</Text>
            <TextInput 
              style={[styles.inputSmall, { textAlign: 'right' }]} 
              placeholder="0%" 
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Final:</Text>
            <Text style={styles.totalValue}>R$ 0,00</Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          <Button title="Salvar Rascunho" variant="outline" onPress={() => {}} style={{ flex: 1, marginRight: 10 }} />
          <Button title="Salvar" onPress={() => {}} style={{ flex: 1 }} />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  inputSmall: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    width: 80,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: colors.text,
  },
  itemDetails: {
    fontSize: 12,
    color: colors.textLight,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.textLight,
  },
  summaryValue: {
    color: colors.text,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});