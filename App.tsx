import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { FormScreen } from './src/screens/FormScreen';

// Criando o navegador do tipo "Pilha" (Stack)
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
        {/* TELA 1: HOME (Lista) */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} // Esconde a barra de título padrão, pois fizemos a nossa
        />

        {/* TELA 2: FORM (Criação) */}
        <Stack.Screen 
          name="Form" 
          component={FormScreen} 
          options={{ 
            title: 'Novo Orçamento',
            headerStyle: { backgroundColor: '#2563EB' }, // Azul do tema
            headerTintColor: '#FFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
