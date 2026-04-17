import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusOrcamento } from '../types';
import { getStatusAcoes } from '../utils/status';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

interface StatusModalProps {
  visible: boolean;
  currentStatus: StatusOrcamento | null;
  onClose: () => void;
  onUpdate: (newStatus: StatusOrcamento) => void;
  isLoading?: boolean;
}

export function StatusModal({ visible, currentStatus, onClose, onUpdate, isLoading }: StatusModalProps) {
  if (!currentStatus) return null;

  const acoes = getStatusAcoes(currentStatus);

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Atualizar Status</Text>
            <StatusBadge status={currentStatus} />
          </View>

          <Text style={styles.subtitle}>
            {acoes.length > 0 
              ? 'Selecione o novo status para este orçamento:' 
              : 'Este orçamento já está em um status final.'}
          </Text>

          <View style={styles.actions}>
            {acoes.map((status) => (
              <Button
                key={status}
                title={status}
                variant={status === 'Rejeitado' ? 'danger' : 'secondary'}
                onPress={() => onUpdate(status)}
                isLoading={isLoading}
                style={styles.button}
              />
            ))}
            
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  subtitle: {
    fontSize: 14,
    color: '#868e96',
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  closeBtn: {
    marginTop: 8,
    alignItems: 'center',
    padding: 12,
  },
  closeBtnText: {
    color: '#868e96',
    fontSize: 16,
    fontWeight: '500',
  }
});
