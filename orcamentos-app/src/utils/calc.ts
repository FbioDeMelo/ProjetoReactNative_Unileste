import { ItemServico } from '../types';

/** Subtotal de um único item: quantidade × precoUnitario */
export function calcularItem(item: ItemServico): number {
  const qtd = Math.max(0, item.quantidade || 0);
  const preco = Math.max(0, item.precoUnitario || 0);
  return qtd * preco;
}

/** Soma de todos os itens */
export function calcularSubtotal(servicos: ItemServico[]): number {
  return servicos.reduce((acc, item) => acc + calcularItem(item), 0);
}

/** Valor absoluto do desconto */
export function calcularDesconto(subtotal: number, descontoPercent: number): number {
  const pct = Math.min(100, Math.max(0, descontoPercent || 0));
  return subtotal * (pct / 100);
}

/** Total final: nunca negativo */
export function calcularTotal(subtotal: number, descontoPercent: number): number {
  const total = subtotal - calcularDesconto(subtotal, descontoPercent);
  return Math.max(0, total);
}

/** Formata valor em BRL */
export function formatBRL(value: number): string {
  return value.toFixed(2).replace('.', ',');
}
