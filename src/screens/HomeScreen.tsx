import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Orcamento, StatusOrcamento } from '../types';
import { colors, spacing, borderRadius } from '../theme';
import { OrcamentoCard } from '../components/list/OrcamentoCard';
import { Button } from '../components/ui/Button';

const dadosExemplo: Orcamento[] = [
  {
    id: '1',
    cliente: 'Loja de Móveis XYZ',
    titulo: 'Projeto Sala de Estar',
    status: 'Rascunho',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    itens: [
      { id: 'i1', descricao: 'Sofá', quantidade: 1, precoUnitario: 2500 },
      { id: 'i2', descricao: 'Mesa de Centro', quantidade: 1, precoUnitario: 800 }
    ],
  },
  {
    id: '2',
    cliente: 'Consultoria Tech',
    titulo: 'Manutenção PCs',
    status: 'Aprovado',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    itens: [
      { id: 'i3', descricao: 'Formatação', quantidade: 5, precoUnitario: 150 },
      { id: 'i4', descricao: 'Troca HD', quantidade: 2, precoUnitario: 300 }
    ],
  },
  {
    id: '3',
    cliente: 'Maria Silva',
    titulo: 'Cadeiras Escritório',
    status: 'Enviado',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    itens: [
      { id: 'i5', descricao: 'Cadeira Ergonomica', quantidade: 4, precoUnitario: 600 }
    ],
  },
];

export const HomeScreen = () => {
  const [filter, setFilter] = useState<StatusOrcamento | 'Todos'>('Todos');
  const [searchText, setSearchText] = useState('');

 
  const filteredData = dadosExemplo.filter(item => {
    const matchesStatus = filter === 'Todos' || item.status === filter;
    const matchesSearch = item.titulo.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.cliente.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const draftCount = dadosExemplo.filter(i => i.status === 'Rascunho').length;

  const renderOrcamento = ({ item }: { item: Orcamento }) => (
    <TouchableOpacity onPress={() => console.log('Navegar para detalhes', item.id)}>
      <OrcamentoCard orcamento={item} onPress={() => {}} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* Cabeçalho Principal */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orçamentos</Text>
        <TouchableOpacity>
           <Text style={styles.novoBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Aviso de Rascunhos */}
      {draftCount > 0 && (
        <View style={styles.draftBanner}>
          <Text style={styles.draftText}>
            Você tem {draftCount} {draftCount === 1 ? 'item' : 'itens'} em rascunho
          </Text>
        </View>
      )}

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar orçamento ou cliente..."
          placeholderTextColor={colors.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filtros de Status */} 
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {['Todos', 'Rascunho', 'Enviado', 'Aprovado', 'Recusado'].map((status) => (
          <TouchableOpacity 
            key={status}
            style={[
              styles.filterChip, 
              filter === status && styles.filterChipActive
            ]}
            onPress={() => setFilter(status as StatusOrcamento | 'Todos')}
          >
            <Text style={[
              styles.filterText,
              filter === status && styles.filterTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderOrcamento}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text>
        }
      />

      {}
      <View style={styles.fabContainer}>
        <Button title="+ Novo Orçamento" onPress={() => console.log('Criar novo')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  novoBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  draftBanner: {
    backgroundColor: '#FEF3C7', 
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  draftText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterScroll: {
    marginBottom: spacing.md,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100, 
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.xl,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
});