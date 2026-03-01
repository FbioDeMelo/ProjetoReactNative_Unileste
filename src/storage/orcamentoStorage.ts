import AsyncStorage from '@react-native-async-storage/async-storage';
import { Orcamento } from '../types';

const KEY = '@webtester:orcamentos';

// Salvar a lista inteira (Sobrescrita)
export async function saveOrcamentos(data: Orcamento[]) {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(KEY, jsonValue);
  } catch (e) {
    console.error("Erro ao salvar", e);
  }
}

// Carregar a lista
export async function getOrcamentos(): Promise<Orcamento[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Erro ao carregar", e);
    return [];
  }
}