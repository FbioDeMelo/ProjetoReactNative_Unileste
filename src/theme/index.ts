// src/theme/index.ts
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2563EB',      // Azul principal
  primaryDark: '#1E40AF',
  secondary: '#64748B',    // Cinza
  background: '#F1F5F9',   // Fundo claro
  surface: '#FFFFFF',      // Branco (Cards)
  text: '#0F172A',         // Texto principal
  textLight: '#64748B',    // Texto secundário
  danger: '#EF4444',       // Vermelho (Excluir/Recusado)
  success: '#10B981',      // Verde (Aprovado)
  warning: '#F59E0B',      // Amarelo/Laranja (Enviado)
  border: '#E2E8F0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
};

// Estilos globais podem ser reutilizados
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    // Sombra leve para dar profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});