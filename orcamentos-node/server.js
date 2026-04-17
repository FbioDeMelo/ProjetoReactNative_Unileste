import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { openDb } from './database.js';

const app = express();
app.use(express.json());
app.use(cors());

// --- SCHEMAS DE VALIDAÇÃO (Zod) ---

const ItemServicoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, "A descrição do serviço precisa ter pelo menos 2 caracteres"),
  quantidade: z.number().min(1, "A quantidade deve ser pelo menos 1"),
  precoUnitario: z.number().min(0, "O preço não pode ser negativo"),
});

const OrcamentoSchema = z.object({
  id: z.string().optional(),
  cliente: z.string().trim().min(3, "O nome do cliente precisa ter pelo menos 3 caracteres"),
  titulo: z.string().trim().min(3, "O título precisa ter pelo menos 3 caracteres"),
  status: z.string(),
  desconto: z.number().min(0).max(100).optional().default(0),
  // total e subtotal enviados pelo frontend são IGNORADOS — backend recalcula
  total: z.number().optional(),
  subtotal: z.number().optional(),
  dataCriacao: z.string().optional(),
  servicos: z.array(ItemServicoSchema).optional().default([]),
});

// --- LÓGICA DE CÁLCULO NO SERVIDOR (fonte única de verdade) ---

function calcularTotais(servicos, descontoPct) {
  const subtotal = servicos.reduce((acc, s) => acc + (s.quantidade * s.precoUnitario), 0);
  const descontoAplicado = subtotal * (Math.min(100, Math.max(0, descontoPct || 0)) / 100);
  const total = Math.max(0, subtotal - descontoAplicado);
  return { subtotal, total };
}

// --- MIDDLEWARE DE VALIDAÇÃO ---

const validateMiddleware = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path.join('.')] = err.message;
      });
      return res.status(400).json(formattedErrors);
    }
    return res.status(500).json({ general: "Internal Validation Error" });
  }
};

// --- ROTAS ---

// GET — Listar todos com serviços
app.get('/api/orcamentos', async (req, res) => {
  try {
    const db = await openDb();
    const orcamentosMap = new Map();

    const orcs = await db.all('SELECT * FROM orcamentos ORDER BY dataCriacao DESC');
    for (let o of orcs) {
      o.servicos = [];
      orcamentosMap.set(o.id, o);
    }

    const servs = await db.all('SELECT * FROM servicos');
    for (let s of servs) {
      const parent = orcamentosMap.get(s.orcamento_id);
      if (parent) parent.servicos.push(s);
    }

    res.json(Array.from(orcamentosMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao ler o banco de dados");
  }
});

// POST — Criar (servidor recalcula total e subtotal)
app.post('/api/orcamentos', validateMiddleware(OrcamentoSchema), async (req, res) => {
  const db = await openDb();
  const data = req.body;
  const newId = data.id || uuidv4();
  const dataCriacao = data.dataCriacao || new Date().toISOString();

  // 🔒 Backend é a fonte de verdade dos cálculos
  const { subtotal, total } = calcularTotais(data.servicos, data.desconto);

  try {
    await db.run('BEGIN TRANSACTION');

    await db.run(
      'INSERT INTO orcamentos (id, cliente, titulo, status, desconto, subtotal, total, dataCriacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, data.cliente, data.titulo, data.status, data.desconto, subtotal, total, dataCriacao]
    );

    for (let s of data.servicos) {
      await db.run(
        'INSERT INTO servicos (id, orcamento_id, nome, quantidade, precoUnitario) VALUES (?, ?, ?, ?, ?)',
        [s.id || uuidv4(), newId, s.nome, s.quantidade, s.precoUnitario]
      );
    }

    await db.run('COMMIT');
    res.status(201).json({ ...data, id: newId, dataCriacao, subtotal, total });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: "Erro interno ao salvar" });
  }
});

const STATUS_FLOW = {
  Pendente: ['Aprovado', 'Rejeitado'],
  Aprovado: ['Pago', 'Rejeitado', 'Pendente'],
  Rejeitado: ['Pendente'],
  Pago: []
};

// PUT — Atualizar (servidor recalcula total e subtotal)
app.put('/api/orcamentos/:id', validateMiddleware(OrcamentoSchema), async (req, res) => {
  const db = await openDb();
  const idTarget = req.params.id;
  const data = req.body;

  try {
    // Validação do fluxo de status e bloqueio de edição 'Pago'
    const row = await db.get('SELECT status FROM orcamentos WHERE id = ?', [idTarget]);
    
    if (row && row.status === 'Pago') {
      return res.status(403).json({ error: "Orçamentos pagos não podem mais ser alterados." });
    }

    if (row && data.status && data.status !== row.status) {
      const statusAtual = row.status;
      const permitido = STATUS_FLOW[statusAtual] || [];
      if (!permitido.includes(data.status)) {
        return res.status(400).json({ error: `Não pode mudar de ${statusAtual} para ${data.status}` });
      }
    }

    await db.run('BEGIN TRANSACTION');

    // 🔒 Backend recalcula — ignora total/subtotal enviado
    const { subtotal, total } = calcularTotais(data.servicos, data.desconto);

    await db.run(
      'UPDATE orcamentos SET cliente = ?, titulo = ?, status = ?, desconto = ?, subtotal = ?, total = ? WHERE id = ?',
      [data.cliente, data.titulo, data.status, data.desconto, subtotal, total, idTarget]
    );

    // Delete + reinsert dos serviços
    await db.run('DELETE FROM servicos WHERE orcamento_id = ?', [idTarget]);

    for (let s of data.servicos) {
      await db.run(
        'INSERT INTO servicos (id, orcamento_id, nome, quantidade, precoUnitario) VALUES (?, ?, ?, ?, ?)',
        [s.id || uuidv4(), idTarget, s.nome, s.quantidade, s.precoUnitario]
      );
    }

    await db.run('COMMIT');
    res.json({ ...data, id: idTarget, subtotal, total });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: "Erro interno ao atualizar" });
  }
});

// DELETE
app.delete('/api/orcamentos/:id', async (req, res) => {
  try {
    const db = await openDb();
    await db.run('DELETE FROM orcamentos WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ao deletar");
  }
});

app.listen(8080, () => {
  console.log('✅ BudgetFlow Backend v1.1 | Node + SQLite na porta 8080');
  console.log('🔒 Cálculos centralizados no servidor');
});
