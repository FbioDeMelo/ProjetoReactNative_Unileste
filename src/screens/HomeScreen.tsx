import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Orcamento, StatusOrcamento } from '../types';
import { colors, spacing, borderRadius } from '../theme';
import { OrcamentoCard } from '../components/list/OrcamentoCard';
import { Button } from '../components/ui/Button';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { getOrcamentos, saveOrcamentos } from '../storage/orcamentoStorage';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filter, setFilter] = useState<StatusOrcamento | 'Todos'>('Todos');
  const [searchText, setSearchText] = useState('');

  const loadOrcamentos = async () => {
    try {
      const data = await getOrcamentos();
      setOrcamentos(data);
    } catch (error) {
      console.error("Erro ao carregar orçamentos", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrcamentos();
    }, [])
  );

  const handleStatusChange = async (id: string, novoStatus: StatusOrcamento) => {
    try {
      const listaAtualizada = orcamentos.map(item => {
        if (item.id === id) {
          return { ...item, status: novoStatus, dataAtualizacao: new Date().toISOString() };
        }
        return item;
      });

      await saveOrcamentos(listaAtualizada);
      setOrcamentos(listaAtualizada);
      Alert.alert("Sucesso", `Orçamento marcado como ${novoStatus}`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Excluir Orçamento",
      "Tem certeza que deseja apagar este orçamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const novaLista = orcamentos.filter(item => item.id !== id);
            setOrcamentos(novaLista);
            await saveOrcamentos(novaLista);
          }
        }
      ]
    );
  };

  const filteredData = orcamentos.filter(item => {
    const matchesStatus = filter === 'Todos' || item.status === filter;
    const matchesSearch = item.titulo.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.cliente.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const draftCount = orcamentos.filter(i => i.status === 'Rascunho').length;

  const renderOrcamento = ({ item }: { item: Orcamento }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => {
        // VERIFICAÇÃO: Só permite mudar status se for Rascunho
        if (item.status === 'Rascunho') {
          Alert.alert(
            `Orçamento: ${item.titulo}`,
            `Cliente: ${item.cliente}\nTotal: ${item.itens.reduce((a,b)=>a+(b.quantidade*b.precoUnitario),0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`,
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Recusar",
                style: "destructive",
                onPress: () => handleStatusChange(item.id, 'Recusado')
              },
              {
                text: "Aprovar",
                onPress: () => handleStatusChange(item.id, 'Aprovado')
              }
            ],
            { cancelable: true }
          );
        } else {
          // CASO CONTRÁRIO: Apenas mostra detalhes e bloqueia a ação
          Alert.alert(
            "Orçamento Finalizado",
            `Status: ${item.status}\nCliente: ${item.cliente}\nTotal: ${item.itens.reduce((a,b)=>a+(b.quantidade*b.precoUnitario),0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}\n\nEste orçamento já foi finalizado e não pode ter o status alterado.`,
            [{ text: "OK", style: "default" }]
          );
        }
      }}
      onLongPress={() => handleDelete(item.id)} 
    >
      <OrcamentoCard orcamento={item} onPress={() => {}} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* Cabeçalho Principal */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orçamentos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Form')}>
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

      {/* Lista */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderOrcamento}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{paddingTop: 50}}>
             <Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text>
             <Text style={styles.emptySubText}>Vá em "+ Novo" para criar o primeiro!</Text>
          </View>
        }
        refreshing={false}
        onRefresh={loadOrcamentos}
      />

      {/* Botão Flutuante */}
      <View style={styles.fabContainer}>
        <Button 
          title="+ Novo Orçamento" 
          onPress={() => navigation.navigate('Form')} 
        />
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
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 16,
    marginTop: spacing.xl,
  },
  emptySubText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
    marginTop: 5,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
});