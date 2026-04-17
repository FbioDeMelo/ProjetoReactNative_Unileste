import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Alert } from '../utils/alert';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Orcamento, StatusOrcamento, ItemServico } from '../types';
import { useBudgetStore } from '../store/useBudgetStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { calcularItem, calcularSubtotal, calcularDesconto, calcularTotal, formatBRL } from '../utils/calc';

import { getStatusAcoes } from '../utils/status';

type FormRouteProp = RouteProp<RootStackParamList, 'FormOrcamento'>;
type FormNavProp = NativeStackNavigationProp<RootStackParamList, 'FormOrcamento'>;

export function FormOrcamentoScreen() {
  const route = useRoute<FormRouteProp>();
  const navigation = useNavigation<FormNavProp>();
  const { orcamentos, createOrcamento, updateOrcamento, deleteOrcamento, isLoading } = useBudgetStore();

  const orcamentoId = route.params?.orcamentoId;
  const isEditing = !!orcamentoId;

  const [titulo, setTitulo] = useState('');
  const [cliente, setCliente] = useState('');
  const [status, setStatus] = useState<StatusOrcamento>('Pendente');
  const [servicos, setServicos] = useState<any[]>([]);
  const [descontoStr, setDescontoStr] = useState('0');

  useEffect(() => {
    if (isEditing) {
      const existing = orcamentos.find(o => o.id === orcamentoId);
      if (existing) {
        setTitulo(existing.titulo);
        setCliente(existing.cliente);
        setStatus(existing.status);
        // Converter números para string para o formulário
        setServicos(existing.servicos.map(s => ({
          ...s,
          quantidade: s.quantidade.toString(),
          precoUnitario: s.precoUnitario.toString()
        })));
        setDescontoStr(existing.desconto.toString());
      }
    }
  }, [isEditing, orcamentoId]);

  // --- Cálculos derivados via utils/calc.ts ---
  const descontoVal = parseFloat(descontoStr.replace(',', '.')) || 0;
  
  // Converte servicos do form (strings) para servicos do modelo (numbers) para cálculo
  const servicosCalculo: ItemServico[] = servicos.map(s => ({
    ...s,
    quantidade: parseFloat(s.quantidade.toString().replace(',', '.')) || 0,
    precoUnitario: parseFloat(s.precoUnitario.toString().replace(',', '.')) || 0
  }));

  const subtotal = calcularSubtotal(servicosCalculo);
  const valorDesconto = calcularDesconto(subtotal, descontoVal);
  const total = calcularTotal(subtotal, descontoVal);
  const totalValido = total >= 0 && !isNaN(total);

  const handleAddServico = () => {
    setServicos([...servicos, {
      id: Math.random().toString(36).substr(2, 9),
      nome: '', quantidade: '1', precoUnitario: '0'
    }]);
  };

  const handleChangeServico = (id: string, key: string, value: string) => {
    setServicos(servicos.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const handleRemoveServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
  };

  const handleUpdateStatus = (novoStatus: StatusOrcamento) => {
    setStatus(novoStatus);
  };

  // --- Validação local antes de chamar a API ---
  const validateLocal = (): boolean => {
    if (!titulo.trim() || titulo.trim().length < 3) {
      Alert.alert('Validação', 'O título deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (!cliente.trim() || cliente.trim().length < 3) {
      Alert.alert('Validação', 'O nome do cliente deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (descontoVal < 0 || descontoVal > 100) {
      Alert.alert('Validação', 'O desconto deve ser entre 0% e 100%.');
      return false;
    }
    
    for (const s of servicosCalculo) {
      if (!s.nome.trim() || s.nome.trim().length < 2) {
        Alert.alert('Validação', `Serviço inválido: descrição deve ter pelo menos 2 caracteres.`);
        return false;
      }
      if (s.quantidade <= 0) {
        Alert.alert('Validação', `Serviço "${s.nome}": quantidade deve ser maior que 0.`);
        return false;
      }
      if (s.precoUnitario < 0) {
        Alert.alert('Validação', `Serviço "${s.nome}": preço não pode ser negativo.`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateLocal()) return;

    // Envia os dados crus (já convertidos para número); o backend recalcula total e subtotal
    const payload: Orcamento = {
      id: isEditing ? orcamentoId! : Math.random().toString(36).substr(2, 9),
      cliente,
      titulo,
      status,
      servicos: servicosCalculo,
      desconto: descontoVal,
      total, // o backend ignora e recalcula, mas mantemos para tipagem
      dataCriacao: new Date().toISOString()
    };

    let success = false;
    if (isEditing) {
      success = await updateOrcamento(payload);
    } else {
      success = await createOrcamento(payload);
    }

    if (success) navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Excluir Orçamento', 'Deseja excluir permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const success = await deleteOrcamento(orcamentoId!);
        if (success) navigation.goBack();
      }}
    ]);
  };

  const isReadOnly = status === 'Pago';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Dados Básicos */}
          <View style={styles.cardSec}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Dados Básicos</Text>
              <StatusBadge status={status} />
            </View>
            
            <Input label="Título (*)" value={titulo} onChangeText={setTitulo} editable={!isReadOnly} />
            <Input label="Cliente (*)" value={cliente} onChangeText={setCliente} editable={!isReadOnly} />
          </View>

          {/* Serviços */}
          <View style={styles.cardSec}>
            <Text style={styles.sectionTitle}>Serviços</Text>
            {servicos.map((item, index) => {
              // Cálculo para exibição em tempo real (baseado no servicosCalculo correspondente)
              const itemCalc = servicosCalculo[index];
              const itemTotal = calcularItem(itemCalc);
              
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemLabel}>Serviço #{index + 1}</Text>
                    {!isReadOnly && (
                      <TouchableOpacity onPress={() => handleRemoveServico(item.id)}>
                        <Text style={styles.deleteText}>Remover</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Input
                    label="Descrição"
                    value={item.nome}
                    onChangeText={(t) => handleChangeServico(item.id, 'nome', t)}
                    editable={!isReadOnly}
                  />
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Input
                        label="Qtde"
                        keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                        value={item.quantidade}
                        onChangeText={(t) => handleChangeServico(item.id, 'quantidade', t)}
                        editable={!isReadOnly}
                      />
                    </View>
                    <View style={styles.col}>
                      <Input
                        label="Vlr Unitário"
                        keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                        value={item.precoUnitario}
                        onChangeText={(t) => handleChangeServico(item.id, 'precoUnitario', t)}
                        editable={!isReadOnly}
                      />
                    </View>
                  </View>
                  {/* Subtotal do item — atualiza em tempo real */}
                  <View style={styles.itemSubtotalRow}>
                    <Text style={styles.itemSubtotalLabel}>Subtotal do item:</Text>
                    <Text style={[styles.itemSubtotalValue, itemTotal > 0 ? styles.valorValido : styles.valorZero]}>
                      R$ {formatBRL(itemTotal)}
                    </Text>
                  </View>
                </View>
              );
            })}
            {!isReadOnly && (
              <Button title="+ Adicionar Serviço" variant="secondary" onPress={handleAddServico} disabled={isLoading} />
            )}
          </View>

          {/* Resultado Final */}
          <View style={styles.cardSec}>
            <Text style={styles.sectionTitle}>Resultado Final</Text>
            <Input
              label="Desconto Geral (%)"
              keyboardType="numeric"
              value={descontoStr}
              onChangeText={setDescontoStr}
              editable={!isReadOnly}
            />
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>R$ {formatBRL(subtotal)}</Text>
              </View>
              {descontoVal > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Desconto ({descontoVal}%)</Text>
                  <Text style={styles.descontoValue}>- R$ {formatBRL(valorDesconto)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.totalFinalRow]}>
                <Text style={styles.totalFinalLabel}>Total Final</Text>
                <Text style={[styles.finalVal, totalValido ? styles.valorValido : styles.valorZero]}>
                  R$ {formatBRL(total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View style={styles.actions}>
            {!isReadOnly ? (
              <Button title="Salvar Orçamento" onPress={handleSave} isLoading={isLoading} />
            ) : (
              <Text style={styles.lockedText}>🔒 Este orçamento está pago e não pode ser editado.</Text>
            )}
            
            {isEditing && !isReadOnly && (
              <Button
                title="Excluir Orçamento"
                variant="danger"
                onPress={handleDelete}
                disabled={isLoading}
                style={{ marginTop: 12 }}
              />
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  cardSec: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#343a40' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusActionsRow: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  statusActionLabel: { fontSize: 14, color: '#868e96', marginBottom: 8, fontWeight: '500' },
  statusButtonsContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statusActionButton: { paddingVertical: 8, paddingHorizontal: 12 },
  itemRow: {
    borderWidth: 1, borderColor: '#e9ecef', padding: 12, borderRadius: 8,
    marginBottom: 16, backgroundColor: '#f8f9fa'
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemLabel: { fontWeight: '600', color: '#495057', fontSize: 14 },
  deleteText: { color: '#e03131', fontWeight: '600', fontSize: 14 },
  row: { flexDirection: 'row', marginHorizontal: -6 },
  col: { flex: 1, paddingHorizontal: 6 },
  itemSubtotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#dee2e6'
  },
  itemSubtotalLabel: { fontSize: 13, color: '#868e96', fontWeight: '500' },
  itemSubtotalValue: { fontSize: 14, fontWeight: '700' },
  totalsContainer: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e9ecef' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  totalFinalRow: { marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#dee2e6' },
  totalLabel: { color: '#868e96', fontSize: 15 },
  totalFinalLabel: { color: '#343a40', fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 15, color: '#343a40', fontWeight: '500' },
  descontoValue: { fontSize: 15, color: '#e03131', fontWeight: '500' },
  finalVal: { fontSize: 22, fontWeight: 'bold' },
  valorValido: { color: '#2b8a3e' },
  valorZero: { color: '#adb5bd' },
  actions: { marginTop: 8 },
  lockedText: {
    backgroundColor: '#fff3bf',
    color: '#f08c00',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ffe066',
  },
});
