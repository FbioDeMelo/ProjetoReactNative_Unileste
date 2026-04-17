import { StatusOrcamento } from '../types';

export const getStatusAcoes = (currentStatus: StatusOrcamento): StatusOrcamento[] => {
  switch (currentStatus) {
    case 'Pendente':
      return ['Aprovado', 'Rejeitado'];
    case 'Aprovado':
      return ['Pago', 'Rejeitado', 'Pendente'];
    case 'Rejeitado':
      return ['Pendente'];
    default:
      return [];
  }
};
