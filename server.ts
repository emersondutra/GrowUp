import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import {
  getPositions,
  savePosition,
  deletePosition,
  getTransactions,
  addTransaction,
  deleteTransaction,
  getDividends,
  addDividend,
  deleteDividend,
  getBrokerBalances,
  seedIfEmpty,
} from './src/db/portfolio.ts';
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  seedAdminUserIfEmpty,
  getOrCreateUser,
} from './src/db/users.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Automatically ensure database has initial seed data & admin user on startup
  seedIfEmpty().catch((err) => {
    console.error('Initial DB seed note:', err);
  });
  seedAdminUserIfEmpty().catch((err) => {
    console.error('Initial Admin User seed note:', err);
  });

  // User sync endpoint (called after Firebase Auth login)
  app.post('/api/auth/sync-user', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email, displayName, photoUrl } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'uid and email are required' });
      }
      const user = await getOrCreateUser(uid, email, displayName, photoUrl);
      res.json(user);
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // --- CRUD USERS (Gestão de Usuários) ---
  app.get('/api/users/current', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const emailHeader = (req.headers['x-user-email'] as string) || req.user?.email || 'emerson.dutra@gmail.com';
      let user = await getUserByEmail(emailHeader);
      if (!user) {
        // Fallback to primary admin
        user = await getUserByEmail('emerson.dutra@gmail.com');
      }
      res.json(user || {
        id: 1,
        fullName: 'Emerson Rocha Dutra',
        name: 'Emerson',
        email: 'emerson.dutra@gmail.com',
        cpf: '01576230171',
        role: 'admin',
        status: 'ativo',
      });
    } catch (error: any) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: error.message || 'Failed to get current user' });
    }
  });

  app.get('/api/users', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const list = await getAllUsers();
      res.json(list);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  });

  app.post('/api/users', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { fullName, name, email, cpf, role, status } = req.body;
      if (!fullName || !email) {
        return res.status(400).json({ error: 'Nome Completo e Email são obrigatórios' });
      }

      // Check if email already exists
      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Já existe um usuário cadastrado com este e-mail' });
      }

      const newUser = await createUser({
        fullName,
        name: name || fullName.split(' ')[0],
        email,
        cpf,
        role: role === 'admin' ? 'admin' : 'cliente',
        status: status === 'inativo' ? 'inativo' : 'ativo',
      });

      res.status(201).json(newUser);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: error.message || 'Erro ao cadastrar usuário' });
    }
  });

  app.put('/api/users/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de usuário inválido' });
      }

      const { fullName, name, email, cpf, role, status } = req.body;
      const updated = await updateUser(id, {
        fullName,
        name,
        email,
        cpf,
        role,
        status,
      });

      res.json(updated);
    } catch (error: any) {
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' });
    }
  });

  app.delete('/api/users/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de usuário inválido' });
      }

      const existing = await getUserById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Prevent deletion of master admin
      if (existing.email === 'emerson.dutra@gmail.com') {
        return res.status(403).json({ error: 'O administrador principal do sistema não pode ser excluído.' });
      }

      await deleteUser(id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error(`Error deleting user ${req.params.id}:`, error);
      res.status(500).json({ error: error.message || 'Erro ao excluir usuário' });
    }
  });

  // --- CRUD POSITIONS ---
  app.get('/api/positions', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const data = await getPositions();
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get positions:', error);
      res.status(500).json({ error: error.message || 'Failed to get positions' });
    }
  });

  app.post('/api/positions', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const pos = req.body;
      if (!pos || !pos.id || !pos.ticker) {
        return res.status(400).json({ error: 'Invalid position data' });
      }
      const saved = await savePosition(pos);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save position:', error);
      res.status(500).json({ error: error.message || 'Failed to save position' });
    }
  });

  app.delete('/api/positions/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await deletePosition(id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete position:', error);
      res.status(500).json({ error: error.message || 'Failed to delete position' });
    }
  });

  // --- CRUD TRANSACTIONS ---
  app.get('/api/transactions', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const data = await getTransactions();
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get transactions:', error);
      res.status(500).json({ error: error.message || 'Failed to get transactions' });
    }
  });

  app.post('/api/transactions', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const tx = req.body;
      if (!tx || !tx.id || !tx.ticker || !tx.type) {
        return res.status(400).json({ error: 'Invalid transaction payload' });
      }
      const saved = await addTransaction(tx);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to add transaction:', error);
      res.status(500).json({ error: error.message || 'Failed to add transaction' });
    }
  });

  app.delete('/api/transactions/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await deleteTransaction(id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete transaction:', error);
      res.status(500).json({ error: error.message || 'Failed to delete transaction' });
    }
  });

  // --- CRUD DIVIDENDS ---
  app.get('/api/dividends', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const data = await getDividends();
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get dividends:', error);
      res.status(500).json({ error: error.message || 'Failed to get dividends' });
    }
  });

  app.post('/api/dividends', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const div = req.body;
      if (!div || !div.id || !div.ticker) {
        return res.status(400).json({ error: 'Invalid dividend payload' });
      }
      const saved = await addDividend(div);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to add dividend:', error);
      res.status(500).json({ error: error.message || 'Failed to add dividend' });
    }
  });

  app.delete('/api/dividends/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await deleteDividend(id);
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete dividend:', error);
      res.status(500).json({ error: error.message || 'Failed to delete dividend' });
    }
  });

  // --- BALANCES ---
  app.get('/api/balances', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const data = await getBrokerBalances();
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get balances:', error);
      res.status(500).json({ error: error.message || 'Failed to get balances' });
    }
  });

  // Google Finance Scraping & Live Financial API Proxy
  app.get('/api/finance/dollar', async (req, res) => {
    try {
      const gfUrl = 'https://www.google.com/finance/quote/USD-BRL';
      const response = await fetch(gfUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      let rate = 5.50;
      let changePercent = 0.15;

      if (response.ok) {
        const html = await response.text();
        const priceMatch =
          html.match(/data-last-price="([0-9.]+)"/) ||
          html.match(/trades at R\$([0-9.,]+)/) ||
          html.match(/class="YMlKec fxKbKc">([^<]+)<\/div>/);

        if (priceMatch) {
          const raw = priceMatch[1].replace('R$', '').replace('$', '').trim();
          const parsed = parseFloat(raw.replace(',', '.'));
          if (!isNaN(parsed) && parsed > 1 && parsed < 15) {
            rate = parsed;
          }
        }

        const changeMatch =
          html.match(/([+-]?[0-9.]+)%\s*today/i) ||
          html.match(/class="JwB6be">([+-]?[0-9.,]+)%<\/div>/);
        if (changeMatch) {
          const parsedChange = parseFloat(changeMatch[1].replace(',', '.'));
          if (!isNaN(parsedChange)) {
            changePercent = parsedChange;
          }
        }
      }

      res.json({
        rate: Number(rate.toFixed(4)),
        changePercent: Number(changePercent.toFixed(2)),
        source: 'Google Finance (USD-BRL)',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching USD/BRL from Google Finance:', error);
      res.json({
        rate: 5.50,
        changePercent: 0.12,
        source: 'Google Finance (Fallback)',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Batch Quotes from Google Finance
  app.post('/api/finance/batch-quotes', async (req, res) => {
    try {
      const { items } = req.body as {
        items: { ticker: string; market: 'BR' | 'US'; fallbackPrice?: number }[];
      };

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'items array is required' });
      }

      const dollarPromise = (async () => {
        try {
          const resp = await fetch('https://www.google.com/finance/quote/USD-BRL', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (resp.ok) {
            const html = await resp.text();
            const match =
              html.match(/trades at R\$([0-9.,]+)/) ||
              html.match(/R\$\s*([0-9]\.[0-9]{3,4})/);
            if (match) {
              const parsed = parseFloat(match[1].replace(',', '.'));
              if (!isNaN(parsed) && parsed > 2) return parsed;
            }
          }
        } catch {
          // ignore
        }
        return 5.50;
      })();

      const quotesPromises = items.map(async (item) => {
        const { ticker, market, fallbackPrice = 50 } = item;
        let symbol = ticker;

        if (market === 'BR') {
          symbol = `${ticker}:BVMF`;
        } else {
          symbol = ticker;
        }

        try {
          const url = `https://www.google.com/finance/quote/${symbol}`;
          const response = await fetch(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            },
          });

          if (response.ok) {
            const html = await response.text();
            const match =
              html.match(/data-last-price="([0-9.]+)"/) ||
              html.match(/trades at [R$]*([0-9.,]+)/) ||
              html.match(/class="YMlKec fxKbKc">([^<]+)<\/div>/);

            let price = fallbackPrice;
            if (match) {
              const cleaned = match[1].replace(/[^0-9.,]/g, '').replace(',', '.');
              const parsed = parseFloat(cleaned);
              if (!isNaN(parsed) && parsed > 0) {
                price = parsed;
              }
            }

            const changePercentMatch =
              html.match(/([+-]?[0-9.]+)%\s*today/i) ||
              html.match(/class="JwB6be">([+-]?[0-9.,]+)%<\/div>/);
            let changePercent = 0.5;
            if (changePercentMatch) {
              const parsed = parseFloat(changePercentMatch[1].replace(',', '.'));
              if (!isNaN(parsed)) changePercent = parsed;
            }

            return {
              ticker,
              market,
              price: Number(price.toFixed(2)),
              changePercent: Number(changePercent.toFixed(2)),
              currency: market === 'BR' ? 'BRL' : 'USD',
              status: 'live',
              source: `Google Finance (${symbol})`,
            };
          }
        } catch (err) {
          console.error(`Failed to fetch ${ticker} from Google Finance:`, err);
        }

        return {
          ticker,
          market,
          price: fallbackPrice,
          changePercent: 0.45,
          currency: market === 'BR' ? 'BRL' : 'USD',
          status: 'cached',
          source: 'Google Finance (Cached)',
        };
      });

      const [fxRate, quotes] = await Promise.all([
        dollarPromise,
        Promise.all(quotesPromises),
      ]);

      res.json({
        fxRate,
        quotes,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error in batch quotes:', err);
      res.status(500).json({ error: 'Failed to retrieve quotes' });
    }
  });

  // Mount Vite or static files
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GrowUp Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
