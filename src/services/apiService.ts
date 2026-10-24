import { Position, Transaction, Dividend, BrokerBalance, AppUser } from '../types';

export async function fetchDbPositions(): Promise<Position[] | null> {
  try {
    const res = await fetch('/api/positions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch positions from DB:', err);
  }
  return null;
}

export async function saveDbPosition(pos: Position): Promise<Position | null> {
  try {
    const res = await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pos),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to persist position to DB:', err);
  }
  return null;
}

export async function deleteDbPosition(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/positions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete position from DB:', err);
    return false;
  }
}

export async function fetchDbTransactions(): Promise<Transaction[] | null> {
  try {
    const res = await fetch('/api/transactions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch transactions from DB:', err);
  }
  return null;
}

export async function saveDbTransaction(tx: Transaction): Promise<Transaction | null> {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to persist transaction to DB:', err);
  }
  return null;
}

export async function deleteDbTransaction(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete transaction from DB:', err);
    return false;
  }
}

export async function fetchDbDividends(): Promise<Dividend[] | null> {
  try {
    const res = await fetch('/api/dividends');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch dividends from DB:', err);
  }
  return null;
}

export async function saveDbDividend(div: Dividend): Promise<Dividend | null> {
  try {
    const res = await fetch('/api/dividends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(div),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to persist dividend to DB:', err);
  }
  return null;
}

export async function deleteDbDividend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/dividends/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete dividend from DB:', err);
    return false;
  }
}

export async function fetchDbBalances(): Promise<BrokerBalance[] | null> {
  try {
    const res = await fetch('/api/balances');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch balances from DB:', err);
  }
  return null;
}

export async function syncUserWithDb(user: { uid: string; email: string; displayName?: string; photoUrl?: string }) {
  try {
    await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (err) {
    console.warn('User sync note:', err);
  }
}

// --- USER MANAGEMENT (CRUD) ---
export async function fetchCurrentUser(email?: string): Promise<AppUser | null> {
  try {
    const headers: Record<string, string> = {};
    if (email) {
      headers['x-user-email'] = email;
    }
    const res = await fetch('/api/users/current', { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch current user:', err);
  }
  return null;
}

export async function fetchDbUsers(): Promise<AppUser[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch users:', err);
  }
  return [];
}

export async function createDbUser(userData: {
  fullName: string;
  name?: string;
  email: string;
  cpf?: string;
  role: 'admin' | 'cliente';
  status?: 'ativo' | 'inativo';
}): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erro ao criar usuário' };
    }
    return { success: true, user: data };
  } catch (err: any) {
    console.error('Failed to create user:', err);
    return { success: false, error: err.message || 'Erro de conexão' };
  }
}

export async function updateDbUser(
  id: number,
  userData: Partial<{
    fullName: string;
    name: string;
    email: string;
    cpf: string;
    role: 'admin' | 'cliente';
    status: 'ativo' | 'inativo';
  }>
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erro ao atualizar usuário' };
    }
    return { success: true, user: data };
  } catch (err: any) {
    console.error(`Failed to update user ${id}:`, err);
    return { success: false, error: err.message || 'Erro de conexão' };
  }
}

export async function deleteDbUser(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erro ao excluir usuário' };
    }
    return { success: true };
  } catch (err: any) {
    console.error(`Failed to delete user ${id}:`, err);
    return { success: false, error: err.message || 'Erro de conexão' };
  }
}
