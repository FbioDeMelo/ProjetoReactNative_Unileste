# 🚀 BudgetFlow

**BudgetFlow** é um ecossistema completo para gestão de orçamentos e serviços, desenvolvido para ser rápido, moderno e confiável. O sistema centraliza toda a lógica de negócio no servidor, garantindo cálculos precisos e integridade de dados através de um fluxo de status controlado.

---

## ✨ Funcionalidades

- **💎 Interface Moderna**: Design premium com Floating Action Button (FAB), cards minimalistas e UX refinada.
- **⚡ Atualização Rápida**: Altere o status de orçamentos diretamente da lista principal via modal intuitivo.
- **🔒 Fluxo de Status**: Máquina de estados que impede transições inválidas (ex: de Pago para Pendente).
- **🧮 Cálculos Centralizados**: O backend é a fonte única de verdade para subtotais, descontos e totais finais.
- **🔍 Filtros Avançados**: Busca por cliente/título e filtragem por categorias de status.
- **📱 Multiplataforma**: Funciona perfeitamente em Android, iOS e Web.
- **🚀 Performance**: Atualizações otimistas no frontend usando **Zustand** para uma sensação de velocidade instantânea.

---

## 🛠️ Tecnologias

### **Frontend (App)**
- **React Native / Expo**
- **Zustand** (Estado Global & Persistência)
- **React Navigation** (Navegação Stack)
- **Axios** (Integração com API)

### **Backend (Servidor)**
- **Node.js + Express**
- **SQLite** (Banco de Dados embutido)
- **Zod** (Validação rigorosa de esquemas)
- **CORS** (Habilitado para comunicações seguras)

---

## 🚀 Como Rodar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/budgetflow.git
cd budgetflow
```

### 2. Configurar o Backend
```bash
cd orcamentos-node
npm install
node server.js
```
*O servidor rodará em `http://localhost:8080`*

### 3. Configurar o Frontend
```bash
cd orcamentos-app
npm install
# No arquivo src/services/api.ts, certifique-se de que o IP está correto para seu dispositivo móvel
npx expo start
```
*Pressione `w` para abrir na Web ou escaneie o QR Code com o app **Expo Go** no celular.*

---

## 🏗️ Estrutura do Projeto

```text
├── orcamentos-app/        # App React Native
│   ├── src/
│   │   ├── components/    # Componentes UI reutilizáveis
│   │   ├── screens/       # Telas da aplicação
│   │   ├── store/         # Gerenciamento de estado (Zustand)
│   │   ├── utils/         # Cálculos e lógica compartilhada
│   │   └── services/      # Configurações de API (Axios)
└── orcamentos-node/       # API Express
    ├── server.js          # Lógica das rotas e validações
    └── database.js        # Configuração do SQLite
```

---

## 📝 Regras de Negócio Importantes

1.  **Bloqueio de Edição**: Orçamentos com status **Pago** tornam-se imutáveis e não podem mais ser editados ou excluídos.
2.  **Cálculos**: O frontend envia apenas os valores brutos; o backend recalcula tudo para evitar fraudes ou erros de arredondamento.
3.  **Transições de Status**:
    *   `Pendente` ↔ `Aprovado`
    *   `Pendente` ↔ `Rejeitado`
    *   `Aprovado` → `Pago`

---

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ❤️ para facilitar a vida de prestadores de serviço.
