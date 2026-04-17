import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, StatusOrcamento } from '../types';
import { useBudgetStore } from '../store/useBudgetStore';
import { BudgetCard } from '../components/BudgetCard';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { StatusModal } from '../components/StatusModal';
import { StatusBadge } from '../components/StatusBadge'; 

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { orcamentos, deleteOrcamento, fetchOrcamentos, isLoading, changeStatus } = useBudgetStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | StatusOrcamento>('Todos');

  const statuses: ('Todos' | StatusOrcamento)[] = ['Todos', 'Pendente', 'Aprovado', 'Pago', 'Rejeitado'];

  // Carregar do Back-End quando rodar
  useEffect(() => {
    fetchOrcamentos();
  }, [fetchOrcamentos]);

  const handleCreateNew = () => {
    navigation.navigate('FormOrcamento', {});
  };

  const handleEdit = (id: string) => {
    navigation.navigate('FormOrcamento', { orcamentoId: id });
  };

  const attemptDelete = (id: string) => {
    setSelectedId(id);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      await deleteOrcamento(selectedId);
    }
    setModalVisible(false);
    setSelectedId(null);
  };

  const openStatusModal = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async (newStatus: StatusOrcamento) => {
    if (selectedOrcamento) {
      const success = await changeStatus(selectedOrcamento.id, newStatus);
      if (success) {
        setStatusModalVisible(false);
        setSelectedOrcamento(null);
      }
    }
  };

  const filteredOrcamentos = orcamentos.filter(orc => {
    const matchBusca = orc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       orc.cliente.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'Todos' ? true : orc.status === statusFilter;
    return matchBusca && matchStatus;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar por título ou cliente..."
            placeholderTextColor="#adb5bd"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.chipsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {statuses.map((statusOp) => {
              const isSelected = statusFilter === statusOp;
              return (
                <TouchableOpacity 
                  key={statusOp} 
                  style={[styles.chip, isSelected && styles.chipSelected]} 
                  onPress={() => setStatusFilter(statusOp)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {statusOp}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredOrcamentos}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={fetchOrcamentos}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
               <ActivityIndicator size="large" color="#007AFF"/>
            ) : (
                <>
                  <Text style={styles.emptyTitle}>
                    {orcamentos.length === 0 ? "Nenhum orçamento ainda" : "Nenhum resultado"}
                  </Text>
                  <Text style={styles.emptySub}>
                    {orcamentos.length === 0 
                      ? "Crie seu primeiro orçamento para começar. Ele será salvo no Banco de Dados embutido."
                      : "Tente usar outras palavras-chave ou mude o filtro de status."}
                  </Text>
                </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <BudgetCard 
            orcamento={item} 
            onPress={() => handleEdit(item.id)} 
            onLongPress={() => attemptDelete(item.id)}
            onStatusPress={() => openStatusModal(item)}
          />
        )}
      />
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleCreateNew} 
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmModal 
        visible={modalVisible}
        title="Excluir Orçamento"
        message="Tem certeza que deseja excluir da Base de Dados?"
        onCancel={() => setModalVisible(false)}
        onConfirm={confirmDelete}
      />

      <StatusModal
        visible={statusModalVisible}
        currentStatus={selectedOrcamento?.status || null}
        onClose={() => setStatusModalVisible(false)}
        onUpdate={handleUpdateStatus}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerSection: { 
    paddingTop: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f3f5' 
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: { 
    backgroundColor: '#f8f9fa', 
    paddingHorizontal: 18, 
    paddingVertical: 14, 
    borderRadius: 12, 
    fontSize: 16, 
    color: '#1a1a1a',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  chipsWrapper: { 
    marginBottom: 16,
  },
  chipsScroll: { paddingHorizontal: 16 },
  chip: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: '#f8f9fa', 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#f1f3f5' 
  },
  chipSelected: { 
    backgroundColor: '#1a1a1a', 
    borderColor: '#1a1a1a' 
  },
  chipText: { 
    fontSize: 13, 
    color: '#495057', 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chipTextSelected: { color: '#ffffff' },
  listContent: { padding: 16, paddingBottom: 100, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#adb5bd', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  }
});
