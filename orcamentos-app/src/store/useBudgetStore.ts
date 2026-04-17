import { create } from 'zustand';
import { api } from '../services/api';
import { Orcamento, StatusOrcamento } from '../types';
import { Alert } from '../utils/alert';

export interface BudgetStoreState {
  orcamentos: Orcamento[];
  isLoading: boolean;
  error: string | null;
  fetchOrcamentos: () => Promise<void>;
  createOrcamento: (orcamento: Orcamento) => Promise<boolean>;
  updateOrcamento: (orcamento: Orcamento) => Promise<boolean>;
  deleteOrcamento: (id: string) => Promise<boolean>;
  changeStatus: (id: string, status: StatusOrcamento) => Promise<boolean>;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetStoreState>((set, get) => ({
  orcamentos: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchOrcamentos: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Orcamento[]>('/orcamentos');
      set({ orcamentos: response.data, isLoading: false });
    } catch (error) {
      const msg = 'Não foi possível carregar os orçamentos da API.';
      set({ isLoading: false, error: msg });
      Alert.alert('Erro de conexão', msg);
    }
  },

  createOrcamento: async (orcamento: Orcamento) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Orcamento>('/orcamentos', orcamento);
      const novo = response.data;
      // Atualização otimista: insere no topo imediatamente
      set((state) => ({
        orcamentos: [novo, ...state.orcamentos],
        isLoading: false,
      }));
      Alert.alert('Sucesso', 'Orçamento criado com sucesso!');
      return true;
    } catch (error: any) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : 'Falha de comunicação com servidor ao salvar.';
      set({ isLoading: false, error: msg });
      Alert.alert('Erro de Validação', msg);
      return false;
    }
  },

  updateOrcamento: async (orcamento: Orcamento) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Orcamento>(`/orcamentos/${orcamento.id}`, orcamento);
      const atualizado = response.data;
      set((state) => ({
        orcamentos: state.orcamentos.map((o) => o.id === orcamento.id ? atualizado : o),
        isLoading: false,
      }));
      Alert.alert('Sucesso', 'Orçamento atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : 'Falha ao atualizar o orçamento no Backend.';
      set({ isLoading: false, error: msg });
      Alert.alert('Erro de Validação', msg);
      return false;
    }
  },

  deleteOrcamento: async (id: string) => {
    // Atualização otimista: remove da lista antes da resposta
    const backup = get().orcamentos;
    set((state) => ({
      orcamentos: state.orcamentos.filter((o) => o.id !== id),
      isLoading: true,
    }));
    try {
      await api.delete(`/orcamentos/${id}`);
      set({ isLoading: false });
      Alert.alert('Sucesso', 'Orçamento excluído permanentemente.');
      return true;
    } catch (error) {
      // Reverte em caso de falha
      set({ orcamentos: backup, isLoading: false, error: 'Falha ao deletar.' });
      Alert.alert('Erro', 'Não foi possível excluir o orçamento.');
      return false;
    }
  },

  changeStatus: async (id: string, status: StatusOrcamento) => {
    const target = get().orcamentos.find((o) => o.id === id);
    if (!target) return false;
    // Atualização otimista no status
    set((state) => ({
      orcamentos: state.orcamentos.map((o) => o.id === id ? { ...o, status } : o),
    }));
    try {
      const response = await api.put<Orcamento>(`/orcamentos/${id}`, { ...target, status });
      set((state) => ({
        orcamentos: state.orcamentos.map((o) => o.id === id ? response.data : o),
      }));
      return true;
    } catch (error) {
      // Reverte o status em caso de erro
      set((state) => ({
        orcamentos: state.orcamentos.map((o) => o.id === id ? target : o),
        error: 'Falha ao mudar status.',
      }));
      return false;
    }
  },
}));
