import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, globalStyles } from '../theme';
import { Button } from '../components/ui/Button';
import { ItemServico, Orcamento } from '../types';
import { useNavigation } from '@react-navigation/native';
import { getOrcamentos, saveOrcamentos } from '../storage/orcamentoStorage';

export const FormScreen = () => {
  const navigation = useNavigation<any>();

  // 1. Estados Principais
  const [titulo, setTitulo] = useState('');
  const [cliente, setCliente] = useState('');
  const [desconto, setDesconto] = useState('0');
  const [itens, setItens] = useState<ItemServico[]>([]);

  // Estados para adicionar item
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemPreco, setNovoItemPreco] = useState(''); // NOVO: Estado para o preço

  const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
  const valorDesconto = subtotal * (Number(desconto) / 100);
  const total = subtotal - valorDesconto;

  // Função para Adicionar Item
  const handleAddItem = () => {
    if (!novoItemNome.trim()) {
      Alert.alert("Atenção", "Digite o nome do serviço.");
      return;
    }

    // Converte o preço para número. Se estiver vazio, assume 0
    const valor = Number(novoItemPreco) || 0;

    if (valor <= 0) {
       Alert.alert("Atenção", "Digite um valor válido para o serviço.");
       return;
    }

    const novoItem: ItemServico = {
      id: Date.now().toString(),
      descricao: novoItemNome,
      quantidade: 1,
      precoUnitario: valor, // Usa o valor digitado pelo usuário
    };

    setItens([...itens, novoItem]);
    setNovoItemNome('');
    setNovoItemPreco(''); // Limpa o campo de preço também
  };

  const handleRemoveItem = (id: string) => {
    const novaLista = itens.filter(item => item.id !== id);
    setItens(novaLista);
  };

  const handleSave = async () => {
    if (!titulo || !cliente) {
      Alert.alert("Atenção", "Preencha o Título e o Cliente.");
      return;
    }

    const novoOrcamento: Orcamento = {
      id: Date.now().toString(),
      cliente,
      titulo,
      itens,
      percentualDesconto: Number(desconto),
      status: 'Rascunho',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    try {
      const listaAtual = await getOrcamentos();
      const novaLista = [...listaAtual, novoOrcamento];
      await saveOrcamentos(novaLista);
      
      Alert.alert("Sucesso", "Orçamento salvo com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

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
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Cliente</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nome do cliente"
            placeholderTextColor={colors.textLight}
            value={cliente}
            onChangeText={setCliente}
          />
        </View>

        {/* Seção 2: Adicionar Item (ATUALIZADA) */}
        <View style={globalStyles.card}>
          <Text style={styles.sectionTitle}>Adicionar Serviço</Text>
          
          <View style={styles.addItemRow}>
            {/* Input Nome */}
            <TextInput 
              style={[styles.input, styles.inputFlex]}
              placeholder="Nome do serviço"
              value={novoItemNome}
              onChangeText={setNovoItemNome}
            />
            
            {/* Input Preço (NOVO) */}
            <TextInput 
              style={[styles.input, styles.inputPreco]}
              placeholder="R$ 0,00"
              keyboardType="decimal-pad" // Teclado numérico com ponto/vírgula
              value={novoItemPreco}
              onChangeText={setNovoItemPreco}
            />

            {/* Botão Adicionar */}
            <Button 
              title="+" 
              onPress={handleAddItem} 
              style={styles.buttonAdd} 
            />
          </View>
        </View>

        {/* Seção 3: Lista de Itens */}
        <View style={globalStyles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Itens do Serviço ({itens.length})</Text>
          </View>
          
          {itens.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum item adicionado.</Text>
          ) : (
            itens.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.descricao}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantidade}x {formatMoney(item.precoUnitario)}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemTotal}>{formatMoney(item.quantidade * item.precoUnitario)}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Seção 4: Resumo Financeiro */}
        <View style={globalStyles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto ({desconto}%):</Text>
            <TextInput 
              style={[styles.inputSmall, { textAlign: 'right' }]} 
              placeholder="0" 
              keyboardType="numeric"
              value={desconto}
              onChangeText={setDesconto}
            />
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Final:</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          <Button title="Salvar Rascunho" variant="outline" onPress={handleSave} style={{ flex: 1, marginRight: 10 }} />
          <Button title="Salvar" onPress={handleSave} style={{ flex: 1 }} />
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
    height: 48, 
  },
  inputFlex: {
    flex: 1, // Ocupa o espaço disponível
    marginRight: 5,
  },
  inputPreco: {
    width: 100, // Largura fixa para o preço
    marginRight: 5,
    textAlign: 'right', // Alinha o preço à direita
  },
  buttonAdd: {
    width: 50, 
    height: 48 
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
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
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
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
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
  itemActions: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  removeText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    alignItems: 'center',
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