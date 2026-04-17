import { Alert as RNAlert, Platform } from 'react-native';

export const Alert = {
  alert: (title: string, message?: string, buttons?: { text: string; onPress?: () => void; style?: string }[]) => {
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 1) {
        // Assume it's a confirmation if there are multiple buttons
        const confirmText = buttons.find(b => b.style === 'destructive' || b.text.toLowerCase() === 'excluir' || b.text.toLowerCase() === 'sim')?.text || 'Confirmar';
        const result = window.confirm(`${title}\n\n${message || ''}`);
        if (result) {
          const confirmBtn = buttons.find(b => b.style === 'destructive' || b.text.toLowerCase() === 'excluir' || b.text.toLowerCase() === 'sim') || buttons[1];
          if (confirmBtn?.onPress) confirmBtn.onPress();
        } else {
          const cancelBtn = buttons.find(b => b.style === 'cancel' || b.text.toLowerCase() === 'cancelar') || buttons[0];
          if (cancelBtn?.onPress) cancelBtn.onPress();
        }
      } else {
        // Simple alert
        window.alert(`${title}\n\n${message || ''}`);
        if (buttons && buttons[0]?.onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      RNAlert.alert(title, message, buttons);
    }
  }
};
