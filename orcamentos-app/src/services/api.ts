import axios from 'axios';
import { Platform } from 'react-native';

// Na Web, o navegador consegue acessar o localhost direto.
// No mobile físico, precisa do IP real da máquina.
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080/api'
  : 'http://192.168.10.150:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
