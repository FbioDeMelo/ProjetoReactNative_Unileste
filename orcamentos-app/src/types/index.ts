export type StatusOrcamento = 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Pago';

export interface ItemServico {
  id: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Orcamento {
  id: string;
  cliente: string;
  titulo: string;
  status: StatusOrcamento;
  servicos: ItemServico[];
  desconto: number; // Porcentagem de desconto (0 a 100)
  total: number; // Valor final calculado: subtotal - desconto
  dataCriacao: string; // ISO format string
}

// Vuex, Redux or Zustand states were moved to their specific files.

// React Navigation Types
export type RootStackParamList = {
  Home: undefined;
  FormOrcamento: { orcamentoId?: string }; // if undefined, it's a new orcamento
};
