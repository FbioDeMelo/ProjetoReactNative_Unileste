// src/types/index.ts

// 1. Tipo de Status do Orçamento
export type StatusOrcamento =
  | 'Rascunho'
  | 'Enviado'
  | 'Aprovado'
  | 'Recusado';

// 2. Modelo de Item de Serviço
export interface ItemServico {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
}

// 3. Modelo de Orçamento
export interface Orcamento {
  id: string;
  cliente: string;
  titulo: string;
  itens: ItemServico[];
  percentualDesconto?: number; // Opcional
  status: StatusOrcamento;
  dataCriacao: string;
  dataAtualizacao: string;
}